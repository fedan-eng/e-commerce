// components/category/CategoryPage.jsx
// Shared template for /products/<slug>. Server component — loads products from the DB.
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getCategory } from "@/lib/categories";
import CategoryHero from "./CategoryHero";
import TrustBar from "./TrustBar";
import FeaturedProducts from "./FeaturedProducts";
import CategoryShop from "./CategoryShop";
import CategoryVideos from "./CategoryVideos";
import CategoryReviews from "./CategoryReviews";
import CategoryFAQ from "./CategoryFAQ";
import ExploreMore from "./ExploreMore";

async function getCategoryProducts(dbCategory) {
  await connectDB();
  // Case-insensitive match — some older products were saved as e.g. "chargers"
  const docs = await Product.find({ category: dbCategory })
    .collation({ locale: "en", strength: 2 })
    .select("-ratings -comments.likes -comments.dislikes")
    .lean();

  // Respect the admin's manual ordering for this category
  docs.sort(
    (a, b) => (a.sortOrder?.[dbCategory] ?? 9999) - (b.sortOrder?.[dbCategory] ?? 9999)
  );

  // Plain JSON so it can be passed to client components
  return JSON.parse(JSON.stringify(docs));
}

function collectReviews(products) {
  return products
    .flatMap((p) =>
      (p.comments || [])
        .filter((c) => c.status === "approved")
        .map((c) => ({
          _id: c._id,
          text: c.text,
          rating: c.rating,
          createdAt: c.createdAt,
          productId: p._id,
          productName: p.name,
        }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 12);
}

export default async function CategoryPage({ slug }) {
  const category = getCategory(slug);
  if (!category) notFound();

  const products = await getCategoryProducts(category.dbCategory);
  const reviews = collectReviews(products);
  // Comments aren't needed on the client once reviews are extracted
  const listProducts = products.map(({ comments, ...p }) => p);

  return (
    <main>
      <CategoryHero category={category} />
      <TrustBar />
      <FeaturedProducts category={category} products={listProducts} />
      {/* useSearchParams inside CategoryShop needs a Suspense boundary for static rendering */}
      <Suspense fallback={null}>
        <CategoryShop category={category} products={listProducts} />
      </Suspense>
      <CategoryVideos category={category} products={listProducts} />
      <CategoryReviews category={category} reviews={reviews} />
      <CategoryFAQ category={category} />
      <ExploreMore currentSlug={slug} />
    </main>
  );
}
