"use client";
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import Link from "next/link";
import axios from "axios";

const STATUS_COLORS = {
  confirmed:  { text: "#e8c46a", bg: "#e8c46a18", border: "#e8c46a33" },
  processed:  { text: "#6ab4e8", bg: "#6ab4e818", border: "#6ab4e833" },
  shipped:    { text: "#a06ae8", bg: "#a06ae818", border: "#a06ae833" },
  delivered:  { text: "#6ae8a0", bg: "#6ae8a018", border: "#6ae8a033" },
  cancelled:  { text: "#e86a6a", bg: "#e86a6a18", border: "#e86a6a833" },
  returned:   { text: "#e8946a", bg: "#e8946a18", border: "#e8946a33" },
};

const CAT_COLORS  = ["#e8c46a","#6ae8a0","#6ab4e8","#a06ae8","#e86a6a","#e8946a","#5dcaa5","#e87ab4"];
const STAT_ACCENTS = ["#e8c46a","#6ae8a0","#6ab4e8","#a06ae8","#e8946a"];

function fmt(n) {
  return Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtK(n) {
  const v = Math.round(Number(n) || 0);
  return v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v);
}
function getDayLabels() {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const today = new Date().getDay();
  return Array.from({ length: 7 }, (_, i) => days[(today - (6 - i) + 7) % 7]);
}

