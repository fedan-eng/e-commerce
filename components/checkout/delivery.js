// components/checkout/delivery.js — delivery options and fees used at checkout
import { MapPin, Package, Zap } from "lucide-react";

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

// Free delivery needs a minimum spend and no promo code (any code at all). Returns why it's
// unavailable, or null. /api/paystack checks the same through lib/pricing.js.
export function freeDeliveryBlock(subTotal, promoCode) {
  if (promoCode) return "Not available with promo codes";
  if (subTotal < FREE_DELIVERY_MIN_SUBTOTAL) return "Available on orders of ₦10,000 or more";
  return null;
}

export const isFreeDeliveryAvailable = (subTotal, promoCode = null) => !freeDeliveryBlock(subTotal, promoCode);
