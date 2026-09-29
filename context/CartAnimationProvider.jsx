"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CartAnimationContext } from "./CartAnimationContext";
import { useCartAnimation } from "@/hooks/useCartAnimation";

export default function CartAnimationProvider({ children }) {
  const { cartIconRef, triggerFly, flyState, clearFly } = useCartAnimation();

  return (
    <CartAnimationContext.Provider value={{ cartIconRef, triggerFly, flyState, clearFly }}>
      {children}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {flyState && (
              <FlyingPolaroid
                key={flyState.id}          // unique key per trigger so AnimatePresence remounts cleanly
                flyState={flyState}
                onComplete={() => {
                  flyState.onLand?.();
                  clearFly();
                }}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </CartAnimationContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FlyingPolaroid
//
// Two-phase animation:
//   Phase "pop"  — polaroid bubbles into existence on the product image
//                  scale: 0 → 1.15 → 1  (spring overshoot)
//                  holds for HOLD_MS before flying
//   Phase "fly"  — floats from product image to Add to Cart button
//                  translates + shrinks + fades
// ─────────────────────────────────────────────────────────────────────────────
const POLAROID_SIZE = 115;   // px — visible size of the polaroid during "pop"
const HOLD_MS       = 320;   // ms the polaroid stays visible before flying away

function FlyingPolaroid({ flyState, onComplete }) {
  const { imageUrl, from, to } = flyState;

  // "pop" | "fly"
  const [phase, setPhase] = useState("pop");

  // Center of source (product image)
  const originX = from.x + from.width  / 2 - POLAROID_SIZE / 2;
  const originY = from.y + from.height / 2 - POLAROID_SIZE / 2;

  // Center of destination (Add to Cart button)
  const destX   = to.x + to.width  / 2 - POLAROID_SIZE / 2;
  const destY   = to.y + to.height / 2 - POLAROID_SIZE / 2;

  // After pop completes, hold briefly then start flying
  const handlePopComplete = () => {
    setTimeout(() => setPhase("fly"), HOLD_MS);
  };

  return (
    <div
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        zIndex:        9999,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence mode="wait">
        {phase === "pop" && (
          // ── Phase 1: Bubble pop ──────────────────────────────────────────
          <motion.div
            key="pop"
            style={{
              position:        "absolute",
              width:           POLAROID_SIZE,
              height:          POLAROID_SIZE,
              left:            originX,
              top:             originY,
              backgroundColor: "white",
              borderRadius:    "50%",
              padding:         9,
              boxShadow:       "0 16px 48px rgba(0,0,0,0.24), 0 4px 16px rgba(0,0,0,0.14)",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              overflow:        "hidden",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.18, 1], opacity: 1 }}
            exit={{ scale: 1, opacity: 1 }}          // exit is instant — fly takes over
            transition={{
              scale:   { duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }, // custom spring curve — bouncy
              opacity: { duration: 0.18 },
            }}
            onAnimationComplete={handlePopComplete}
          >
            <PolaroidImage src={imageUrl} />
          </motion.div>
        )}

        {phase === "fly" && (
          // ── Phase 2: Float to Add to Cart button ────────────────────────
          <motion.div
            key="fly"
            style={{
              position:        "absolute",
              width:           POLAROID_SIZE,
              height:          POLAROID_SIZE,
              left:            originX,
              top:             originY,
              backgroundColor: "white",
              borderRadius:    "50%",
              padding:         9,
              boxShadow:       "0 16px 48px rgba(0,0,0,0.24), 0 4px 16px rgba(0,0,0,0.14)",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              overflow:        "hidden",
              originX:         "center",
              originY:         "center",
            }}
            initial={{
              x:       0,
              y:       0,
              scale:   1,
              opacity: 1,
            }}
            animate={{
              // Translate from origin to destination
              x:       destX - originX,
              y:       destY - originY,
              scale:   0.15,
              opacity: [1, 1, 0.6, 0],
            }}
            transition={{
              duration: 0.72,
              ease:     [0.4, 0, 0.2, 1],
              opacity:  { times: [0, 0.45, 0.75, 1] },
              scale:    { ease: [0.4, 0, 1, 1] },
            }}
            onAnimationComplete={onComplete}
          >
            <PolaroidImage src={imageUrl} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Image inside the polaroid ─────────────────────────────────────────────────
function PolaroidImage({ src }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      style={{
        width:        "100%",
        height:       "100%",
        objectFit:    "contain",
        borderRadius: "50%",
        display:      "block",
        pointerEvents: "none",
        userSelect:   "none",
      }}
    />
  );
}