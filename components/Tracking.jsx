"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Check, Package, X } from "lucide-react";
import Loading from "@/components/Loading";
import { formatAmount } from "lib/utils";

const STEPS = ["Confirmed", "Processing", "Shipped", "In Transit", "Delivered"];

// Map any casing variant → canonical step label
const NORMALISE = {
  confirmed:    "Confirmed",
  processing:   "Processing",
  shipped:      "Shipped",
  intransit:    "In Transit",
  "in transit": "In Transit",
  "in-transit": "In Transit", // Legacy support for old data
  delivered:    "Delivered",
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchOrder = async (id) => {
    if (!id.trim()) {
      setError("Please enter an order number");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await axios.get(`/api/orders/${id.trim()}`);
      setOrder(res.data.order);
    } catch (err) {
      console.error("Tracking error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to fetch order. Please check the order number and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-populate and auto-submit if order param exists in URL
  useEffect(() => {
    const orderParam = searchParams.get("order");
    if (orderParam) {
      setOrderId(orderParam);
      fetchOrder(orderParam);
    }
  }, [searchParams]);

  const onSubmit = (e) => {
    e.preventDefault();
    fetchOrder(orderId);
  };

  const status = order?.status;
  const cancelled = status?.toLowerCase() === "cancelled";
  const currentIndex = STEPS.indexOf(NORMALISE[status?.toLowerCase()] || status);

  return (
    <div id="track" className="rounded-[24px] bg-forest p-6 text-white">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint text-forest">
          <Package size={18} />
        </span>
        <h2 className="text-lg font-bold">Track your order</h2>
      </div>
      <p className="mt-3 text-sm text-white/75">Enter the order number from your confirmation email.</p>

      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          name="track"
          aria-label="Order number"
          placeholder="Order number"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="h-12 min-w-0 flex-1 rounded-full bg-white px-4 text-sm text-ink outline-none placeholder:text-faint"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 shrink-0 items-center justify-center rounded-full bg-mint px-5 text-sm font-semibold text-forest transition-colors hover:bg-white disabled:cursor-wait"
        >
          {loading ? <Loading /> : "Track"}
        </button>
      </form>

      {error && <p role="alert" className="mt-3 text-[13px] font-medium text-[#ffb4b4]">{error}</p>}

      {order && (
        <div className="mt-5 rounded-[18px] bg-white p-5 text-ink">
          <p className="text-xs font-semibold uppercase tracking-wider text-faint">Order</p>
          <p className="mt-0.5 break-all text-sm font-bold text-forest">{order._id}</p>

          {cancelled ? (
            <p className="mt-4 flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-filred">
              <X size={16} /> This order was cancelled
            </p>
          ) : (
            <ol className="mt-4">
              {STEPS.map((step, i) => {
                const done = i <= currentIndex;
                return (
                  <li key={step} className="relative flex items-center gap-3 pb-4 last:pb-0">
                    {i < STEPS.length - 1 && (
                      <span
                        aria-hidden
                        className={`absolute left-[11px] top-6 h-[calc(100%-24px)] w-0.5 ${i < currentIndex ? "bg-forest" : "bg-line"}`}
                      />
                    )}
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        done ? "bg-forest text-white" : "border-2 border-line bg-white"
                      }`}
                    >
                      {done && <Check size={13} strokeWidth={3} />}
                    </span>
                    <span className={`text-sm ${i === currentIndex ? "font-bold text-forest" : done ? "text-ink" : "text-faint"}`}>
                      {step}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="mt-5 border-t border-line pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">Items</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="text-muted">
                    {item.color ? `${item.color} ` : ""}{item.name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-semibold">{formatAmount(item.price)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm font-bold text-forest">
              <span>Total</span>
              <span>{formatAmount(order.total)}</span>
            </div>
            <p className="mt-2 text-xs text-faint">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Tracking() {
  return (
    <Suspense fallback={<Loading />}>
      <TrackingContent />
    </Suspense>
  );
}
