// app/products/[id]/head.jsx
// This component runs on the server and is responsible for rendering metadata and
// structured data for product detail pages.  The `params` object contains
// the dynamic `id` segment.

export default async function Head({ params }) {
  const { id } = params;
  // fetch the product from the public API so we can build metadata and schema
  let product = null;
  try {
    const res = await fetch(`https://www.filstore.com.ng/api/products/${id}`, {
      cache: "no-store",
    });
    const json = await res.json();
    product = json.product || json;
  } catch (e) {
    // swallow network errors; metadata will fall back to generic values
    console.error("Failed to load product metadata", e);
  }

  const title = product ? `${product.name} | FIL Store` : "Product | FIL Store";
  const description =
    product?.description || "Quality tech products available at FIL Store Nigeria.";
  const url = `https://www.filstore.com.ng/products/${id}`;

  // build JSON-LD for the product itself
  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.image,
        description,
        sku: product._id,
        brand: { "@type": "Brand", name: "FIL" },
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "NGN",
          price: product.price,
          availability: product.availability
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
        // include rating if the product has one (optional)
        ...(product.averageRating && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount || 0,
          },
        }),
      }
    : null;

  const breadcrumbSchema = {
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
              item: url,
            },
          ]
        : []),
    ],
  };

  const combinedSchema = [
    productSchema,
    breadcrumbSchema,
  ].filter(Boolean);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {product?.image && <meta property="og:image" content={product.image} />}
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(combinedSchema),
          }}
        />
      )}
    </>
  );
}
