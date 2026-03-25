// app/sitemap.js
export default async function sitemap() {
  const baseUrl = 'https://www.filstore.com.ng';
  
  // 1. Main Static Pages
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

  // 2. Category Pages (The "Konga" Sitelinks)
  // We define these manually since they are your main business pillars
  const categories = [
    'Power+Bank',
    'Wearables',
    'Chargers',
    'Cables',
    'Audio'
  ];

  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/products?categories=${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8, // High priority to encourage Sitelinks
  }));

  // 3. Dynamic Product Pages
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
    console.error('could not load products for sitemap', e);
  }

  return [...mainPages, ...categoryPages, ...productPages];
}