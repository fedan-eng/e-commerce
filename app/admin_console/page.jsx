"use client";
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import Link from "next/link";
import axios from "axios";
import { Download, ShoppingBag, TrendingUp, PackageCheck, Users, Wallet, MapPin, PieChart, Trophy, Star } from "lucide-react";
import { toCSV, downloadCSV } from "@/lib/csv";

const STATUS_COLORS = {
  confirmed:  { text: "#f5b82e" },
  pending:    { text: "#f5b82e" },
  processing: { text: "#5aa9e6" },
  processed:  { text: "#5aa9e6" },
  shipped:    { text: "#a78bfa" },
  "in transit": { text: "#3b82f6" },
  delivered:  { text: "#22a861" },
  cancelled:  { text: "#ef5350" },
  returned:   { text: "#f4a259" },
};

const CAT_COLORS = ["#0f472b","#c5ea3c","#3fbf7f","#5aa9e6","#f4a259","#a78bfa","#f472b6","#94a3b8"];
const TOOLTIP    = { backgroundColor: "#0f472b", titleColor: "#d7f75b", bodyColor: "#ffffff", padding: 10, cornerRadius: 12, displayColors: false };

function fmt(n) {
  return Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtK(n) {
  const v = Math.round(Number(n) || 0);
  return v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v);
}

