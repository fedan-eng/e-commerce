// components/checkout/delivery.js — delivery options and fees used at checkout
import { MapPin, Package, Zap } from "lucide-react";

export const FREE_DELIVERY_MIN_SUBTOTAL = 10000;

export const DELIVERY_OPTIONS = [
  { id: "Regular", icon: Package, title: "Regular delivery", detail: "2–3 working days in Lagos, 3–5 interstate" },
  { id: "Express", icon: Zap, title: "Express delivery", detail: "Within 24 hours for orders placed before 10am. Lagos only" },
  { id: "Free", icon: MapPin, title: "Free Thursday delivery", detail: "Every Thursday, 5–7 working days. Lagos only" },
];

// Regular = the region's fee, Express = double it, Free = nothing
export function deliveryFeeFor(type, region) {
  const base = region?.fee || 0;
  if (type === "Free") return 0;
  if (type === "Express") return base * 2;
  return base;
}

export const isFreeDeliveryAvailable = (subTotal) => subTotal >= FREE_DELIVERY_MIN_SUBTOTAL;
