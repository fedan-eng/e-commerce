// app/admin/customers/[id]/page.jsx  ← NEW file
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS = {
  confirmed: "#e8c46a",
  pending: "#e8c46a",
  processing: "#6ab4e8",
  processed: "#6ab4e8",
  shipped: "#a06ae8",
  delivered: "#6ae8a0",
  cancelled: "#e86a6a",
};

const getTotal = (order) => {
  if (order.total != null) return parseFloat(order.total).toLocaleString();
  if (order.subTotal != null) return parseFloat(order.subTotal).toLocaleString();
  return "—";
};

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("user");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(r => r.json())
      .then(data => {
        setUser(data.user);
        setOrders(data.orders || []);
        setRole(data.user?.role || "user");
        setIsActive(data.user?.isActive !== false); // default true if field doesn't exist
        setLoading(false);
      });
  }, [id]);

  const saveChanges = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, isActive }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

 const currentIsActive = user.isActive ?? true; // treat undefined as true
const hasChanges = user && (role !== user.role || isActive !== currentIsActive);

  if (loading) return <div style={{ color: "#444", fontSize: "13px", padding: "40px 0" }}>Loading customer...</div>;
  if (!user) return <div style={{ color: "#e86a6a", fontSize: "13px", padding: "40px 0" }}>Customer not found.</div>;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
  const initials = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || user.email?.[0]?.toUpperCase() || "?";
  const totalSpent = orders.reduce((acc, o) => acc + (parseFloat(o.total || o.subTotal || 0)), 0);

  return (
    <div style={{ maxWidth: "960px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <Link href="/admin/customers" style={{ fontSize: "11px", color: "#555", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← BACK TO CUSTOMERS
        </Link>
        <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Avatar */}
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: user.role === "admin" ? "#e8c46a18" : "#6ab4e818",
            border: `1px solid ${user.role === "admin" ? "#e8c46a33" : "#6ab4e833"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", fontWeight: "700",
            color: user.role === "admin" ? "#e8c46a" : "#6ab4e8",
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: "4px" }}>Customer</div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#e8e8e8", letterSpacing: "-0.02em" }}>
              {fullName}
              {user.isActive === false && (
                <span style={{ marginLeft: "12px", fontSize: "11px", color: "#e86a6a", letterSpacing: "0.1em", background: "#e86a6a18", border: "1px solid #e86a6a33", padding: "3px 8px", borderRadius: "4px", verticalAlign: "middle" }}>
                  SUSPENDED
                </span>
              )}
            </h1>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" }}>
        {/* Left */}
        <div>
          {/* Stats strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            {[
              { label: "Total Orders", value: orders.length },
              { label: "Total Spent", value: `₦${totalSpent.toLocaleString()}` },
              { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString() },
            ].map(s => (
              <div key={s.label} style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "16px 20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", marginBottom: "8px" }}>{s.label}</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#e8e8e8" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Profile Info */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", marginBottom: "16px" }}>Profile Info</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
              {[
                { label: "Email", value: user.email },
                { label: "Phone", value: user.phone || "—" },
                { label: "Additional Phone", value: user.addPhone || "—" },
                { label: "Date of Birth", value: user.dob || "—" },
                { label: "Address", value: user.address || "—" },
                { label: "City", value: user.city || "—" },
                { label: "Region", value: user.region?.name || "—" },
                { label: "Country", value: user.country || "—" },
              ].map(f => (
                <div key={f.label} style={{ padding: "10px 0", borderBottom: "1px solid #171717" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#444", textTransform: "uppercase", marginBottom: "4px" }}>{f.label}</div>
                  <div style={{ fontSize: "13px", color: "#888" }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Order History */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase" }}>
                Order History ({orders.length})
              </div>
            </div>
            {orders.length === 0 ? (
              <div style={{ padding: "32px 20px", color: "#444", fontSize: "13px", textAlign: "center" }}>
                No orders yet.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                    {["Order ID", "Items", "Total", "Status", "Date"].map(h => (
                      <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "10px", letterSpacing: "0.12em", color: "#444", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} style={{ borderBottom: "1px solid #161616" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#141414"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "12px 20px" }}>
                        <Link href={`/admin/orders/${order._id}`} style={{ fontSize: "12px", color: "#e8c46a", textDecoration: "none", fontFamily: "monospace" }}>
                          #{String(order._id).slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td style={{ padding: "12px 20px", fontSize: "13px", color: "#666" }}>{order.items?.length || 0}</td>
                      <td style={{ padding: "12px 20px", fontSize: "13px", color: "#e8e8e8", fontWeight: "600" }}>₦{getTotal(order)}</td>
                      <td style={{ padding: "12px 20px" }}>
                        <span style={{
                          fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase",
                          color: STATUS_COLORS[order.status?.toLowerCase()] || "#888",
                          background: `${STATUS_COLORS[order.status?.toLowerCase()] || "#888"}18`,
                          border: `1px solid ${STATUS_COLORS[order.status?.toLowerCase()] || "#888"}33`,
                          padding: "3px 8px", borderRadius: "4px",
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 20px", fontSize: "12px", color: "#555" }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Actions Panel */}
        <div>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px", position: "sticky", top: "20px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", marginBottom: "20px" }}>
              Account Controls
            </div>

            {/* Role */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#444", textTransform: "uppercase", marginBottom: "8px" }}>Role</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {["user", "admin"].map(r => (
                  <button key={r} onClick={() => setRole(r)} style={{
                    flex: 1, padding: "9px", borderRadius: "6px", cursor: "pointer",
                    fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
                    fontWeight: role === r ? "700" : "400",
                    border: role === r ? `1px solid ${r === "admin" ? "#e8c46a" : "#6ab4e8"}` : "1px solid #222",
                    background: role === r ? `${r === "admin" ? "#e8c46a" : "#6ab4e8"}12` : "transparent",
                    color: role === r ? (r === "admin" ? "#e8c46a" : "#6ab4e8") : "#444",
                    transition: "all 0.15s",
                  }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Status */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#444", textTransform: "uppercase", marginBottom: "8px" }}>Account Status</div>
              <button onClick={() => setIsActive(a => !a)} style={{
                width: "100%", padding: "10px", borderRadius: "6px", cursor: "pointer",
                fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: "600",
                border: isActive ? "1px solid #6ae8a033" : "1px solid #e86a6a33",
                background: isActive ? "#6ae8a012" : "#e86a6a12",
                color: isActive ? "#6ae8a0" : "#e86a6a",
                transition: "all 0.2s",
              }}>
                {isActive ? "● Active — Click to Suspend" : "● Suspended — Click to Restore"}
              </button>
              <div style={{ fontSize: "11px", color: "#333", marginTop: "6px", lineHeight: "1.5" }}>
                {isActive
                  ? "Customer can log in and place orders."
                  : "Customer account is suspended."}
              </div>
            </div>

            {error && (
              <div style={{ padding: "10px 12px", background: "#e86a6a18", border: "1px solid #e86a6a33", borderRadius: "6px", color: "#e86a6a", fontSize: "12px", marginBottom: "12px" }}>
                {error}
              </div>
            )}

            <button
              onClick={saveChanges}
              disabled={saving || saved || !hasChanges}
              style={{
                width: "100%", padding: "11px",
                background: saved ? "#1a2e1a" : saving ? "#1a1a1a" : hasChanges ? "#e8c46a" : "#141414",
                color: saved ? "#6ae8a0" : saving ? "#444" : hasChanges ? "#0a0a0a" : "#333",
                border: "none", borderRadius: "6px",
                fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
                fontWeight: "700", cursor: (saving || !hasChanges) ? "default" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {saved ? "✓ Saved" : saving ? "Saving..." : "Save Changes"}
            </button>

            {/* Quick links */}
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#444", textTransform: "uppercase", marginBottom: "10px" }}>Quick Links</div>
              <a href={`mailto:${user.email}`} style={{
                display: "block", padding: "8px 0",
                fontSize: "12px", color: "#555", textDecoration: "none",
                borderBottom: "1px solid #161616", transition: "color 0.15s",
              }}
                onMouseEnter={e => e.target.style.color = "#888"}
                onMouseLeave={e => e.target.style.color = "#555"}
              >
                ✉ Email customer
              </a>
              {orders.length > 0 && (
                <Link href={`/admin/orders?search=${user._id}`} style={{
                  display: "block", paddingTop: "8px",
                  fontSize: "12px", color: "#555", textDecoration: "none", transition: "color 0.15s",
                }}
                  onMouseEnter={e => e.target.style.color = "#888"}
                  onMouseLeave={e => e.target.style.color = "#555"}
                >
                  ◈ View all orders
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}