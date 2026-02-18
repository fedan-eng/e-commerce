// app/admin/orders/[id]/page.jsx
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

const TIMELINE_STEPS = ["Confirmed", "Processing", "Shipped", "Delivered"];

const getTotal = (order) => {
  if (order.total != null) return parseFloat(order.total).toFixed(2);
  if (order.subTotal != null) return parseFloat(order.subTotal).toFixed(2);
  const sum = (order.items || []).reduce((acc, item) => {
    return acc + parseFloat(item.price || 0) * parseFloat(item.quantity || 1);
  }, 0);
  return sum.toFixed(2);
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data.order);
        setStatus(data.order?.status || "Confirmed");
        setLoading(false);
      });
  }, [id]);

  const updateStatus = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrder((prev) => ({ ...prev, status }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: "#444", fontSize: "13px", padding: "40px 0" }}>
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ color: "#e86a6a", fontSize: "13px", padding: "40px 0" }}>
        Order not found.
      </div>
    );
  }

  const normalizedStatus = order.status?.toLowerCase();
  const isCancelled = normalizedStatus === "cancelled";

  // Figure out timeline progress
  const currentStepIdx = TIMELINE_STEPS.findIndex(
    (s) => s.toLowerCase() === normalizedStatus
  );

  return (
    <div style={{ maxWidth: "960px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <Link
          href="/admin/orders"
          style={{ fontSize: "11px", color: "#555", textDecoration: "none", letterSpacing: "0.1em" }}
        >
          ← BACK TO ORDERS
        </Link>
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>
              Order Detail
            </div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#e8e8e8", fontFamily: "monospace" }}>
              #{String(order._id).slice(-10).toUpperCase()}
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "#555" }}>
              {new Date(order.createdAt).toLocaleString()}
            </div>
            {order.email && (
              <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>{order.email}</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
        {/* Left: Items + Address */}
        <div>
          {/* Order Items */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase" }}>
                Order Items
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                  {["Product", "Qty", "Price", "Subtotal"].map((h) => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "10px", letterSpacing: "0.12em", color: "#444", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #161616" }}>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            style={{ width: "38px", height: "38px", objectFit: "cover", borderRadius: "4px", background: "#1a1a1a", flexShrink: 0 }}
                          />
                        )}
                        <div>
                          <div style={{ fontSize: "13px", color: "#e8e8e8" }}>{item.name}</div>
                          {(item.size || item.color) && (
                            <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
                              {[item.size, item.color].filter(Boolean).join(" · ")}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#888" }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#888" }}>
                      ₦{parseFloat(item.price).toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#e8e8e8", fontWeight: "600" }}>
                      ₦{(parseFloat(item.price) * parseFloat(item.quantity)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals breakdown */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid #222" }}>
              {order.deliveryFee != null && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "24px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>DELIVERY</span>
                  <span style={{ fontSize: "13px", color: "#888" }}>
                    {order.deliveryFee === 0 ? "Free" : `₦${parseFloat(order.deliveryFee).toLocaleString()}`}
                  </span>
                </div>
              )}
              {order.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "24px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>DISCOUNT</span>
                  <span style={{ fontSize: "13px", color: "#6ae8a0" }}>-₦{parseFloat(order.discount).toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "24px" }}>
                <span style={{ fontSize: "12px", color: "#555" }}>TOTAL</span>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#e8e8e8" }}>
                  ₦{parseFloat(getTotal(order)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", marginBottom: "14px" }}>
              Customer Info
            </div>
            <div style={{ fontSize: "13px", color: "#888", lineHeight: "2" }}>
              {(order.firstName || order.lastName) && (
                <div style={{ color: "#e8e8e8" }}>{[order.firstName, order.lastName].filter(Boolean).join(" ")}</div>
              )}
              {order.email && <div>{order.email}</div>}
              {order.phone && <div>{order.phone}</div>}
              {order.deliveryType && <div>{order.deliveryType}</div>}
              {order.address && <div>{order.address}</div>}
              {order.city && <div>{order.city}{order.region?.name ? `, ${order.region.name}` : ""}</div>}
            </div>
          </div>

          {/* Shipping Address (if separate) */}
          {order.shippingAddress && (
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", marginBottom: "14px" }}>
                Shipping Address
              </div>
              <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.8" }}>
                <div style={{ color: "#e8e8e8" }}>{order.shippingAddress.fullName}</div>
                <div>{order.shippingAddress.address}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Status Panel */}
        <div>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px", position: "sticky", top: "20px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", marginBottom: "20px" }}>
              Order Status
            </div>

            {/* Status Timeline */}
            <div style={{ marginBottom: "24px", position: "relative" }}>
              {/* Vertical line */}
              <div style={{
                position: "absolute",
                left: "3.5px",
                top: "8px",
                bottom: "8px",
                width: "1px",
                background: "#222",
                zIndex: 0,
              }} />

              {isCancelled ? (
                // Show cancelled state
                <>
                  {TIMELINE_STEPS.map((s) => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", position: "relative", zIndex: 1 }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: "#1a1a1a", border: "1px solid #222" }} />
                      <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#2a2a2a" }}>{s}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", position: "relative", zIndex: 1 }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: "#e86a6a", border: "1px solid #e86a6a", boxShadow: "0 0 8px #e86a6a88" }} />
                    <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#e86a6a" }}>Cancelled</span>
                    <span style={{ marginLeft: "auto", fontSize: "9px", color: "#e86a6a", letterSpacing: "0.1em" }}>● NOW</span>
                  </div>
                </>
              ) : (
                TIMELINE_STEPS.map((s, stepIdx) => {
                  const isActive = s.toLowerCase() === normalizedStatus;
                  const isPast = currentStepIdx > stepIdx;
                  const color = STATUS_COLORS[s.toLowerCase()];

                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", position: "relative", zIndex: 1 }}>
                      <div style={{
                        width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                        background: isActive ? color : isPast ? "#2a3a2a" : "#1a1a1a",
                        border: `1px solid ${isActive ? color : isPast ? "#3a5a3a" : "#2a2a2a"}`,
                        boxShadow: isActive ? `0 0 8px ${color}88` : "none",
                        transition: "all 0.2s",
                      }} />
                      <span style={{
                        fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em",
                        color: isActive ? color : isPast ? "#3a6a3a" : "#333",
                        transition: "color 0.2s",
                      }}>
                        {s}
                      </span>
                      {isActive && (
                        <span style={{ marginLeft: "auto", fontSize: "9px", color, letterSpacing: "0.1em" }}>● NOW</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Status History */}
            {order.statusHistory?.length > 0 && (
              <div style={{ marginBottom: "20px", borderTop: "1px solid #1a1a1a", paddingTop: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#444", textTransform: "uppercase", marginBottom: "10px" }}>History</div>
                {order.statusHistory.map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: STATUS_COLORS[h.status?.toLowerCase()] || "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {h.status}
                    </span>
                    <span style={{ fontSize: "11px", color: "#444" }}>
                      {new Date(h.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Status Update */}
            <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "16px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#444", textTransform: "uppercase", marginBottom: "8px" }}>
                Update Status
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: "100%",
                  background: "#0a0a0a",
                  border: `1px solid ${STATUS_COLORS[status?.toLowerCase()] || "#333"}55`,
                  color: STATUS_COLORS[status?.toLowerCase()] || "#888",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  outline: "none",
                  marginBottom: "10px",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                }}
              >
                {["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                  <option key={s} value={s} style={{ background: "#111", color: STATUS_COLORS[s.toLowerCase()] }}>
                    {s}
                  </option>
                ))}
              </select>

              {error && (
                <div style={{ fontSize: "11px", color: "#e86a6a", marginBottom: "8px", padding: "8px 10px", background: "#e86a6a12", borderRadius: "4px", border: "1px solid #e86a6a22" }}>
                  {error}
                </div>
              )}

              <button
                onClick={updateStatus}
                disabled={saving || status?.toLowerCase() === order.status?.toLowerCase()}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: saved ? "#1a2e1a" : saving ? "#1a1a1a" : "#e8c46a",
                  color: saved ? "#6ae8a0" : saving ? "#444" : "#0a0a0a",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "11px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontWeight: "700",
                  cursor: (saving || status?.toLowerCase() === order.status?.toLowerCase()) ? "default" : "pointer",
                  transition: "all 0.2s",
                  opacity: status?.toLowerCase() === order.status?.toLowerCase() ? 0.4 : 1,
                  boxSizing: "border-box",
                }}
              >
                {saved ? "✓ Saved" : saving ? "Saving..." : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}