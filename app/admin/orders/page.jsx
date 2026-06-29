// app/admin/orders/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const STATUS_COLORS = {
  confirmed:  { text: "text-[#e8c46a]", bg: "bg-[#e8c46a12]", border: "border-[#e8c46a33]", hex: "#e8c46a" },
  processing: { text: "text-[#6ab4e8]", bg: "bg-[#6ab4e812]", border: "border-[#6ab4e833]", hex: "#6ab4e8" },
  processed:  { text: "text-[#6ab4e8]", bg: "bg-[#6ab4e812]", border: "border-[#6ab4e833]", hex: "#6ab4e8" },
  shipped:    { text: "text-[#a06ae8]", bg: "bg-[#a06ae812]", border: "border-[#a06ae833]", hex: "#a06ae8" },
  delivered:  { text: "text-[#6ae8a0]", bg: "bg-[#6ae8a012]", border: "border-[#6ae8a033]", hex: "#6ae8a0" },
  cancelled:  { text: "text-[#e86a6a]", bg: "bg-[#e86a6a12]", border: "border-[#e86a6a33]", hex: "#e86a6a" },
  pending:    { text: "text-[#e8c46a]", bg: "bg-[#e8c46a12]", border: "border-[#e8c46a33]", hex: "#e8c46a" },
};

const ALL_STATUSES       = ["all", "Confirmed", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const ALL_ORDER_STATUSES = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];
const DAYS_OPTIONS       = [
  { label: "All time",      value: "" },
  { label: "Last 7 days",   value: "7" },
  { label: "Last 14 days",  value: "14" },
  { label: "Last 30 days",  value: "30" },
  { label: "Last 90 days",  value: "90" },
];

const STAT_CARDS = [
  { label: "Total orders",    key: "total",     color: "#e8e8e8" },
  { label: "Confirmed",       key: "confirmed", color: "#e8c46a" },
  { label: "Shipped",         key: "shipped",   color: "#a06ae8" },
  { label: "Delivered",       key: "delivered", color: "#6ae8a0" },
  { label: "Cancelled",       key: "cancelled", color: "#e86a6a" },
];

function getStatusStyle(k) {
  return STATUS_COLORS[k?.toLowerCase()] || { text: "text-[#888]", bg: "bg-[#88888812]", border: "border-[#88888833]", hex: "#888" };
}

