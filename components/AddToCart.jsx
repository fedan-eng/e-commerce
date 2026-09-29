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

const AddToCartButton = ({ product, className = "", selectedColor = null }) => {
  const dispatch       = useDispatch();
  const { triggerFly } = useCartAnimationContext();
  const buttonRef      = useRef(null); // fly target

  const [phase, setPhase] = useState("idle");

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

    // On product cards, source image is wrapped with data-product-id
    const sourceElement =
      document.querySelector(`[data-product-id="${product._id}"] img`) ||
      null;

    const buttonElement = buttonRef.current;

    setPhase("flying");

    triggerFly({
      imageUrl: imageToUse,
      sourceElement,
      buttonElement,  // polaroid flies TO this button
      onLand: () => {
        dispatch(itemAdded({
          name:  product.name,
          image: imageToUse,
          color: colorToAdd?.name || null,
          price: product.price,
        }));
        setPhase("landed");
        setTimeout(() => setPhase("idle"), 1500);
      },
    });
  }, [phase, selectedColor, product, dispatch, triggerFly, trackEvent, trackTikTokATC, trackMetaATC]);

  const isAvailable = product && product.availability;
  const isFlying    = phase === "flying";
  const isLanded    = phase === "landed";

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleAddToCart}
      disabled={!isAvailable || isFlying}
      whileTap={isAvailable && phase === "idle" ? { scale: 0.96 } : {}}
      animate={
        isLanded
          ? { scale: [1, 1.05, 1], transition: { duration: 0.25 } }
          : {}
      }
      className={`relative overflow-hidden cursor-pointer ${className}`}
    >
      {/* Shimmer */}
      {isFlying && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 0.65, ease: "linear", repeat: Infinity }}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        {!isAvailable ? (
          <motion.span key="oos"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            Out of Stock
          </motion.span>

        ) : isFlying ? (
          <motion.span key="flying"
            className="flex items-center justify-center gap-1.5"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
          >
            {[0,1,2].map((i) => (
              <motion.span key={i}
                className="w-1 h-1 bg-current rounded-full inline-block"
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </motion.span>

        ) : isLanded ? (
          <motion.span key="landed"
            className="flex items-center justify-center gap-1.5"
            initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }}
            transition={{ duration: 0.18, type: "spring", stiffness: 400 }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Added!
          </motion.span>

        ) : (
          <motion.span key="idle"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
          >
            Add to cart
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default AddToCartButton;