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
  { label: "All time",   value: "" },
  { label: "Last 7 days",  value: "7" },
  { label: "Last 14 days", value: "14" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

function getStatusStyle(statusKey) {
  return STATUS_COLORS[statusKey] || { text: "text-white", bg: "bg-[#88888815]", border: "border-[#88888844]", hex: "#888" };
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [loading, setLoading]       = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [updating, setUpdating]     = useState(null);
  const [orders, setOrders]         = useState([]);
  const [page, setPage]             = useState(Number(searchParams.get("page")) || 1);

  // Filters — initialise from URL so direct links work (e.g. ?search=697878dd...)
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [searchInput, setSearchInput]   = useState(searchParams.get("search") || "");
  const [search, setSearch]             = useState(searchParams.get("search") || "");
  const [days, setDays]                 = useState(searchParams.get("days") || "");

  const searchRef = useRef(null);

  // Sync URL → state when user pastes a direct link
  useEffect(() => {
    const s = searchParams.get("search") || "";
    setSearch(s);
    setSearchInput(s);
  }, [searchParams]);

  // ── Push filter changes to URL ──────────────────────────────────────────────
  const syncUrl = useCallback((overrides = {}) => {
    const params = new URLSearchParams();
    const sf  = overrides.statusFilter  ?? statusFilter;
    const se  = overrides.search        ?? search;
    const d   = overrides.days          ?? days;
    const pg  = overrides.page          ?? page;
    if (sf !== "all") params.set("status", sf);
    if (se)           params.set("search", se);
    if (d)            params.set("days", d);
    if (pg > 1)       params.set("page", pg);
    const qs = params.toString();
    router.replace(qs ? `/admin/orders?${qs}` : "/admin/orders", { scroll: false });
  }, [statusFilter, search, days, page, router]);

  // ── Fetch ───────────────────────────────────────────────────────────────────
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

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSearchSubmit = () => {
    const trimmed = searchInput.trim();
    setSearch(trimmed);
    setPage(1);
    syncUrl({ search: trimmed, page: 1 });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearchSubmit();
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
    syncUrl({ search: "", page: 1 });
  };

  const handleStatusChange = (s) => {
    setStatusFilter(s);
    setPage(1);
    syncUrl({ statusFilter: s, page: 1 });
  };

  const handleDaysChange = (d) => {
    setDays(d);
    setPage(1);
    syncUrl({ days: d, page: 1 });
  };

  const changePage = (newPage) => {
    setPage(newPage);
    syncUrl({ page: newPage });
  };

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
    if (order.total != null)    return parseFloat(order.total).toLocaleString("en-NG", { minimumFractionDigits: 2 });
    if (order.subTotal != null) return parseFloat(order.subTotal).toLocaleString("en-NG", { minimumFractionDigits: 2 });
    return (order.items || [])
      .reduce((acc, item) => acc + parseFloat(item.price || 0) * parseFloat(item.quantity || 1), 0)
      .toLocaleString("en-NG", { minimumFractionDigits: 2 });
  };

  const PaginationRow = () => totalPages > 1 ? (
    <div className="flex justify-between items-center px-5 py-4 border-t border-[#1a1a1a]">
      <span className="text-[12px] text-[#444]">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <button onClick={() => changePage(Math.max(1, page - 1))} disabled={page === 1}
          className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono
            ${page === 1 ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
          ← Prev
        </button>
        <button onClick={() => changePage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono
            ${page === totalPages ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
          Next →
        </button>
      </div>
    </div>
  ) : null;

  const activeFilters = [
    search && { label: `"${search.length > 20 ? search.slice(0, 20) + "…" : search}"`, onRemove: clearSearch },
    days   && { label: DAYS_OPTIONS.find(d => d.value === days)?.label, onRemove: () => handleDaysChange("") },
  ].filter(Boolean);

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="text-[11px] tracking-[0.2em] text-[#555] uppercase mb-1.5">Management</div>
        <h1 className="m-0 text-[28px] font-bold text-[#e8e8e8] tracking-tight">
          Orders <span className="text-[#444] text-lg">({total})</span>
        </h1>
      </div>

      {/* ── Search + Days filter row ── */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {/* Search bar */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none">
            <SearchIcon />
          </span>
          <input
            ref={searchRef}
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by order ID or customer ID…"
            className="w-full bg-[#111] border border-[#222] rounded-lg pl-9 pr-9 py-2.5 text-[13px] text-[#ccc] placeholder-[#3a3a3a] outline-none focus:border-[#333] transition-colors font-mono"
          />
          {searchInput && (
            <button onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors cursor-pointer">
              <XIcon />
            </button>
          )}
        </div>

        {/* Days filter */}
        <select
          value={days}
          onChange={e => handleDaysChange(e.target.value)}
          className="bg-[#111] border border-[#222] rounded-lg px-3 py-2.5 text-[12px] text-[#888] outline-none focus:border-[#333] cursor-pointer font-mono transition-colors sm:w-auto w-full"
        >
          {DAYS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value} style={{ background: "#111" }}>{opt.label}</option>
          ))}
        </select>

        {/* Search button */}
        <button
          onClick={handleSearchSubmit}
          className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#222] rounded-lg px-5 py-2.5 text-[12px] text-[#888] hover:text-[#ccc] font-mono tracking-[0.1em] uppercase transition-all cursor-pointer whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {/* ── Active filter chips ── */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map((f, i) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#1cc97815] border border-[#1cc97833] rounded-full text-[11px] text-[#1cc978] font-mono">
              {f.label}
              <button onClick={f.onRemove} className="hover:text-white transition-colors cursor-pointer"><XIcon /></button>
            </span>
          ))}
        </div>
      )}

      {/* ── Status Filter Tabs ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {ALL_STATUSES.map((s) => {
          const active    = statusFilter === s;
          const styleInfo = getStatusStyle(s.toLowerCase());
          return (
            <button key={s} onClick={() => handleStatusChange(s)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] tracking-[0.1em] uppercase cursor-pointer border transition-all font-mono
                ${active
                  ? `${styleInfo.text} ${styleInfo.bg} ${styleInfo.border}`
                  : "text-[#555] bg-transparent border-[#222] hover:border-[#333] hover:text-[#777]"
                }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-12 text-[#444] text-[13px] text-center bg-[#111] border border-[#222] rounded-lg">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-[#111] border border-[#222] rounded-lg">
          <div className="text-[#333] text-[13px] mb-2">No orders found</div>
          {(search || days || statusFilter !== "all") && (
            <button onClick={() => { setSearch(""); setSearchInput(""); setDays(""); setStatusFilter("all"); setPage(1); router.replace("/admin/orders", { scroll: false }); }}
              className="text-[11px] text-[#555] hover:text-[#888] underline underline-offset-2 cursor-pointer transition-colors font-mono tracking-[0.08em]">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Desktop Table ── */}
          <div className="hidden md:block bg-[#111] border border-[#222] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {["Order ID", "Customer", "Items", "Total", "Status", "Date", "Actions"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] tracking-[0.15em] text-[#444] uppercase font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const sKey   = order.status?.toLowerCase();
                    const sStyle = getStatusStyle(sKey);
                    return (
                      <tr key={order._id} className="border-b border-[#161616] hover:bg-[#141414] transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <Link href={`/admin/orders/${order._id}`} className="text-[12px] text-[#e8c46a] no-underline font-mono hover:underline">
                            #{String(order._id).slice(-8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 max-w-[180px]">
                          <div className="text-[13px] text-[#888] truncate">{order.firstName} {order.lastName || ""}</div>
                          {order.email && <div className="text-[11px] text-[#555] truncate">{order.email}</div>}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-[#888]">{order.items?.length || 0}</td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-[#e8e8e8] whitespace-nowrap">₦{getTotal(order)}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <select value={ALL_ORDER_STATUSES.find(s => s.toLowerCase() === sKey) || order.status}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            style={{ background: sStyle.hex + "15", borderColor: sStyle.hex + "44", color: sStyle.hex }}
                            className={`border rounded px-2 py-1 text-[11px] tracking-[0.08em] uppercase cursor-pointer outline-none font-mono transition-opacity
                              ${updating === order._id ? "opacity-50" : "opacity-100"}`}
                          >
                            {ALL_ORDER_STATUSES.map(s => <option key={s} value={s} style={{ background: "#111", color: getStatusStyle(s.toLowerCase()).hex }}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-[#555] whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <Link href={`/admin/orders/${order._id}`}
                            className="text-[11px] text-[#555] no-underline tracking-[0.1em] px-2.5 py-1 border border-[#222] rounded transition-all hover:text-[#e8e8e8] hover:border-[#444]">
                            VIEW
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationRow />
          </div>

          {/* ── Mobile Cards ── */}
          <div className="md:hidden flex flex-col gap-2.5">
            {orders.map((order) => {
              const sKey   = order.status?.toLowerCase();
              const sStyle = getStatusStyle(sKey);
              return (
                <div key={order._id} className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 hover:border-[#2a2a2a] transition-colors">
                  {/* Top row: ID + amount */}
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="min-w-0">
                      <Link href={`/admin/orders/${order._id}`} className="text-[12px] text-[#e8c46a] no-underline font-mono tracking-[0.04em] hover:underline">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </Link>
                      <div className="text-[12px] text-[#666] mt-0.5 truncate max-w-[200px]">
                        {order.firstName} {order.lastName || ""}
                      </div>
                      {order.email && (
                        <div className="text-[11px] text-[#444] truncate max-w-[200px]">{order.email}</div>
                      )}
                    </div>
                    <div className="text-[15px] font-bold text-[#e8e8e8] whitespace-nowrap shrink-0">
                      ₦{getTotal(order)}
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="text-[11px] text-[#444] mb-3">
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""} · {new Date(order.createdAt).toLocaleDateString()}
                  </div>

                  {/* Bottom row: status select + view link */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#1a1a1a]">
                    <select value={ALL_ORDER_STATUSES.find(s => s.toLowerCase() === sKey) || order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      style={{ background: sStyle.hex + "15", borderColor: sStyle.hex + "44", color: sStyle.hex }}
                      className={`border rounded px-2.5 py-1.5 text-[11px] tracking-[0.08em] uppercase cursor-pointer outline-none font-mono shrink-0
                        ${updating === order._id ? "opacity-50" : "opacity-100"}`}
                    >
                      {ALL_ORDER_STATUSES.map(s => <option key={s} value={s} style={{ background: "#111", color: getStatusStyle(s.toLowerCase()).hex }}>{s}</option>)}
                    </select>
                    <Link href={`/admin/orders/${order._id}`}
                      className="text-[11px] text-[#555] no-underline tracking-[0.1em] px-3.5 py-1.5 border border-[#222] rounded hover:text-[#e8e8e8] hover:border-[#444] transition-all whitespace-nowrap shrink-0">
                      VIEW →
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Mobile pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[12px] text-[#444]">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => changePage(Math.max(1, page - 1))} disabled={page === 1}
                    className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono
                      ${page === 1 ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
                    ← Prev
                  </button>
                  <button onClick={() => changePage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                    className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono
                      ${page === totalPages ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
                    Next →
                  </button>
                </div>
              </div>
            )}
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