"use client";

import { useEffect } from "react";
import { useGAEvent } from "@/hooks/useGAEvent";
import { useMetaPixelEvent } from "@/hooks/useMetaPixelEvent";
import { useTikTokEvent } from "@/hooks/useTikTokEvent";

// How long to wait before firing view events, so they don't compete with first paint
const TRACK_DELAY_MS = 3000;

// Fires "viewed this product" to GA, Meta Pixel and TikTok once per product.
export default function useProductViewTracking(product) {
  const { trackEvent } = useGAEvent();
  const { trackViewContent: trackMetaView } = useMetaPixelEvent();
  const { trackViewContent: trackTikTokView } = useTikTokEvent();

  useEffect(() => {
    if (!product?._id) return;
    const timer = setTimeout(() => {
      try {
        trackEvent("view_item", {
          item_id: product._id,
          item_name: product.name,
          currency: "NGN",
          value: product.price,
          items: [{ item_id: product._id, item_name: product.name, price: product.price }],
        });
        trackMetaView(product);
        trackTikTokView(product);
      } catch (err) {
        console.error("View tracking failed:", err);
      }
    }, TRACK_DELAY_MS);
    return () => clearTimeout(timer);
    // Only re-fire when the product changes, not when the tracker functions are recreated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);
}
