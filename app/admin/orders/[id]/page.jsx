// app/admin/orders/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS = {
  confirmed:  "#e8c46a", pending:  "#e8c46a",
  processing: "#6ab4e8", processed: "#6ab4e8",
  shipped:    "#a06ae8", delivered: "#6ae8a0",
  cancelled:  "#e86a6a",
};

const TIMELINE_STEPS = ["Confirmed", "Processing", "Shipped", "Delivered"];

const getTotal = (order) => {
  if (order.total != null)    return parseFloat(order.total).toFixed(2);
  if (order.subTotal != null) return parseFloat(order.subTotal).toFixed(2);
  return (order.items || []).reduce((acc, item) =>
    acc + parseFloat(item.price || 0) * parseFloat(item.quantity || 1), 0).toFixed(2);
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState("");
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(data => { setOrder(data.order); setStatus(data.order?.status || "Confirmed"); setLoading(false); });
  }, [id]);

  const updateStatus = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { setOrder(prev => ({ ...prev, status })); setSaved(true); setTimeout(() => setSaved(false), 2500); }
      else        { const data = await res.json(); setError(data.message || "Failed to update"); }
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-[#444] text-[13px] pt-10">Loading order...</div>;
  if (!order)  return <div className="text-[#e86a6a] text-[13px] pt-10">Order not found.</div>;

  const normalizedStatus = order.status?.toLowerCase();
  const isCancelled      = normalizedStatus === "cancelled";
  const currentStepIdx   = TIMELINE_STEPS.findIndex(s => s.toLowerCase() === normalizedStatus);

  return (
    <div className="max-w-[960px]">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/orders" className="text-[11px] text-[#555] no-underline tracking-[0.1em] hover:text-[#888] transition-colors">
          ← BACK TO ORDERS
        </Link>
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
          <div>
            <div className="text-[11px] tracking-[0.2em] text-[#555] uppercase mb-1.5">Order Detail</div>
            <h1 className="m-0 text-[24px] font-bold text-[#e8e8e8] font-mono">
              #{String(order._id).slice(-10).toUpperCase()}
            </h1>
          </div>
          <div className="sm:text-right">
            <div className="text-[12px] text-[#555]">{new Date(order.createdAt).toLocaleString()}</div>
            {order.email && <div className="text-[12px] text-[#666] mt-1">{order.email}</div>}
          </div>
        </div>
      </div>

      {/* Layout: 2-col on md+, stacked on mobile */}
      <div className="flex flex-col md:grid md:grid-cols-[1fr_300px] gap-5">

        {/* Left */}
        <div>
          {/* Order Items */}
          <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-[#1a1a1a]">
              <div className="text-[10px] tracking-[0.15em] text-[#444] uppercase">Order Items</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[380px]">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {["Product", "Qty", "Price", "Subtotal"].map(h => (
                      <th key={h} className="px-5 py-2.5 text-left text-[10px] tracking-[0.12em] text-[#444] uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, i) => (
                    <tr key={i} className="border-b border-[#161616]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {item.image && <img src={item.image} alt="" className="w-9 h-9 object-cover rounded bg-[#1a1a1a] flex-shrink-0" />}
                          <div>
                            <div className="text-[13px] text-[#e8e8e8] whitespace-nowrap">{item.name}</div>
                            {(item.size || item.color) && (
                              <div className="text-[11px] text-[#555] mt-0.5">{[item.size, item.color].filter(Boolean).join(" · ")}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#888] whitespace-nowrap">{item.quantity}</td>
                      <td className="px-5 py-3.5 text-[13px] text-[#888] whitespace-nowrap">₦{parseFloat(item.price).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-[13px] text-[#e8e8e8] font-semibold whitespace-nowrap">
                        ₦{(parseFloat(item.price) * parseFloat(item.quantity)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Totals */}
            <div className="px-5 py-4 border-t border-[#222]">
              {order.deliveryFee != null && (
                <div className="flex justify-end gap-6 mb-2">
                  <span className="text-[12px] text-[#555]">DELIVERY</span>
                  <span className="text-[13px] text-[#888]">{order.deliveryFee === 0 ? "Free" : `₦${parseFloat(order.deliveryFee).toLocaleString()}`}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-end gap-6 mb-2">
                  <span className="text-[12px] text-[#555]">DISCOUNT</span>
                  <span className="text-[13px] text-[#6ae8a0]">-₦{parseFloat(order.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-end gap-6">
                <span className="text-[12px] text-[#555]">TOTAL</span>
                <span className="text-lg font-bold text-[#e8e8e8]">₦{parseFloat(getTotal(order)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-[#111] border border-[#222] rounded-lg p-5 mb-5">
            <div className="text-[10px] tracking-[0.15em] text-[#444] uppercase mb-3.5">Customer Info</div>
            <div className="text-[13px] text-[#888] leading-loose">
              {(order.firstName || order.lastName) && <div className="text-[#e8e8e8]">{[order.firstName, order.lastName].filter(Boolean).join(" ")}</div>}
              {order.email        && <div>{order.email}</div>}
              {order.phone        && <div>{order.phone}</div>}
              {order.deliveryType && <div>{order.deliveryType}</div>}
              {order.address      && <div>{order.address}</div>}
              {order.city         && <div>{order.city}{order.region?.name ? `, ${order.region.name}` : ""}</div>}
            </div>
          </div>

          {order.shippingAddress && (
            <div className="bg-[#111] border border-[#222] rounded-lg p-5">
              <div className="text-[10px] tracking-[0.15em] text-[#444] uppercase mb-3.5">Shipping Address</div>
              <div className="text-[13px] text-[#888] leading-relaxed">
                <div className="text-[#e8e8e8]">{order.shippingAddress.fullName}</div>
                <div>{order.shippingAddress.address}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Status Panel */}
        <div>
          <div className="bg-[#111] border border-[#222] rounded-lg p-5 md:sticky md:top-5">
            <div className="text-[10px] tracking-[0.15em] text-[#444] uppercase mb-5">Order Status</div>

            {/* Timeline */}
            <div className="mb-6 relative">
              <div className="absolute left-[3.5px] top-2 bottom-2 w-px bg-[#222]" />
              {isCancelled ? (
                <>
                  {TIMELINE_STEPS.map(s => (
                    <div key={s} className="flex items-center gap-3 mb-3.5 relative z-10">
                      <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[#1a1a1a] border border-[#222]" />
                      <span className="text-[12px] uppercase tracking-[0.08em] text-[#2a2a2a]">{s}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[#e86a6a] border border-[#e86a6a]" style={{ boxShadow: "0 0 8px #e86a6a88" }} />
                    <span className="text-[12px] uppercase tracking-[0.08em] text-[#e86a6a]">Cancelled</span>
                    <span className="ml-auto text-[9px] text-[#e86a6a] tracking-[0.1em]">● NOW</span>
                  </div>
                </>
              ) : (
                TIMELINE_STEPS.map((s, stepIdx) => {
                  const isActive = s.toLowerCase() === normalizedStatus;
                  const isPast   = currentStepIdx > stepIdx;
                  const color    = STATUS_COLORS[s.toLowerCase()];
                  return (
                    <div key={s} className="flex items-center gap-3 mb-3.5 relative z-10">
                      <div className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-200"
                        style={{
                          background:   isActive ? color : isPast ? "#2a3a2a" : "#1a1a1a",
                          border:       `1px solid ${isActive ? color : isPast ? "#3a5a3a" : "#2a2a2a"}`,
                          boxShadow:    isActive ? `0 0 8px ${color}88` : "none",
                        }} />
                      <span className="text-[12px] uppercase tracking-[0.08em] transition-colors duration-200"
                        style={{ color: isActive ? color : isPast ? "#3a6a3a" : "#333" }}>
                        {s}
                      </span>
                      {isActive && <span className="ml-auto text-[9px] tracking-[0.1em]" style={{ color }}>● NOW</span>}
                    </div>
                  );
                })
              )}
            </div>

            {/* History */}
            {order.statusHistory?.length > 0 && (
              <div className="mb-5 border-t border-[#1a1a1a] pt-4">
                <div className="text-[10px] tracking-[0.12em] text-[#444] uppercase mb-2.5">History</div>
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="flex justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-[0.06em]" style={{ color: STATUS_COLORS[h.status?.toLowerCase()] || "#888" }}>{h.status}</span>
                    <span className="text-[11px] text-[#444]">{new Date(h.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Update */}
            <div className="border-t border-[#1a1a1a] pt-4">
              <div className="text-[10px] tracking-[0.12em] text-[#444] uppercase mb-2">Update Status</div>
              <select value={status} onChange={e => setStatus(e.target.value)}
                style={{ borderColor: (STATUS_COLORS[status?.toLowerCase()] || "#333") + "55", color: STATUS_COLORS[status?.toLowerCase()] || "#888" }}
                className="w-full bg-[#0a0a0a] border rounded-md px-3 py-2.5 text-[12px] tracking-[0.08em] uppercase cursor-pointer outline-none mb-2.5 transition-all font-mono">
                {["Confirmed","Processing","Shipped","Delivered","Cancelled"].map(s => (
                  <option key={s} value={s} style={{ background: "#111", color: STATUS_COLORS[s.toLowerCase()] }}>{s}</option>
                ))}
              </select>

              {error && (
                <div className="text-[11px] text-[#e86a6a] mb-2 px-2.5 py-2 bg-[#e86a6a12] rounded border border-[#e86a6a22]">{error}</div>
              )}

              <button onClick={updateStatus}
                disabled={saving || status?.toLowerCase() === order.status?.toLowerCase()}
                className={`w-full py-2.5 border-none rounded-md text-[11px] tracking-[0.15em] uppercase font-bold cursor-pointer transition-all font-mono
                  ${saved   ? "bg-[#1a2e1a] text-[#6ae8a0]"
                  : saving  ? "bg-[#1a1a1a] text-[#444] cursor-default"
                  : status?.toLowerCase() === order.status?.toLowerCase()
                    ? "bg-[#e8c46a] text-[#0a0a0a] opacity-40 cursor-default"
                    : "bg-[#e8c46a] text-[#0a0a0a]"
                  }`}
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