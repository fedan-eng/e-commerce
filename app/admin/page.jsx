// app/admin/page.jsx
"use client";
import { useEffect, useState } from "react";
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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/orders?limit=5").then((r) => r.json()),
      fetch("/api/products?limit=1").then((r) => r.json()),
    ]).then(([ordersData, productsData]) => {
      setRecentOrders(ordersData.orders || []);
      setStats({
        totalOrders: ordersData.total || 0,
        totalProducts: productsData.pagination?.total || 0,
        confirmed: (ordersData.orders || []).filter((o) => o.status?.toLowerCase() === "confirmed").length,
      });
      setLoading(false);
    });
  }, []);

  const StatCard = ({ label, value, accent, href }) => (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#111",
        border: "1px solid #222",
        borderTop: `2px solid ${accent}`,
        borderRadius: "8px",
        padding: "24px",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = accent}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderTop = `2px solid ${accent}`;
          e.currentTarget.style.borderRight = "1px solid #222";
          e.currentTarget.style.borderBottom = "1px solid #222";
          e.currentTarget.style.borderLeft = "1px solid #222";
        }}
      >
        <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#fff", textTransform: "uppercase", marginBottom: "10px" }}>{label}</div>
        <div style={{ fontSize: "36px", fontWeight: "700", color: "#e8e8e8", lineHeight: 1 }}>
          {loading ? "—" : value}
        </div>
      </div>
    </Link>
  );

  const getTotal = (order) => {
  if (order.total != null) return parseFloat(order.total).toFixed(2);
  if (order.subTotal != null) return parseFloat(order.subTotal).toFixed(2);
  // fallback: calculate from items
  const sum = (order.items || []).reduce((acc, item) => {
    return acc + parseFloat(item.price || 0) * parseFloat(item.quantity || 1);
  }, 0);
  return sum.toFixed(2);
};

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>Overview</div>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#e8e8e8", letterSpacing: "-0.02em" }}>Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
        <StatCard label="Total Orders" value={stats?.totalOrders} accent="#e8c46a" href="/admin/orders" />
        <StatCard label="Total Products" value={stats?.totalProducts} accent="#6ae8a0" href="/admin/products" />
        <StatCard label="Confirmed Orders" value={stats?.confirmed} accent="#e8c46a" href="/admin/orders?status=Confirmed" />
      </div>

      {/* Recent Orders */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "13px", color: "#fff", letterSpacing: "0.06em" }}>RECENT ORDERS</div>
          <Link href="/admin/orders" style={{ fontSize: "11px", color: "#fff", textDecoration: "none", letterSpacing: "0.1em" }}>VIEW ALL →</Link>
        </div>

        {loading ? (
          <div style={{ padding: "32px 24px", color: "#444", fontSize: "13px" }}>Loading...</div>
        ) : recentOrders.length === 0 ? (
          <div style={{ padding: "32px 24px", color: "#444", fontSize: "13px" }}>No orders yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                {["Order ID", "Items", "Total", "Status", "Date"].map((h) => (
                  <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: "10px", letterSpacing: "0.15em", color: "#fff", textTransform: "uppercase", fontWeight: "600" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} style={{ borderBottom: "1px solid #171717" }}>
                  <td style={{ padding: "14px 24px", fontSize: "12px", color: "#fff", fontFamily: "monospace" }}>
                    <Link href={`/admin/orders/${order._id}`} style={{ color: "#e8c46a", textDecoration: "none" }}>
                      #{String(order._id).slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td style={{ padding: "14px 24px", fontSize: "13px", color: "#fff" }}>{order.items?.length || 0} item(s)</td>
                  <td style={{ padding: "14px 24px", fontSize: "13px", color: "#fff", fontWeight: "600" }}>
                    ₦{getTotal(order) || "—"}
                  </td>
                  <td style={{ padding: "14px 24px" }}>
                    <span style={{
                      fontSize: "10px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: STATUS_COLORS[order.status?.toLowerCase()] || "#fff",
                      background: `${STATUS_COLORS[order.status?.toLowerCase()]}18` || "#88888818",
                      border: `1px solid ${STATUS_COLORS[order.status?.toLowerCase()]}33` || "#88888833",
                      padding: "3px 8px",
                      borderRadius: "4px",
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 24px", fontSize: "12px", color: "#fff" }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}