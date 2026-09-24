"use client";

import { useRef, useState, useCallback } from "react";

/**
 * useCartAnimation
 *
 * cartIconRef  — still used by Navbar for the count bounce animation
 *                and as the FLY TARGET on desktop when no button rect is passed
 *
 * triggerFly({ imageUrl, sourceElement, buttonElement, onLand })
 *   imageUrl       — product image URL for the polaroid
 *   sourceElement  — the product <img> DOM node  (fly starts here)
 *   buttonElement  — the Add to Cart <button> DOM node (fly ends here)
 *                    falls back to cartIconRef if not provided
 *   onLand         — callback fired when polaroid reaches its target
 */
export function useCartAnimation() {
  const cartIconRef = useRef(null);
  const [flyState, setFlyState] = useState(null);

  const triggerFly = useCallback(({ imageUrl, sourceElement, buttonElement, onLand }) => {
    // Source: product image rect
    if (!sourceElement) {
      onLand?.();
      return;
    }

    const sourceRect = sourceElement.getBoundingClientRect();

    // Target: Add to Cart button rect (preferred) → nav cart icon (fallback)
    const targetEl    = buttonElement || cartIconRef.current;
    if (!targetEl) {
      onLand?.();
      return;
    }
    const targetRect  = targetEl.getBoundingClientRect();

    setFlyState({
      id:    Date.now(), // unique key so AnimatePresence remounts cleanly on rapid clicks
      imageUrl,
      from: {
        x:      sourceRect.left,
        y:      sourceRect.top,
        width:  sourceRect.width,
        height: sourceRect.height,
      },
      to: {
        x:      targetRect.left,
        y:      targetRect.top,
        width:  targetRect.width,
        height: targetRect.height,
      },
      onLand,
    });
  }, []);

  const clearFly = useCallback(() => setFlyState(null), []);

  return { cartIconRef, triggerFly, flyState, clearFly };
}