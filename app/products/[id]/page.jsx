// app/products/[id]/page.jsx

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

// Clamp rating value between 1-5 for Google Schema validation
function clampRating(value) {
  const num = parseFloat(value) || 0;
  return Math.max(1, Math.min(5, num));
}

// priceValidUntil — 1 year from today, updated at build/request time
function getPriceValidUntil() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0]; // "2026-03-20"
}

export default async function Page({ params }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  const productUrl = `https://www.filstore.com.ng/products/${id}`;
  const priceValidUntil = getPriceValidUntil();

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: Array.isArray(product.image) ? product.image : [product.image],
        description: product.description,
        sku: product._id,
        brand: {
          "@type": "Brand",
          name: "FIL",
        },

        // ── Fix 1: aggregateRating — ONLY if rating count > 0 ──────────────
        // CRITICAL: ratingValue MUST be between 1-5 for Google validation
        ...(product.ratingsCount > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: clampRating(product.averageRating),
                reviewCount: product.ratingsCount ?? 0,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),

        // ── Fix 2: review — ONLY include if there are actual ratings ──────
        // Map ratings to reviews. Only include if ratingsCount > 0
        ...(product.ratings && product.ratings.length > 0
          ? {
              review: product.ratings.slice(0, 3).map((r) => ({
                "@type": "Review",
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: clampRating(r.value) ?? 0,
                  bestRating: 5,
                  worstRating: 1,
                },
                author: {
                  "@type": "Person",
                  name: "Verified Buyer",
                },
                reviewBody: "Verified purchase",
                datePublished: r.createdAt
                  ? new Date(r.createdAt).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0],
              })),
            }
          : {}),

        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "NGN",
          price: product.price,

          // ── Fix 3: priceValidUntil ───────────────────────────────────
          priceValidUntil,

          availability: product.availability
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",

          seller: {
            "@type": "Organization",
            name: "Fedan Investment Limited",
            url: "https://www.filstore.com.ng",
          },

          // ── Fix 4: hasMerchantReturnPolicy ───────────────────────────
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "NG",
            returnPolicyCategory:
              "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 7,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
          },

          // ── Fix 5: shippingDetails ───────────────────────────────────
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              value: 0,
              currency: "NGN",
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "NG",
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 2,
                unitCode: "DAY",
              },
              transitTime: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 5,
                unitCode: "DAY",
              },
            },
          },
        },
      }
    : null;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.filstore.com.ng",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: "https://www.filstore.com.ng/products",
      },
      ...(product
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.name,
              item: productUrl,
            },
          ]
        : []),
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