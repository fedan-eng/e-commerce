"use client";
// components/cart/CartSidebar.jsx — desktop cart panel (slides in from the right)
import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { closeCart, dismissBanner } from "@/store/features/cartUISlice";
import { removeFromCart, updateQuantity } from "@/store/features/cartSlice";
import { CartHeader, AddedBanner, DeliveryNote, CartItemList, CartSummary, EmptyCart } from "./CartParts";

export default function CartSidebar() {
  const dispatch = useDispatch();
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

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") dispatch(closeCart()); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dispatch]);

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
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] hidden bg-[#0A321B]/35 backdrop-blur-[2px] md:block"
            onClick={close}
          />
          <motion.aside
            key="cart-sidebar"
            role="dialog"
            aria-label="Your cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-3 right-3 top-3 z-[201] hidden w-full max-w-[420px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl md:flex"
          >
            <div className="shrink-0 border-b border-[#EEF3EF] px-6 pb-4 pt-6">
              <CartHeader totalItems={totalItems} onClose={close} />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pt-4">
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
              <div className="shrink-0 border-t border-[#EEF3EF] bg-white px-6 pb-6 pt-5">
                <CartSummary subtotal={subtotal} totalItems={totalItems} onClose={close} />
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
