// components/category/CategoryPage.jsx
// Shared template for /products/<slug>. Server component — loads products from the DB.
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getCategory } from "@/lib/categories";
import CategoryHero from "./CategoryHero";
import TrustBar from "./TrustBar";
import BestSellers from "@/components/landing/BestSellers";
import CategoryShop from "./CategoryShop";
import { CategoryShopSkeleton } from "@/components/PageSkeletons";
// import VideoAnimation from "@/components/landing/VideoAnimation";
import WhatsAppReviews from "@/components/landing/WhatsAppReviews";
import { getWhatsAppReviews } from "@/lib/whatsappReviews";
import CategoryFAQ from "./CategoryFAQ";
import ExploreMore from "./ExploreMore";

async function getCategoryProducts(dbCategory) {
  await connectDB();
  // Case-insensitive match — some older products were saved as e.g. "chargers"
  const docs = await Product.find({ category: dbCategory })
    .collation({ locale: "en", strength: 2 })
    .select("-ratings -comments")
    .lean();

  // Respect the admin's manual ordering for this category
  docs.sort(
    (a, b) => (a.sortOrder?.[dbCategory] ?? 9999) - (b.sortOrder?.[dbCategory] ?? 9999)
  );

  // Plain JSON so it can be passed to client components
  return JSON.parse(JSON.stringify(docs));
}

// One tab per product that has a video, in the shape <VideoAnimation /> expects
// function collectVideoTabs(products) {
//   return products
//     .map((p) => ({ id: p._id, label: p.name, src: (p.videos || []).find(Boolean) }))
//     .filter((t) => t.src);
// }

export default async function CategoryPage({ slug }) {
  const category = getCategory(slug);
  if (!category) notFound();

  const [products, chats] = await Promise.all([
    getCategoryProducts(category.dbCategory),
    getWhatsAppReviews(slug), // managed in Admin → WhatsApp reviews
  ]);
  const reviewsTitle = category.reviewsTitle || `What customers say about our ${category.title}`;

  return (
    <main>
      <CategoryHero category={category} />
      <TrustBar />
      {/* Same "What everyone's carrying" section as the homepage, scoped to this category */}
      <BestSellers
        category={category.dbCategory}
        title={category.featuredTitle}
        theme={category.theme}
        initialProducts={products.slice(0, 3)}
      />
      {/* useSearchParams inside CategoryShop needs a Suspense boundary for static rendering */}
      <Suspense fallback={<CategoryShopSkeleton />}>
        <CategoryShop category={category} products={products} />
      </Suspense>
      {/* Video section taken down for now — shared with the homepage
      <VideoAnimation tabs={collectVideoTabs(products)} /> */}
      {/* WhatsApp screenshots only; written reviews live on the product pages */}
      {chats.length > 0 && (
        <WhatsAppReviews
          variant="category"
          chats={chats}
          title={reviewsTitle}
          subtitle={`Real reviews from people using FIL ${category.title} every day.`}
        />
      )}
      <CategoryFAQ category={category} />
      <ExploreMore currentSlug={slug} />
    </main>
  );
}
