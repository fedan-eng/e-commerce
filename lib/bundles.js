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

// Extra fields for a cart item, next to _id, name, price, image, quantity and color.
// deal: the product's live Black Friday deal ({ id, title, type, percent, gift }, lib/deals.js);
// a discount deal also sets `price` to the deal price, so spread these after `price`.
export function cartItemExtras(product, deal = null) {
  const extras = {};
  if (product?.originalPrice > product?.price) extras.originalPrice = product.originalPrice;
  const bundle = bundleCartInfo(product);
  if (bundle) extras.bundle = bundle;
  if (deal && !bundle) {
    extras.deal = { id: String(deal.id || deal._id), title: deal.title, type: deal.type, percent: deal.percent || null, gift: deal.gift || "" };
    if (deal.type === "discount" && deal.percent) {
      extras.originalPrice = Math.max(extras.originalPrice || 0, product.price);
      extras.price = Math.round((product.price * (100 - deal.percent)) / 100);
    }
  }
  return extras;
}

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
