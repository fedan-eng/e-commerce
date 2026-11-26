// lib/bundles.js — bundle deals (Product.isBundle) and the cart sums that depend on them.
// Plain functions with no server imports, so the cart, checkout and /api/paystack share them.

// A product is a bundle when the admin switched it on, or simply put it in the Bundles category
export const isBundleProduct = (product) => Boolean(product?.isBundle || /^bundles$/i.test(String(product?.category || "").trim()));

// The database query for the same thing (lib/products.js)
export const BUNDLE_QUERY = { $or: [{ isBundle: true }, { category: { $regex: /^\s*bundles\s*$/i } }] };

// Pieces in one bundle: 1× power bank + 1× charger + 1× cable = 3
// (from the parts picked in the admin, else the "In the box" list)
export function bundlePieceCount(product) {
  const sum = (list) => (list || []).reduce((n, b) => n + (Number(b.quantity) || 1), 0);
  return sum(product?.bundleItems) || sum(product?.boxContent);
}

// What a cart line needs to draw a bundle card: { count, highlights } or undefined
export function bundleCartInfo(product) {
  if (!isBundleProduct(product)) return undefined;
  return {
    count: bundlePieceCount(product) || 1,
    highlights: (product.features || []).slice(0, 2),
  };
}

// One free product as { _id, name, image }, from a populated product or one already in this shape
function giftShape(g, gift) {
  if (!g || typeof g !== "object" || !g.name) return null;
  return { _id: g._id ? String(g._id) : null, name: g.name, image: g.image || g.colors?.[0]?.images?.[0] || giftImageFor(gift) };
}

// A gift deal's free products as [{ _id, name, image }], from giftProducts (or the older single
// giftProduct), populated from the database or already shaped (/api/deals). With none picked,
// one stand-in from the gift's name ("cord" → FIL cord). Empty when there's nothing to show.
export function giftsInfo(deal) {
  const list = Array.isArray(deal?.giftProducts) && deal.giftProducts.length ? deal.giftProducts : deal?.giftProduct ? [deal.giftProduct] : [];
  const gifts = list.map((g) => giftShape(g, deal?.gift)).filter(Boolean);
  if (gifts.length) return gifts;
  const fallback = fallbackGift(deal?.gift);
  return fallback ? [fallback] : [];
}

// Photos for gifts whose deal has no gift product picked in the admin yet
const GIFT_IMAGES = [[/^(free\s+)?cords?$/i, "https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/Gemini-Generated-Image-5y3sor5y3sor5y3s-1-jrhetf.webp"]];
export const giftImageFor = (gift) => GIFT_IMAGES.find(([re]) => re.test(String(gift || "").trim()))?.[1] || "";

// { _id: null, name: "FIL cord", image } from the gift's name alone, or null
function fallbackGift(gift) {
  const name = String(gift || "").trim().replace(/^free\s+/i, "");
  return name ? { _id: null, name: `FIL ${name}`, image: giftImageFor(name) } : null;
}

// A % off flash deal comes off the product's original price (its "was" price when it has one),
// never ending up dearer than today's price. Returns { price, originalPrice }.
export function discountDealPricing(product, percent) {
  const price = Number(product?.price) || 0;
  const original = Math.max(Number(product?.originalPrice) || 0, price);
  return { price: Math.min(price, Math.round((original * (100 - percent)) / 100)), originalPrice: original };
}

// Extra fields for a cart item, next to _id, name, price, image, quantity and color.
// deal: the product's live Black Friday deal ({ id, title, type, percent, gift }, lib/deals.js);
// a discount deal also sets `price` to the deal price, so spread these after `price`.
export function cartItemExtras(product, deal = null) {
  const extras = {};
  if (product?.originalPrice > product?.price) extras.originalPrice = product.originalPrice;
  const bundle = bundleCartInfo(product);
  if (bundle) extras.bundle = bundle;
  // Admin-only test products are delivered free (see isAdminOnlyOrder)
  if (product?.adminOnly) extras.adminOnly = true;
  if (deal && !bundle) {
    extras.deal = { id: String(deal.id || deal._id), title: deal.title, type: deal.type, percent: deal.percent || null, gift: deal.gift || "" };
    const giftProducts = deal.type === "gift" ? giftsInfo(deal) : [];
    if (giftProducts.length) extras.deal.giftProducts = giftProducts;
    if (deal.type === "discount" && deal.percent) {
      // Off the original price, which is what's crossed out (discountDealPricing)
      const pricing = discountDealPricing(product, deal.percent);
      extras.originalPrice = pricing.originalPrice;
      extras.price = pricing.price;
    }
  }
  return extras;
}

// An order of admin-only test products only: no delivery fee, so a ₦10 product costs ₦10
export const isAdminOnlyOrder = (items) => Array.isArray(items) && items.length > 0 && items.every((item) => item?.adminOnly === true);

export const isBundleItem = (item) => Boolean(item?.isBundle || item?.bundle);

// Items in the order summary: a bundle of 3 counts as 3
export function cartPieceCount(items) {
  return (items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (item.bundle?.count || 1), 0);
}

// Value of the cart at full price, and how much the discounts take off it
export function cartSavings(items) {
  let full = 0;
  let paid = 0;
  for (const item of items || []) {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    full += Math.max(Number(item.originalPrice) || 0, price) * qty;
    paid += price * qty;
  }
  return { full, savings: full - paid };
}

// Promo codes only take money off items that aren't already a deal: bundles and Black Friday
// discounts (free-gift deals keep their normal price, so codes still work on them)
export const isDealPriced = (item) => isBundleItem(item) || item?.deal?.type === "discount";

export function promoEligibleSubtotal(items) {
  return (items || []).reduce(
    (sum, item) => (isDealPriced(item) ? sum : sum + (Number(item.price) || 0) * (Number(item.quantity) || 0)),
    0
  );
}

export const BUNDLE_PROMO_MESSAGE = "Promo codes can't be used on bundle or flash deals";

// "Includes 1× MagFlex, 1× 20W charger, 1× USB-C cable" for an order line, or "" if it isn't a bundle
export function bundleContentsText(item) {
  const parts = (item?.bundleContents || []).map((b) => `${b.quantity || 1}× ${b.name}`);
  return parts.length ? `Includes ${parts.join(", ")}` : "";
}

// Short line for a Black Friday deal on a cart or order line: "Free cord included" / "Black Friday −35%"
export function dealText(item) {
  const deal = item?.deal;
  if (!deal) return "";
  if (deal.type === "gift") return `Free ${String(deal.gift || "gift").replace(/^free\s+/i, "")} included`;
  return deal.percent ? `Black Friday −${deal.percent}%` : "Black Friday deal";
}

// The pill on a discounted line: "Flash deal −50%" ("" for other lines; gift lines get a gift row)
export const flashDealPill = (item) => (item?.deal?.type === "discount" && item.deal.percent ? `Flash deal −${item.deal.percent}%` : "");

// The free products on a gift deal line, each on its own FREE row: [{ _id, name, image }].
// Reads orders saved before deals had several gifts (giftProduct) too.
export function dealGifts(item) {
  const deal = item?.deal;
  return deal?.type === "gift" ? giftsInfo(deal) : [];
}

// Savings that come from Black Friday flash deals (the struck-through prices on deal lines)
export function flashDealSavings(items) {
  return (items || []).reduce((sum, item) => {
    if (item?.deal?.type !== "discount") return sum;
    const qty = Number(item.quantity) || 0;
    return sum + Math.max(0, (Number(item.originalPrice) || 0) - (Number(item.price) || 0)) * qty;
  }, 0);
}
