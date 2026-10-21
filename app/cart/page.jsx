// app/cart/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQuantity, updateColor } from "@/store/features/cartSlice";
import { EmptyCart } from "@/components/cart/CartParts";
import CheckoutModal from "@/components/checkout/CheckoutModal";
import CartLineItem from "./components/CartLineItem";
import OrderSummary from "./components/OrderSummary";
import useCartColorOptions from "./useCartColorOptions";

function trackBeginCheckout(items, value) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "begin_checkout", {
    currency: "NGN",
    value,
    items: items.map((item, index) => ({
      item_id: item._id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      index,
    })),
  });
}

export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart.items);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const colorsById = useCartColorOptions(items);

  const [mounted, setMounted] = useState(false); // cart lives in the browser; avoid a hydration flash
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const subTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const changeQuantity = (item, quantity) => {
    if (quantity >= 1) dispatch(updateQuantity({ _id: item._id, color: item.color, quantity }));
  };

  const changeColor = (item, newColor) => {
    if (!newColor || newColor === item.color) return;
    const colorData = colorsById[item._id]?.find((c) => c.name === newColor);
    dispatch(updateColor({ _id: item._id, oldColor: item.color, newColor, newImage: colorData?.images?.[0] || item.image }));
  };

  const startCheckout = () => {
    trackBeginCheckout(items, subTotal);
    // Checkout's own Contact and Delivery steps collect missing details and save them to the account
    setCheckoutOpen(true);
  };

  if (!mounted) return null;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-8 sm:px-6 md:pt-12">
      {items.length === 0 ? (
        <div className="mx-auto max-w-md">
          <EmptyCart />
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-3">
            <h1 className="text-[30px] font-bold tracking-tight text-forest md:text-[40px]">Your cart</h1>
            <span className="rounded-full bg-mint px-3 py-1 text-sm font-semibold text-forest">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <p className="mt-1 text-[15px] text-muted">Your goodies are waiting. Check out when you&apos;re ready.</p>

          <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
            <ul className="divide-y divide-line border-y border-line">
              {items.map((item) => (
                <CartLineItem
                  key={`${item._id}-${item.color || "default"}`}
                  item={item}
                  colors={colorsById[item._id]}
                  onQuantityChange={(qty) => changeQuantity(item, qty)}
                  onColorChange={(color) => changeColor(item, color)}
                  onRemove={() => dispatch(removeFromCart({ _id: item._id, color: item.color }))}
                />
              ))}
            </ul>

            <div className="lg:sticky lg:top-24">
              <OrderSummary subTotal={subTotal} itemCount={itemCount} isAuthenticated={isAuthenticated} onCheckout={startCheckout} />
            </div>
          </div>
        </>
      )}

      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}
