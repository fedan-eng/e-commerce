// app/admin_console/orders/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Check, Copy, FileText, MessageCircle, Phone, Mail, ChevronDown, User, Truck, CreditCard, ShoppingBag } from "lucide-react";
import { TIMELINE_STEPS, ALL_STATUSES, normalizeStatusKey, matchStatusLabel, shortId } from "@/lib/orderStatus";
import { downloadInvoice } from "@/lib/invoice";
import { useAdmin } from "@/components/admin/AdminContext";
import {
  PageHeader, Card, CardHeader, Button, Dropdown, MenuItem, StatusBadge, EmptyState, Spinner, Avatar,
  selectCls, TH, TD, cx,
} from "@/components/admin/ui";
import { money, localPhone, telLink, whatsappLink } from "@/components/admin/format";

const lineTotal = it => parseFloat(it.price || 0) * parseFloat(it.quantity || 1);
const orderTotal = o => (o.total != null ? parseFloat(o.total) : o.subTotal != null ? parseFloat(o.subTotal) : (o.items || []).reduce((a, it) => a + lineTotal(it), 0));
const fmtDateTime = d => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// Horizontal progress through the order's stages
function OrderTimeline({ status, history }) {
  const norm        = normalizeStatusKey(status);
  const isCancelled = norm === "cancelled";
  const current     = TIMELINE_STEPS.findIndex(s => normalizeStatusKey(s) === norm);
  const reachedAt   = key => {
    const h = [...(history || [])].reverse().find(x => normalizeStatusKey(x.status) === key);
    return h ? new Date(h.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null;
  };

  return (
    <Card className="px-5 py-5">
      {isCancelled && (
        <div className="mb-4 rounded-lg bg-[#fdeeee] px-3 py-2 text-[13px] text-[#b91c1c]">
          This order was cancelled{reachedAt("cancelled") ? ` on ${reachedAt("cancelled")}` : ""}.
        </div>
      )}
      <ol className="no-scrollbar flex overflow-x-auto">
        {TIMELINE_STEPS.map((step, i) => {
          const key   = normalizeStatusKey(step);
          const done  = !isCancelled && current >= i;
          const now   = !isCancelled && current === i;
          const when  = reachedAt(key);
          return (
            <li key={step} className="relative flex min-w-[96px] flex-1 flex-col items-center text-center">
              {i > 0 && (
                <span className={cx("absolute right-1/2 top-[13px] h-0.5 w-full", done ? "bg-pine" : "bg-edge")} aria-hidden />
              )}
              <span className={cx(
                "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold",
                done ? "border-pine bg-pine text-white" : "border-edge bg-white text-faint",
                now && "ring-4 ring-pine/15",
              )}>
                {done ? <Check size={14} strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              <span className={cx("mt-2 text-xs font-medium", done ? "text-ink" : "text-faint")}>{step}</span>
              <span className="text-[11px] text-faint">{when || (now ? "Now" : " ")}</span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-[13px]">
      <span className="shrink-0 text-faint">{label}</span>
      <span className="min-w-0 break-words text-right text-ink">{children}</span>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { refreshAlerts } = useAdmin();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState("");

  useEffect(() => {
    fetch(`/api/orders/${id}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        setOrder(data.order);
        setStatus(matchStatusLabel(data.order?.status));
      })
      .catch(err => {
        console.error("Failed to fetch order:", err);
        toast.error("Couldn't load this order");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update");
      setOrder(data.order);
      setStatus(matchStatusLabel(data.order?.status));
      toast.success(`Status changed to ${status}`);
      refreshAlerts();
    } catch (err) {
      toast.error(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!order) {
    return (
      <Card>
        <EmptyState
          icon={ShoppingBag}
          title="Order not found"
          description="It may have been removed, or the link is wrong."
          action={<Button href="/admin_console/orders">Back to orders</Button>}
        />
      </Card>
    );
  }

  const name     = [order.firstName, order.lastName].filter(Boolean).join(" ") || "Customer";
  const phone    = localPhone(order.phone);
  const subTotal = (order.items || []).reduce((a, it) => a + lineTotal(it), 0);
  const unchanged = normalizeStatusKey(status) === normalizeStatusKey(order.status);
  const copyId = () => navigator.clipboard?.writeText(String(order._id)).then(() => toast.success("Order ID copied"));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            Order #{shortId(order._id)}
            <StatusBadge status={order.status} />
          </span>
        }
        description={`Placed ${fmtDateTime(order.createdAt)}${order.source === "manual" ? " · Recorded manually" : ""}`}
        actions={
          <>
            <Button onClick={copyId}><Copy size={16} aria-hidden /> Copy ID</Button>
            <Dropdown
              renderTrigger={({ open, toggle }) => (
                <Button onClick={toggle} aria-expanded={open} disabled={!phone && !order.email}>
                  Contact <ChevronDown size={14} aria-hidden />
                </Button>
              )}
            >
              {phone && <MenuItem icon={MessageCircle} onClick={() => window.open(whatsappLink(phone, `Hi ${order.firstName || ""}, this is FIL about your order #${shortId(order._id)}.`), "_blank", "noopener")}>WhatsApp</MenuItem>}
              {phone && <MenuItem icon={Phone} onClick={() => { window.location.href = telLink(phone); }}>Call {phone}</MenuItem>}
              {order.email && <MenuItem icon={Mail} onClick={() => { window.location.href = `mailto:${order.email}`; }}>Email {order.email}</MenuItem>}
            </Dropdown>
            <Button variant="primary" onClick={() => downloadInvoice(order).catch(() => toast.error("Couldn't create the invoice"))}>
              <FileText size={16} aria-hidden /> Invoice
            </Button>
          </>
        }
      />

      <OrderTimeline status={order.status} history={order.statusHistory} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ── Left: items and totals ── */}
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader title="Items" description={`${(order.items || []).length} product line${(order.items || []).length === 1 ? "" : "s"}`} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className={TH}>Product</th>
                    <th className={cx(TH, "text-right")}>Price</th>
                    <th className={cx(TH, "text-right")}>Qty</th>
                    <th className={cx(TH, "text-right")}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((it, i) => (
                    <tr key={i}>
                      <td className={TD}>
                        <div className="flex items-center gap-3">
                          {it.image
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={it.image} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-hover object-cover" />
                            : <span className="h-11 w-11 shrink-0 rounded-lg bg-hover" />}
                          <div className="min-w-0">
                            {it.productId
                              ? <Link href={`/admin_console/products/${it.productId}`} className="block truncate font-medium text-ink no-underline hover:text-pine">{it.name}</Link>
                              : <span className="block truncate font-medium">{it.name}</span>}
                            <span className="block text-xs text-faint">
                              {[it.category, it.color && `Colour: ${it.color}`, it.size, it.sku].filter(Boolean).join(" · ") || "—"}
                            </span>
                          </div>
                          {it.status && normalizeStatusKey(it.status) !== normalizeStatusKey(order.status) && <StatusBadge status={it.status} />}
                        </div>
                      </td>
                      <td className={cx(TD, "whitespace-nowrap text-right text-sub")}>{money(it.price)}</td>
                      <td className={cx(TD, "text-right")}>{it.quantity}</td>
                      <td className={cx(TD, "whitespace-nowrap text-right font-medium")}>{money(lineTotal(it))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ml-auto flex max-w-sm flex-col gap-1 px-5 py-4 text-[13px]">
              <div className="flex justify-between"><span className="text-faint">Subtotal</span><span>{money(subTotal)}</span></div>
              {order.deliveryFee != null && (
                <div className="flex justify-between"><span className="text-faint">Delivery</span><span>{order.deliveryFee === 0 ? "Free" : money(order.deliveryFee)}</span></div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-faint">Discount{order.promoCode ? ` (${order.promoCode})` : ""}</span>
                  <span className="text-[#15803d]">−{money(order.discount)}</span>
                </div>
              )}
              <div className="mt-1 flex items-baseline justify-between border-t border-edge pt-2">
                <span className="font-medium">Total</span>
                <span className="font-poppins text-lg font-semibold">{money(orderTotal(order))}</span>
              </div>
            </div>
          </Card>

          {order.orderNote && (
            <Card className="px-5 py-4">
              <div className="mb-1 text-[13px] font-medium text-sub">Note</div>
              <p className="m-0 whitespace-pre-line text-[13px] text-ink">{order.orderNote}</p>
            </Card>
          )}
        </div>

        {/* ── Right: status and details ── */}
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="px-5 py-4">
            <h2 className="m-0 mb-3 font-poppins text-[15px] font-semibold text-ink">Update status</h2>
            <div className="flex gap-2">
              <select value={status} onChange={e => setStatus(e.target.value)} className={selectCls} aria-label="New status">
                <option value="" disabled>Select status</option>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Button variant="primary" onClick={updateStatus} disabled={saving || !status || unchanged}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
            <p className="mb-0 mt-2 text-xs text-faint">The customer gets an email when the status changes.</p>

            {order.statusHistory?.length > 0 && (
              <div className="mt-4 border-t border-edge pt-3">
                <div className="mb-2 text-[13px] font-medium text-sub">History</div>
                <ol className="m-0 flex list-none flex-col gap-2 p-0">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <li key={i} className="flex items-center justify-between gap-3">
                      <StatusBadge status={h.status} />
                      <span className="text-xs text-faint">{fmtDateTime(h.date)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>

          <Card className="px-5 py-4">
            <div className="mb-3 flex items-center gap-2"><User size={16} className="text-faint" aria-hidden /><h2 className="m-0 font-poppins text-[15px] font-semibold text-ink">Customer</h2></div>
            <div className="flex items-center gap-3">
              <Avatar first={order.firstName} last={order.lastName} email={order.email} />
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium">{name}</div>
                {order.email && <a href={`mailto:${order.email}`} className="block truncate text-xs text-pine no-underline hover:underline">{order.email}</a>}
                {phone && <div className="text-xs text-faint">{phone}</div>}
              </div>
            </div>
            {(phone || order.userId) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {phone && <Button size="sm" onClick={() => window.open(whatsappLink(phone), "_blank", "noopener")}><MessageCircle size={14} aria-hidden /> WhatsApp</Button>}
                {phone && <Button size="sm" href={telLink(phone)}><Phone size={14} aria-hidden /> Call</Button>}
                {order.userId && <Button size="sm" variant="ghost" href={`/admin_console/customers/${order.userId}`}>View profile</Button>}
              </div>
            )}
          </Card>

          <Card className="px-5 py-4">
            <div className="mb-2 flex items-center gap-2"><Truck size={16} className="text-faint" aria-hidden /><h2 className="m-0 font-poppins text-[15px] font-semibold text-ink">Delivery</h2></div>
            {order.address && <p className="m-0 mb-1 text-[13px] text-ink">{order.address}</p>}
            <p className="m-0 text-[13px] text-sub">{[order.city, order.region?.name].filter(Boolean).join(", ") || "—"}</p>
            {order.deliveryType && <InfoRow label="Method">{order.deliveryType}</InfoRow>}
            {order.shippingAddress && (
              <div className="mt-3 border-t border-edge pt-3 text-[13px]">
                <div className="mb-1 font-medium text-sub">Ship to</div>
                <div>{order.shippingAddress.fullName}</div>
                <div className="text-sub">{order.shippingAddress.address}</div>
                <div className="text-sub">{[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.country].filter(Boolean).join(", ")}</div>
              </div>
            )}
          </Card>

          <Card className="px-5 py-4">
            <div className="mb-2 flex items-center gap-2"><CreditCard size={16} className="text-faint" aria-hidden /><h2 className="m-0 font-poppins text-[15px] font-semibold text-ink">Payment</h2></div>
            <InfoRow label="Method">{order.paymentMethod || "—"}</InfoRow>
            {order.paymentStatus && <InfoRow label="Status"><span className="capitalize">{order.paymentStatus}</span></InfoRow>}
            {order.paymentReference && <InfoRow label="Reference"><span className="font-mono text-xs">{order.paymentReference}</span></InfoRow>}
            <InfoRow label="Promo code">{order.promoCode || "None"}</InfoRow>
          </Card>
        </div>
      </div>
    </div>
  );
}
