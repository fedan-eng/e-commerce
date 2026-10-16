// app/admin_console/orders/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { Metadata } from "next";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  STATUS_COLORS,
  TIMELINE_STEPS,
  ALL_STATUSES,
  normalizeStatusKey,
  matchStatusLabel,
  getStatusColor,
  shortId,
} from "@/lib/orderStatus";

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
      style={{ background: color + "1a", border: `1px solid ${color}40` }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-ink capitalize whitespace-nowrap"
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}

// Horizontal step timeline (matches reference screenshot style)
function OrderTimeline({ currentStatus }) {
  const norm        = normalizeStatusKey(currentStatus);
  const isCancelled = norm === "cancelled";
  const stepIdx     = TIMELINE_STEPS.findIndex(s => normalizeStatusKey(s) === norm);

  const steps = isCancelled
    ? [...TIMELINE_STEPS, "Cancelled"]
    : TIMELINE_STEPS;

  return (
    <div className="relative flex items-start justify-between w-full overflow-x-auto pb-1">
      {/* connector line */}
      <div className="absolute top-[15px] left-[10%] right-[10%] h-[3px] rounded-full bg-sage z-0" />

      {steps.map((s, i) => {
        const key        = normalizeStatusKey(s);
        const color      = STATUS_COLORS[key] || "#0f472b";
        const isActive   = key === norm;
        const isPast     = !isCancelled && stepIdx > i;
        const isCancStep = s === "Cancelled";

        return (
          <div key={s} className="relative z-10 flex flex-col items-center gap-2 min-w-[80px] flex-1">
            {/* dot */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? "scale-110" : ""}`}
              style={{
                background: isActive ? color : isPast ? "#cff6df" : "#ffffff",
                borderColor: isActive ? color : isPast ? "#9ad9b4" : "#dfe6e2",
                boxShadow: isActive ? `0 0 0 5px ${color}22` : "none",
              }}
            >
              {isActive ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : isPast ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0f472b" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <span className="text-[11px] font-semibold text-ghost">{i + 1}</span>
              )}
            </div>

            {/* label */}
            <div className="text-center">
              <div
                className="text-[11px] font-semibold"
                style={{ color: isActive ? "#14261c" : isPast ? "#0f472b" : "#b3c0b9" }}
              >
                {s}
              </div>
              {isActive && (
                <div className="inline-block text-[9px] font-bold mt-1 px-1.5 py-px rounded-full bg-zest text-pine">NOW</div>
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
    fetch(`/api/orders/${id}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        setOrder(data.order);
        setStatus(matchStatusLabel(data.order?.status));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch order:", err);
        setError("Failed to load order");
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
        const data = await res.json();
        setOrder(data.order);
        setStatus(matchStatusLabel(data.order?.status));
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

  if (loading) return <div className="flex items-center gap-3 text-faint text-[13px] pt-10"><div className="w-6 h-6 rounded-full border-[3px] border-mint border-t-pine animate-spin" /> Loading order…</div>;
  if (!order)  return <div className="text-[#c53030] text-[13px] pt-10">Order not found.</div>;

  const norm = normalizeStatusKey(order.status);

  return (
    <div className="w-full max-w-[1000px]">

      {/* Back + header */}
      <div className="mb-6">
        <Link
          href="/admin_console/orders"
          className="inline-flex items-center gap-1.5 text-pine no-underline text-[13px] font-semibold bg-white border border-line rounded-full px-3.5 py-1.5 hover:bg-mint transition-colors mb-4"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center text-[11px] font-semibold text-pine bg-zest px-2.5 py-0.5 rounded-full mb-2">Order detail</div>
            <h1 className="text-[24px] font-poppins font-bold text-pine leading-tight break-all">
              Order details (#{shortId(order._id)})
            </h1>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Timeline card */}
      <div className="bg-white border border-line rounded-3xl p-5 mb-4">
        <OrderTimeline currentStatus={order.status} />
      </div>

      {/* Order meta row */}
      <div className="bg-white border border-line rounded-3xl p-5 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[11px] font-medium text-faint mb-1">Order number</div>
            <div className="text-[13px] text-pine font-semibold">#{shortId(order._id)}</div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-faint mb-1">Order date</div>
            <div className="text-[13px] text-ink">
              {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-faint mb-1">Customer name</div>
            <div className="text-[13px] text-ink font-semibold">
              {[order.firstName, order.lastName].filter(Boolean).join(" ") || "—"}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-faint mb-1">Customer email</div>
            {order.email
              ? <a href={`mailto:${order.email}`} className="text-[13px] text-[#1d6fb0] no-underline hover:underline break-all">{order.email}</a>
              : <span className="text-[13px] text-faint">—</span>
            }
          </div>
        </div>
        {order.userId && (
          <div className="mt-4 pt-4 border-t border-line">
            <div className="text-[11px] font-medium text-faint mb-1">Customer account</div>
            <Link
              href={`/admin_console/customers/${order.userId}`}
              className="text-[13px] font-semibold text-pine no-underline bg-mint rounded-full px-3.5 py-1.5 hover:bg-zest transition-colors inline-flex items-center gap-1.5"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              View customer profile →
            </Link>
          </div>
        )}
      </div>

      {/* Main content grid */}
      <div className="flex flex-col-reverse md:grid md:grid-cols-[1fr_280px] gap-4">

        {/* ── Left column ── */}
        <div className="min-w-0 flex flex-col gap-4">

          {/* Items table */}
          <div className="bg-white border border-line rounded-3xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-line">
              <span className="text-[15px] font-poppins font-semibold text-pine">Order items 📦</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 440 }}>
                <thead>
                  <tr className="bg-sage">
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold">#</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold">Image</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold">Product</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap">Category</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold">Colour</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold">Qty</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold">Price</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, i) => (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className="px-5 py-3.5 text-[12px] text-faint">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        {item.image
                          ? <Image src={item.image} alt="" width={36} height={36} className="w-9 h-9 object-cover rounded-xl bg-sage" />
                          : <div className="w-9 h-9 rounded-xl bg-sage border border-line" />
                        }
                      </td>
                      <td className="px-5 py-3.5 max-w-[150px]">
                        <div className="text-[12px] text-ink truncate">{item.name}</div>
                        {item.size && <div className="text-[10px] text-faint mt-0.5">{item.size}</div>}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-faint whitespace-nowrap">{item.category || "—"}</td>
                      <td className="px-5 py-3.5 text-[12px] text-faint whitespace-nowrap">{item.color || "Nil"}</td>
                      <td className="px-5 py-3.5 text-[12px] text-muted">{item.quantity}</td>
                      <td className="px-5 py-3.5 text-[12px] text-muted whitespace-nowrap">₦{parseFloat(item.price).toLocaleString()}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={item.status || order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals footer */}
            <div className="px-5 py-4 border-t border-line space-y-2">
              {order.deliveryFee != null && (
                <div className="flex justify-between">
                  <span className="text-[11px] text-faint uppercase tracking-wider">Sub total</span>
                  <span className="text-[12px] text-muted">
                    ₦{(order.items || []).reduce((a, i) => a + parseFloat(i.price || 0) * parseFloat(i.quantity || 1), 0).toLocaleString()}
                  </span>
                </div>
              )}
              {order.deliveryFee != null && (
                <div className="flex justify-between">
                  <span className="text-[11px] text-faint uppercase tracking-wider">Delivery fees</span>
                  <span className="text-[12px] text-muted">
                    {order.deliveryFee === 0 ? "Free" : `₦${parseFloat(order.deliveryFee).toLocaleString()}`}
                  </span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[11px] text-faint uppercase tracking-wider">Discount</span>
                  <span className="text-[12px] text-[#15803d]">-₦{parseFloat(order.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-line">
                <span className="text-[12px] text-muted uppercase tracking-wider font-semibold">Total</span>
                <span className="text-xl font-poppins font-bold text-pine">₦{parseFloat(getTotal(order)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bottom info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Delivery info */}
            <div className="bg-white border border-line rounded-3xl p-4">
              <div className="text-[14px] font-poppins font-semibold text-pine mb-3">Delivery information</div>
              <div className="space-y-1.5 text-[12px] text-muted">
                {(order.firstName || order.lastName) && (
                  <div className="text-ink font-semibold">{[order.firstName, order.lastName].filter(Boolean).join(" ")}</div>
                )}
                {order.address      && <div className="break-words">{order.address}</div>}
                {order.city         && <div>{order.city}{order.region?.name ? `, ${order.region.name}` : ""}</div>}
                {order.phone        && <div>{order.phone}</div>}
                {order.deliveryType && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-faint">
                      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    <span>{order.deliveryType}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white border border-line rounded-3xl p-4">
              <div className="text-[14px] font-poppins font-semibold text-pine mb-3">Payment method</div>
              <div className="space-y-1.5 text-[12px] text-muted">
                {order.paymentMethod && <div className="text-ink">{order.paymentMethod}</div>}
                {order.paymentReference && (
              <>
              <div className="text-[14px] font-poppins font-semibold text-pine mb-3">Payment Reference</div>
                  <div className="text-faint break-all">{order.paymentReference}</div>
                  </>
                )}
                {!order.paymentMethod && !order.paymentReference && (
                  <div className="text-ghost">—</div>
                )}
              </div>
            </div>

            {/* Promo code */}
            <div className="bg-white border border-line rounded-3xl p-4">
              <div className="text-[14px] font-poppins font-semibold text-pine mb-3">Promo code used</div>
              <div className="text-[12px]">
                {order.promoCode
                  ? <span className="text-pine">{order.promoCode}</span>
                  : <span className="text-ghost">Nil</span>
                }
              </div>
              {order.discount > 0 && (
                <div className="text-[11px] text-[#15803d] mt-1">-₦{parseFloat(order.discount).toLocaleString()} saved</div>
              )}
            </div>
          </div>

          {/* Shipping address (if separate) */}
          {order.shippingAddress && (
            <div className="bg-white border border-line rounded-3xl p-4">
              <div className="text-[14px] font-poppins font-semibold text-pine mb-3">Shipping address</div>
              <div className="space-y-1 text-[12px] text-muted">
                <div className="text-ink">{order.shippingAddress.fullName}</div>
                <div className="break-words">{order.shippingAddress.address}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: status panel ── */}
        <div className="min-w-0">
          <div className="bg-white border border-line rounded-3xl p-4 md:sticky md:top-5">

            <div className="text-[14px] font-poppins font-semibold text-pine mb-4">Update status</div>

            {/* Status select */}
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{
                borderColor: (STATUS_COLORS[normalizeStatusKey(status)] || "#cbd8d1") + "55",
                color:        STATUS_COLORS[normalizeStatusKey(status)] || "#7c8b84",
              }}
              className="w-full h-11 bg-canvas border rounded-full px-4 text-[13px] font-semibold cursor-pointer outline-none mb-3"
            >
              <option value="" disabled>Select status</option>
              {ALL_STATUSES.map(s => (
                <option key={s} value={s} style={{ background: "#ffffff", color: STATUS_COLORS[normalizeStatusKey(s)] || "#7c8b84" }}>{s}</option>
              ))}
            </select>

            {error && (
              <div className="text-[11px] text-[#c53030] mb-3 px-3 py-2 bg-[#fdecec] rounded-xl border border-[#f3c4c4]">
                {error}
              </div>
            )}

            <button
              onClick={updateStatus}
              disabled={saving || normalizeStatusKey(status) === normalizeStatusKey(order.status)}
              className={`w-full h-11 border-none rounded-full text-[13px] font-semibold cursor-pointer transition-all
                ${saved
                  ? "bg-[#e3f6e9] text-[#15803d]"
                  : saving
                    ? "bg-sage text-ghost cursor-default"
                    : normalizeStatusKey(status) === normalizeStatusKey(order.status)
                      ? "bg-pine text-white opacity-35 cursor-default"
                      : "bg-pine text-white hover:bg-pine-deep hover:shadow-[0_8px_20px_-8px_rgba(15,71,43,0.6)]"
                }`}
            >
              {saved ? "✓ Saved" : saving ? "Saving…" : "Save status"}
            </button>

            {/* Status history */}
            {order.statusHistory?.length > 0 && (
              <div className="mt-5 pt-4 border-t border-line">
                <div className="text-[14px] font-poppins font-semibold text-pine mb-3">History</div>
                <div className="space-y-2.5">
                  {order.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <StatusBadge status={h.status} />
                      <span className="text-[10px] text-faint">
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