function StatusBadge({ status }) {
  const ss = getStatusStyle(status?.toLowerCase());
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-[.08em] uppercase border ${ss.text} ${ss.bg} ${ss.border}`}>
      {status}
    </span>
  );
}

function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [loading,      setLoading]      = useState(true);
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);
  const [updating,     setUpdating]     = useState(null);
  const [orders,       setOrders]       = useState([]);
  const [expanded,     setExpanded]     = useState({});
  const [stats,        setStats]        = useState({ total: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 });
  const [page,         setPage]         = useState(Number(searchParams.get("page")) || 1);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [searchInput,  setSearchInput]  = useState(searchParams.get("search") || "");
  const [search,       setSearch]       = useState(searchParams.get("search") || "");
  const [days,         setDays]         = useState(searchParams.get("days") || "");

  const syncUrl = useCallback((o = {}) => {
    const params = new URLSearchParams();
    const sf = o.statusFilter ?? statusFilter;
    const se = o.search       ?? search;
    const d  = o.days         ?? days;
    const pg = o.page         ?? page;
    if (sf !== "all") params.set("status", sf);
    if (se)           params.set("search", se);
    if (d)            params.set("days",   d);
    if (pg > 1)       params.set("page",   pg);
    const qs = params.toString();
    router.replace(qs ? `/admin/orders?${qs}` : "/admin/orders", { scroll: false });
  }, [statusFilter, search, days, page, router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (search)                 params.append("search", search);
    if (days)                   params.append("days",   days);
    const res  = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    if (data.stats) setStats(data.stats);
    setLoading(false);
  }, [page, statusFilter, search, days]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const submitSearch = () => {
    const v = searchInput.trim();
    setSearch(v); setPage(1); syncUrl({ search: v, page: 1 });
  };
  const clearSearch = () => {
    setSearchInput(""); setSearch(""); setPage(1); syncUrl({ search: "", page: 1 });
  };
  const handleStatus = (s) => { setStatusFilter(s); setPage(1); syncUrl({ statusFilter: s, page: 1 }); };
  const handleDays   = (d) => { setDays(d); setPage(1); syncUrl({ days: d, page: 1 }); };
  const changePage   = (p) => { setPage(p); syncUrl({ page: p }); };
  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } finally { setUpdating(null); }
  };

  const getTotal = (order) => {
    if (order.total    != null) return parseFloat(order.total).toLocaleString();
    if (order.subTotal != null) return parseFloat(order.subTotal).toLocaleString();
    return (order.items || [])
      .reduce((acc, i) => acc + parseFloat(i.price || 0) * parseFloat(i.quantity || 1), 0)
      .toLocaleString();
  };

  const Pagination = () => totalPages > 1 ? (
    <div className="flex justify-between items-center px-5 py-3 border-t border-[#1a1a1a]">
      <span className="text-[11px] text-[#444] font-mono">
        Page {page} of {totalPages} &middot; {total} orders
      </span>
      <div className="flex gap-1.5">
        <button
          onClick={() => changePage(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`px-3 py-1.5 border rounded text-[11px] font-mono transition-all
            ${page === 1
              ? "border-[#1a1a1a] text-[#2a2a2a] cursor-default bg-transparent"
              : "border-[#2a2a2a] text-[#666] cursor-pointer hover:border-[#444] hover:text-[#aaa] bg-transparent"
            }`}
        >
          ← Prev
        </button>
        <button
          onClick={() => changePage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={`px-3 py-1.5 border rounded text-[11px] font-mono transition-all
            ${page === totalPages
              ? "border-[#1a1a1a] text-[#2a2a2a] cursor-default bg-transparent"
              : "border-[#2a2a2a] text-[#666] cursor-pointer hover:border-[#444] hover:text-[#aaa] bg-transparent"
            }`}
        >
          Next →
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full max-w-full">

      {/* Page header */}
      <div className="mb-6">
        <div className="text-[10px] tracking-[.2em] text-[#fff] uppercase mb-1">Management</div>
        <h1 className="text-2xl font-bold text-[#e8e8e8] tracking-tight">
          Orders
          <span className="text-[#3a3a3a] text-base font-normal ml-2">({total})</span>
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {STAT_CARDS.map(({ label, key, color }) => (
          <div key={key} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
            <div className="text-[10px] tracking-[.12em] text-[#444] uppercase mb-2">{label}</div>
            <div className="text-2xl font-bold" style={{ color }}>{stats[key] ?? "—"}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 mb-4">
        <div className="flex flex-col gap-3">

          {/* Search row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitSearch()}
                placeholder="Search by order ID, email or name…"
                className="w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg pl-9 pr-9 py-2.5 text-[12px] text-[#ccc] placeholder-[#333] outline-none focus:border-[#2a2a2a] font-mono"
              />
              {searchInput && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={submitSearch}
              className="shrink-0 bg-[#e8c46a] text-[#0a0a0a] rounded-lg px-5 py-2.5 text-[11px] font-bold font-mono tracking-[.1em] uppercase hover:bg-[#d4b05e] transition-colors cursor-pointer border-none"
            >
              Search
            </button>
          </div>

          {/* Second row: days + status chips */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={days}
              onChange={e => handleDays(e.target.value)}
              className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-3 py-2 text-[12px] text-[#888] outline-none cursor-pointer font-mono"
            >
              {DAYS_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: "#111" }}>{o.label}</option>
              ))}
            </select>

            <div className="flex gap-1.5 flex-wrap">
              {ALL_STATUSES.map(s => {
                const active = statusFilter === s;
                const ss     = getStatusStyle(s.toLowerCase());
                return (
                  <button
                    key={s}
                    onClick={() => handleStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-[10px] tracking-[.08em] uppercase cursor-pointer border transition-all font-mono whitespace-nowrap
                      ${active
                        ? `${ss.text} ${ss.bg} ${ss.border}`
                        : "text-[#fff] bg-transparent border-[#1e1e1e] hover:border-[#333] hover:text-[#777]"
                      }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active filter chips */}
          {(search || days) && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#1a1a1a]">
              {search && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#e8c46a12] border border-[#e8c46a33] rounded-full text-[10px] text-[#e8c46a] font-mono">
                  {search.length > 20 ? search.slice(0, 20) + "…" : `"${search}"`}
                  <button onClick={clearSearch} className="hover:text-white cursor-pointer">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </span>
              )}
              {days && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#e8c46a12] border border-[#e8c46a33] rounded-full text-[10px] text-[#e8c46a] font-mono">
                  {DAYS_OPTIONS.find(d => d.value === days)?.label}
                  <button onClick={() => handleDays("")} className="hover:text-white cursor-pointer">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table / cards */}
      {loading ? (
        <div className="py-16 text-center text-[#333] text-[13px] bg-[#111] border border-[#1a1a1a] rounded-xl">
          Loading orders…
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-[#111] border border-[#1a1a1a] rounded-xl">
          <div className="text-[#444] text-[13px] mb-2">No orders found</div>
          {(search || days || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch(""); setSearchInput(""); setDays(""); setStatusFilter("all"); setPage(1);
                router.replace("/admin/orders", { scroll: false });
              }}
              className="text-[11px] text-[#fff] hover:text-[#888] underline underline-offset-2 font-mono bg-transparent border-none cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden md:block bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 700 }}>
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {/* expand toggle col */}
                    <th className="w-10 px-4 py-3.5" />
                    {["SN", "Order date", "Order number", "Customer email", "Order qty", "Total", "Status", "Action"].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left text-[10px] tracking-[.12em] text-[#3a3a3a] uppercase font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => {
                    const sKey  = order.status?.toLowerCase();
                    const ss    = getStatusStyle(sKey);
                    const isExp = expanded[order._id];
                    return (
                      <>
                        <tr
                          key={order._id}
                          className="border-b border-[#161616] hover:bg-[#141414] transition-colors cursor-pointer"
                          onClick={() => toggleExpand(order._id)}
                        >
                          {/* chevron */}
                          <td className="px-4 py-3.5 text-[#444]">
                            <svg
                              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                              style={{ transform: isExp ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .2s" }}
                            >
                              <polyline points="9 18 15 12 9 6"/>
                            </svg>
                          </td>
                          <td className="px-4 py-3.5 text-[12px] text-[#444] font-mono">{idx + 1 + (page - 1) * 15}</td>
                          <td className="px-4 py-3.5 text-[12px] text-[#666] whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <Link href={`/admin/orders/${order._id}`} className="text-[12px] text-[#e8c46a] no-underline font-mono hover:underline">
                              Order #{String(order._id).slice(-8).toUpperCase()}
                            </Link>
                          </td>
                          <td className="px-4 py-3.5 max-w-[180px]" onClick={e => e.stopPropagation()}>
                            {order.email
                              ? <a href={`mailto:${order.email}`} className="text-[12px] text-[#6ab4e8] no-underline hover:underline truncate block">{order.email}</a>
                              : <span className="text-[12px] text-[#444]">—</span>
                            }
                          </td>
                          <td className="px-4 py-3.5 text-[12px] text-[#888]">{order.items?.length || 0}</td>
                          <td className="px-4 py-3.5 text-[13px] font-semibold text-[#e8e8e8] whitespace-nowrap">₦{getTotal(order)}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <select
                              value={ALL_ORDER_STATUSES.find(s => s.toLowerCase() === sKey) || order.status}
                              onChange={e => updateStatus(order._id, e.target.value)}
                              style={{ background: ss.hex + "12", borderColor: ss.hex + "44", color: ss.hex }}
                              className={`border rounded-lg px-2.5 py-1.5 text-[11px] uppercase cursor-pointer outline-none font-mono ${updating === order._id ? "opacity-50" : ""}`}
                            >
                              {ALL_ORDER_STATUSES.map(s => (
                                <option key={s} value={s} style={{ background: "#111", color: getStatusStyle(s.toLowerCase()).hex }}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                            <Link
                              href={`/admin/orders/${order._id}`}
                              className="text-[11px] text-[#fff] no-underline px-3 py-1.5 border border-[#222] rounded-lg hover:text-[#e8e8e8] hover:border-[#3a3a3a] transition-all whitespace-nowrap font-mono"
                            >
                              View details ↗
                            </Link>
                          </td>
                        </tr>

                        {/* Expanded items sub-table */}
                        {isExp && order.items?.length > 0 && (
                          <tr key={`${order._id}-exp`} className="border-b border-[#161616]">
                            <td />
                            <td colSpan={8} className="px-4 py-3 bg-[#0d0d0d]">
                              <table className="w-full border-collapse" style={{ minWidth: 500 }}>
                                <thead>
                                  <tr className="border-b border-[#1a1a1a]">
                                    {["SKU | ID", "Product", "Category", "Unit price", "Qty", "Status", "Action"].map(h => (
                                      <th key={h} className="pb-2 pr-5 text-left text-[10px] tracking-[.1em] text-[#333] uppercase font-semibold whitespace-nowrap">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item, i) => {
                                    const iStatus = item.status?.toLowerCase() || sKey;
                                    const iss     = getStatusStyle(iStatus);
                                    return (
                                      <tr key={i} className="border-b border-[#161616] last:border-0">
                                        <td className="pt-2.5 pr-5 text-[11px] text-[#444] font-mono whitespace-nowrap">{item.sku || "—"}</td>
                                        <td className="pt-2.5 pr-5">
                                          <div className="flex items-center gap-2.5">
                                            {item.image && (
                                              <img src={item.image} alt="" className="w-8 h-8 rounded object-cover bg-[#1a1a1a] shrink-0" />
                                            )}
                                            <span className="text-[12px] text-[#ccc] truncate max-w-[160px]">{item.name}</span>
                                          </div>
                                        </td>
                                        <td className="pt-2.5 pr-5 text-[12px] text-[#fff] whitespace-nowrap">{item.category || "—"}</td>
                                        <td className="pt-2.5 pr-5 text-[12px] text-[#888] whitespace-nowrap">₦{parseFloat(item.price).toLocaleString()}</td>
                                        <td className="pt-2.5 pr-5 text-[12px] text-[#888]">{item.quantity}</td>
                                        <td className="pt-2.5 pr-5 whitespace-nowrap">
                                          <StatusBadge status={item.status || order.status} />
                                        </td>
                                        <td className="pt-2.5">
                                          {item.productId && (
                                            <Link href={`/admin/products/${item.productId}`} className="text-[10px] text-[#444] hover:text-[#888] no-underline font-mono border border-[#1e1e1e] rounded px-2 py-1 whitespace-nowrap hover:border-[#333] transition-all">
                                              View details ↗
                                            </Link>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination />
          </div>

          {/* ── Mobile cards ── */}
          <div className="md:hidden flex flex-col gap-2.5 w-full">
            {orders.map((order, idx) => {
              const sKey = order.status?.toLowerCase();
              const ss   = getStatusStyle(sKey);
              return (
                <div key={order._id} className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <Link href={`/admin/orders/${order._id}`} className="text-[12px] text-[#e8c46a] no-underline font-mono hover:underline">
                          Order #{String(order._id).slice(-8).toUpperCase()}
                        </Link>
                        <div className="text-[10px] text-[#444] mt-0.5 font-mono">
                          {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <span className="text-[15px] font-bold text-[#e8e8e8] shrink-0">₦{getTotal(order)}</span>
                    </div>

                    {order.email && (
                      <div className="text-[11px] text-[#6ab4e8] truncate mb-2">{order.email}</div>
                    )}

                    <div className="text-[11px] text-[#444] mb-3 font-mono">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-[#1a1a1a]">
                      <select
                        value={ALL_ORDER_STATUSES.find(s => s.toLowerCase() === sKey) || order.status}
                        onChange={e => updateStatus(order._id, e.target.value)}
                        style={{ background: ss.hex + "12", borderColor: ss.hex + "44", color: ss.hex }}
                        className={`flex-1 min-w-0 border rounded-lg px-2.5 py-2 text-[11px] uppercase cursor-pointer outline-none font-mono ${updating === order._id ? "opacity-50" : ""}`}
                      >
                        {ALL_ORDER_STATUSES.map(s => (
                          <option key={s} value={s} style={{ background: "#111", color: getStatusStyle(s.toLowerCase()).hex }}>{s}</option>
                        ))}
                      </select>
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="shrink-0 text-[11px] text-[#fff] no-underline px-3.5 py-2 border border-[#222] rounded-lg hover:text-[#e8e8e8] hover:border-[#444] transition-all font-mono"
                      >
                        VIEW →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            <Pagination />
          </div>
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-[#333] p-10 text-[13px]">Loading…</div>}>
      <AdminOrdersPage />
    </Suspense>
  );
}