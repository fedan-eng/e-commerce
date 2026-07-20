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
      alternates: { canonical: `https://www.filstore.com.ng/products/${id}` },
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

  const url = `https://www.filstore.com.ng/products/${id}`;

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

  if (!product) return <ProductDetailsPage />;

  const productName = cleanText(product.name || "Product");
  const productUrl = `https://www.filstore.com.ng/products/${id}`;
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
      availability:
        product.availability !== false
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Fedan Investment Limited",
        url: "https://www.filstore.com.ng",
      },
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
  };

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
      {
        "@type": "ListItem",
        position: 3,
        name: productName,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetailsPage />
    </>
  );
}