export default function AdminDashboard() {
  const [allOrders,    setAllOrders]    = useState([]);
  const [allProducts,  setAllProducts]  = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [chartMode,    setChartMode]    = useState("week");
  const [filterMonth,  setFilterMonth]  = useState(0);
  const [filterYear,   setFilterYear]   = useState(0);

  const salesRef  = useRef(null);
  const donutRef  = useRef(null);
  const statusRef = useRef(null);
  const salesInst  = useRef(null);
  const donutInst  = useRef(null);
  const statusInst = useRef(null);

  // ── Load data ──────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      axios.get("/api/admin/orders?limit=500"),
      axios.get("/api/products?limit=500"),
      axios.get("/api/admin/users?limit=1"),
    ])
      .then(([{ data: ordersData }, { data: productsData }, { data: usersData }]) => {
        setAllOrders(ordersData.orders || []);
        setAllProducts(productsData.products || []);
        setTotalCustomers(usersData.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── Product lookup (category + rating by _id) ─────────────
  const productLookup = {};
  allProducts.forEach(p => { productLookup[String(p._id)] = { category: p.category || "Other", rating: p.averageRating || 0 }; });

  // ── Filtered slice ─────────────────────────────────────────
  const filtered = allOrders.filter(o => {
    const d = new Date(o.createdAt);
    if (filterMonth > 0 && d.getMonth() + 1 !== filterMonth) return false;
    if (filterYear  > 0 && d.getFullYear()   !== filterYear)  return false;
    return true;
  });

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
  }, [loading, filtered.length, chartMode, filterMonth, filterYear]);

  function buildSalesChart() {
    salesInst.current?.destroy();
    if (!salesRef.current) return;
    let labels, data;
    if (chartMode === "week") {
      labels = getDayLabels();
      data   = Array(7).fill(0);
      const today = new Date(); today.setHours(23, 59, 59, 999);
      filtered.forEach(o => {
        const diff = Math.floor((today - new Date(o.createdAt)) / 86400000);
        if (diff >= 0 && diff < 7) data[6 - diff] += parseFloat(o.total || o.subTotal || 0);
      });
    } else {
      labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      data   = Array(12).fill(0);
      filtered.forEach(o => { data[new Date(o.createdAt).getMonth()] += parseFloat(o.total || o.subTotal || 0); });
    }
    salesInst.current = new Chart(salesRef.current, {
      type: "line",
      data: { labels, datasets: [{ label: "Sales (₦)", data, borderColor: "#1cc978", backgroundColor: "rgba(28,201,120,0.08)", borderWidth: 1.5, pointBackgroundColor: "#1cc978", pointRadius: 3, tension: 0.4, fill: true }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderWidth: 1, titleColor: "#e8e8e8", bodyColor: "#aaa", callbacks: { label: ctx => "₦" + fmt(ctx.raw) } } },
        scales: { x: { grid: { color: "#1a1a1a" }, ticks: { color: "#555", font: { size: 11 } } }, y: { grid: { color: "#1a1a1a" }, ticks: { color: "#555", font: { size: 11 }, callback: v => "₦" + fmtK(v) } } },
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
      data: { labels: entries.map(e => e[0]), datasets: [{ data: entries.map(e => e[1]), backgroundColor: entries.map((_, i) => CAT_COLORS[i % CAT_COLORS.length]), borderWidth: 0, hoverOffset: 4 }] },
      options: { responsive: false, cutout: "72%", plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderWidth: 1, titleColor: "#e8e8e8", bodyColor: "#aaa" } } },
    });
  }

  function buildStatusChart() {
    statusInst.current?.destroy();
    if (!statusRef.current) return;
    const map = {};
    filtered.forEach(o => { const s = (o.status || "unknown").toLowerCase(); map[s] = (map[s] || 0) + 1; });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return;
    const colors = entries.map(e => STATUS_COLORS[e[0]]?.text || "#888");
    statusInst.current = new Chart(statusRef.current, {
      type: "doughnut",
      data: { labels: entries.map(e => e[0]), datasets: [{ data: entries.map(e => e[1]), backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
      options: { responsive: false, cutout: "72%", plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderWidth: 1, titleColor: "#e8e8e8", bodyColor: "#aaa" } } },
    });
  }

  // ── Derived stats ──────────────────────────────────────────
  const totalSales      = filtered.reduce((a, o) => a + parseFloat(o.total || o.subTotal || 0), 0);
  const totalOrders     = filtered.length;
  const avgOrder        = totalOrders ? totalSales / totalOrders : 0;
  const delivered       = filtered.filter(o => o.status?.toLowerCase() === "delivered").length;
  const uniqueCustomers = totalCustomers;

  const statCards = [
    { label: "Total Sales",      value: "₦" + fmt(totalSales),  accent: STAT_ACCENTS[0], sub: "from orders",    dir: "up"  },
    { label: "Total Orders",     value: totalOrders,             accent: STAT_ACCENTS[1], sub: "orders placed",  dir: "neu" },
    { label: "Avg. Order Value", value: "₦" + fmt(avgOrder),    accent: STAT_ACCENTS[2], sub: "per order",      dir: "up"  },
    { label: "Delivered",        value: delivered,               accent: STAT_ACCENTS[3], sub: "completed",      dir: "up"  },
    { label: "Customers",        value: uniqueCustomers,         accent: STAT_ACCENTS[4], sub: "unique emails",  dir: "neu" },
  ];

  // ── Region data ────────────────────────────────────────────
  const regionMap = {};
  filtered.forEach(o => { const r = o.region?.name || o.city || "Other"; regionMap[r] = (regionMap[r] || 0) + 1; });
  const regions  = Object.entries(regionMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const regMax   = regions[0]?.[1] || 1;
  const regDotColors = ["#e8c46a","#6ae8a0","#6ab4e8","#a06ae8","#e8946a"];

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

  // ─────────────────────────────────────────────────────────
  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-6 flex justify-between items-start flex-wrap gap-3">
        <div>
          <div className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-1.5">Overview</div>
          <h1 className="text-2xl font-bold text-[#e8e8e8] tracking-tight">Dashboard</h1>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(+e.target.value)}
            className="bg-[#111] border border-[#2a2a2a] text-[#aaa] text-[12px] px-3 py-1.5 rounded-md outline-none cursor-pointer"
          >
            <option value={0}>All Months</option>
            {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={e => setFilterYear(+e.target.value)}
            className="bg-[#111] border border-[#2a2a2a] text-[#aaa] text-[12px] px-3 py-1.5 rounded-md outline-none cursor-pointer"
          >
            <option value={0}>All Years</option>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
        {statCards.map(card => (
          <div
            key={card.label}
            className="bg-[#111] border border-[#1e1e1e] rounded-lg p-3.5"
            style={{ borderTopWidth: "2px", borderTopColor: card.accent }}
          >
            <div className="text-[10px] tracking-[0.12em] text-[#666] uppercase mb-2.5">{card.label}</div>
            <div className="text-xl font-bold text-[#e8e8e8] leading-none">
              {loading ? <span className="text-[#333]">—</span> : card.value}
            </div>
            <div className={`flex items-center gap-1 mt-2 text-[11px] ${card.dir === "up" ? "text-[#6ae8a0]" : "text-[#888]"}`}>
              {card.dir === "up" && <span className="text-[10px]">↑</span>}
              <span>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Chart + Region */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3 mb-3">

        {/* Sales Chart */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1a1a1a] flex justify-between items-center">
            <span className="text-[11px] tracking-[0.1em] text-[#888] uppercase">Sales</span>
            <div className="flex bg-[#0a0a0a] border border-[#1e1e1e] rounded-md overflow-hidden">
              {["week","month"].map(m => (
                <button
                  key={m}
                  onClick={() => setChartMode(m)}
                  className={`text-[11px] px-3 py-1.5 border-none cursor-pointer transition-all ${chartMode === m ? "bg-[#1e1e1e] text-[#e8e8e8]" : "bg-transparent text-[#555]"}`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 relative h-[220px]">
            {loading
              ? <div className="text-[#444] text-[13px] text-center pt-10">Loading…</div>
              : <canvas ref={salesRef} aria-label="Sales over time" />
            }
          </div>
        </div>

        {/* Sales by Region */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1a1a1a]">
            <span className="text-[11px] tracking-[0.1em] text-[#888] uppercase">Sales by Region</span>
          </div>
          {loading
            ? <div className="px-4 py-8 text-[#444] text-[13px] text-center">Loading…</div>
            : <div>
                {regions.length === 0
                  ? <div className="px-4 py-8 text-[#444] text-[13px] text-center">No region data</div>
                  : regions.map(([name, val], i) => (
                      <div key={name} className="flex items-center justify-between px-4 py-2.5 border-b border-[#161616] last:border-0 text-[13px]">
                        <div className="flex items-center gap-2 text-[#ccc]">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: regDotColors[i % regDotColors.length] }} />
                          {name}
                        </div>
                        <div className="flex-1 mx-3 h-[3px] bg-[#1e1e1e] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: Math.round((val / regMax) * 100) + "%", background: regDotColors[i % regDotColors.length] }} />
                        </div>
                        <span className="text-[#888] text-[12px]">{fmtK(val)}</span>
                      </div>
                    ))
                }
              </div>
          }
        </div>
      </div>

      {/* Category + Status donuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">

        {/* Sales by Category */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1a1a1a]">
            <span className="text-[11px] tracking-[0.1em] text-[#888] uppercase">Sales by Category</span>
          </div>
          <div className="p-4 flex gap-5 items-center">
            <div className="relative w-[130px] h-[130px] flex-shrink-0">
              {loading
                ? <div className="w-full h-full rounded-full border-4 border-[#1e1e1e]" />
                : <canvas ref={donutRef} width={130} height={130} aria-label="Sales by category" />
              }
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-[18px] font-bold text-[#e8e8e8]">{fmtK(catTotal)}</div>
                <div className="text-[10px] text-[#555] uppercase tracking-[.08em] mt-0.5">Total</div>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              {catEntries.slice(0, 6).map((e, i) => (
                <div key={e[0]} className="flex items-center justify-between text-[12px] text-[#aaa]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                    <span>{e[0]}</span>
                  </div>
                  <span className="text-[#e8e8e8] font-medium">{fmtK(e[1])}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1a1a1a]">
            <span className="text-[11px] tracking-[0.1em] text-[#888] uppercase">Order Status Breakdown</span>
          </div>
          <div className="p-4 flex gap-5 items-center">
            <div className="relative w-[130px] h-[130px] flex-shrink-0">
              {loading
                ? <div className="w-full h-full rounded-full border-4 border-[#1e1e1e]" />
                : <canvas ref={statusRef} width={130} height={130} aria-label="Order status breakdown" />
              }
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-[18px] font-bold text-[#e8e8e8]">{statusTotal}</div>
                <div className="text-[10px] text-[#555] uppercase tracking-[.08em] mt-0.5">Orders</div>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              {statusEntries.map(e => {
                const col = STATUS_COLORS[e[0]]?.text || "#888";
                return (
                  <div key={e[0]} className="flex items-center justify-between text-[12px] text-[#aaa]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col }} />
                      <span className="capitalize">{e[0]}</span>
                    </div>
                    <span className="text-[#e8e8e8] font-medium">{e[1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a1a1a]">
          <span className="text-[11px] tracking-[0.1em] text-[#888] uppercase">Top Selling Products</span>
        </div>
        {loading ? (
          <div className="px-4 py-10 text-[#444] text-[13px] text-center">Loading…</div>
        ) : topProducts.length === 0 ? (
          <div className="px-4 py-10 text-[#444] text-[13px] text-center">No product data in orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 560 }}>
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  {["SN","Product","Category","Unit Price","Qty","Total","Rating"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] tracking-[0.12em] text-[#444] uppercase font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i} className="border-b border-[#161616] hover:bg-[#131313] transition-colors last:border-0">
                    <td className="px-4 py-2.5 text-[#555] text-[13px]">{i + 1}</td>
                    <td className="px-4 py-2.5 text-[#e8e8e8] text-[13px] max-w-[200px] truncate">{p.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] text-[#888] bg-[#1a1a1a] px-2 py-0.5 rounded">{p.category}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[#e8e8e8] text-[13px] whitespace-nowrap">₦{fmt(p.price)}</td>
                    <td className="px-4 py-2.5 text-[#aaa] text-[13px]">{p.qty}</td>
                    <td className="px-4 py-2.5 text-[#e8e8e8] text-[13px] font-semibold whitespace-nowrap">₦{fmt(p.total)}</td>
                    <td className="px-4 py-2.5 text-[#e8c46a] text-[13px]">
                      {p.rating ? "★ " + Number(p.rating).toFixed(1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}