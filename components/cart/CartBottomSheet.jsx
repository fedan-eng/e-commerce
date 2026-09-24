"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X, ShoppingBag, Minus, Plus, Trash2, CheckCircle, GripHorizontal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { closeCart, dismissBanner } from "@/store/features/cartUISlice";
import { removeFromCart, updateQuantity } from "@/store/features/cartSlice";
import { formatAmount } from "@/lib/utils";

export default function CartBottomSheet() {
  const dispatch  = useDispatch();
  const controls  = useDragControls();
  const { isOpen, showBanner, lastAddedItem } = useSelector((s) => s.cartUI);
  const cartItems = useSelector((s) => s.cart.items);

  const subtotal   = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Auto-dismiss banner
  useEffect(() => {
    if (!showBanner) return;
    const t = setTimeout(() => dispatch(dismissBanner()), 3000);
    return () => clearTimeout(t);
  }, [showBanner, dispatch]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

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
            dragListener={false}          // only drag via handle
            dragConstraints={{ top: 0 }} // can't drag up past origin
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_, info) => {
              // If dragged down more than 100px, close
              if (info.offset.y > 100) dispatch(closeCart());
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="
              fixed bottom-0 left-0 right-0
              bg-white rounded-t-3xl shadow-2xl
              z-[201] md:hidden
              flex flex-col
              max-h-[88vh]
            "
          >
            {/* ── Drag Handle ── */}
            <div
              className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing flex-shrink-0"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* ── "Added to cart" banner ── */}
            <AnimatePresence>
              {showBanner && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-green-500 text-white px-5 py-3 flex items-center gap-2 overflow-hidden flex-shrink-0"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Added to your cart</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
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

            {/* ── Cart Items (scrollable) ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                  <ShoppingBag className="w-10 h-10 opacity-30" />
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
                  <MobileCartItem
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

            {/* ── Footer ── */}
            {cartItems.length > 0 && (
              <div className="flex-shrink-0 border-t border-gray-100 px-5 pt-4 pb-8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="font-bold text-base">{formatAmount(subtotal)}</span>
                </div>

                <Link
                  href="/cart"
                  onClick={() => dispatch(closeCart())}
                  className="
                    flex items-center justify-center gap-2 w-full
                    bg-black text-white font-semibold py-4 rounded-2xl
                    hover:bg-gray-900 transition-colors text-sm
                  "
                >
                  Checkout Now ({totalItems}) →
                </Link>

                <button
                  onClick={() => dispatch(closeCart())}
                  className="w-full text-center text-sm text-gray-500 hover:text-black transition-colors underline underline-offset-2"
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

// ── Single cart item (mobile) ─────────────────────────────────────────────────
function MobileCartItem({ item, onQtyChange, onRemove }) {
  return (
    <div className="flex gap-3">
      {/* Image */}
      <div className="w-[72px] h-[72px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={72}
            height={72}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ShoppingBag className="w-5 h-5 text-gray-300" />
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

        <div className="flex items-center justify-between mt-2">
          {/* Stepper */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onQtyChange(item, -1)}
              className="w-7 h-7 flex items-center justify-center active:bg-gray-100"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-sm font-medium select-none">
              {item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(item, +1)}
              className="w-7 h-7 flex items-center justify-center active:bg-gray-100"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <span className="text-sm font-bold">
            {formatAmount(item.price * item.quantity)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="self-start p-1 text-gray-300 active:text-red-400 mt-0.5"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}