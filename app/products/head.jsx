// app/products/head.jsx
// Static metadata and schema for the products listing page.  We fetch a small
// sample of products during SSR to provide a representative ItemList schema.

export default async function Head({ searchParams }) {
  // fetch the first page of products so that search engines can see some items
  let itemList = [];
  try {
    const res = await fetch(
      "https://www.filstore.com.ng/api/products?limit=12",
      { cache: "no-store" }
    );
    const json = await res.json();
    const prods = json.products || [];
    itemList = prods.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Product",
        name: p.name,
        image: p.image,
        description: p.description || `Buy ${p.name} at FIL Store Nigeria`,
        url: `https://www.filstore.com.ng/products/${p._id}`,
      },
    }));
  } catch (e) {
    console.error("failed to fetch products for head schema", e);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Product catalog | FIL Store",
    numberOfItems: itemList.length,
    itemListElement: itemList,
  };

  return (
    <>
      {/* basic page-specific metadata (title/description already defined in page.jsx) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
