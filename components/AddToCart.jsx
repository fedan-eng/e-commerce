"use client";

import { useDispatch } from "react-redux";
import { useRef } from "react";
import { addToCart } from "@/store/features/cartSlice";
import { itemAdded } from "@/store/features/cartUISlice";
import { useCartAnimationContext } from "@/context/CartAnimationContext";
import { useGAEvent } from "@/hooks/useGAEvent";
import { useTikTokEvent } from "@/hooks/useTikTokEvent";
import { useMetaPixelEvent } from "@/hooks/useMetaPixelEvent";

// Helper SVG
const SparkleIcon = ({ className }) => (
  <svg
    className={`fill-current text-[#22c55e] pointer-events-none ${className}`}
    viewBox="0 0 24 24"
  >
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

const AddToCartButton = ({ product, className = "", selectedColor = null }) => {
  const dispatch   = useDispatch();
  const { triggerFly } = useCartAnimationContext();
  // Ref attached to the <img> element inside this button's parent context.
  // We pass it down to the product gallery via a sibling pattern —
  // but for the fly animation we grab the main product image from the DOM
  // using a data attribute, which avoids prop-drilling through the whole tree.
  const buttonRef  = useRef(null);

  const { trackEvent }                       = useGAEvent();
  const { trackAddToCart: trackTikTokATC }   = useTikTokEvent();
  const { trackAddToCart: trackMetaATC }     = useMetaPixelEvent();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const colorToAdd  = selectedColor || (product.colors?.length > 0 ? product.colors[0] : null);
    const imageToUse  = colorToAdd?.images?.[0] || product.image;

    // 1. Dispatch to Redux cart immediately (UI is snappy, animation is cosmetic)
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

    // 2. Track analytics
    trackEvent("add_to_cart", {
      items: [{ item_id: product._id, item_name: product.name, price: product.price, quantity: 1 }],
    });
    trackTikTokATC(product, 1);
    trackMetaATC(product, 1);

    // 3. Find the main product image on the page via data attribute
    //    ProductGallery renders: <div data-product-gallery-image> wrapping the main <img>
    //    This avoids prop drilling and works on both PDP and product cards.
    const sourceElement =
      document.querySelector("[data-product-gallery-image] img") ||
      document.querySelector(`[data-product-id="${product._id}"] img`) ||
      null;

    // 4. Trigger the fly animation.
    //    onLand fires when the polaroid reaches the cart icon —
    //    THAT is when we open the sidebar/sheet and show the banner.
    triggerFly({
      imageUrl:      imageToUse,
      sourceElement,
      onLand: () => {
        dispatch(
          itemAdded({
            name:   product.name,
            image:  imageToUse,
            color:  colorToAdd?.name || null,
            price:  product.price,
          })
        );
        // itemAdded sets isOpen:true and showBanner:true in cartUISlice
        // CartSidebar (desktop) and CartBottomSheet (mobile) both listen to isOpen
      },
    });
  };

  const isAvailable = product && product.availability;

  return (
    <div className="relative inline-block group" ref={buttonRef}>

      {/* ANIMATED SPARKLES ON HOVER */}
      {isAvailable && (
        <>
          <SparkleIcon className="absolute -top-3 left-1 w-4 h-4 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-2 group-hover:-rotate-12 transition-all duration-300 ease-out" />
          <SparkleIcon className="absolute -top-2 -right-2 w-5 h-5 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-2 group-hover:rotate-12 transition-all duration-300 delay-75 ease-out" />
          <SparkleIcon className="absolute -bottom-3 -left-3 w-6 h-6 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-1 group-hover:-rotate-45 transition-all duration-300 delay-50 ease-out" />
          <SparkleIcon className="absolute -bottom-3 right-4 w-5 h-5 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-2 group-hover:rotate-45 transition-all duration-300 delay-100 ease-out" />
          <SparkleIcon className="absolute top-1/2 -right-5 -translate-y-1/2 w-3 h-3 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-1 transition-all duration-300 delay-150 ease-out" />
        </>
      )}

      {/* BUTTON */}
      <button
        onClick={handleAddToCart}
        disabled={!isAvailable}
        className={`
          relative flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-white
          bg-black border-2 border-black
          hover:bg-[#22c55e] hover:border-black hover:text-white
          transition-all duration-300 ease-out
          active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
          ${className}
        `}
      >
        <span>{isAvailable ? "Add to Cart" : "Out of Stock"}</span>

        {isAvailable && (
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default AddToCartButton;