"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CartAnimationContext } from "./CartAnimationContext";
import { useCartAnimation } from "@/hooks/useCartAnimation";

/**
 * CartAnimationProvider
 *
 * Place this in your root ClientLayout (or wherever your Redux Provider lives).
 * It owns the fly state and renders the flying polaroid image directly into
 * document.body via a portal so it can go above everything (z-[9999]).
 *
 * Example:
 *   // app/ClientLayout.jsx
 *   <ReduxProvider store={store}>
 *     <CartAnimationProvider>
 *       <Navbar />
 *       {children}
 *     </CartAnimationProvider>
 *   </ReduxProvider>
 */

export default function CartAnimationProvider({ children }) {
  const { cartIconRef, triggerFly, flyState, clearFly } = useCartAnimation();

  // Compute CSS transforms for the flying element
  // The element starts positioned at the product image and flies to the cart icon
  const getAnimationProps = () => {
    if (!flyState) return {};

    const { from, to } = flyState;

    // Polaroid starts at the product image size, shrinks to ~60px as it lands
    const startSize = Math.min(from.width, from.height, 120); // cap at 120px
    const endSize   = 32; // shrinks to roughly cart icon size

    // Starting position: center of the product image
    const startX = from.x + from.width  / 2 - startSize / 2;
    const startY = from.y + from.height / 2 - startSize / 2;

    // Ending position: center of the cart icon
    const endX = to.x - endSize / 2;
    const endY = to.y - endSize / 2;

    return { startSize, endSize, startX, startY, endX, endY };
  };

  const anim = flyState ? getAnimationProps() : null;

  return (
    <CartAnimationContext.Provider value={{ cartIconRef, triggerFly, flyState, clearFly }}>
      {children}

      {/* Portal: flying polaroid image — renders above everything */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {flyState && anim && (
              <motion.div
                key="cart-fly"
                // ── Initial state: at the product image ──────────────────────
                initial={{
                  x:       anim.startX,
                  y:       anim.startY,
                  width:   anim.startSize,
                  height:  anim.startSize,
                  opacity: 1,
                  scale:   1,
                  borderRadius: "50%",  // rounded-full
                }}
                // ── Animate to: cart icon position ───────────────────────────
                animate={{
                  x:       anim.endX,
                  y:       anim.endY,
                  width:   anim.endSize,
                  height:  anim.endSize,
                  opacity: [1, 1, 0],   // hold then fade at the end
                  scale:   [1, 0.9, 0.5],
                  borderRadius: "50%",
                }}
                // ── Transition ───────────────────────────────────────────────
                transition={{
                  duration: 0.65,
                  ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart — feels natural
                  opacity: { times: [0, 0.7, 1] },
                  scale:   { times: [0, 0.5, 1] },
                }}
                onAnimationComplete={() => {
                  flyState.onLand?.();
                  clearFly();
                }}
                style={{
                  position: "fixed",
                  top:      0,
                  left:     0,
                  zIndex:   9999,
                  pointerEvents: "none",
                  // Polaroid look: white background, shadow, rounded
                  backgroundColor: "white",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* Product image inside the polaroid */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flyState.imageUrl}
                  alt=""
                  style={{
                    width:      "100%",
                    height:     "100%",
                    objectFit:  "contain",
                    borderRadius: "50%",
                    display:    "block",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </CartAnimationContext.Provider>
  );
}