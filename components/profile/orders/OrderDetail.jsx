"use client";
// components/profile/orders/OrderDetail.jsx — one order: items (buy again / return), totals,
// delivery details and tracking, plus the return and support forms.
import { useState } from "react";
import { ArrowLeft, Info, MessageCircle } from "lucide-react";
import AddToCartButton from "@/components/AddToCart";
import OrderProgressBar from "@/components/OrderTracking";
import { ProductImage } from "@/components/ProductImage";
import { formatAmount } from "@/lib/utils";
import StatusPill from "./StatusPill";
import ReturnForm from "./ReturnForm";
import SupportForm from "./SupportForm";

const RETURN_DAYS = 7;

// Last day for returns: 7 days after delivery (or after the latest status change)
function returnDeadline(statusHistory) {
  if (!Array.isArray(statusHistory) || statusHistory.length === 0) return null;
  const entry = statusHistory.find((h) => h.status === "Delivered") || statusHistory[statusHistory.length - 1];
  if (!entry?.date) return null;
  const d = new Date(entry.date);
  d.setDate(d.getDate() + RETURN_DAYS);
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

export default function OrderDetail({ order, onBack }) {
  const [tab, setTab] = useState("details"); // details | track
  const [view, setView] = useState("order"); // order | return | support
  const [returningItem, setReturningItem] = useState(null);

  if (view === "return" && returningItem) {
    return <ReturnForm order={order} item={returningItem} onBack={() => setView("order")} />;
  }
  if (view === "support") {
    return <SupportForm order={order} onBack={() => setView("order")} />;
  }

  const regionName = order.region?.name || order.region || "";
  const deadline = returnDeadline(order.statusHistory);
  const rows = [
    { label: "Subtotal", value: formatAmount(order.subTotal ?? 0) },
    { label: "Delivery", value: Number(order.deliveryFee) > 0 ? formatAmount(order.deliveryFee) : "Free" },
    ...(order.discount > 0 ? [{ label: "Discount", value: `−${formatAmount(order.discount)}` }] : []),
  ];

  return (
    <section className="rounded-[24px] border border-line p-6 sm:p-8">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-forest">
        <ArrowLeft size={16} /> All orders
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="break-all text-xl font-bold text-forest">Order #{String(order._id).slice(-8).toUpperCase()}</h2>
        <StatusPill status={order.status} />
      </div>
      <p className="mt-1 text-sm text-muted">
        Placed {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="mt-6 inline-flex rounded-full bg-sage p-1" role="tablist">
        {[
          { id: "details", label: "Details" },
          { id: "track", label: "Track order" },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === id ? "bg-white text-forest shadow-sm" : "text-muted hover:text-forest"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "track" ? (
        <div className="mt-6">
          <OrderProgressBar currentStatus={order.status || "Confirmed"} statusHistory={order.statusHistory || []} />
        </div>
      ) : (
        <>
          <ul className="mt-6 flex flex-col gap-3">
            {order.items.map((item, i) => (
              <li key={`${item._id || i}-${item.color || ""}`} className="flex flex-wrap items-center gap-3 rounded-[20px] bg-sage p-3 sm:flex-nowrap">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white">
                  <ProductImage src={item.image} alt={item.name} width={52} height={52} className="h-[52px] w-[52px] object-contain" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold text-ink">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.color ? `${item.color} · ` : ""}Qty {item.quantity} · {formatAmount(item.price)}
                  </p>
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                  <AddToCartButton
                    product={{ ...item, availability: item.availability ?? true }}
                    label="Buy again"
                    animated={false}
                    className="h-10 flex-1 rounded-full bg-forest px-4 text-[13px] font-semibold text-white transition-colors hover:bg-black sm:flex-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setReturningItem(item);
                      setView("return");
                    }}
                    className="h-10 flex-1 rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-forest transition-colors hover:border-forest sm:flex-none"
                  >
                    Return
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 text-sm">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <dt className="text-muted">{label}</dt>
                <dd className="text-ink">{value}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-line pt-3">
              <dt className="font-bold text-forest">Total</dt>
              <dd className="font-bold text-forest">{formatAmount(order.total)}</dd>
            </div>
          </dl>

          {deadline && (
            <p className="mt-6 flex items-start gap-2.5 rounded-2xl bg-mint px-4 py-3 text-sm text-forest">
              <Info size={17} className="mt-0.5 shrink-0" />
              Returns are accepted within {RETURN_DAYS} days. For this order, the window closes on {deadline}.
            </p>
          )}

          <div className="mt-6 rounded-[20px] border border-line p-5">
            <h3 className="font-bold text-forest">Delivery</h3>
            <div className="mt-2 space-y-0.5 text-sm text-muted">
              <p className="font-semibold text-ink">
                {order.firstName} {order.lastName}
              </p>
              <p>{order.address}</p>
              <p>
                {order.city}
                {regionName ? `, ${regionName}` : ""}
              </p>
              <p>{order.phone}</p>
              <p className="pt-1 capitalize">{order.deliveryType} delivery</p>
            </div>
          </div>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="text-sm text-muted">Something not right with this order?</p>
        <button
          type="button"
          onClick={() => setView("support")}
          className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-forest hover:bg-sage"
        >
          <MessageCircle size={16} /> Contact support
        </button>
      </div>
    </section>
  );
}
