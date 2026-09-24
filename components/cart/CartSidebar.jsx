"use client";

import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Minus, Plus, CheckCircle2, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { closeCart, dismissBanner } from "@/store/features/cartUISlice";
import { removeFromCart, updateQuantity } from "@/store/features/cartSlice";
import { formatAmount } from "@/lib/utils";

export default function CartSidebar() {
  const dispatch = useDispatch();
  const { isOpen, showBanner } = useSelector((s) => s.cartUI);
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
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-[18px] h-[18px]" strokeWidth={2.5} />
                <span className="font-oswald font-bold text-[15px] text-gray-900">
                  Your Cart ({totalItems})
                </span>
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              
              {/* ── "Added to cart" & Delivery notification block ── */}
              <AnimatePresence>
                {showBanner && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, scale: 0.95 }}
                    animate={{ height: "auto", opacity: 1, scale: 1 }}
                    exit={{ height: 0, opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="bg-[#f0fdf4] border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2.5 mb-3">
                      <CheckCircle2 className="w-5 h-5 fill-green-600 text-white flex-shrink-0" />
                      <span className="text-[14px] font-poppins font-bold">Added to your cart</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-1 text-gray-500">
                      <Home className="w-4 h-4 flex-shrink-0 opacity-80" strokeWidth={2} />
                      <span className="text-[13px] font-medium tracking-wide">
                        Free delivery in Lagos on Thursday
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Cart Items ── */}
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
                  <ShoppingCart className="w-10 h-10 opacity-20" />
                  <p className="text-sm">Your cart is empty</p>
                </div>
              ) : (
                <div className="flex flex-col space-y-6">
                  {cartItems.map((item, index) => (
                    <CartItem
                      key={`${item._id}-${item.color}`}
                      item={item}
                      isLast={index === cartItems.length - 1}
                      onQtyChange={handleQtyChange}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            {cartItems.length > 0 && (
              <div className="flex-shrink-0 border-t border-gray-100 bg-white px-6 py-6 pb-8">
                {/* Subtotal */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex flex-col">
                    <span className="text-[15px] font-poppins font-medium text-gray-500">Subtotal</span>
                    <span className="text-[13px] font-poppins text-gray-400 mt-1">
                      {totalItems} {totalItems === 1 ? "item" : "items"} in cart
                    </span>
                  </div>
                  <span className="font-poppins font-bold text-[17px] text-gray-900">
                    {formatAmount(subtotal)}
                  </span>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/cart"
                  onClick={() => dispatch(closeCart())}
                  className="
                    flex items-center justify-center gap-2 w-full
                    bg-[#0f0f0f] text-white font-bold py-3.5 rounded-xl
                    hover:bg-black transition-colors text-[15px]
                  "
                >
                  Checkout Now ({totalItems}) <span className="font-poppins text-[16px] leading-none">➔</span>
                </Link>

                {/* Continue Shopping Link */}
                <button
                  onClick={() => dispatch(closeCart())}
                  className="w-full text-center text-[13px] font-poppins font-medium text-emerald-500 hover:text-emerald-600 transition-colors underline underline-offset-4 mt-4"
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

// ── Single cart item block ──────────────────────────────────────────────────
function CartItem({ item, onQtyChange, isLast }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex flex-col ${!isLast ? "border-b border-gray-100 pb-6" : ""}`}
    >
      {/* Big Rectangle Image Display */}
      <div className="w-full aspect-[16/11] mb-4 flex-shrink-0 rounded-[20px] overflow-hidden bg-[#f8f9fa] border border-gray-50 relative flex items-center justify-center p-6">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain p-4 mix-blend-multiply"
          />
        ) : (
          <ShoppingCart className="w-8 h-8 text-gray-200" />
        )}
      </div>

      {/* Info */}
      <div className="w-full">
        <h3 className="text-[15px] font-poppins font-extrabold text-gray-900 leading-snug truncate">
          {item.name}
        </h3>
        {item.color && (
          <p className="text-[13px] font-poppins text-gray-400 mt-1 capitalize">{item.color}</p>
        )}

        {/* Bottom Stepper & Price Row */}
        <div className="flex items-center justify-between mt-4">
          
          {/* Custom Styled Stepper */}
          <div className="flex items-center gap-4 border border-gray-200/80 rounded-xl px-2 py-1.5 shadow-sm">
            <button
              onClick={() => onQtyChange(item, -1)}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-[14px] h-[14px]" strokeWidth={2.5} />
            </button>
            <span className="w-3 text-center text-[13px] font-bold text-gray-900 select-none">
              {item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(item, +1)}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-[14px] h-[14px]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Bold Item Total Price */}
          <span className="text-[15px] font-extrabold text-gray-900 tracking-tight">
            {formatAmount(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}