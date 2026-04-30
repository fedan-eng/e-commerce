// app/admin/orders/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS = {
  confirmed:  "#e8c46a",
  pending:    "#e8c46a",
  processing: "#6ab4e8",
  processed:  "#6ab4e8",
  shipped:    "#a06ae8",
  delivered:  "#6ae8a0",
  cancelled:  "#e86a6a",
};

// The canonical progression shown in the timeline
const TIMELINE_STEPS = ["Confirmed", "Processing", "Shipped", "Delivered"];
const ALL_STATUSES   = ["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

const getStatusColor = (s) => STATUS_COLORS[s?.toLowerCase()] || "#555";

const getTotal = (order) => {
  if (order.total    != null) return parseFloat(order.total).toFixed(2);
  if (order.subTotal != null) return parseFloat(order.subTotal).toFixed(2);
  return (order.items || [])
    .reduce((acc, item) => acc + parseFloat(item.price || 0) * parseFloat(item.quantity || 1), 0)
    .toFixed(2);
};

function StatusBadge({ status }) {
  const color = getStatusColor(status);
  return (
    <span
      style={{ color, background: color + "15", border: `1px solid ${color}44` }}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-[.08em] uppercase"
    >
      {status}
    </span>
  );
}

// Horizontal step timeline (matches reference screenshot style)
function OrderTimeline({ currentStatus }) {
  const norm        = currentStatus?.toLowerCase();
  const isCancelled = norm === "cancelled";
  const stepIdx     = TIMELINE_STEPS.findIndex(s => s.toLowerCase() === norm);

  const steps = isCancelled
    ? [...TIMELINE_STEPS, "Cancelled"]
    : TIMELINE_STEPS;

  return (
    <div className="relative flex items-start justify-between w-full overflow-x-auto pb-1">
      {/* connector line */}
      <div className="absolute top-[14px] left-0 right-0 h-px bg-[#1e1e1e] z-0" />

      {steps.map((s, i) => {
        const key        = s.toLowerCase();
        const color      = STATUS_COLORS[key] || "#555";
        const isActive   = key === norm;
        const isPast     = !isCancelled && stepIdx > i;
        const isCancStep = s === "Cancelled";

        return (
          <div key={s} className="relative z-10 flex flex-col items-center gap-2 min-w-[80px] flex-1">
            {/* dot */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all"
              style={{
                background: isActive ? color : isPast ? "#1e2e1e" : "#111",
                borderColor: isActive ? color : isPast ? "#2e4e2e" : "#2a2a2a",
                boxShadow: isActive ? `0 0 12px ${color}66` : "none",
              }}
            >
              {isActive ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : isPast ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3a6a3a" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <span className="text-[10px] font-mono text-[#333]">{i + 1}</span>
              )}
            </div>

            {/* label */}
            <div className="text-center">
              <div
                className="text-[10px] tracking-[.08em] uppercase font-mono font-semibold"
                style={{ color: isActive ? color : isPast ? "#3a6a3a" : "#2a2a2a" }}
              >
                {s}
              </div>
              {isActive && (
                <div className="text-[9px] font-mono mt-0.5" style={{ color: color + "88" }}>● NOW</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
      .then(data => {
        setOrder(data.order);
        setStatus(data.order?.status || "Confirmed");
        setLoading(false);
      });
  }, [id]);

  const updateStatus = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrder(prev => ({ ...prev, status }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const d = await res.json();
        setError(d.message || "Failed to update");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-[#444] text-[13px] pt-10 font-mono">Loading order…</div>;
  if (!order)  return <div className="text-[#e86a6a] text-[13px] pt-10 font-mono">Order not found.</div>;

  const norm = order.status?.toLowerCase();

  return (
    <div className="w-full max-w-[1000px]">

      {/* Back + header */}
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-[#6ae8a0] no-underline text-[11px] font-mono tracking-[.1em] uppercase hover:opacity-80 transition-opacity mb-4"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="text-[10px] tracking-[.2em] text-[#444] uppercase mb-1">Order detail</div>
            <h1 className="text-xl font-bold text-[#e8e8e8] font-mono break-all">
              Order details (#{String(order._id).slice(-9).toUpperCase()})
            </h1>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Timeline card */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 mb-4">
        <OrderTimeline currentStatus={order.status} />
      </div>

      {/* Order meta row */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] tracking-[.12em] text-[#444] uppercase mb-1">Order number</div>
            <div className="text-[13px] text-[#e8c46a] font-mono">#{String(order._id).slice(-9).toUpperCase()}</div>
          </div>
          <div>
            <div className="text-[10px] tracking-[.12em] text-[#444] uppercase mb-1">Order date</div>
            <div className="text-[13px] text-[#ccc] font-mono">
              {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-[.12em] text-[#444] uppercase mb-1">Customer name</div>
            <div className="text-[13px] text-[#ccc] font-semibold">
              {[order.firstName, order.lastName].filter(Boolean).join(" ") || "—"}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-[.12em] text-[#444] uppercase mb-1">Customer email</div>
            {order.email
              ? <a href={`mailto:${order.email}`} className="text-[13px] text-[#6ab4e8] no-underline hover:underline break-all">{order.email}</a>
              : <span className="text-[13px] text-[#444]">—</span>
            }
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex flex-col-reverse md:grid md:grid-cols-[1fr_280px] gap-4">

        {/* ── Left column ── */}
        <div className="min-w-0 flex flex-col gap-4">

          {/* Items table */}
          <div className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#1a1a1a]">
              <span className="text-[10px] tracking-[.12em] text-[#444] uppercase">Order items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 440 }}>
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="px-5 py-3 text-left text-[10px] tracking-[.1em] text-[#3a3a3a] uppercase">#</th>
                    <th className="px-5 py-3 text-left text-[10px] tracking-[.1em] text-[#3a3a3a] uppercase">Image</th>
                    <th className="px-5 py-3 text-left text-[10px] tracking-[.1em] text-[#3a3a3a] uppercase">Product</th>
                    <th className="px-5 py-3 text-left text-[10px] tracking-[.1em] text-[#3a3a3a] uppercase whitespace-nowrap">Category</th>
                    <th className="px-5 py-3 text-left text-[10px] tracking-[.1em] text-[#3a3a3a] uppercase">Colour</th>
                    <th className="px-5 py-3 text-left text-[10px] tracking-[.1em] text-[#3a3a3a] uppercase">Qty</th>
                    <th className="px-5 py-3 text-left text-[10px] tracking-[.1em] text-[#3a3a3a] uppercase">Price</th>
                    <th className="px-5 py-3 text-left text-[10px] tracking-[.1em] text-[#3a3a3a] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, i) => (
                    <tr key={i} className="border-b border-[#161616] last:border-0">
                      <td className="px-5 py-3.5 text-[12px] text-[#444] font-mono">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        {item.image
                          ? <img src={item.image} alt="" className="w-9 h-9 object-cover rounded-lg bg-[#1a1a1a]" />
                          : <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] border border-[#222]" />
                        }
                      </td>
                      <td className="px-5 py-3.5 max-w-[150px]">
                        <div className="text-[12px] text-[#e8e8e8] truncate">{item.name}</div>
                        {item.size && <div className="text-[10px] text-[#444] mt-0.5">{item.size}</div>}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#666] whitespace-nowrap">{item.category || "—"}</td>
                      <td className="px-5 py-3.5 text-[12px] text-[#666] whitespace-nowrap">{item.color || "Nil"}</td>
                      <td className="px-5 py-3.5 text-[12px] text-[#888]">{item.quantity}</td>
                      <td className="px-5 py-3.5 text-[12px] text-[#888] whitespace-nowrap">₦{parseFloat(item.price).toLocaleString()}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={item.status || order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals footer */}
            <div className="px-5 py-4 border-t border-[#1a1a1a] space-y-2">
              {order.deliveryFee != null && (
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#444] uppercase tracking-wider">Sub total</span>
                  <span className="text-[12px] text-[#888] font-mono">
                    ₦{(order.items || []).reduce((a, i) => a + parseFloat(i.price || 0) * parseFloat(i.quantity || 1), 0).toLocaleString()}
                  </span>
                </div>
              )}
              {order.deliveryFee != null && (
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#444] uppercase tracking-wider">Delivery fees</span>
                  <span className="text-[12px] text-[#888] font-mono">
                    {order.deliveryFee === 0 ? "Free" : `₦${parseFloat(order.deliveryFee).toLocaleString()}`}
                  </span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#444] uppercase tracking-wider">Discount</span>
                  <span className="text-[12px] text-[#6ae8a0] font-mono">-₦{parseFloat(order.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[#1a1a1a]">
                <span className="text-[12px] text-[#888] uppercase tracking-wider font-semibold">Total</span>
                <span className="text-lg font-bold text-[#e8e8e8] font-mono">₦{parseFloat(getTotal(order)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bottom info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Delivery info */}
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
              <div className="text-[10px] tracking-[.12em] text-[#444] uppercase mb-3">Delivery information</div>
              <div className="space-y-1.5 text-[12px] text-[#777]">
                {(order.firstName || order.lastName) && (
                  <div className="text-[#ccc] font-semibold">{[order.firstName, order.lastName].filter(Boolean).join(" ")}</div>
                )}
                {order.address      && <div className="break-words">{order.address}</div>}
                {order.city         && <div>{order.city}{order.region?.name ? `, ${order.region.name}` : ""}</div>}
                {order.phone        && <div>{order.phone}</div>}
                {order.deliveryType && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[#444]">
                      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    <span>{order.deliveryType}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
              <div className="text-[10px] tracking-[.12em] text-[#444] uppercase mb-3">Payment method</div>
              <div className="space-y-1.5 text-[12px] text-[#777]">
                {order.paymentMethod && <div className="text-[#ccc]">{order.paymentMethod}</div>}
                {order.paymentReference && (
                  <div className="font-mono text-[#444] break-all">{order.paymentReference}</div>
                )}
                {!order.paymentMethod && !order.paymentReference && (
                  <div className="text-[#333]">—</div>
                )}
              </div>
            </div>

            {/* Promo code */}
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
              <div className="text-[10px] tracking-[.12em] text-[#444] uppercase mb-3">Promo code used</div>
              <div className="text-[12px]">
                {order.promoCode
                  ? <span className="text-[#e8c46a] font-mono">{order.promoCode}</span>
                  : <span className="text-[#333]">Nil</span>
                }
              </div>
              {order.discount > 0 && (
                <div className="text-[11px] text-[#6ae8a0] mt-1">-₦{parseFloat(order.discount).toLocaleString()} saved</div>
              )}
            </div>
          </div>

          {/* Shipping address (if separate) */}
          {order.shippingAddress && (
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
              <div className="text-[10px] tracking-[.12em] text-[#444] uppercase mb-3">Shipping address</div>
              <div className="space-y-1 text-[12px] text-[#777]">
                <div className="text-[#ccc]">{order.shippingAddress.fullName}</div>
                <div className="break-words">{order.shippingAddress.address}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: status panel ── */}
        <div className="min-w-0">
          <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 md:sticky md:top-5">

            <div className="text-[10px] tracking-[.12em] text-[#444] uppercase mb-4">Update status</div>

            {/* Status select */}
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{
                borderColor: (STATUS_COLORS[status?.toLowerCase()] || "#333") + "55",
                color:        STATUS_COLORS[status?.toLowerCase()] || "#888",
              }}
              className="w-full bg-[#0a0a0a] border rounded-xl px-3 py-2.5 text-[12px] uppercase cursor-pointer outline-none mb-3 font-mono"
            >
              {ALL_STATUSES.map(s => (
                <option key={s} value={s} style={{ background: "#111", color: STATUS_COLORS[s.toLowerCase()] || "#888" }}>{s}</option>
              ))}
            </select>

            {error && (
              <div className="text-[11px] text-[#e86a6a] mb-3 px-3 py-2 bg-[#e86a6a10] rounded-lg border border-[#e86a6a22]">
                {error}
              </div>
            )}

            <button
              onClick={updateStatus}
              disabled={saving || status?.toLowerCase() === order.status?.toLowerCase()}
              className={`w-full py-3 border-none rounded-xl text-[11px] tracking-[.12em] uppercase font-bold cursor-pointer transition-all font-mono
                ${saved
                  ? "bg-[#6ae8a022] text-[#6ae8a0]"
                  : saving
                    ? "bg-[#1a1a1a] text-[#333] cursor-default"
                    : status?.toLowerCase() === order.status?.toLowerCase()
                      ? "bg-[#e8c46a] text-[#0a0a0a] opacity-30 cursor-default"
                      : "bg-[#e8c46a] text-[#0a0a0a] hover:bg-[#d4b05e]"
                }`}
            >
              {saved ? "✓ Saved" : saving ? "Saving…" : "Save status"}
            </button>

            {/* Status history */}
            {order.statusHistory?.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#1a1a1a]">
                <div className="text-[10px] tracking-[.12em] text-[#444] uppercase mb-3">History</div>
                <div className="space-y-2">
                  {order.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span
                        className="text-[11px] uppercase font-mono"
                        style={{ color: STATUS_COLORS[h.status?.toLowerCase()] || "#888" }}
                      >
                        {h.status}
                      </span>
                      <span className="text-[10px] text-[#444] font-mono">
                        {new Date(h.date).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}