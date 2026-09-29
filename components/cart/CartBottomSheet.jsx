"use client";

import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X, ShoppingBag, Minus, Plus, CheckCircle2, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { closeCart, dismissBanner } from "@/store/features/cartUISlice";
import { removeFromCart, updateQuantity } from "@/store/features/cartSlice";
import { formatAmount } from "@/lib/utils";

export default function CartBottomSheet() {
  const dispatch = useDispatch();
  const controls = useDragControls();
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

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleQtyChange = useCallback(
    (item, delta) => {
      const next = item.quantity + delta;
      if (next < 1) {
        dispatch(removeFromCart({ _id: item._id, color: item.color }));
      } else {
        dispatch(
          updateQuantity({ _id: item._id, color: item.color, quantity: next })
        );
      }
    },
    [dispatch]
  );

  return (
    <>
      {/* ── Backdrop ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[200] md:hidden"
            onClick={() => dispatch(closeCart())}
          />
        )}
      </AnimatePresence>

      {/* ── Bottom Sheet ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="cart-bottom-sheet"
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.35 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) dispatch(closeCart());
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="
              fixed bottom-0 left-0 right-0
              bg-white rounded-t-[28px] shadow-2xl
              z-[201] md:hidden
              flex flex-col
              max-h-[92vh]
            "
          >
            {/* ── Drag Handle ── */}
            <div
              className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing flex-shrink-0"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={2.2} />
                <span className="font-oswald font-bold text-[16px] text-gray-900">
                  Your Cart ({totalItems})
                </span>
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
              </button>
            </div>

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
              
              {/* ── Added to cart banner + Free delivery ── */}
              <AnimatePresence>
                {showBanner && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                    animate={{ height: "auto", opacity: 1, marginBottom: 20 }}
                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    {/* Soft green pill */}
                    <div className="bg-[#e8f8ef] border border-[#b8e6c9] rounded-2xl px-4 py-3 flex items-center gap-2.5 mb-3">
                      <div className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-[14px] font-roboto font-semibold text-[#166534]">
                        Added to your cart
                      </span>
                    </div>

                    {/* Free delivery line */}
                    <div className="flex items-center gap-2 px-1">
                      <Home className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" strokeWidth={2} />
                      <span className="text-[12.5px] font-roboto text-gray-500 font-medium">
                        Free delivery in Lagos on Thursday
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Empty state ── */}
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                  <ShoppingBag className="w-12 h-12 opacity-25" />
                  <p className="text-sm font-roboto font-medium">Your cart is empty</p>
                  <button
                    onClick={() => dispatch(closeCart())}
                    className="text-sm font-roboto text-black font-medium underline underline-offset-2 mt-1"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                /* ── 2-COLUMN PRODUCT GRID ── */
                <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                  {cartItems.map((item) => (
                    <MobileCartItem
                      key={`${item._id}-${item.color}`}
                      item={item}
                      onQtyChange={handleQtyChange}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            {cartItems.length > 0 && (
              <div className="flex-shrink-0 border-t border-gray-100 bg-white px-5 pt-4 pb-8 safe-area-bottom">
                {/* Subtotal row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14px] font-roboto font-medium text-gray-500">
                      Subtotal
                    </span>
                    <span className="text-[12px] font-roboto text-gray-400">
                      {totalItems} {totalItems === 1 ? "item" : "items"} in cart
                    </span>
                  </div>
                  <span className="font-roboto font-extrabold text-[17px] text-gray-900 tracking-tight">
                    {formatAmount(subtotal)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/cart"
                  onClick={() => dispatch(closeCart())}
                  className="
                    flex items-center justify-center gap-2 w-full
                    bg-[#111] text-white font-bold py-[15px] rounded-2xl
                    active:scale-[0.98] transition-transform text-[15px]
                  "
                >
                  Checkout Now ({totalItems})
                  <span className="font-roboto text-base leading-none">→</span>
                </Link>

                {/* Continue Shopping */}
                <button
                  onClick={() => dispatch(closeCart())}
                  className="w-full text-center text-[13px] font-roboto font-semibold text-[#22c55e] active:text-[#16a34a] transition-colors underline underline-offset-4 mt-3.5"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Single cart item card (2-col grid) ────────────────────────────────────────
function MobileCartItem({ item, onQtyChange }) {
  return (
    <div className="flex flex-col">
      {/* Product Image */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#f5f5f5] border border-gray-100 mb-2.5">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain p-3"
            sizes="(max-width: 768px) 45vw, 180px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-gray-300" />
          </div>
        )}
      </div>

      {/* Name */}
      <p className="text-[12.5px] font-roboto font-bold text-gray-900 leading-snug line-clamp-2 min-h-[32px]">
        {item.name}
      </p>

      {/* Color */}
      {item.color && (
        <p className="text-[11px] font-roboto text-gray-400 mt-0.5 capitalize leading-none">
          {item.color}
        </p>
      )}

      {/* Stepper + Price */}
      <div className="flex items-center justify-between mt-2.5 gap-1">
        {/* Qty stepper */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
          <button
            onClick={() => onQtyChange(item, -1)}
            className="w-6 h-6 flex items-center justify-center active:bg-gray-100"
            aria-label="Decrease"
          >
            <Minus className="w-2.5 h-2.5 text-gray-600" strokeWidth={2.5} />
          </button>
          <span className="w-5 text-center text-[11px] font-roboto font-bold text-gray-900 select-none">
            {item.quantity}
          </span>
          <button
            onClick={() => onQtyChange(item, +1)}
            className="w-6 h-6 flex items-center justify-center active:bg-gray-100"
            aria-label="Increase"
          >
            <Plus className="w-2.5 h-2.5 text-gray-600" strokeWidth={2.5} />
          </button>
        </div>

        {/* Price */}
        <span className="text-[12.5px] font-roboto font-extrabold text-gray-900 tracking-tight whitespace-nowrap">
          {formatAmount(item.price * item.quantity)}
        </span>
      </div>
    </div>
  );
}