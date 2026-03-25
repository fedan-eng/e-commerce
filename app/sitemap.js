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
    { name: 'Power Bank', url: 'Power+Bank' },
    { name: 'Wearables', url: 'Wearables' },
    { name: 'Chargers', url: 'Chargers' },
    { name: 'Lifestyle', url: 'Lifestyle' },
    { name: 'Extensions', url: 'Extensions' }
  ];

  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/products?categories=${cat.url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8, // High priority to encourage Sitelinks
  }));

  // 3. Special Pages (Best Seller, What's New, Today's Deal)
  const specials = [
    { name: 'Best Seller', param: 'isBestseller' },
    { name: "What's New", param: 'isWhatsNew' },
    { name: "Today's Deal", param: 'isTodaysDeal' }
  ];

  const specialPages = specials.map((special) => ({
    url: `${baseUrl}/products?specials=${special.param}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.85, // High priority for specials
  }));

  // 4. Dynamic Product Pages
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

  return [...mainPages, ...categoryPages, ...specialPages, ...productPages];
}