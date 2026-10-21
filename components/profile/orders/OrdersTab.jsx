"use client";
// components/profile/orders/OrdersTab.jsx — the shopper's orders (/api/orders), grouped by order,
// with order details, tracking, returns and support (OrderDetail).
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import Loading from "@/components/Loading";
import { ProductImage } from "@/components/ProductImage";
import { formatAmount } from "@/lib/utils";
import StatusPill from "./StatusPill";
import OrderDetail from "./OrderDetail";

const LIMIT = 10;

const shortId = (id) => String(id).slice(-8).toUpperCase();
const dateOf = (d) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

export default function OrdersTab() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [opening, setOpening] = useState(null); // order id being loaded

  useEffect(() => {
    if (selectedOrder) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    axios
      .get(`/api/orders?page=${page}&limit=${LIMIT}`)
      .then((res) => {
        if (cancelled) return;
        setItems(res.data.items || []);
        setTotalPages(Math.max(1, res.data.totalPages || 1));
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        if (!cancelled) setError("We couldn't load your orders. Please refresh the page.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, selectedOrder]);

  // The API lists items; show them grouped under their order
  const orders = useMemo(() => {
    const groups = new Map();
    items.forEach((item) => {
      const id = String(item.orderId);
      if (!groups.has(id)) groups.set(id, { id, date: item.orderDate, status: item.status, items: [] });
      groups.get(id).items.push(item);
    });
    return [...groups.values()];
  }, [items]);

  const openOrder = async (orderId) => {
    setOpening(orderId);
    try {
      const res = await axios.get(`/api/orders/${orderId}`);
      setSelectedOrder(res.data.order);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("We couldn't open that order. Please try again.");
    } finally {
      setOpening(null);
    }
  };

  if (selectedOrder) return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />;

  return (
    <section className="rounded-[24px] border border-line p-6 sm:p-8">
      <h2 className="text-xl font-bold text-forest">My orders</h2>
      <p className="mt-1 text-sm text-muted">Track deliveries, buy again or start a return.</p>

      {error && <p className="mt-5 rounded-2xl bg-[#fde8e8] px-4 py-3 text-sm text-filred">{error}</p>}

      {loading ? (
        <div className="py-12">
          <Loading />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-[20px] bg-sage px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-forest">
            <Package size={24} />
          </span>
          <p className="mt-4 text-lg font-bold text-forest">No orders yet</p>
          <p className="mt-1 text-sm text-muted">When you buy something, you can follow it here.</p>
          <Link
            href="/products/power-banks"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-forest px-8 text-[15px] font-semibold text-white transition-colors hover:bg-black"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-[20px] bg-sage p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-sm font-bold text-forest">Order #{shortId(order.id)}</p>
                  <p className="text-xs text-muted">{dateOf(order.date)}</p>
                  <StatusPill status={order.status} />
                </div>
                <button
                  type="button"
                  onClick={() => openOrder(order.id)}
                  disabled={opening === order.id}
                  className="rounded-full border border-forest bg-white px-4 py-2 text-[13px] font-semibold text-forest transition-colors hover:bg-mint disabled:opacity-60"
                >
                  {opening === order.id ? "Opening…" : "View order"}
                </button>
              </div>

              <ul className="mt-4 flex flex-col gap-3">
                {order.items.map((item, i) => (
                  <li key={`${item._id || i}-${item.color || ""}`} className="flex items-center gap-3">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white">
                      <ProductImage src={item.image} alt={item.name} width={44} height={44} className="h-11 w-11 object-contain" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-ink">{item.name}</p>
                      <p className="text-xs text-muted">
                        {item.color ? `${item.color} · ` : ""}Qty {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-ink">{formatAmount(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {!loading && totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Order pages">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-forest transition-colors enabled:hover:border-forest disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-forest transition-colors enabled:hover:border-forest disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </nav>
      )}
    </section>
  );
}
