"use client";

import { useRef, useState, useCallback } from "react";

/**
 * useCartAnimation
 *
 * Drives the "flying polaroid" effect when a user adds to cart.
 *
 * Usage:
 *   const { cartIconRef, triggerFly, FlyingImagePortal } = useCartAnimation();
 *
 *   1. Attach `cartIconRef` to the cart icon element in your Navbar.
 *   2. Call `triggerFly({ imageUrl, sourceElement })` from AddToCartButton,
 *      passing the product image URL and the <img> DOM node as sourceElement.
 *   3. Render <FlyingImagePortal /> somewhere high in the tree (e.g. Navbar or layout).
 *   4. Pass an `onLand` callback to `triggerFly` — it fires when the animation ends.
 */

export function useCartAnimation() {
  const cartIconRef = useRef(null);
  const [flyState, setFlyState] = useState(null);
  // flyState shape:
  // {
  //   imageUrl: string,
  //   from: { x, y, width, height },   — source bounding rect
  //   to:   { x, y, width, height },   — cart icon bounding rect
  //   onLand: () => void,
  // }

  const triggerFly = useCallback(({ imageUrl, sourceElement, onLand }) => {
    if (!cartIconRef.current || !sourceElement) {
      // Fallback: skip animation, just call onLand
      onLand?.();
      return;
    }

    const sourceRect = sourceElement.getBoundingClientRect();
    const cartRect   = cartIconRef.current.getBoundingClientRect();

    setFlyState({
      imageUrl,
      from: {
        x:      sourceRect.left,
        y:      sourceRect.top,
        width:  sourceRect.width,
        height: sourceRect.height,
      },
      to: {
        x:      cartRect.left + cartRect.width  / 2,
        y:      cartRect.top  + cartRect.height / 2,
      },
      onLand,
    });
  }, []);

  const clearFly = useCallback(() => setFlyState(null), []);

  return { cartIconRef, triggerFly, flyState, clearFly };
}