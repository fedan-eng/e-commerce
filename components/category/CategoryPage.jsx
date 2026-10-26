// components/category/CategoryPage.jsx
// Shared template for /products/<slug>. Server component — loads products from the DB.
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import "@/models/User"; // registers the model for populate()
import { getCategory } from "@/lib/categories";
import CategoryHero from "./CategoryHero";
import TrustBar from "./TrustBar";
import BestSellers from "@/components/landing/BestSellers";
import CategoryShop from "./CategoryShop";
// import VideoAnimation from "@/components/landing/VideoAnimation";
import Reviews from "@/components/landing/Reviews";
import WhatsAppReviews from "@/components/landing/WhatsAppReviews";
import { getWhatsAppReviews } from "@/lib/whatsappReviews";
import CategoryFAQ from "./CategoryFAQ";
import ExploreMore from "./ExploreMore";

async function getCategoryProducts(dbCategory) {
  await connectDB();
  // Case-insensitive match — some older products were saved as e.g. "chargers"
  const docs = await Product.find({ category: dbCategory })
    .collation({ locale: "en", strength: 2 })
    .select("-ratings -comments.likes -comments.dislikes")
    .populate({ path: "comments.user", select: "firstName lastName city" })
    .lean();

  // Respect the admin's manual ordering for this category
  docs.sort(
    (a, b) => (a.sortOrder?.[dbCategory] ?? 9999) - (b.sortOrder?.[dbCategory] ?? 9999)
  );

  // Plain JSON so it can be passed to client components
  return JSON.parse(JSON.stringify(docs));
}

// "Lanre Kuti" → "Lanre K."
function shortName(user) {
  const first = user?.firstName?.trim();
  if (!first) return "FIL customer";
  const lastInitial = user.lastName?.trim()?.[0];
  return lastInitial ? `${first} ${lastInitial.toUpperCase()}.` : first;
}

// Approved reviews across the category, in the shape <Reviews /> expects
function collectReviews(products) {
  return products
    .flatMap((p) =>
      (p.comments || [])
        .filter((c) => c.status === "approved" && c.text?.trim())
        .map((c) => ({
          id: c._id,
          text: c.text,
          author: c.user ? shortName(c.user) : c.authorName?.trim() || "FIL customer", // link reviews may have no account
          city: c.user?.city || "",
          product: p.name,
          createdAt: c.createdAt,
        }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 12);
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
  const reviews = collectReviews(products);
  // Comments aren't needed on the client once reviews are extracted
  const listProducts = products.map(({ comments, ...p }) => p);
  const reviewsTitle = category.reviewsTitle || `What customers say about our ${category.title}`;

  return (
    <main>
      <CategoryHero category={category} />
      <TrustBar />
      {/* Same "What everyone's carrying" section as the homepage, scoped to this category */}
      <BestSellers category={category.dbCategory} title={category.featuredTitle} theme={category.theme} />
      {/* useSearchParams inside CategoryShop needs a Suspense boundary for static rendering */}
      <Suspense fallback={null}>
        <CategoryShop category={category} products={listProducts} />
      </Suspense>
      {/* Video section taken down for now — shared with the homepage
      <VideoAnimation tabs={collectVideoTabs(listProducts)} /> */}
      {/* WhatsApp screenshots first; written reviews only while a category has none */}
      {chats.length > 0 ? (
        <WhatsAppReviews
          variant="category"
          chats={chats}
          title={reviewsTitle}
          subtitle={`Real reviews from people using FIL ${category.title} every day.`}
        />
      ) : reviews.length > 0 && (
        <Reviews
          title={reviewsTitle}
          subtitle={`Real reviews from people using FIL ${category.title} every day.`}
          reviews={reviews}
        />
      )}
      <CategoryFAQ category={category} />
      <ExploreMore currentSlug={slug} />
    </main>
  );
}
