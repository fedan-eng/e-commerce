"use client";

import { useDispatch } from "react-redux";
import { useRef, useState, useCallback } from "react";
import { ArrowRight, Check } from "lucide-react";
import { addToCart } from "@/store/features/cartSlice";
import { itemAdded } from "@/store/features/cartUISlice";
import { useCartAnimationContext } from "@/context/CartAnimationContext";
import { useGAEvent } from "@/hooks/useGAEvent";
import { useTikTokEvent } from "@/hooks/useTikTokEvent";
import { useMetaPixelEvent } from "@/hooks/useMetaPixelEvent";

// Product details page "Add to Cart": flies the gallery image into the cart icon.
const AddToCartButtonPDP = ({ product, selectedColor = null, quantity = 1, className = "" }) => {
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
        quantity,
        ...(colorToAdd ? { color: colorToAdd.name } : {}),
      })
    );

    trackEvent("add_to_cart", {
      items: [{ item_id: product._id, item_name: product.name, price: product.price, quantity }],
    });
    trackTikTokATC(product, quantity);
    trackMetaATC(product, quantity);

    setPhase("flying");

    triggerFly({
      imageUrl: imageToUse,
      sourceElement: document.querySelector("[data-product-gallery-image] img"),
      buttonElement: buttonRef.current,
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
  }, [phase, selectedColor, quantity, product, dispatch, triggerFly, trackEvent, trackTikTokATC, trackMetaATC]);

  const isAvailable = Boolean(product?.availability);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleAddToCart}
      disabled={!isAvailable || phase === "flying"}
      className={`group flex h-[52px] items-center justify-center gap-2 rounded-full px-6 text-[17px] font-semibold transition-colors disabled:cursor-not-allowed ${
        phase === "landed" ? "bg-forest text-white" : "bg-mint text-forest hover:bg-[#b9f0d0]"
      } ${!isAvailable ? "opacity-50" : ""} ${className}`}
    >
      {!isAvailable ? (
        "Out of stock"
      ) : phase === "flying" ? (
        "Adding…"
      ) : phase === "landed" ? (
        <>
          <Check size={18} strokeWidth={2.5} /> Added
        </>
      ) : (
        <>
          Buy Now
          <ArrowRight size={19} strokeWidth={2.25} className="transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
};

export default AddToCartButtonPDP;
