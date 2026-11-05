// app/sitemap.js → /sitemap.xml
// Only real, indexable pages: no redirects, no query-string URLs.
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { STORE_CATEGORIES } from "@/lib/categories";
import { SITE_URL, MAGFLEX_PATH } from "@/lib/seo";

export const revalidate = 3600;

async function getProducts() {
  try {
    await connectDB();
    // Products in hidden categories stay out, same as the storefront
    const categories = STORE_CATEGORIES.map((c) => c.dbCategory);
    return await Product.find({ category: { $in: categories } })
      .collation({ locale: "en", strength: 2 })
      .select("_id category updatedAt")
      .lean();
  } catch (e) {
    console.error("could not load products for sitemap", e);
    return [];
  }
}

export default async function sitemap() {
  const products = await getProducts();
  const now = new Date();

  // A category page changes when one of its products does
  const latestIn = (dbCategory) => {
    const dates = products
      .filter((p) => (p.category || "").toLowerCase() === dbCategory.toLowerCase() && p.updatedAt)
      .map((p) => new Date(p.updatedAt));
    return dates.length ? new Date(Math.max(...dates)) : now;
  };

  const mainPages = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/policies`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryPages = STORE_CATEGORIES.map((cat) => ({
    url: `${SITE_URL}/products/${cat.slug}`,
    lastModified: latestIn(cat.dbCategory),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const productPages = products.map((p) => {
    const path = `/products/${p._id}`;
    return {
      url: `${SITE_URL}${path}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "weekly",
      priority: path === MAGFLEX_PATH ? 0.9 : 0.7,
    };
  });

  return [...mainPages, ...categoryPages, ...productPages];
}
