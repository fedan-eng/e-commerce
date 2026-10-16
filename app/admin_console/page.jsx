"use client";
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import Link from "next/link";
import axios from "axios";
import {
  Download, CalendarDays, ChevronDown, Wallet, ShoppingBag, TrendingUp, Users,
  Star, Clock, PackageX, ShoppingCart, BarChart3, Trophy,
} from "lucide-react";
import { toCSV, downloadCSV } from "@/lib/csv";
import { STATUS_COLORS, normalizeStatusKey, normalizeStatusLabel, shortId } from "@/lib/orderStatus";
import { useAdmin } from "@/components/admin/AdminContext";
import {
  PageHeader, Card, CardHeader, Button, Segmented, Dropdown, MenuItem, MenuSeparator,
  StatCard, StatusBadge, Skeleton, Spinner, EmptyState, cx,
} from "@/components/admin/ui";
import { money, moneyShort, compact, timeAgo, initials } from "@/components/admin/format";

const CAT_COLORS = ["#0f472b", "#3d8a62", "#7fbf9b", "#bfe0cc", "#a3aca7", "#d5ddd8", "#5b6660", "#e6e9e7"];
const statusColor = s => STATUS_COLORS[normalizeStatusKey(s)] || "#a3aca7";

const TOOLTIP = {
  backgroundColor: "#111814", titleColor: "#ffffff", bodyColor: "#e6e9e7",
  padding: 10, cornerRadius: 8, boxPadding: 4, titleFont: { weight: "500" },
};

// ── Date range helpers (all in the admin's local time) ──────
const RANGE_PRESETS = [
  { value: "today",     label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d",        label: "Last 7 days" },
  { value: "30d",       label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "thisYear",  label: "This year" },
  { value: "all",       label: "All time" },
  { value: "custom",    label: "Custom range" },
];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY = 86400000;

const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay   = d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const addDays    = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
// "YYYY-MM-DD" (from <input type="date">) → local Date
const parseDay   = s => { if (!s) return null; const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const pad2       = n => String(n).padStart(2, "0");
const dayKey     = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const monthKey   = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
const monthsBetween = (a, b) => (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();

function getRangeBounds(preset, customFrom, customTo) {
  const now = new Date();
  switch (preset) {
    case "today":     return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": { const y = addDays(now, -1); return { from: startOfDay(y), to: endOfDay(y) }; }
    case "7d":        return { from: addDays(startOfDay(now), -6),  to: endOfDay(now) };
    case "30d":       return { from: addDays(startOfDay(now), -29), to: endOfDay(now) };
    case "thisMonth": return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
    case "lastMonth": return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)) };
    case "thisYear":  return { from: new Date(now.getFullYear(), 0, 1), to: endOfDay(now) };
    case "custom": {
      const f = parseDay(customFrom), t = parseDay(customTo);
      return { from: f ? startOfDay(f) : null, to: t ? endOfDay(t) : null };
    }
    default:          return { from: null, to: null };
  }
}

// The equally long stretch just before the range (for trend arrows)
function getPreviousBounds(from, to) {
  if (!from || !to) return null;
  const span = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  return { from: new Date(prevTo.getTime() - span), to: prevTo };
}

const orderTotal = o => parseFloat(o.total || o.subTotal || 0);
const pctChange = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);

