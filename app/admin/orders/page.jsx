// app/admin/orders/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const STATUS_COLORS = {
  pending: "#e8c46a",
  confirmed: "#e8c46a",   // 👈 add
  processing: "#6ab4e8",
  processed: "#6ab4e8",   // 👈 add
  shipped: "#a06ae8",
  delivered: "#6ae8a0",
  cancelled: "#e86a6a",
};

const ALL_STATUSES = ["all", "Confirmed", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState(null); // orderId being updated

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (statusFilter !== "all") params.append("status", statusFilter);

    const res = await fetch(`/api/admin/orders?${params}`);
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o)
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  const getTotal = (order) => {
  if (order.total != null) return parseFloat(order.total).toFixed(2);
  if (order.subTotal != null) return parseFloat(order.subTotal).toFixed(2);
  // fallback: calculate from items
  const sum = (order.items || []).reduce((acc, item) => {
    return acc + parseFloat(item.price || 0) * parseFloat(item.quantity || 1);
  }, 0);
  return sum.toFixed(2);
};

const ALL_ORDER_STATUSES = ["Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>Management</div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#e8e8e8", letterSpacing: "-0.02em" }}>
            Orders <span style={{ color: "#444", fontSize: "18px" }}>({total})</span>
          </h1>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} style={{
            padding: "7px 16px",
            borderRadius: "20px",
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            border: statusFilter === s
              ? `1px solid ${STATUS_COLORS[s] || "#e8e8e8"}`
              : "1px solid #222",
            color: statusFilter === s ? (STATUS_COLORS[s] || "#e8e8e8") : "#555",
            background: statusFilter === s ? `${STATUS_COLORS[s] || "#e8e8e8"}12` : "transparent",
            transition: "all 0.15s",
          }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px 24px", color: "#444", fontSize: "13px", textAlign: "center" }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "48px 24px", color: "#444", fontSize: "13px", textAlign: "center" }}>No orders found.</div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                  {["Order ID", "Customer", "Items", "Total", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", fontWeight: "600" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: "1px solid #161616", transition: "background 0.1s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#141414"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <Link href={`/admin/orders/${order._id}`} style={{ fontSize: "12px", color: "#e8c46a", textDecoration: "none", fontFamily: "monospace" }}>
                        #{String(order._id).slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#888" }}>
                      {order.firstName + " " + (order.email ? `(${order.email})` : "—")}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#888" }}>
                      {order.items?.length || 0}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: "600", color: "#e8e8e8", display: "flex", alignItems: "center", gap: "4px" }}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" 
    style={{ width: "14px", height: "14px", fill: "#e8e8e8", flexShrink: 0 }}>
    <path d="M218.6 110.3C210.8 98.6 196.2 93.3 182.7 97.4C169.2 101.5 160 113.9 160 128L160 320L128 320C114.7 320 104 330.7 104 344C104 357.3 114.7 368 128 368L160 368L160 512C160 529.7 174.3 544 192 544C209.7 544 224 529.7 224 512L224 368L313.5 368L421.3 529.8C429.1 541.5 443.7 546.8 457.2 542.7C470.7 538.6 480 526.1 480 512L480 368L512 368C525.3 368 536 357.3 536 344C536 330.7 525.3 320 512 320L480 320L480 128C480 110.3 465.7 96 448 96C430.3 96 416 110.3 416 128L416 320L358.5 320L218.7 110.3zM390.5 368L416 368L416 406.3L390.5 368zM281.5 320L224 320L224 233.7L281.5 320z"/>
  </svg>
  {getTotal(order) || "—"}
</td>
                    <td style={{ padding: "14px 20px" }}>
                      {/* Inline status dropdown */}
                      <select
                        value={ALL_ORDER_STATUSES.find(
    s => s.toLowerCase() === order.status?.toLowerCase()
  ) || order.status}
  onChange={(e) => updateStatus(order._id, e.target.value)}
                        style={{
                          background: `${STATUS_COLORS[order.status]}15`,
                          border: `1px solid ${STATUS_COLORS[order.status]}44`,
                          color: STATUS_COLORS[order.status],
                          borderRadius: "4px",
                          padding: "4px 8px",
                          fontSize: "11px",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          outline: "none",
                          opacity: updating === order._id ? 0.5 : 1,
                        }}
                      >
                         {ALL_ORDER_STATUSES.map((s) => (
    <option key={s} value={s} style={{ background: "#111", color: STATUS_COLORS[order.status?.toLowerCase()] }}>
      {s}
    </option>
  ))}
                      </select>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "12px", color: "#555" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <Link href={`/admin/orders/${order._id}`} style={{
                        fontSize: "11px", color: "#555", textDecoration: "none",
                        letterSpacing: "0.1em", padding: "4px 10px", border: "1px solid #222",
                        borderRadius: "4px", transition: "all 0.15s",
                      }}
                        onMouseEnter={(e) => { e.target.style.color = "#e8e8e8"; e.target.style.borderColor = "#444"; }}
                        onMouseLeave={(e) => { e.target.style.color = "#555"; e.target.style.borderColor = "#222"; }}
                      >
                        VIEW
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: "16px 20px", borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#444" }}>Page {page} of {totalPages}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding: "6px 14px", background: "transparent", border: "1px solid #222", color: page === 1 ? "#333" : "#888", borderRadius: "4px", cursor: page === 1 ? "default" : "pointer", fontSize: "12px" }}>
                    ← Prev
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ padding: "6px 14px", background: "transparent", border: "1px solid #222", color: page === totalPages ? "#333" : "#888", borderRadius: "4px", cursor: page === totalPages ? "default" : "pointer", fontSize: "12px" }}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}