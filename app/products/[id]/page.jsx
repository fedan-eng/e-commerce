import { cache } from "react";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getCategoryByDbName } from "@/lib/categories";
import { SITE_URL, jsonLdHtml } from "@/lib/seo";
import ProductDetailsPage from "./ProductDetailsPage";

// Pages are cached and rebuilt at most hourly; admin edits, review moderation and
// paid orders call revalidateProduct() so changes show up straight away.
export const revalidate = 3600;

// Without this Next renders every visit on demand (a DB query per view) and ignores
// `revalidate`. An empty list builds nothing up front: each product page is
// generated on its first visit, then served from the cache.
export function generateStaticParams() {
  return [];
}

// Read straight from the database (no HTTP hop to the live site). Reviews are left
// out: the page loads approved ones from /api/products/[id]/comments, and pending
// ones must never reach the browser. cache() shares one query between
// generateMetadata and the page.
const fetchProduct = cache(async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  // DB errors throw (error page, not cached) rather than looking like a missing product
  await connectDB();
  const product = await Product.findById(id).select("-comments -ratings -sortOrder").lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
});

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function truncate(value = "", length = 155) {
  const text = cleanText(value);
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function clampRating(value) {
  const num = parseFloat(value) || 5;
  return Math.max(1, Math.min(5, num));
}

function getPriceValidUntil() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return {
      title: "Premium Tech Products | FIL Store",
      description: "Shop premium tech accessories, power solutions, and wearables at FIL Store.",
      alternates: { canonical: `${SITE_URL}/products/${id}` },
    };
  }

  const productName = cleanText(product.name || "Product");
  const category = cleanText(product.category || "Tech Accessories");
  const categoryLower = category.toLowerCase();
  const price = product.price ? `₦${product.price}` : null;
  const shortDesc = truncate(product.description || "", 120);

  const title = `${productName} | Premium ${category} in Nigeria | FIL Store`;

  const description = [
    `Shop ${productName} from FIL Store, Nigeria’s premium destination for ${categoryLower}.`,
    `Original quality, trusted service, warranty support, and fast delivery in Lagos and nationwide.`,
    price ? `Available now for ${price}.` : "",
    shortDesc,
  ]
    .filter(Boolean)
    .join(" ");

  const keywords = [
    `${productName.toLowerCase()} nigeria`,
    `buy ${productName.toLowerCase()} online nigeria`,
    `${productName.toLowerCase()} price in nigeria`,
    `original ${productName.toLowerCase()} nigeria`,
    `premium ${categoryLower} nigeria`,
    `buy ${categoryLower} online nigeria`,
    `tech accessories nigeria`,
    `fast delivery lagos`,
    `trusted online store nigeria`,
    `pay on delivery nigeria`,
  ].join(", ");

  const url = `${SITE_URL}/products/${id}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "FIL Store",
      type: "website",
      images: product?.image ? [{ url: product.image, alt: productName }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product?.image ? [product.image] : [],
    },
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product?._id) notFound();

  const productName = cleanText(product.name || "Product");
  const productUrl = `${SITE_URL}/products/${id}`;
  const category = getCategoryByDbName(product.category);
  const priceValidUntil = getPriceValidUntil();
  const cleanPrice = String(product.price || "").replace(/[^0-9.]/g, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    image: Array.isArray(product.image)
      ? product.image
      : product.image
        ? [product.image]
        : [],
    description: cleanText(product.description || ""),
    sku: product._id || id,
    mpn: product._id || id,
    brand: {
      "@type": "Brand",
      name: "FIL",
    },
    aggregateRating:
      product.ratingsCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: clampRating(product.averageRating),
            reviewCount: product.ratingsCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "NGN",
      price: cleanPrice || undefined,
      priceValidUntil,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.availability !== false
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Fedan Investment Limited",
        url: SITE_URL,
      },
      // No shippingDetails: the fee depends on the delivery region, chosen at checkout
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "NG",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7, // the returns policy in lib/categories.js commonFaqs
      },
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Home", item: SITE_URL },
      // Through the category page, matching the breadcrumb shown on the page
      category && { name: category.title, item: `${SITE_URL}/products/${category.slug}` },
      { name: productName, item: productUrl },
    ]
      .filter(Boolean)
      .map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(breadcrumb)} />
      <ProductDetailsPage product={product} />
    </>
  );
}