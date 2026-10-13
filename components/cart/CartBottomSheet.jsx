"use client";
// components/cart/CartBottomSheet.jsx — mobile cart (slides up from the bottom, drag down to close)
import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { closeCart, dismissBanner } from "@/store/features/cartUISlice";
import { removeFromCart, updateQuantity } from "@/store/features/cartSlice";
import { CartHeader, AddedBanner, DeliveryNote, CartItemList, CartSummary, EmptyCart } from "./CartParts";

export default function CartBottomSheet() {
  const dispatch = useDispatch();
  const controls = useDragControls();
  const { isOpen, showBanner } = useSelector((s) => s.cartUI);
  const cartItems = useSelector((s) => s.cart.items);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const close = () => dispatch(closeCart());

  // Auto-dismiss "Added to your cart" after 3s
  useEffect(() => {
    if (!showBanner) return;
    const t = setTimeout(() => dispatch(dismissBanner()), 3000);
    return () => clearTimeout(t);
  }, [showBanner, dispatch]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleQtyChange = useCallback((item, delta) => {
    const next = item.quantity + delta;
    if (next < 1) dispatch(removeFromCart({ _id: item._id, color: item.color }));
    else dispatch(updateQuantity({ _id: item._id, color: item.color, quantity: next }));
  }, [dispatch]);

  const handleRemove = useCallback((item) => {
    dispatch(removeFromCart({ _id: item._id, color: item.color }));
  }, [dispatch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-[#0A321B]/35 md:hidden"
            onClick={close}
          />
          <motion.div
            key="cart-bottom-sheet"
            role="dialog"
            aria-label="Your cart"
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.35 }}
            onDragEnd={(_, info) => { if (info.offset.y > 120) close(); }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-0 bottom-0 z-[201] flex max-h-[92vh] flex-col rounded-t-[28px] bg-white shadow-2xl md:hidden"
          >
            {/* Drag handle + header (drag from here to close) */}
            <div
              className="shrink-0 cursor-grab touch-none border-b border-[#EEF3EF] px-5 pb-4 active:cursor-grabbing"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="flex justify-center pb-3 pt-3">
                <div className="h-1.5 w-10 rounded-full bg-[#D6E2DA]" />
              </div>
              <CartHeader totalItems={totalItems} onClose={close} />
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4">
              <AddedBanner show={showBanner} />
              {cartItems.length === 0 ? (
                <EmptyCart onClose={close} />
              ) : (
                <>
                  <DeliveryNote />
                  <CartItemList items={cartItems} onQtyChange={handleQtyChange} onRemove={handleRemove} />
                </>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="shrink-0 border-t border-[#EEF3EF] bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
                <CartSummary subtotal={subtotal} totalItems={totalItems} onClose={close} />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
