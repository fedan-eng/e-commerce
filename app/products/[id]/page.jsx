// app/products/[id]/page.jsx  ← NEW FILE, no "use client"

import ProductDetailsPage from "./ProductDetailsPage";

async function fetchProduct(id) {
  try {
    const res = await fetch(`https://www.filstore.com.ng/api/products/${id}`, {
      cache: "no-store",
    });
    const json = await res.json();
    return json.product || json;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  const title = product ? `${product.name} | FIL Store` : "Product | FIL Store";
  const description = product?.description || "Quality tech products at FIL Store Nigeria.";
  const url = `https://www.filstore.com.ng/products/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: product?.image ? [{ url: product.image }] : [],
    },
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  const jsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    description: product.description,
    sku: product._id,
    brand: { "@type": "Brand", name: "FIL" },
    offers: {
      "@type": "Offer",
      url: `https://www.filstore.com.ng/products/${id}`,
      priceCurrency: "NGN",
      price: product.price,
      availability: product.availability
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(product.averageRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.averageRating,
        reviewCount: product.ratingsCount || 0,
      },
    }),
  } : null;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.filstore.com.ng" },
      { "@type": "ListItem", position: 2, name: "Products", item: "https://www.filstore.com.ng/products" },
      ...(product ? [{ "@type": "ListItem", position: 3, name: product.name, item: `https://www.filstore.com.ng/products/${id}` }] : []),
    ],
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ProductDetailsPage />
    </>
  );
}

