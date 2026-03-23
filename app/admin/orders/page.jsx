// app/admin/orders/page.jsx
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const STATUS_COLORS = {
  confirmed:  { text: "text-[#e8c46a]", bg: "bg-[#e8c46a15]", border: "border-[#e8c46a44]", hex: "#e8c46a" },
  processing: { text: "text-[#6ab4e8]", bg: "bg-[#6ab4e815]", border: "border-[#6ab4e844]", hex: "#6ab4e8" },
  processed:  { text: "text-[#6ab4e8]", bg: "bg-[#6ab4e815]", border: "border-[#6ab4e844]", hex: "#6ab4e8" },
  shipped:    { text: "text-[#a06ae8]", bg: "bg-[#a06ae815]", border: "border-[#a06ae844]", hex: "#a06ae8" },
  delivered:  { text: "text-[#6ae8a0]", bg: "bg-[#6ae8a015]", border: "border-[#6ae8a044]", hex: "#6ae8a0" },
  cancelled:  { text: "text-[#e86a6a]", bg: "bg-[#e86a6a15]", border: "border-[#e86a6a44]", hex: "#e86a6a" },
};

const ALL_STATUSES       = ["all", "Confirmed", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const ALL_ORDER_STATUSES = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];
const DAYS_OPTIONS       = [
  { label: "All time",    value: "" },
  { label: "Last 7 days",  value: "7" },
  { label: "Last 14 days", value: "14" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

function getStatusStyle(k) {
  return STATUS_COLORS[k] || { text: "text-white", bg: "bg-[#88888815]", border: "border-[#88888844]", hex: "#888" };
}

function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [loading,     setLoading]     = useState(true);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);
  const [updating,    setUpdating]    = useState(null);
  const [orders,      setOrders]      = useState([]);
  const [page,        setPage]        = useState(Number(searchParams.get("page")) || 1);
  const [statusFilter,setStatusFilter]= useState(searchParams.get("status") || "all");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [search,      setSearch]      = useState(searchParams.get("search") || "");
  const [days,        setDays]        = useState(searchParams.get("days") || "");

  const syncUrl = useCallback((o = {}) => {
    const params = new URLSearchParams();
    const sf = o.statusFilter  ?? statusFilter;
    const se = o.search        ?? search;
    const d  = o.days          ?? days;
    const pg = o.page          ?? page;
    if (sf !== "all") params.set("status", sf);
    if (se)           params.set("search", se);
    if (d)            params.set("days", d);
    if (pg > 1)       params.set("page", pg);
    const qs = params.toString();
    router.replace(qs ? `/admin/orders?${qs}` : "/admin/orders", { scroll: false });
  }, [statusFilter, search, days, page, router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (search)                 params.append("search", search);
    if (days)                   params.append("days", days);
    const res  = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
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

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } finally { setUpdating(null); }
  };

  const getTotal = (order) => {
    if (order.total != null)    return parseFloat(order.total).toLocaleString();
    if (order.subTotal != null) return parseFloat(order.subTotal).toLocaleString();
    return (order.items || [])
      .reduce((acc, i) => acc + parseFloat(i.price || 0) * parseFloat(i.quantity || 1), 0)
      .toLocaleString();
  };

  const Pagination = () => totalPages > 1 ? (
    <div className="flex justify-between items-center px-4 py-3 border-t border-[#1a1a1a]">
      <span className="text-[11px] text-[#444]">Page {page} / {totalPages}</span>
      <div className="flex gap-2">
        <button onClick={() => changePage(Math.max(1, page - 1))} disabled={page === 1}
          className={`px-3 py-1.5 bg-transparent border border-[#222] rounded text-[11px] font-mono
            ${page === 1 ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
          ← Prev
        </button>
        <button onClick={() => changePage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className={`px-3 py-1.5 bg-transparent border border-[#222] rounded text-[11px] font-mono
            ${page === totalPages ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
          Next →
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full max-w-full">
      {/* Header */}
      <div className="mb-5">
        <div className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-1">Management</div>
        <h1 className="m-0 text-2xl font-bold text-[#e8e8e8] tracking-tight">
          Orders <span className="text-[#444] text-base font-normal">({total})</span>
        </h1>
      </div>

      {/* Search — full width stacked on mobile */}
      <div className="flex flex-col gap-2 mb-3 w-full">
        <div className="relative w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text" value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitSearch()}
            placeholder="Search order ID or customer…"
            className="w-full bg-[#111] border border-[#1e1e1e] rounded-lg pl-9 pr-9 py-2.5 text-[12px] text-[#ccc] placeholder-[#3a3a3a] outline-none focus:border-[#333] font-mono"
          />
          {searchInput && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
        {/* Days + Search button on same row */}
        <div className="flex gap-2 w-full">
          <select value={days} onChange={e => handleDays(e.target.value)}
            className="flex-1 min-w-0 bg-[#111] border border-[#1e1e1e] rounded-lg px-3 py-2.5 text-[12px] text-[#888] outline-none cursor-pointer font-mono">
            {DAYS_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: "#111" }}>{o.label}</option>)}
          </select>
          <button onClick={submitSearch}
            className="flex-shrink-0 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg px-4 py-2.5 text-[11px] text-[#888] hover:text-[#ccc] font-mono tracking-[0.08em] uppercase transition-all cursor-pointer">
            Search
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {(search || days) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {search && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1cc97815] border border-[#1cc97833] rounded-full text-[10px] text-[#1cc978] font-mono">
              {search.length > 16 ? search.slice(0,16)+"…" : `"${search}"`}
              <button onClick={clearSearch} className="hover:text-white cursor-pointer">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </span>
          )}
          {days && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1cc97815] border border-[#1cc97833] rounded-full text-[10px] text-[#1cc978] font-mono">
              {DAYS_OPTIONS.find(d => d.value === days)?.label}
              <button onClick={() => handleDays("")} className="hover:text-white cursor-pointer">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </span>
          )}
        </div>
      )}

      {/* Status tabs — horizontal scroll, no wrap */}
      <div className="w-full overflow-x-auto mb-5" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        <div className="flex gap-1.5 pb-1 w-max">
          {ALL_STATUSES.map(s => {
            const active = statusFilter === s;
            const ss     = getStatusStyle(s.toLowerCase());
            return (
              <button key={s} onClick={() => handleStatus(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] tracking-[0.08em] uppercase cursor-pointer border transition-all font-mono whitespace-nowrap
                  ${active ? `${ss.text} ${ss.bg} ${ss.border}` : "text-[#555] bg-transparent border-[#222] hover:border-[#333] hover:text-[#777]"}`}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-[#444] text-[13px] text-center bg-[#111] border border-[#1e1e1e] rounded-lg">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="py-14 text-center bg-[#111] border border-[#1e1e1e] rounded-lg">
          <div className="text-[#444] text-[13px] mb-2">No orders found</div>
          {(search || days || statusFilter !== "all") && (
            <button onClick={() => { setSearch(""); setSearchInput(""); setDays(""); setStatusFilter("all"); setPage(1); router.replace("/admin/orders", { scroll: false }); }}
              className="text-[11px] text-[#555] hover:text-[#888] underline underline-offset-2 font-mono">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-[#111] border border-[#222] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {["Order ID","Customer","Items","Total","Status","Date","Actions"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] tracking-[0.12em] text-[#444] uppercase font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const sKey = order.status?.toLowerCase();
                    const ss   = getStatusStyle(sKey);
                    return (
                      <tr key={order._id} className="border-b border-[#161616] hover:bg-[#141414] transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <Link href={`/admin/orders/${order._id}`} className="text-[12px] text-[#e8c46a] no-underline font-mono hover:underline">
                            #{String(order._id).slice(-8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 max-w-[160px]">
                          <div className="text-[13px] text-[#888] truncate">{order.firstName} {order.lastName || ""}</div>
                          {order.email && <div className="text-[11px] text-[#555] truncate">{order.email}</div>}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-[#888]">{order.items?.length || 0}</td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-[#e8e8e8] whitespace-nowrap">₦{getTotal(order)}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <select value={ALL_ORDER_STATUSES.find(s => s.toLowerCase() === sKey) || order.status}
                            onChange={e => updateStatus(order._id, e.target.value)}
                            style={{ background: ss.hex + "15", borderColor: ss.hex + "44", color: ss.hex }}
                            className={`border rounded px-2 py-1 text-[11px] uppercase cursor-pointer outline-none font-mono ${updating === order._id ? "opacity-50" : ""}`}>
                            {ALL_ORDER_STATUSES.map(s => <option key={s} value={s} style={{ background: "#111", color: getStatusStyle(s.toLowerCase()).hex }}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-[#555] whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5">
                          <Link href={`/admin/orders/${order._id}`}
                            className="text-[11px] text-[#555] no-underline px-2.5 py-1 border border-[#222] rounded hover:text-[#e8e8e8] hover:border-[#444] transition-all whitespace-nowrap">
                            VIEW
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination />
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-2.5 w-full">
            {orders.map(order => {
              const sKey = order.status?.toLowerCase();
              const ss   = getStatusStyle(sKey);
              return (
                <div key={order._id} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 w-full">
                  {/* Row 1: ID + Amount */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link href={`/admin/orders/${order._id}`} className="text-[12px] text-[#e8c46a] no-underline font-mono hover:underline leading-tight">
                      #{String(order._id).slice(-8).toUpperCase()}
                    </Link>
                    <span className="text-[14px] font-bold text-[#e8e8e8] leading-tight shrink-0">
                      ₦{getTotal(order)}
                    </span>
                  </div>

                  {/* Row 2: Customer */}
                  <div className="mb-2">
                    <div className="text-[12px] text-[#777] truncate">
                      {order.firstName} {order.lastName || ""}
                    </div>
                    {order.email && (
                      <div className="text-[11px] text-[#444] truncate">{order.email}</div>
                    )}
                  </div>

                  {/* Row 3: Meta */}
                  <div className="text-[11px] text-[#444] mb-3">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""} &middot; {new Date(order.createdAt).toLocaleDateString()}
                  </div>

                  {/* Row 4: Status select + View */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#1a1a1a]">
                    <select value={ALL_ORDER_STATUSES.find(s => s.toLowerCase() === sKey) || order.status}
                      onChange={e => updateStatus(order._id, e.target.value)}
                      style={{ background: ss.hex + "15", borderColor: ss.hex + "44", color: ss.hex }}
                      className={`flex-1 min-w-0 border rounded-lg px-2.5 py-2 text-[11px] uppercase cursor-pointer outline-none font-mono ${updating === order._id ? "opacity-50" : ""}`}>
                      {ALL_ORDER_STATUSES.map(s => <option key={s} value={s} style={{ background: "#111", color: getStatusStyle(s.toLowerCase()).hex }}>{s}</option>)}
                    </select>
                    <Link href={`/admin/orders/${order._id}`}
                      className="shrink-0 text-[11px] text-[#555] no-underline px-3.5 py-2 border border-[#222] rounded-lg hover:text-[#e8e8e8] hover:border-[#444] transition-all font-mono tracking-wide">
                      VIEW →
                    </Link>
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
    <Suspense fallback={<div className="text-[#444] p-10 text-[13px]">Loading...</div>}>
      <AdminOrdersPage />
    </Suspense>
  );
}