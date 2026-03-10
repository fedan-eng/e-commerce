// app/head.jsx
// Global `<head>` additions: organization + website structured data that should appear on every page.
// This is a server component that Next will include at the root of the app.

export default function Head() {
  const graph = [
    {
      "@type": "Organization",
      "@context": "https://schema.org",
      name: "FIL Store",
      url: "https://www.filstore.com.ng",
      logo: "https://www.filstore.com.ng/fillogo.png",
      sameAs: [
        // add any social links you have
        "https://facebook.com/filstore",
        "https://instagram.com/filstore",
        "https://twitter.com/filstore"
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+234-800-123-4567",
          contactType: "customer service",
          areaServed: "NG",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@context": "https://schema.org",
      url: "https://www.filstore.com.ng",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.filstore.com.ng/products?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
    </>
  );
}
