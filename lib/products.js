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
