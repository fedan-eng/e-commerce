"use client";

import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Minus, Plus, Trash2, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { closeCart, dismissBanner } from "@/store/features/cartUISlice";
import { removeFromCart, updateQuantity } from "@/store/features/cartSlice";
import { formatAmount } from "@/lib/utils";

export default function CartSidebar() {
  const dispatch = useDispatch();
  const { isOpen, showBanner, lastAddedItem } = useSelector((s) => s.cartUI);
  const cartItems = useSelector((s) => s.cart.items);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Auto-dismiss banner after 3s
  useEffect(() => {
    if (!showBanner) return;
    const t = setTimeout(() => dispatch(dismissBanner()), 3000);
    return () => clearTimeout(t);
  }, [showBanner, dispatch]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") dispatch(closeCart()); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dispatch]);

  const handleQtyChange = useCallback((item, delta) => {
    const next = item.quantity + delta;
    if (next < 1) {
      dispatch(removeFromCart({ _id: item._id, color: item.color }));
    } else {
      dispatch(updateQuantity({ _id: item._id, color: item.color, quantity: next }));
    }
  }, [dispatch]);

  return (
    <>
      {/* ── Backdrop ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 z-[200] hidden md:block"
            onClick={() => dispatch(closeCart())}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="cart-sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="
              fixed top-0 right-0 h-screen w-full max-w-[400px]
              bg-white shadow-2xl z-[201]
              hidden md:flex flex-col
            "
          >
            {/* ── "Added to cart" green banner ── */}
            <AnimatePresence>
              {showBanner && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-green-500 text-white px-5 py-3 flex items-center gap-2 overflow-hidden flex-shrink-0"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Added to your cart</span>
                  {lastAddedItem?.freeDelivery && (
                    <span className="ml-auto text-xs opacity-90">
                      🎉 Free delivery in Lagos on Thursday
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-semibold text-[15px]">
                  Your Cart ({totalItems})
                </span>
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Cart Items ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                  <ShoppingBag className="w-12 h-12 opacity-30" />
                  <p className="text-sm">Your cart is empty</p>
                  <button
                    onClick={() => dispatch(closeCart())}
                    className="text-sm text-black underline underline-offset-2"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <CartItem
                    key={`${item._id}-${item.color}`}
                    item={item}
                    onQtyChange={handleQtyChange}
                    onRemove={() =>
                      dispatch(removeFromCart({ _id: item._id, color: item.color }))
                    }
                  />
                ))
              )}
            </div>

            {/* ── Footer: Subtotal + CTA ── */}
            {cartItems.length > 0 && (
              <div className="flex-shrink-0 border-t border-gray-100 px-5 py-5 space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                  </span>
                  <span className="font-bold text-base">{formatAmount(subtotal)}</span>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/cart"
                  onClick={() => dispatch(closeCart())}
                  className="
                    flex items-center justify-center gap-2 w-full
                    bg-black text-white font-semibold py-3.5 rounded-xl
                    hover:bg-gray-900 transition-colors text-sm
                  "
                >
                  Checkout Now ({totalItems}) →
                </Link>

                {/* Continue Shopping */}
                <button
                  onClick={() => dispatch(closeCart())}
                  className="w-full text-center text-sm text-gray-500 hover:text-black transition-colors underline underline-offset-2"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Single cart item row ──────────────────────────────────────────────────────
function CartItem({ item, onQtyChange, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex gap-3"
    >
      {/* Image */}
      <div className="w-[80px] h-[80px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ShoppingBag className="w-6 h-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
          {item.name}
        </p>
        {item.color && (
          <p className="text-xs text-gray-400 mt-0.5 capitalize">{item.color}</p>
        )}

        {/* Quantity stepper + price row */}
        <div className="flex items-center justify-between mt-2">
          {/* Stepper */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onQtyChange(item, -1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium select-none">
              {item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(item, +1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Price */}
          <span className="text-sm font-bold text-gray-900">
            {formatAmount(item.price * item.quantity)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="self-start p-1 text-gray-300 hover:text-red-400 transition-colors mt-0.5"
        aria-label="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}