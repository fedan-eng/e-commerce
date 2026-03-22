// app/admin/orders/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
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

function getStatusStyle(statusKey) {
  return STATUS_COLORS[statusKey] || { text: "text-white", bg: "bg-[#88888815]", border: "border-[#88888844]", hex: "#888" };
}

function AdminOrdersPage() {
  const [loading, setLoading]       = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [updating, setUpdating]     = useState(null);
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [orders, setOrders] = useState([]);
  const [page, setPage]     = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (statusFilter !== "all") params.append("status", statusFilter);
    const res  = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

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
    if (order.total != null)    return parseFloat(order.total).toFixed(2);
    if (order.subTotal != null) return parseFloat(order.subTotal).toFixed(2);
    return (order.items || []).reduce((acc, item) =>
      acc + parseFloat(item.price || 0) * parseFloat(item.quantity || 1), 0).toFixed(2);
  };

  const Pagination = () => totalPages > 1 ? (
    <div className="flex justify-between items-center mt-4 px-1">
      <span className="text-[12px] text-[#444]">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono
            ${page === 1 ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
          ← Prev
        </button>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
          className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono
            ${page === totalPages ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
          Next →
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="text-[11px] tracking-[0.2em] text-[#555] uppercase mb-1.5">Management</div>
        <h1 className="m-0 text-[28px] font-bold text-[#e8e8e8] tracking-tight">
          Orders <span className="text-[#444] text-lg">({total})</span>
        </h1>
      </div>

      {/* Filter Tabs — scroll on mobile */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {ALL_STATUSES.map((s) => {
          const active    = statusFilter === s;
          const styleInfo = getStatusStyle(s.toLowerCase());
          return (
            <button key={s} onClick={() => {
              setStatusFilter(s); setPage(1);
              router.replace(s === "all" ? "/admin/orders" : `/admin/orders?status=${s}`, { scroll: false });
            }}
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
        <div className="py-12 text-[#444] text-[13px] text-center bg-[#111] border border-[#222] rounded-lg">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-[#444] text-[13px] text-center bg-[#111] border border-[#222] rounded-lg">No orders found.</div>
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
                        <td className="px-5 py-3.5 text-[13px] text-[#888] whitespace-nowrap">
                          {order.firstName} {order.email ? `(${order.email})` : "—"}
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
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-[#1a1a1a] flex justify-between items-center">
                <span className="text-[12px] text-[#444]">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono ${page === 1 ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
                    ← Prev
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono ${page === totalPages ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile Cards ── */}
          <div className="md:hidden flex flex-col gap-2.5">
            {orders.map((order) => {
              const sKey   = order.status?.toLowerCase();
              const sStyle = getStatusStyle(sKey);
              return (
                <div key={order._id} className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 hover:border-[#2a2a2a] transition-colors">
                  <div className="flex justify-between items-start gap-2 mb-2.5">
                    <div>
                      <Link href={`/admin/orders/${order._id}`} className="text-[12px] text-[#e8c46a] no-underline font-mono tracking-[0.04em] hover:underline">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </Link>
                      <div className="text-[12px] text-[#666] mt-0.5">
                        {order.firstName}{order.email ? ` · ${order.email}` : ""}
                      </div>
                      <div className="text-[11px] text-[#444] mt-0.5">
                        {order.items?.length || 0} item(s) · {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-[15px] font-bold text-[#e8e8e8] whitespace-nowrap">₦{getTotal(order)}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#1a1a1a] flex-wrap gap-y-2">
                    <select value={ALL_ORDER_STATUSES.find(s => s.toLowerCase() === sKey) || order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      style={{ background: sStyle.hex + "15", borderColor: sStyle.hex + "44", color: sStyle.hex }}
                      className={`border rounded px-2.5 py-1.5 text-[11px] tracking-[0.08em] uppercase cursor-pointer outline-none font-mono
                        ${updating === order._id ? "opacity-50" : "opacity-100"}`}
                    >
                      {ALL_ORDER_STATUSES.map(s => <option key={s} value={s} style={{ background: "#111", color: getStatusStyle(s.toLowerCase()).hex }}>{s}</option>)}
                    </select>
                    <Link href={`/admin/orders/${order._id}`}
                      className="text-[11px] text-[#555] no-underline tracking-[0.1em] px-3.5 py-1.5 border border-[#222] rounded hover:text-[#e8e8e8] hover:border-[#444] transition-all">
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