// ── Date range helpers (all in the admin's local time) ──────
const RANGE_PRESETS = [
  { value: "all",       label: "All Time" },
  { value: "today",     label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d",        label: "Last 7 Days" },
  { value: "30d",       label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear",  label: "This Year" },
  { value: "custom",    label: "Custom Range" },
];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay   = d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const addDays    = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
// "YYYY-MM-DD" (from <input type="date">) → local Date
const parseDay   = s => { if (!s) return null; const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const pad2       = n => String(n).padStart(2, "0");
const dayKey     = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const monthKey   = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

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

export default function AdminDashboard() {
  const [allOrders,    setAllOrders]    = useState([]);
  const [allProducts,  setAllProducts]  = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [chartMode,    setChartMode]    = useState("monthly"); // daily | monthly
  const [rangePreset,  setRangePreset]  = useState("all");
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
  const fromISO    = rangeFrom ? rangeFrom.toISOString() : "";
  const toISO      = rangeTo   ? rangeTo.toISOString()   : "";
  const rangeError = rangeFrom && rangeTo && rangeFrom > rangeTo ? "Start date is after end date" : "";

  // Pick a sensible chart granularity whenever the range changes
  useEffect(() => {
    const span = rangeFrom && rangeTo ? (rangeTo - rangeFrom) / 86400000 : Infinity;
    setChartMode(span <= 62 ? "daily" : "monthly");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromISO, toISO]);

  // ── Load data ──────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      axios.get("/api/products?limit=500"),
      axios.get("/api/admin/users?limit=1"),
    ])
      .then(([{ data: productsData }, { data: usersData }]) => {
        setAllProducts(productsData.products || []);
        setTotalCustomers(usersData.total || 0);
      })
      .catch(() => {});
  }, []);

  // Orders are fetched per date range so older ranges aren't cut off by the limit
  useEffect(() => {
    if (rangeError) return;
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ limit: "10000" });
    if (fromISO) params.set("from", fromISO);
    if (toISO)   params.set("to", toISO);
    axios.get(`/api/admin/orders?${params}`)
      .then(({ data }) => { if (!cancelled) setAllOrders(data.orders || []); })
      .catch(() => { if (!cancelled) setAllOrders([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fromISO, toISO, rangeError]);

  // ── Product lookup (category + rating by _id) ─────────────
  const productLookup = {};
  allProducts.forEach(p => { productLookup[String(p._id)] = { category: p.category || "Other", rating: p.averageRating || 0 }; });

  // ── Filtered slice ─────────────────────────────────────────
  // (date range is applied server-side; source is filtered here)
  const filtered = allOrders.filter(o =>
    filterSource === "all" || (o.source || "online") === filterSource
  );

  // ── Rebuild charts whenever deps change ───────────────────
  useEffect(() => {
    if (loading) return;
    buildSalesChart();
    buildDonutChart();
    buildStatusChart();
    return () => {
      salesInst.current?.destroy();
      donutInst.current?.destroy();
      statusInst.current?.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, allOrders, chartMode, filterSource]);

  function buildSalesChart() {
    salesInst.current?.destroy();
    if (!salesRef.current) return;
    // Buckets span the selected range; "All Time" falls back to the data's own extent
    const end  = rangeTo ? startOfDay(rangeTo) : startOfDay(new Date());
    const keys = [], labels = [];
    if (chartMode === "daily") {
      const start = rangeFrom ? startOfDay(rangeFrom) : addDays(end, -29);
      for (let d = start; d <= end; d = addDays(d, 1)) {
        keys.push(dayKey(d));
        labels.push(`${d.getDate()} ${MONTHS[d.getMonth()]}`);
      }
    } else {
      const earliest  = filtered.reduce((min, o) => Math.min(min, new Date(o.createdAt).getTime()), end.getTime());
      const first     = rangeFrom || new Date(earliest);
      const multiYear = first.getFullYear() !== end.getFullYear();
      for (let d = new Date(first.getFullYear(), first.getMonth(), 1); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
        keys.push(monthKey(d));
        labels.push(multiYear ? `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` : MONTHS[d.getMonth()]);
      }
    }
    const index = Object.fromEntries(keys.map((k, i) => [k, i]));
    const data  = Array(keys.length).fill(0);
    filtered.forEach(o => {
      const d = new Date(o.createdAt);
      const i = index[chartMode === "daily" ? dayKey(d) : monthKey(d)];
      if (i !== undefined) data[i] += parseFloat(o.total || o.subTotal || 0);
    });
    const ctx  = salesRef.current.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, salesRef.current.clientHeight || 220);
    grad.addColorStop(0, "rgba(215,247,91,0.55)");
    grad.addColorStop(1, "rgba(215,247,91,0)");
    salesInst.current = new Chart(salesRef.current, {
      type: "line",
      data: { labels, datasets: [{ label: "Sales (₦)", data, borderColor: "#0f472b", backgroundColor: grad, borderWidth: 2.5, pointBackgroundColor: "#d7f75b", pointBorderColor: "#0f472b", pointBorderWidth: 2, pointRadius: 3.5, pointHoverRadius: 6, tension: 0.4, fill: true }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: false }, tooltip: { ...TOOLTIP, callbacks: { label: ctx => "₦" + fmt(ctx.raw) } } },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: "#6f8279", font: { size: 11 } } },
          y: { grid: { color: "#edf2ee" }, border: { display: false }, ticks: { color: "#6f8279", font: { size: 11 }, callback: v => "₦" + fmtK(v) } },
        },
      },
    });
  }

  function buildDonutChart() {
    donutInst.current?.destroy();
    if (!donutRef.current) return;
    const map = {};
    filtered.forEach(o => (o.items || []).forEach(it => {
      const match = productLookup[String(it.productId)] || productLookup[String(it._id)] || {};
      const cat = it.category || match.category || "Other";
      map[cat] = (map[cat] || 0) + (parseInt(it.quantity, 10) || 1);
    }));
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return;
    donutInst.current = new Chart(donutRef.current, {
      type: "doughnut",
      data: { labels: entries.map(e => e[0]), datasets: [{ data: entries.map(e => e[1]), backgroundColor: entries.map((_, i) => CAT_COLORS[i % CAT_COLORS.length]), borderColor: "#ffffff", borderWidth: 3, borderRadius: 6, hoverOffset: 6 }] },
      options: { responsive: false, cutout: "70%", plugins: { legend: { display: false }, tooltip: TOOLTIP } },
    });
  }

  function buildStatusChart() {
    statusInst.current?.destroy();
    if (!statusRef.current) return;
    const map = {};
    filtered.forEach(o => { const s = (o.status || "unknown").toLowerCase(); map[s] = (map[s] || 0) + 1; });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return;
    const colors = entries.map(e => STATUS_COLORS[e[0]]?.text || "#94a3b8");
    statusInst.current = new Chart(statusRef.current, {
      type: "doughnut",
      data: { labels: entries.map(e => e[0]), datasets: [{ data: entries.map(e => e[1]), backgroundColor: colors, borderColor: "#ffffff", borderWidth: 3, borderRadius: 6, hoverOffset: 6 }] },
      options: { responsive: false, cutout: "70%", plugins: { legend: { display: false }, tooltip: TOOLTIP } },
    });
  }

  // ── Derived stats ──────────────────────────────────────────
  const totalSales      = filtered.reduce((a, o) => a + parseFloat(o.total || o.subTotal || 0), 0);
  const totalOrders     = filtered.length;
  const avgOrder        = totalOrders ? totalSales / totalOrders : 0;
  const delivered       = filtered.filter(o => o.status?.toLowerCase() === "delivered").length;
  const uniqueCustomers = totalCustomers;

  const statCards = [
    { label: "Total Orders",     value: totalOrders,          icon: ShoppingBag,  tint: "bg-mint",      sub: "orders placed" },
    { label: "Avg. Order Value", value: "₦" + fmt(avgOrder), icon: TrendingUp,   tint: "bg-zest",      sub: "per order" },
    { label: "Delivered",        value: delivered,            icon: PackageCheck, tint: "bg-[#e7f1fb]", sub: totalOrders ? `${Math.round((delivered / totalOrders) * 100)}% of orders` : "completed" },
    { label: "Customers",        value: uniqueCustomers,      icon: Users,        tint: "bg-[#fdf0e6]", sub: "registered" },
  ];

  // ── Region data ────────────────────────────────────────────
  const regionMap = {};
  filtered.forEach(o => { const r = o.region?.name || o.city || "Other"; regionMap[r] = (regionMap[r] || 0) + 1; });
  const regions  = Object.entries(regionMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const regMax   = regions[0]?.[1] || 1;

  // ── Category legend ────────────────────────────────────────
  const catMap = {};
  filtered.forEach(o => (o.items || []).forEach(it => {
    const match = productLookup[String(it.productId)] || productLookup[String(it._id)] || {};
    const c = it.category || match.category || "Other";
    catMap[c] = (catMap[c] || 0) + (parseInt(it.quantity, 10) || 1);
  }));
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const catTotal   = catEntries.reduce((a, e) => a + e[1], 0);

  // ── Status legend ──────────────────────────────────────────
  const statusMap = {};
  filtered.forEach(o => { const s = (o.status || "unknown").toLowerCase(); statusMap[s] = (statusMap[s] || 0) + 1; });
  const statusEntries = Object.entries(statusMap).sort((a, b) => b[1] - a[1]);
  const statusTotal   = statusEntries.reduce((a, e) => a + e[1], 0);

  // ── Top products ───────────────────────────────────────────
  const prodMap = {};
  filtered.forEach(o => (o.items || []).forEach(it => {
    const k   = String(it.productId || it._id || it.name || "unknown");
    const qty = parseInt(it.quantity, 10) || 1;
    const match = productLookup[String(it.productId)] || productLookup[String(it._id)] || {};
    const cat = it.category || match.category || "Other";
    const rating = match.rating || it.averageRating || it.rating || 0;
    if (!prodMap[k]) prodMap[k] = { name: it.name || "Unknown", category: cat, price: parseFloat(it.price || 0), qty: 0, total: 0, rating };
    prodMap[k].qty   += qty;
    prodMap[k].total += parseFloat(it.price || 0) * qty;
  }));
  const topProducts = Object.values(prodMap).sort((a, b) => b.total - a.total).slice(0, 10);

  // ── CSV export (respects date range + source filter) ──────
  const fmtDay   = d => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const rangeLabel = rangeFrom || rangeTo
    ? `${rangeFrom ? fmtDay(rangeFrom) : "start"} – ${rangeTo ? fmtDay(rangeTo) : "today"}`
    : "";

  function exportCSV(kind) {
    const when  = o => { const d = new Date(o.createdAt); return `${dayKey(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
    const name  = o => `${o.firstName || ""} ${o.lastName || ""}`.trim();
    const phone = o => { const p = o.phone ? String(o.phone) : ""; return p.length === 10 ? "0" + p : p; };
    const catOf = it => it.category || (productLookup[String(it.productId)] || productLookup[String(it._id)] || {}).category || "Other";
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

  // ─────────────────────────────────────────────────────────
  const selectCls = "h-10 bg-white border border-line-strong text-ink text-[13px] font-medium px-3.5 rounded-full outline-none cursor-pointer hover:border-pine focus:border-pine transition-colors";

  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-5 flex justify-between items-end flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-poppins font-bold text-pine leading-tight">Dashboard</h1>
          <p className={`text-[13px] mt-0.5 ${rangeError ? "text-[#c53030]" : "text-faint"}`}>
            {rangeError || (rangeLabel ? `Showing ${rangeLabel}` : "Here's how the store is doing")}
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className={selectCls}>
            <option value="all">All Sales</option>
            <option value="online">Online</option>
            <option value="manual">Manual</option>
          </select>
          <select value={rangePreset} onChange={e => setRangePreset(e.target.value)} className={selectCls}>
            {RANGE_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {rangePreset === "custom" && (
            <div className="flex gap-1.5 items-center">
              <input
                type="date" value={customFrom} max={customTo || dayKey(new Date())}
                onChange={e => setCustomFrom(e.target.value)} aria-label="From date"
                className={selectCls}
              />
              <span className="text-faint text-[12px]">to</span>
              <input
                type="date" value={customTo} min={customFrom || undefined} max={dayKey(new Date())}
                onChange={e => setCustomTo(e.target.value)} aria-label="To date"
                className={selectCls}
              />
            </div>
          )}
          <div className="flex h-10 rounded-full overflow-hidden bg-pine">
            <button
              onClick={() => exportCSV("orders")} disabled={loading || !filtered.length || !!rangeError}
              className="flex items-center gap-1.5 text-white text-[13px] font-semibold pl-4 pr-3 cursor-pointer hover:bg-pine-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="One row per order"
            >
              <Download size={14} /> Orders CSV
            </button>
            <button
              onClick={() => exportCSV("items")} disabled={loading || !filtered.length || !!rangeError}
              className="text-zest text-[13px] font-semibold pl-3 pr-4 border-l border-white/15 cursor-pointer hover:bg-pine-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="One row per product line"
            >
              Items CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr] gap-3 mb-3">
        {/* Hero: total sales */}
        <div className="col-span-2 lg:col-span-1 relative overflow-hidden rounded-3xl bg-pine p-5 text-white">
          <div className="pointer-events-none absolute -right-8 -top-10 w-32 h-32 rounded-full bg-zest/20" />
          <div className="pointer-events-none absolute right-10 -bottom-12 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-2 text-[12px] text-white/70 font-medium">
            <span className="w-8 h-8 rounded-full bg-zest text-pine flex items-center justify-center"><Wallet size={15} /></span>
            Total Sales
          </div>
          <div className="relative mt-4 text-[26px] font-poppins font-bold text-zest leading-none break-all">
            {loading ? <span className="text-white/30">—</span> : "₦" + fmt(totalSales)}
          </div>
          <div className="relative mt-2 text-[12px] text-white/60">
            {filterSource === "all" ? "online + manual sales" : `${filterSource} sales only`}
          </div>
        </div>

        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="group bg-white border border-line rounded-3xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(15,71,43,0.45)]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] text-faint font-medium">{card.label}</span>
                <span className={`w-8 h-8 flex-shrink-0 rounded-full ${card.tint} text-pine flex items-center justify-center transition-transform duration-300 group-hover:rotate-12`}>
                  <Icon size={15} />
                </span>
              </div>
              <div className="mt-3 text-[20px] font-poppins font-bold text-ink leading-none break-all">
                {loading ? <span className="text-ghost">—</span> : card.value}
              </div>
              <div className="mt-2 text-[12px] text-faint">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Sales Chart + Region */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3 mb-3">
        <Card
          title="Sales"
          icon={TrendingUp}
          right={
            <div className="flex bg-sage rounded-full p-1">
              {["daily","monthly"].map(m => (
                <button
                  key={m}
                  onClick={() => setChartMode(m)}
                  className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${chartMode === m ? "bg-pine text-zest shadow-sm" : "text-muted hover:text-pine"}`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          }
        >
          <div className="px-4 pb-4 relative h-[240px]">
            {loading ? <Spinner /> : <canvas ref={salesRef} aria-label="Sales over time" />}
          </div>
        </Card>

        <Card title="Orders by Region" icon={MapPin}>
          {loading ? <Spinner /> : regions.length === 0 ? <Empty emoji="🗺️" text="No region data yet" /> : (
            <div className="px-5 pb-5 space-y-3.5">
              {regions.map(([name, val], i) => (
                <div key={name}>
                  <div className="flex items-center justify-between gap-2 text-[13px] mb-1.5">
                    <span className="text-ink font-medium truncate">{name}</span>
                    <span className="text-faint text-[12px] font-semibold">{fmtK(val)}</span>
                  </div>
                  <div className="h-2.5 bg-sage rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${i === 0 ? "bg-pine" : i === 1 ? "bg-[#3fbf7f]" : "bg-zest"}`}
                      style={{ width: Math.max(6, Math.round((val / regMax) * 100)) + "%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Category + Status donuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <Card title="Units by Category" icon={PieChart}>
          <Donut
            canvasRef={donutRef} loading={loading} label="Units sold by category"
            total={fmtK(catTotal)} unit="Units"
            rows={catEntries.slice(0, 6).map((e, i) => ({ key: e[0], color: CAT_COLORS[i % CAT_COLORS.length], value: fmtK(e[1]) }))}
          />
        </Card>
        <Card title="Order Status" icon={PieChart}>
          <Donut
            canvasRef={statusRef} loading={loading} label="Order status breakdown"
            total={statusTotal} unit="Orders"
            rows={statusEntries.map(e => ({ key: e[0], color: STATUS_COLORS[e[0]]?.text || "#94a3b8", value: e[1] }))}
          />
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card title="Top Selling Products" icon={Trophy}>
        {loading ? <Spinner /> : topProducts.length === 0 ? <Empty emoji="🛍️" text="No product data in orders yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 600 }}>
              <thead>
                <tr className="bg-sage">
                  {["#","Product","Category","Unit Price","Qty","Total","Rating"].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i} className="border-b border-line last:border-0 hover:bg-[#fafcf9] transition-colors">
                    <td className="px-5 py-3 text-[15px] w-12">
                      {MEDALS[i] || <span className="text-faint text-[13px] font-semibold pl-1">{i + 1}</span>}
                    </td>
                    <td className="px-5 py-3 text-ink text-[13px] font-medium max-w-[220px] truncate">{p.name}</td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-semibold text-pine bg-mint px-2.5 py-1 rounded-full whitespace-nowrap">{p.category}</span>
                    </td>
                    <td className="px-5 py-3 text-muted text-[13px] whitespace-nowrap">₦{fmt(p.price)}</td>
                    <td className="px-5 py-3 text-ink text-[13px]">{p.qty}</td>
                    <td className="px-5 py-3 text-pine text-[13px] font-bold whitespace-nowrap">₦{fmt(p.total)}</td>
                    <td className="px-5 py-3 text-[13px] whitespace-nowrap">
                      {p.rating
                        ? <span className="inline-flex items-center gap-1 text-ink font-medium"><Star size={13} className="fill-star text-star" /> {Number(p.rating).toFixed(1)}</span>
                        : <span className="text-ghost">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
}

// ── Presentational pieces (module level so canvases don't remount on re-render) ──
const MEDALS = ["🥇", "🥈", "🥉"];

function Card({ title, icon: Icon, right, children }) {
  return (
    <div className="bg-white rounded-3xl border border-line overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex justify-between items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-sage text-pine flex items-center justify-center"><Icon size={15} /></span>
          <span className="text-[15px] font-poppins font-semibold text-pine">{title}</span>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="px-5 py-10 flex justify-center">
      <div className="w-7 h-7 rounded-full border-[3px] border-mint border-t-pine animate-spin" />
    </div>
  );
}

function Empty({ emoji, text }) {
  return (
    <div className="px-5 py-10 text-center">
      <div className="text-3xl mb-2" aria-hidden>{emoji}</div>
      <div className="text-faint text-[13px]">{text}</div>
    </div>
  );
}

function Donut({ canvasRef, loading, label, total, unit, rows }) {
  return (
    <div className="px-5 pb-5 pt-1 flex gap-5 items-center">
      <div className="relative w-[140px] h-[140px] flex-shrink-0">
        {loading
          ? <div className="w-full h-full rounded-full border-[14px] border-sage" />
          : <canvas ref={canvasRef} width={140} height={140} aria-label={label} />
        }
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-[20px] font-poppins font-bold text-pine leading-none">{total}</div>
          <div className="text-[11px] text-faint mt-1">{unit}</div>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {!loading && rows.length === 0 && <div className="text-faint text-[13px]">Nothing here yet 🌱</div>}
        {rows.map(r => (
          <div key={r.key} className="flex items-center justify-between gap-2 text-[13px] px-2.5 py-1.5 rounded-full hover:bg-sage transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
              <span className="text-muted capitalize truncate">{r.key}</span>
            </div>
            <span className="text-ink font-semibold">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
