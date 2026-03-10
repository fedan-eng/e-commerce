// app/sitemap.js
export default async function sitemap() {
  const baseUrl = 'https://filstore.com.ng';
  
  // Main pages
  const mainPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];


  // attempt to pull a list of products so each product page gets crawled
  let productPages = [];
  try {
    const res = await fetch(`${baseUrl}/api/products?limit=1000`, {
      cache: "no-store",
    });
    const data = await res.json();
    const products = data.products || [];
    productPages = products.map((p) => ({
      url: `${baseUrl}/products/${p._id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (e) {
    // on failure we simply fall back to the static pages
    console.error('could not load products for sitemap', e);
  }

  return [...mainPages, ...productPages];
}