export default function AdminDashboard() {
  const { alerts } = useAdmin();
  const [allOrders,    setAllOrders]    = useState([]);
  const [prevOrders,   setPrevOrders]   = useState([]);
  const [allProducts,  setAllProducts]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [chartMode,    setChartMode]    = useState("daily"); // daily | monthly
  const [rangePreset,  setRangePreset]  = useState("30d");
  const [customFrom,   setCustomFrom]   = useState("");
  const [customTo,     setCustomTo]     = useState("");
  const [filterSource, setFilterSource] = useState("all"); // all | online | manual

  const salesRef  = useRef(null);
  const donutRef  = useRef(null);
  const statusRef = useRef(null);
  const salesInst  = useRef(null);
  const donutInst  = useRef(null);
  const statusInst = useRef(null);

  // ── Date range ─────────────────────────────────────────────
  const { from: rangeFrom, to: rangeTo } = getRangeBounds(rangePreset, customFrom, customTo);
  const prevRange  = getPreviousBounds(rangeFrom, rangeTo);
  const fromISO    = rangeFrom ? rangeFrom.toISOString() : "";
  const toISO      = rangeTo   ? rangeTo.toISOString()   : "";
  const rangeError = rangeFrom && rangeTo && rangeFrom > rangeTo ? "Start date is after end date" : "";

  // Pick a sensible chart granularity whenever the range changes
  useEffect(() => {
    const span = rangeFrom && rangeTo ? (rangeTo - rangeFrom) / DAY : Infinity;
    setChartMode(span <= 62 ? "daily" : "monthly");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromISO, toISO]);

  // ── Load data ──────────────────────────────────────────────
  useEffect(() => {
    axios.get("/api/products?limit=500")
      .then(({ data }) => setAllProducts(data.products || []))
      .catch(() => {});
  }, []);

  // Orders are fetched per date range (and for the period before it, for trends)
  useEffect(() => {
    if (rangeError) return;
    let cancelled = false;
    setLoading(true);
    const fetchRange = (from, to) => {
      const params = new URLSearchParams({ limit: "10000" });
      if (from) params.set("from", from.toISOString());
      if (to)   params.set("to", to.toISOString());
      return axios.get(`/api/admin/orders?${params}`).then(({ data }) => data.orders || []);
    };
    Promise.all([
      fetchRange(rangeFrom, rangeTo),
      prevRange ? fetchRange(prevRange.from, prevRange.to) : Promise.resolve([]),
    ])
      .then(([cur, prev]) => { if (!cancelled) { setAllOrders(cur); setPrevOrders(prev); } })
      .catch(() => { if (!cancelled) { setAllOrders([]); setPrevOrders([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromISO, toISO, rangeError]);

  // ── Product lookup (category + rating by _id) ─────────────
  const productLookup = {};
  allProducts.forEach(p => { productLookup[String(p._id)] = { category: p.category || "Other", rating: p.averageRating || 0, image: p.image }; });
  const lookup = it => productLookup[String(it.productId)] || productLookup[String(it._id)] || {};

  // ── Filtered slices (date range is applied server-side; source here) ──
  const bySource = o => filterSource === "all" || (o.source || "online") === filterSource;
  const filtered = allOrders.filter(bySource);
  const prevFiltered = prevOrders.filter(bySource);

  // ── Rebuild charts whenever deps change ───────────────────
  useEffect(() => {
    if (loading) return;
    buildSalesChart();
    buildDonut(donutRef, donutInst, catEntries, (_, i) => CAT_COLORS[i % CAT_COLORS.length]);
    buildDonut(statusRef, statusInst, statusEntries, e => statusColor(e[0]));
    return () => {
      salesInst.current?.destroy();
      donutInst.current?.destroy();
      statusInst.current?.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, allOrders, prevOrders, chartMode, filterSource, allProducts]);

  function buildSalesChart() {
    salesInst.current?.destroy();
    if (!salesRef.current) return;
    // Buckets span the selected range; "All time" falls back to the data's own extent
    const end  = rangeTo ? startOfDay(rangeTo) : startOfDay(new Date());
    const keys = [], labels = [];
    let start;
    if (chartMode === "daily") {
      start = rangeFrom ? startOfDay(rangeFrom) : addDays(end, -29);
      for (let d = start; d <= end; d = addDays(d, 1)) {
        keys.push(dayKey(d));
        labels.push(`${d.getDate()} ${MONTHS[d.getMonth()]}`);
      }
    } else {
      const earliest  = filtered.reduce((min, o) => Math.min(min, new Date(o.createdAt).getTime()), end.getTime());
      start = new Date((rangeFrom || new Date(earliest)).getFullYear(), (rangeFrom || new Date(earliest)).getMonth(), 1);
      const multiYear = start.getFullYear() !== end.getFullYear();
      for (let d = start; d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
        keys.push(monthKey(d));
        labels.push(multiYear ? `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` : MONTHS[d.getMonth()]);
      }
    }
    const index = Object.fromEntries(keys.map((k, i) => [k, i]));
    const data  = Array(keys.length).fill(0);
    filtered.forEach(o => {
      const d = new Date(o.createdAt);
      const i = index[chartMode === "daily" ? dayKey(d) : monthKey(d)];
      if (i !== undefined) data[i] += orderTotal(o);
    });

    // Previous period, lined up bucket-for-bucket with the current one
    let prevData = null;
    if (prevRange) {
      prevData = Array(keys.length).fill(0);
      const pStart = startOfDay(prevRange.from);
      prevFiltered.forEach(o => {
        const d = new Date(o.createdAt);
        const i = chartMode === "daily"
          ? Math.floor((startOfDay(d) - pStart) / DAY)
          : monthsBetween(pStart, d);
        if (i >= 0 && i < prevData.length) prevData[i] += orderTotal(o);
      });
    }

    const ctx  = salesRef.current.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, salesRef.current.clientHeight || 240);
    grad.addColorStop(0, "rgba(15,71,43,0.14)");
    grad.addColorStop(1, "rgba(15,71,43,0)");

    const datasets = [{
      label: "This period", data, borderColor: "#0f472b", backgroundColor: grad, borderWidth: 2.5,
      pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: "#0f472b", pointHoverBorderColor: "#fff", pointHoverBorderWidth: 2,
      tension: 0.4, fill: true,
    }];
    if (prevData) datasets.push({
      label: "Previous period", data: prevData, borderColor: "#c9d0cc", borderWidth: 2, borderDash: [5, 5],
      pointRadius: 0, pointHoverRadius: 4, pointHoverBackgroundColor: "#c9d0cc", tension: 0.4, fill: false,
    });

    salesInst.current = new Chart(salesRef.current, {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: false }, tooltip: { ...TOOLTIP, callbacks: { label: c => ` ${c.dataset.label}: ${money(c.raw)}` } } },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: "#7a847f", font: { size: 11 }, maxRotation: 0, autoSkipPadding: 16 } },
          y: { grid: { color: "#eef0ef" }, border: { display: false }, beginAtZero: true, ticks: { color: "#7a847f", font: { size: 11 }, maxTicksLimit: 5, callback: v => moneyShort(v) } },
        },
      },
    });
  }

  function buildDonut(ref, inst, entries, colorFor) {
    inst.current?.destroy();
    if (!ref.current || !entries.length) return;
    inst.current = new Chart(ref.current, {
      type: "doughnut",
      data: { labels: entries.map(e => e[0]), datasets: [{ data: entries.map(e => e[1]), backgroundColor: entries.map(colorFor), borderColor: "#ffffff", borderWidth: 2, hoverOffset: 4 }] },
      options: { responsive: false, cutout: "72%", plugins: { legend: { display: false }, tooltip: TOOLTIP } },
    });
  }

  // ── Derived stats ──────────────────────────────────────────
  const sumSales = list => list.reduce((a, o) => a + orderTotal(o), 0);
  const buyers   = list => new Set(list.map(o => (o.email || o.phone || o._id || "").toString().toLowerCase())).size;
  const totalSales  = sumSales(filtered);
  const totalOrders = filtered.length;
  const avgOrder    = totalOrders ? totalSales / totalOrders : 0;
  const prevSales   = sumSales(prevFiltered);
  const prevAvg     = prevFiltered.length ? prevSales / prevFiltered.length : 0;
  const trendNote   = prevRange ? "No sales in the previous period" : "All-time total";

  const statCards = [
    { label: "Total sales",      value: money(totalSales),     icon: Wallet,      trend: prevRange ? pctChange(totalSales, prevSales) : null },
    { label: "Orders",           value: totalOrders.toLocaleString(), icon: ShoppingBag, trend: prevRange ? pctChange(totalOrders, prevFiltered.length) : null },
    { label: "Avg. order value", value: money(avgOrder),       icon: TrendingUp,  trend: prevRange ? pctChange(avgOrder, prevAvg) : null },
    { label: "Customers",        value: buyers(filtered).toLocaleString(), icon: Users, trend: prevRange ? pctChange(buyers(filtered), buyers(prevFiltered)) : null },
  ];

  // ── Region data ────────────────────────────────────────────
  const regionMap = {};
  filtered.forEach(o => { const r = o.region?.name || o.city || "Other"; regionMap[r] = (regionMap[r] || 0) + 1; });
  const regions = Object.entries(regionMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const regMax  = regions[0]?.[1] || 1;

  // ── Category units ─────────────────────────────────────────
  const catMap = {};
  filtered.forEach(o => (o.items || []).forEach(it => {
    const c = it.category || lookup(it).category || "Other";
    catMap[c] = (catMap[c] || 0) + (parseInt(it.quantity, 10) || 1);
  }));
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const catTotal   = catEntries.reduce((a, e) => a + e[1], 0);

  // ── Status mix ─────────────────────────────────────────────
  const statusMap = {};
  filtered.forEach(o => { const s = normalizeStatusKey(o.status || "unknown"); statusMap[s] = (statusMap[s] || 0) + 1; });
  const statusEntries = Object.entries(statusMap).sort((a, b) => b[1] - a[1]);

  // ── Top products ───────────────────────────────────────────
  const prodMap = {};
  filtered.forEach(o => (o.items || []).forEach(it => {
    const k   = String(it.productId || it._id || it.name || "unknown");
    const qty = parseInt(it.quantity, 10) || 1;
    const match = lookup(it);
    if (!prodMap[k]) prodMap[k] = {
      id: it.productId, name: it.name || "Unknown", image: it.image || match.image,
      category: it.category || match.category || "Other", price: parseFloat(it.price || 0),
      qty: 0, total: 0, rating: match.rating || it.averageRating || it.rating || 0,
    };
    prodMap[k].qty   += qty;
    prodMap[k].total += parseFloat(it.price || 0) * qty;
  }));
  const topProducts = Object.values(prodMap).sort((a, b) => b.total - a.total).slice(0, 5);

  // ── CSV export (respects date range + source filter) ──────
  const fmtDay = d => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const rangeText = RANGE_PRESETS.find(p => p.value === rangePreset)?.label;
  const rangeLabel = rangePreset === "custom"
    ? (rangeFrom || rangeTo ? `${rangeFrom ? fmtDay(rangeFrom) : "Start"} – ${rangeTo ? fmtDay(rangeTo) : "today"}` : "Custom range")
    : rangeText;

  function exportCSV(kind) {
    const when  = o => { const d = new Date(o.createdAt); return `${dayKey(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
    const name  = o => `${o.firstName || ""} ${o.lastName || ""}`.trim();
    const phone = o => { const p = o.phone ? String(o.phone) : ""; return p.length === 10 ? "0" + p : p; };
    const catOf = it => it.category || lookup(it).category || "Other";
    const orderCols = [
      { header: "Order ID",       value: o => String(o._id) },
      { header: "Date",           value: when },
      { header: "Source",         value: o => o.source || "online" },
      { header: "Customer",       value: name },
      { header: "Email",          value: o => o.email },
      { header: "Phone",          value: phone },
      { header: "City",           value: o => o.city },
      { header: "Region",         value: o => o.region?.name },
    ];

    let rows, columns;
    if (kind === "items") {
      rows = filtered.flatMap(o => (o.items || []).map(it => ({ o, it })));
      columns = [
        ...orderCols.map(c => ({ header: c.header, value: r => c.value(r.o) })),
        { header: "Product",        value: r => r.it.name },
        { header: "Category",       value: r => catOf(r.it) },
        { header: "Color",          value: r => r.it.color },
        { header: "Quantity",       value: r => parseInt(r.it.quantity, 10) || 1 },
        { header: "Unit Price",     value: r => parseFloat(r.it.price || 0) },
        { header: "Line Total",     value: r => parseFloat(r.it.price || 0) * (parseInt(r.it.quantity, 10) || 1) },
        { header: "Payment Method", value: r => r.o.paymentMethod },
        { header: "Order Status",   value: r => r.o.status },
      ];
    } else {
      rows = filtered;
      columns = [
        ...orderCols,
        { header: "Items",          value: o => (o.items || []).map(it => `${it.name} x${parseInt(it.quantity, 10) || 1}`).join("; ") },
        { header: "Units",          value: o => (o.items || []).reduce((a, it) => a + (parseInt(it.quantity, 10) || 1), 0) },
        { header: "Subtotal",       value: o => Number(o.subTotal || 0) },
        { header: "Delivery Fee",   value: o => Number(o.deliveryFee || 0) },
        { header: "Discount",       value: o => Number(o.discount || 0) },
        { header: "Total",          value: o => Number(o.total || 0) },
        { header: "Promo Code",     value: o => o.promoCode },
        { header: "Payment Method", value: o => o.paymentMethod },
        { header: "Payment Status", value: o => o.paymentStatus },
        { header: "Status",         value: o => o.status },
      ];
    }

    const span   = rangeFrom || rangeTo ? `${rangeFrom ? dayKey(rangeFrom) : "start"}_to_${dayKey(rangeTo || new Date())}` : "all-time";
    const source = filterSource === "all" ? "" : `_${filterSource}`;
    downloadCSV(`fil-${kind}${source}_${span}.csv`, toCSV(rows, columns));
  }

  const exportDisabled = loading || !filtered.length || !!rangeError;
  const dateInputCls = "h-10 rounded-lg border border-[#dfe3e1] bg-white px-3 text-[13px] text-ink outline-none focus:border-pine";

  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Dashboard"
        description={rangeError
          ? <span className="text-[#b91c1c]">{rangeError}</span>
          : prevRange ? `${rangeLabel}, compared with the period before` : rangeLabel}
        actions={
          <>
            <Segmented
              label="Sales source"
              value={filterSource}
              onChange={setFilterSource}
              options={[{ value: "all", label: "All" }, { value: "online", label: "Online" }, { value: "manual", label: "Manual" }]}
            />
            <Dropdown
              renderTrigger={({ open, toggle }) => (
                <Button onClick={toggle} aria-expanded={open}>
                  <CalendarDays size={16} aria-hidden /> {rangeLabel} <ChevronDown size={14} aria-hidden />
                </Button>
              )}
            >
              {RANGE_PRESETS.map(p => (
                <MenuItem key={p.value} selected={rangePreset === p.value} onClick={() => setRangePreset(p.value)}>{p.label}</MenuItem>
              ))}
            </Dropdown>
            <Dropdown
              renderTrigger={({ open, toggle }) => (
                <Button variant="primary" onClick={toggle} aria-expanded={open} disabled={exportDisabled}>
                  <Download size={16} aria-hidden /> Export
                </Button>
              )}
            >
              <MenuItem onClick={() => exportCSV("orders")} description="One row per order">Orders CSV</MenuItem>
              <MenuItem onClick={() => exportCSV("items")} description="One row per product line">Items CSV</MenuItem>
            </Dropdown>
          </>
        }
      />

      {rangePreset === "custom" && (
        <Card className="-mt-1 flex flex-wrap items-center gap-2 px-4 py-3">
          <span className="text-[13px] text-sub">Custom range</span>
          <input
            type="date" value={customFrom} max={customTo || dayKey(new Date())}
            onChange={e => setCustomFrom(e.target.value)} aria-label="From date" className={dateInputCls}
          />
          <span className="text-[13px] text-faint">to</span>
          <input
            type="date" value={customTo} min={customFrom || undefined} max={dayKey(new Date())}
            onChange={e => setCustomTo(e.target.value)} aria-label="To date" className={dateInputCls}
          />
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map(c => <StatCard key={c.label} {...c} loading={loading} note={trendNote} />)}
      </div>

      {/* Sales chart + needs attention */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Sales over time"
            description={
              <span className="mt-1 flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-pine" />This period <b className="font-semibold text-ink">{loading ? "…" : moneyShort(totalSales)}</b></span>
                {prevRange && <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-[#c9d0cc]" />Previous period <b className="font-semibold text-ink">{loading ? "…" : moneyShort(prevSales)}</b></span>}
              </span>
            }
            action={
              <Segmented
                label="Chart grouping"
                value={chartMode}
                onChange={setChartMode}
                options={[{ value: "daily", label: "Daily" }, { value: "monthly", label: "Monthly" }]}
              />
            }
          />
          <div className="relative h-[260px] px-4 pb-4">
            {loading
              ? <div className="flex h-full items-center justify-center"><Spinner /></div>
              : <canvas ref={salesRef} aria-label="Sales over time, this period against the previous one" role="img" />}
          </div>
        </Card>

        <NeedsAttention alerts={alerts} />
      </div>

      {/* Region, category, status */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="Orders by region" />
          {loading ? <BarsSkeleton /> : regions.length === 0
            ? <EmptyState title="No orders yet" description="Regions appear once orders come in." />
            : (
              <div className="flex flex-col gap-3.5 px-5 pb-5">
                {regions.map(([name, val], i) => (
                  <div key={name}>
                    <div className="mb-1.5 flex justify-between gap-3 text-[13px]">
                      <span className="truncate text-ink">{name}</span>
                      <span className="shrink-0 text-sub">{val} order{val === 1 ? "" : "s"}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#f1f3f2]">
                      <div className="h-full rounded-full bg-pine" style={{ width: Math.max(4, Math.round((val / regMax) * 100)) + "%", opacity: 1 - i * 0.16 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
        </Card>

        <Card>
          <CardHeader title="Units by category" />
          <Donut
            canvasRef={donutRef} loading={loading} label="Units sold by category" total={compact(catTotal)} unit="Units"
            rows={catEntries.slice(0, 6).map((e, i) => ({ key: e[0], label: e[0], color: CAT_COLORS[i % CAT_COLORS.length], value: compact(e[1]) }))}
          />
        </Card>

        <Card>
          <CardHeader title="Order status" />
          <Donut
            canvasRef={statusRef} loading={loading} label="Orders by status" total={totalOrders} unit="Orders"
            rows={statusEntries.map(e => ({ key: e[0], label: normalizeStatusLabel(e[0]), color: statusColor(e[0]), value: e[1] }))}
          />
        </Card>
      </div>

      {/* Top products + latest orders */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Top selling products" action={<Button variant="ghost" size="sm" href="/admin_console/products">All products</Button>} />
          {loading ? <BarsSkeleton /> : topProducts.length === 0
            ? <EmptyState icon={Trophy} title="No sales in this period" description="Best sellers show up here once orders come in." />
            : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-[13px]">
                  <thead>
                    <tr className="border-y border-edge bg-[#fafbfa] text-left text-xs font-medium text-faint">
                      <th className="px-5 py-2.5 font-medium">Product</th>
                      <th className="px-5 py-2.5 font-medium">Category</th>
                      <th className="px-5 py-2.5 text-right font-medium">Price</th>
                      <th className="px-5 py-2.5 text-right font-medium">Units</th>
                      <th className="px-5 py-2.5 text-right font-medium">Revenue</th>
                      <th className="px-5 py-2.5 font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={i} className="border-b border-[#eef0ef] last:border-0 hover:bg-[#fafbfa]">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {p.image
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={p.image} alt="" className="h-9 w-9 shrink-0 rounded-lg bg-hover object-cover" />
                              : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pine-tint text-[11px] font-semibold text-pine">{initials(...p.name.split(" "))}</span>}
                            {p.id
                              ? <Link href={`/admin_console/products/${p.id}`} className="max-w-[240px] truncate text-ink no-underline hover:text-pine">{p.name}</Link>
                              : <span className="max-w-[240px] truncate">{p.name}</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3"><span className="rounded-md bg-[#f1f3f2] px-2 py-0.5 text-xs font-medium text-sub">{p.category}</span></td>
                        <td className="whitespace-nowrap px-5 py-3 text-right text-sub">{money(p.price)}</td>
                        <td className="px-5 py-3 text-right">{p.qty}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-right font-medium">{money(p.total)}</td>
                        <td className="whitespace-nowrap px-5 py-3">
                          {p.rating
                            ? <span className="inline-flex items-center gap-1"><Star size={13} className="fill-[#d97706] text-[#d97706]" aria-hidden />{Number(p.rating).toFixed(1)}</span>
                            : <span className="text-faint">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </Card>

        <Card>
          <CardHeader title="Latest orders" action={<Button variant="ghost" size="sm" href="/admin_console/orders">View all</Button>} />
          {!alerts ? <BarsSkeleton /> : alerts.recentOrders.length === 0
            ? <EmptyState icon={ShoppingBag} title="No orders yet" />
            : alerts.recentOrders.map(o => (
              <Link
                key={o._id}
                href={`/admin_console/orders/${o._id}`}
                className="flex items-center gap-3 border-t border-[#eef0ef] px-5 py-3 text-ink no-underline transition-colors hover:bg-[#fafbfa]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine-tint text-xs font-semibold text-pine">
                  {initials(o.firstName, o.lastName, o.email?.[0] || "?")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{[o.firstName, o.lastName].filter(Boolean).join(" ") || o.email || "Customer"}</span>
                  <span className="block text-xs text-faint">#{shortId(o._id)} · {timeAgo(o.createdAt)}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[13px] font-medium">{money(orderTotal(o))}</span>
                  <StatusBadge status={o.status} />
                </span>
              </Link>
            ))}
        </Card>
      </div>
    </div>
  );
}

// ── Presentational pieces (module level so canvases don't remount on re-render) ──

function NeedsAttention({ alerts }) {
  const items = alerts ? [
    alerts.pendingReviews > 0 && {
      icon: Star, tone: "bg-[#fef7e6] text-[#a16207]",
      title: `${alerts.pendingReviews} review${alerts.pendingReviews === 1 ? "" : "s"} to approve`,
      sub: "Customers are waiting to see them", href: "/admin_console/reviews", cta: "Review",
    },
    alerts.staleOrders > 0 && {
      icon: Clock, tone: "bg-[#eef3ff] text-[#1d4ed8]",
      title: `${alerts.staleOrders} order${alerts.staleOrders === 1 ? "" : "s"} still confirmed`,
      sub: `Placed more than ${alerts.staleDays} days ago`, href: "/admin_console/orders?status=Confirmed", cta: "View",
    },
    alerts.outOfStock > 0 && {
      icon: PackageX, tone: "bg-[#fdeeee] text-[#b91c1c]",
      title: `${alerts.outOfStock} product${alerts.outOfStock === 1 ? "" : "s"} out of stock`,
      sub: "Restock or update availability", href: "/admin_console/products", cta: "View",
    },
    alerts.abandonedCarts > 0 && {
      icon: ShoppingCart, tone: "bg-[#f1f3f2] text-sub",
      title: `${alerts.abandonedCarts} abandoned cart${alerts.abandonedCarts === 1 ? "" : "s"}`,
      sub: "Items left for over 48 hours", href: "/admin_console/customers", cta: "View",
    },
  ].filter(Boolean) : [];

  return (
    <Card className="flex flex-col">
      <CardHeader title="Needs attention" description="Things waiting on you" />
      {!alerts && <BarsSkeleton />}
      {alerts && items.length === 0 && (
        <EmptyState icon={BarChart3} title="You’re all caught up" description="Nothing needs your attention right now." />
      )}
      {items.map(it => {
        const Icon = it.icon;
        return (
          <div key={it.title} className="flex items-center gap-3 border-t border-[#eef0ef] px-5 py-3">
            <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", it.tone)}><Icon size={16} aria-hidden /></span>
            <span className="min-w-0 flex-1 text-[13px]">
              <span className="block text-ink">{it.title}</span>
              <span className="block text-xs text-faint">{it.sub}</span>
            </span>
            <Link href={it.href} className="shrink-0 px-1 py-1.5 text-[13px] font-medium text-pine no-underline hover:underline">{it.cta}</Link>
          </div>
        );
      })}
    </Card>
  );
}

function Donut({ canvasRef, loading, label, total, unit, rows }) {
  return (
    <div className="flex flex-wrap items-center gap-5 px-5 pb-5">
      <div className="relative h-[132px] w-[132px] shrink-0">
        {loading
          ? <div className="h-full w-full rounded-full border-[14px] border-[#f1f3f2]" />
          : <canvas ref={canvasRef} width={132} height={132} aria-label={label} role="img" />}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-poppins text-xl font-semibold leading-none text-ink">{loading ? "…" : total}</span>
          <span className="mt-1 text-[11px] text-faint">{unit}</span>
        </div>
      </div>
      <div className="flex min-w-[140px] flex-1 flex-col gap-2 text-[13px]">
        {!loading && rows.length === 0 && <span className="text-faint">No orders in this period</span>}
        {rows.map(r => (
          <div key={r.key} className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: r.color }} />
            <span className="flex-1 truncate capitalize text-sub">{r.label}</span>
            <span className="font-medium text-ink">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarsSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-5 pb-5 pt-1">
      {[80, 60, 70, 45].map(w => <Skeleton key={w} className="h-4" style={{ width: `${w}%` }} />)}
    </div>
  );
}
