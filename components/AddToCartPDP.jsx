"use client";

import { useDispatch } from "react-redux";
import { useRef, useState, useCallback } from "react";
import { addToCart } from "@/store/features/cartSlice";
import { itemAdded } from "@/store/features/cartUISlice";
import { useCartAnimationContext } from "@/context/CartAnimationContext";
import { useGAEvent } from "@/hooks/useGAEvent";
import { useTikTokEvent } from "@/hooks/useTikTokEvent";
import { useMetaPixelEvent } from "@/hooks/useMetaPixelEvent";

const SparkleIcon = ({ className }) => (
  <svg className={`fill-current pointer-events-none ${className}`} viewBox="0 0 24 24">
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

const AddToCartButtonPDP = ({ product, className = "", selectedColor = null }) => {
  const dispatch       = useDispatch();
  const { triggerFly } = useCartAnimationContext();
  const buttonRef      = useRef(null);

  const [phase, setPhase] = useState("idle"); // "idle" | "flying" | "landed"

  const { trackEvent }                     = useGAEvent();
  const { trackAddToCart: trackTikTokATC } = useTikTokEvent();
  const { trackAddToCart: trackMetaATC }   = useMetaPixelEvent();

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (phase !== "idle") return;

    const colorToAdd = selectedColor || (product.colors?.length > 0 ? product.colors[0] : null);
    const imageToUse = colorToAdd?.images?.[0] || product.image;

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

    trackEvent("add_to_cart", {
      items: [{ item_id: product._id, item_name: product.name, price: product.price, quantity: 1 }],
    });
    trackTikTokATC(product, 1);
    trackMetaATC(product, 1);

    const sourceElement =
      document.querySelector("[data-product-gallery-image] img") ||
      document.querySelector(`[data-product-id="${product._id}"] img`) ||
      null;

    const buttonElement = buttonRef.current;

    setPhase("flying");

    triggerFly({
      imageUrl: imageToUse,
      sourceElement,
      buttonElement,
      onLand: () => {
        dispatch(
          itemAdded({
            name:  product.name,
            image: imageToUse,
            color: colorToAdd?.name || null,
            price: product.price,
          })
        );
        setPhase("landed");
        setTimeout(() => setPhase("idle"), 1200);
      },
    });
  }, [phase, selectedColor, product, dispatch, triggerFly, trackEvent, trackTikTokATC, trackMetaATC]);

  const isAvailable = product && product.availability;
  const isFlying    = phase === "flying";
  const isLanded    = phase === "landed";
  const isIdle      = phase === "idle";

  return (
    <div className={`relative group flex-1 w-full ${className}`}>

      {/* ── SPARKLES — hover effect when idle & available ───────────────── */}
      {isAvailable && isIdle && (
        <>
          <SparkleIcon className="text-[#22c55e] absolute -top-3 left-1 w-4 h-4 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-2 group-hover:-rotate-12 transition-all duration-300 ease-out z-10" />
          <SparkleIcon className="text-[#22c55e] absolute -top-2 -right-2 w-5 h-5 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-2 group-hover:rotate-12 transition-all duration-300 delay-75 ease-out z-10" />
          <SparkleIcon className="text-[#22c55e] absolute -bottom-3 -left-3 w-6 h-6 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-1 group-hover:-rotate-45 transition-all duration-300 delay-50 ease-out z-10" />
          <SparkleIcon className="text-[#22c55e] absolute -bottom-3 right-4 w-5 h-5 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-2 group-hover:-rotate-45 transition-all duration-300 delay-100 ease-out z-10" />
          <SparkleIcon className="text-[#22c55e] absolute top-1/2 -right-5 -translate-y-1/2 w-3 h-3 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-1 transition-all duration-300 delay-150 ease-out z-10" />
        </>
      )}

      {/* ── Button ──────────────────────────────────────────────────────── */}
      <button
        ref={buttonRef}
        onClick={handleAddToCart}
        disabled={!isAvailable || isFlying}
        className={`
          relative w-full h-full flex items-center justify-center gap-2.5
          px-4 sm:px-6 py-3.5 rounded-lg font-bold text-sm sm:text-base
          transition-all duration-200 ease-out
          disabled:cursor-not-allowed cursor-pointer
          ${
            isFlying
              ? "bg-[#e5e5e5] border-2 border-[#b5b5b5] text-[#222222]"
              : isLanded
              ? "bg-[#22c55e] border-2 border-[#22c55e] text-white"
              : "bg-black border-2 border-black text-white hover:bg-[#22c55e] hover:border-[#22c55e]"
          }
          ${!isAvailable ? "opacity-50" : ""}
        `}
      >
        {!isAvailable ? (
          <span>Out of Stock</span>
        ) : isFlying ? (
          <span>Adding...</span>
        ) : isLanded ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Added!
          </span>
        ) : (
          <span className="flex items-center gap-2.5">
            Add to Cart
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        )}
      </button>
    </div>
  );
};

export default AddToCartButtonPDP;