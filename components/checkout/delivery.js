// components/checkout/delivery.js — delivery options and fees used at checkout
import { MapPin, Package, Zap } from "lucide-react";
import { isBlackFridayLive } from "@/lib/blackFriday";

export const FREE_DELIVERY_MIN_SUBTOTAL = 10000;

export const DELIVERY_OPTIONS = [
  { id: "Regular", icon: Package, title: "Regular delivery", detail: "2–3 working days in Lagos, 5–7 interstate" },
  { id: "Express", icon: Zap, title: "Express delivery", detail: "Within 24 hours for orders placed before 10am. Lagos only" },
  { id: "Free", icon: MapPin, title: "Free Thursday delivery", detail: "Every Thursday, 5–7 working days. Lagos only. Not with promo codes" },
];

// Regular = the region's fee, Express = double it, Free = nothing
export function deliveryFeeFor(type, region) {
  const base = region?.fee || 0;
  if (type === "Free") return 0;
  if (type === "Express") return base * 2;
  return base;
}

// Free delivery needs a minimum spend, no promo code (any code at all) and no combo deal in the
// order. Returns why it's unavailable, or null. /api/paystack checks the same through lib/pricing.js.
// hasBundle: the order has a bundle (lib/bundles.js isBundleItem). now: for tests.
export function freeDeliveryBlock(subTotal, promoCode, { hasBundle = false, now = new Date() } = {}) {
  if (isBlackFridayLive(now)) return "Not available during Black Friday";
  if (hasBundle) return "Not available with combo deals";
  if (promoCode) return "Not available with promo codes";
  if (subTotal < FREE_DELIVERY_MIN_SUBTOTAL) return "Available on orders of ₦10,000 or more";
  return null;
}

export const isFreeDeliveryAvailable = (subTotal, promoCode = null, options = {}) => !freeDeliveryBlock(subTotal, promoCode, options);
