// app/products/[id]/productUtils.js — pure helpers that turn a Product document into
// what the product details sections render. No React in here.
import {
  BatteryMedium,
  Bluetooth,
  Cable,
  CircleCheck,
  Clock,
  Magnet,
  Plug,
  Zap,
} from "lucide-react";
import { getCategoryByDbName } from "@/lib/categories";

export const DEFAULT_IMAGE_BG = "#cff6df";

const unique = (list) => [...new Set(list.filter(Boolean))];

// ─── Pricing ──────────────────────────────────────────────────────────────────

export function getDiscount(product) {
  const { price, originalPrice } = product;
  if (!originalPrice || originalPrice <= price) return null;
  return {
    amount: originalPrice - price,
    percent: Math.round(((originalPrice - price) / originalPrice) * 100),
  };
}

// ─── Media ────────────────────────────────────────────────────────────────────

// Gallery images: the selected colour's photos first, otherwise every photo we have.
export function getGalleryImages(product, selectedColor) {
  const colorImages = selectedColor?.images || [];
  if (colorImages.length > 0) {
    return unique([...colorImages, ...(product.secondaryImages || [])]);
  }
  return unique([
    product.image,
    ...(product.colors || []).flatMap((c) => c.images || []),
    ...(product.secondaryImages || []),
  ]);
}

// Overview bento: videos lead, then lifestyle shots. Falls back to the gallery photos.
export function getOverviewMedia(product) {
  const videos = (product.videos || []).map((src) => ({ type: "video", src }));
  const images = unique(product.secondaryImages || []).map((src) => ({ type: "image", src }));
  const media = [...videos, ...images];
  if (media.length > 0) return media;
  return getGalleryImages(product).map((src) => ({ type: "image", src }));
}

// Image tile background for the product's category (falls back to mint)
export function getImageBg(product) {
  return getCategoryByDbName(product.category)?.theme?.cardBg || DEFAULT_IMAGE_BG;
}

// ─── Highlights (the 4 cards under the gallery) ───────────────────────────────

const fmt = (n) => Number(n).toLocaleString("en-NG");

const SPEC_HIGHLIGHTS = [
  { key: "capacityMah", icon: BatteryMedium, title: (v) => `${fmt(v)}mAh`, subtitle: "Capacity" },
  { key: "outputW", icon: Zap, title: (v) => `${v}W`, subtitle: "Fast charging" },
  { key: "batteryHours", icon: Clock, title: (v) => `${v} hrs`, subtitle: "Battery life" },
  { key: "portCount", icon: Plug, title: (v) => `${v} ports`, subtitle: "Charge devices at once" },
  { key: "socketCount", icon: Plug, title: (v) => `${v} sockets`, subtitle: "Power everything" },
  { key: "cableLengthM", icon: Cable, title: (v) => `${v}m cable`, subtitle: "Reach further" },
  { key: "connectivity", icon: Bluetooth, title: (v) => v, subtitle: "Connectivity" },
];

const TAG_HIGHLIGHTS = {
  magnetic: { icon: Magnet, title: "Magnetic", subtitle: "Snaps onto your phone" },
  "wireless-charging": { icon: Zap, title: "Wireless", subtitle: "Charge without cables" },
  "built-in-cable": { icon: Cable, title: "Cables built in", subtitle: "Nothing extra to carry" },
  "noise-cancellation": { icon: CircleCheck, title: "Noise cancelling", subtitle: "Shut out the noise" },
  "water-resistant": { icon: CircleCheck, title: "Water resistant", subtitle: "Sweat and splash proof" },
  "surge-protection": { icon: CircleCheck, title: "Surge protection", subtitle: "Keeps devices safe" },
};

export function getHighlights(product, max = 4) {
  const specs = product.specs || {};
  const fromSpecs = SPEC_HIGHLIGHTS.filter((h) => specs[h.key]).map((h) => ({
    icon: h.icon,
    title: h.title(specs[h.key]),
    subtitle: h.subtitle,
  }));
  const fromTags = (specs.featureTags || []).map((t) => TAG_HIGHLIGHTS[t]).filter(Boolean);
  const fromFeatures = (product.features || []).map((f) => ({ icon: CircleCheck, title: f, subtitle: "" }));

  return [...fromSpecs, ...fromTags, ...fromFeatures].slice(0, max);
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const countOf = (v) => (typeof v === "number" ? v : v?.length ?? 0);

export const formatReviewDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

// { 5: n, 4: n, ... } from any list of items with a numeric rating key
export function ratingBreakdown(items, getRating) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  items.forEach((item) => {
    const r = Math.round(getRating(item));
    if (counts[r] != null) counts[r] += 1;
  });
  return counts;
}
