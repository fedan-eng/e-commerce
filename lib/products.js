// lib/products.js — product queries shared by the storefront pages and /api/products
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

// Public listing: never expose reviews (pending ones included) or who rated what
export const PUBLIC_FIELDS = "-comments -ratings";

// Products matching `query` in the admin's manual order for `sortKey`
// (a category, a special like "isBestseller", or "__all__"); unordered ones go last.
// Sorts on the small sortOrder map first and only loads the full documents for the
// requested page, rather than the whole catalogue.
export async function findByManualOrder(query, sortKey, { skip = 0, limit }) {
  const orders = await Product.find(query).select("sortOrder").lean();
  const ids = orders
    .sort((a, b) => (a.sortOrder?.[sortKey] ?? 9999) - (b.sortOrder?.[sortKey] ?? 9999))
    .slice(skip, skip + limit)
    .map((p) => p._id);

  const docs = await Product.find({ _id: { $in: ids } }).select(PUBLIC_FIELDS).lean();
  const byId = new Map(docs.map((d) => [String(d._id), d]));
  return ids.map((id) => byId.get(String(id))).filter(Boolean);
}

// The homepage's "What everyone's carrying" row (the API's default "All" listing),
// as plain JSON for a client component. Null on a DB error so the section falls back
// to loading in the browser instead of breaking the page.
export async function getFeaturedProducts(limit = 3) {
  try {
    await connectDB();
    const products = await findByManualOrder({}, "__all__", { limit });
    return JSON.parse(JSON.stringify(products));
  } catch (err) {
    console.error("getFeaturedProducts failed:", err);
    return null;
  }
}

// The bundle deal for the landing page hero: the most recently edited one that's in stock, or null
export async function getFeaturedBundle() {
  try {
    await connectDB();
    const bundle = await Product.findOne({ isBundle: true, availability: { $ne: false } })
      .sort({ updatedAt: -1 })
      .select("name price originalPrice bundleItems image")
      .lean();
    if (!bundle) return null;
    return {
      _id: String(bundle._id),
      name: bundle.name,
      price: bundle.price,
      originalPrice: bundle.originalPrice > bundle.price ? bundle.originalPrice : null,
      count: (bundle.bundleItems || []).reduce((sum, b) => sum + (b.quantity || 1), 0),
      image: bundle.image || "",
    };
  } catch (err) {
    console.error("getFeaturedBundle failed:", err);
    return null;
  }
}

// Every bundle that's in stock, oldest first, for the landing page hero slides and Combo Deals.
// Full public fields, so "Buy now" can add them to the cart. [] when there are none.
export async function getLiveBundles() {
  try {
    await connectDB();
    const bundles = await Product.find({ isBundle: true, availability: { $ne: false } })
      .select(PUBLIC_FIELDS)
      .sort({ createdAt: 1 })
      .lean();
    return JSON.parse(JSON.stringify(bundles));
  } catch (err) {
    console.error("getLiveBundles failed:", err);
    return [];
  }
}
