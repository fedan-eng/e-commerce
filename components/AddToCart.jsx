"use client";

import { useDispatch } from "react-redux";
import { addToCart } from "@/store/features/cartSlice";
import { useState } from "react";
import { useGAEvent } from "@/hooks/useGAEvent";
import { useTikTokEvent } from "@/hooks/useTikTokEvent";
import { useMetaPixelEvent } from "@/hooks/useMetaPixelEvent";

// Helper SVG component for the sparkles
const SparkleIcon = ({ className }) => (
  <svg
    className={`fill-current text-[#22c55e] pointer-events-none ${className}`}
    viewBox="0 0 24 24"
  >
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

const AddToCartButton = ({ product, className = "", selectedColor = null }) => {
  const dispatch = useDispatch();
  const [notification, setNotification] = useState("");
  const [notificationColor, setNotificationColor] = useState("");
  const { trackEvent } = useGAEvent();
  const { trackAddToCart: trackTikTokAddToCart } = useTikTokEvent();
  const { trackAddToCart: trackMetaAddToCart } = useMetaPixelEvent();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const colorToAdd = selectedColor || (product.colors?.length > 0 ? product.colors[0] : null);

    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        image: colorToAdd?.images?.[0] || product.image,
        quantity: 1,
        ...(colorToAdd ? { color: colorToAdd.name } : {}),
      })
    );

    trackEvent("add_to_cart", {
      items: [{
        item_id: product._id,
        item_name: product.name,
        price: product.price,
        quantity: 1,
      }]
    });

    trackTikTokAddToCart(product, 1);
    trackMetaAddToCart(product, 1);

    showNotification("Added to cart", "bg-green-600");
  };

  const showNotification = (message, color) => {
    setNotification(message);
    setNotificationColor(color);
    setTimeout(() => setNotification(""), 2000);
  };

  const isAvailable = product && product.availability;

  return (
    <>
      {/* FIXED TOP NOTIFICATION */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 text-white py-2 px-5 rounded-lg shadow-lg z-[9999] transition-opacity duration-300 ${notificationColor}`}
        >
          {notification}
        </div>
      )}

      {/* BUTTON CONTAINER WITH HOVER GROUP */}
      <div className="relative inline-block group">
        
        {/* ANIMATED SPARKLES (ON HOVER) */}
        {isAvailable && (
          <>
            {/* Top-Left Sparkle */}
            <SparkleIcon className="absolute -top-3 left-1 w-4 h-4 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-2 group-hover:-rotate-12 transition-all duration-300 ease-out" />
            
            {/* Top-Right Sparkle */}
            <SparkleIcon className="absolute -top-2 -right-2 w-5 h-5 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-2 group-hover:rotate-12 transition-all duration-300 delay-75 ease-out" />
            
            {/* Bottom-Left Sparkle */}
            <SparkleIcon className="absolute -bottom-3 -left-3 w-6 h-6 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-1 group-hover:-rotate-45 transition-all duration-300 delay-50 ease-out" />
            
            {/* Bottom-Right Sparkle */}
            <SparkleIcon className="absolute -bottom-3 right-4 w-5 h-5 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-2 group-hover:rotate-45 transition-all duration-300 delay-100 ease-out" />
            
            {/* Far Right Tiny Accent Sparkle */}
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

          {/* Right Arrow Icon */}
          {isAvailable && (
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          )}
        </button>
      </div>
    </>
  );
};

export default AddToCartButton;