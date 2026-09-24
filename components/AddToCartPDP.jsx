"use client";

import { useDispatch } from "react-redux";
import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addToCart } from "@/store/features/cartSlice";
import { itemAdded } from "@/store/features/cartUISlice";
import { useCartAnimationContext } from "@/context/CartAnimationContext";
import { useGAEvent } from "@/hooks/useGAEvent";
import { useTikTokEvent } from "@/hooks/useTikTokEvent";
import { useMetaPixelEvent } from "@/hooks/useMetaPixelEvent";

// ── Sparkle SVG ───────────────────────────────────────────────────────────────
const SparkleIcon = ({ className }) => (
  <svg
    className={`fill-current pointer-events-none ${className}`}
    viewBox="0 0 24 24"
  >
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

// ── Checkmark SVG ─────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ── Arrow SVG ─────────────────────────────────────────────────────────────────
const ArrowIcon = () => (
  <svg
    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────
const AddToCartButtonPDP = ({ product, className = "", selectedColor = null }) => {
  const dispatch           = useDispatch();
  const { triggerFly }     = useCartAnimationContext();
  const buttonRef          = useRef(null);

  // "flying" = polaroid is in the air; "landed" = brief ✓ flash after landing
  const [phase, setPhase]  = useState("idle"); // "idle" | "flying" | "landed"

  const { trackEvent }                     = useGAEvent();
  const { trackAddToCart: trackTikTokATC } = useTikTokEvent();
  const { trackAddToCart: trackMetaATC }   = useMetaPixelEvent();

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (phase !== "idle") return; // prevent double-tap while animating

    const colorToAdd = selectedColor || (product.colors?.length > 0 ? product.colors[0] : null);
    const imageToUse = colorToAdd?.images?.[0] || product.image;

    // 1. Dispatch to Redux immediately — cart is updated before animation ends
    dispatch(
      addToCart({
        _id:      product._id,
        name:     product.name,
        price:    product.price,
        category: product.category,
        image:    imageToUse,
        quantity: 1,
        ...(colorToAdd ? { color: colorToAdd.name } : {}),
      })
    );

    // 2. Analytics
    trackEvent("add_to_cart", {
      items: [{ item_id: product._id, item_name: product.name, price: product.price, quantity: 1 }],
    });
    trackTikTokATC(product, 1);
    trackMetaATC(product, 1);

    // 3. Source element for the fly animation
    //    ProductGallery wraps its main <img> with data-product-gallery-image.
    //    Product cards use data-product-id={product._id} on their image wrapper.
    const sourceElement =
      document.querySelector("[data-product-gallery-image] img") ||
      document.querySelector(`[data-product-id="${product._id}"] img`) ||
      null;

    // 4. Kick off the polaroid fly
    setPhase("flying");

    triggerFly({
      imageUrl:      imageToUse,
      sourceElement,
      onLand: () => {
        // Open sidebar/sheet + show green banner
        dispatch(
          itemAdded({
            name:  product.name,
            image: imageToUse,
            color: colorToAdd?.name || null,
            price: product.price,
          })
        );

        // Flash the ✓ state on the button briefly
        setPhase("landed");
        setTimeout(() => setPhase("idle"), 1500);
      },
    });
  }, [phase, selectedColor, product, dispatch, triggerFly, trackEvent, trackTikTokATC, trackMetaATC]);

  const isAvailable = product && product.availability;

  // ── Derived button appearance per phase ──────────────────────────────────
  const isFlying  = phase === "flying";
  const isLanded  = phase === "landed";
  const isIdle    = phase === "idle";

  return (
    <div className="relative inline-block group" ref={buttonRef}>

      {/* ── SPARKLES — only when idle & available ───────────────────────── */}
      {isAvailable && isIdle && (
        <>
          {/* Top-Left */}
          <SparkleIcon className="text-[#22c55e] absolute -top-3 left-1 w-4 h-4 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-2 group-hover:-rotate-12 transition-all duration-300 ease-out" />
          {/* Top-Right */}
          <SparkleIcon className="text-[#22c55e] absolute -top-2 -right-2 w-5 h-5 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-2 group-hover:rotate-12 transition-all duration-300 delay-75 ease-out" />
          {/* Bottom-Left */}
          <SparkleIcon className="text-[#22c55e] absolute -bottom-3 -left-3 w-6 h-6 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-1 group-hover:-rotate-45 transition-all duration-300 delay-50 ease-out" />
          {/* Bottom-Right */}
          <SparkleIcon className="text-[#22c55e] absolute -bottom-3 right-4 w-5 h-5 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-2 group-hover:-rotate-45 transition-all duration-300 delay-100 ease-out" />
          {/* Far-Right tiny */}
          <SparkleIcon className="text-[#22c55e] absolute top-1/2 -right-5 -translate-y-1/2 w-3 h-3 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-1 transition-all duration-300 delay-150 ease-out" />
        </>
      )}

      {/* ── LANDED sparkle burst — fires once when polaroid lands ────────── */}
      {isLanded && (
        <>
          <SparkleIcon className="text-[#22c55e] absolute -top-4 left-2 w-4 h-4 animate-ping opacity-75" />
          <SparkleIcon className="text-[#22c55e] absolute -top-3 right-3 w-3 h-3 animate-ping opacity-75 [animation-delay:75ms]" />
          <SparkleIcon className="text-[#22c55e] absolute -bottom-4 left-4 w-5 h-5 animate-ping opacity-75 [animation-delay:150ms]" />
          <SparkleIcon className="text-[#22c55e] absolute -bottom-3 right-6 w-3 h-3 animate-ping opacity-75 [animation-delay:50ms]" />
        </>
      )}

      {/* ── BUTTON ──────────────────────────────────────────────────────── */}
      <motion.button
        onClick={handleAddToCart}
        disabled={!isAvailable || isFlying}
        whileTap={isIdle && isAvailable ? { scale: 0.95 } : {}}
        animate={
          isLanded
            ? { scale: [1, 1.06, 1], transition: { duration: 0.3, ease: "easeOut" } }
            : {}
        }
        className={`
          relative overflow-hidden flex items-center justify-center gap-2.5
          px-6 py-3 rounded-2xl font-bold text-white
          transition-all duration-300 ease-out
          disabled:cursor-not-allowed cursor-pointer
          ${
            isLanded
              ? "bg-[#22c55e] border-2 border-[#22c55e]"          // green when landed
              : isFlying
              ? "bg-black/70 border-2 border-black/70"             // dimmed while flying
              : "bg-black border-2 border-black hover:bg-[#22c55e] hover:border-[#22c55e]" // idle
          }
          ${!isAvailable ? "opacity-50" : ""}
          ${className}
        `}
      >
        {/* Shimmer sweep while flying */}
        {isFlying && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.7, ease: "linear", repeat: Infinity }}
          />
        )}

        {/* Button label — AnimatePresence swaps between the 3 states */}
        <AnimatePresence mode="wait" initial={false}>
          {!isAvailable ? (
            <motion.span
              key="unavailable"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              Out of Stock
            </motion.span>
          ) : isFlying ? (
            <motion.span
              key="flying"
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {/* Tiny spinning loader dots */}
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-white rounded-full inline-block"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </span>
              Adding...
            </motion.span>
          ) : isLanded ? (
            <motion.span
              key="landed"
              className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 400 }}
            >
              <CheckIcon />
              Added!
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              Add to Cart
              <ArrowIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default AddToCartButtonPDP;
