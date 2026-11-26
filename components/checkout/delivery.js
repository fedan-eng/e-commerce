// components/checkout/delivery.js — delivery options and fees used at checkout
import { MapPin, Package, Truck, Zap } from "lucide-react";
import { isBlackFridayLive } from "@/lib/blackFriday";

export const FREE_DELIVERY_MIN_SUBTOTAL = 10000;

// Jumia's public page of its pickup stations (they don't publish a list we can pick from)
export const JUMIA_PICKUP_URL = "https://www.jumia.com.ng/sp-pickup-stations/";

// lagos: only offered for Lagos regions; lagos: false — only outside Lagos; unset — anywhere
export const DELIVERY_OPTIONS = [
  { id: "Regular", icon: Package, title: "Regular delivery", detail: "2–3 working days in Lagos", lagos: true },
  {
    id: "Interstate",
    icon: Truck,
    title: "Regular interstate delivery",
    detail: "5–7 working days, at the Jumia pickup station closest to you",
    link: { href: JUMIA_PICKUP_URL, label: "Browse pickup stations" },
    lagos: false,
  },
  { id: "Express", icon: Zap, title: "Express delivery", detail: "Within 24 hours for orders placed before 10am. Lagos only", lagos: true },
  { id: "Free", icon: MapPin, title: "Free Thursday delivery", detail: "Every Thursday, 5–7 working days. Lagos only. Not with promo codes", lagos: true },
];

// A delivery region in Lagos ("Lagos Mainland", "Lagos Island"…); takes a region or its name
export const isLagosRegion = (region) => /lagos/i.test(typeof region === "string" ? region : region?.name || "");

// The options for a region: Lagos gets Regular, Express and Free; elsewhere gets Interstate.
// Before a region is picked, everything shows.
export function optionsForRegion(region) {
  const name = typeof region === "string" ? region : region?.name;
  if (!name) return DELIVERY_OPTIONS;
  const lagos = isLagosRegion(name);
  return DELIVERY_OPTIONS.filter((o) => o.lagos === undefined || o.lagos === lagos);
}

// What a chosen option becomes for a region: Regular and Interstate swap to suit it, and
// Lagos-only options outside Lagos are refused (null). The server uses this too (lib/pricing.js).
export function deliveryTypeForRegion(type, region) {
  const lagos = isLagosRegion(region);
  if (type === "Regular" || type === "Interstate" || !type) return lagos ? "Regular" : "Interstate";
  if (type === "Express" || type === "Free") return lagos ? type : null;
  return lagos ? "Regular" : "Interstate";
}

// Regular / Interstate = the region's fee, Express = double it, Free = nothing
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
