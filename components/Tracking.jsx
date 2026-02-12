"use client";

import { useState } from "react";
import axios from "axios";
import OrderProgressBar from "@/components/OrderTracking";
import Loading from "@/components/Loading";
import { MdDeliveryDining } from "react-icons/md";
import { formatAmount } from "lib/utils";

export default function Tracking() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await axios.get(`/api/orders/${orderId}`);
      setOrder(res.data.order);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to fetch order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h1 className="mb-4 font-oswald font-medium text-xl sm:text-3xl">
        TRACK MY ORDER
      </h1>

      <div className="flex justify-center gap-2 md:gap-4 bg-[#f6f6f6] px-2 py-4 md:py-6 rounded-md">
        <div className="max-w-[357px] w-full">
          <input
            type="text"
            name="track"
            id="track"
            placeholder="Order number"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="block bg-white p-4 rounded-md outline-0 w-full placeholder-text-[#929292] text-sm"
          />
        </div>

        <button
          onClick={fetchOrder}
          className={
            loading
              ? ""
              : " bg-filgreen px-2 md:px-9 md:py-4 py-1 rounded-md text-dark text-xs md:text-sm shadow-button  "
          }
        >
          {loading ? <Loading /> : "Track Order"}
        </button>
      </div>

      {/* {error && <p className="text-red-600 text-xs">{error}</p>} */}

      {order && (
        <div className="space-y-2 shadow-lg mt-4 p-4 rounded-2xl">
          <h3 className="font-semibold text-gren text-lg">
            Order ID - {order._id}
          </h3>
          <OrderProgressBar currentStatus={order.status} />

          <h3 className="mt-10 font-semibold text-gren uppercase">
            ITEMS PURCHASED
          </h3>
          <ul className="text-sm list-disc list-inside">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.name} × {item.quantity} — {formatAmount(item.price)}
              </li>
            ))}
          </ul>
          <p className="font-semibold text-gren text-lg">
            Total: {formatAmount(order.total)}
          </p>
          <p className="text-filgrey text-xs">
            Ordered On: {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
