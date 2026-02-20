// app/sitemap.js (for App Router)
export default async function sitemap() {
  // Fetch all your products from your database/API
  const products = await fetchAllProducts(); // Your function to get products
  
  // Base URLs
  const baseUrl = 'https://www.filstore.com.ng';
  
  // Static pages
  const routes = [
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

  // Category pages (clean URLs without parameters)
  const categories = ['Power-Bank', 'Lifestyle', 'Extensions', 'Wearables', 'Chargers'];
  const categoryRoutes = categories.map(category => ({
    url: `${baseUrl}/categories/${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Product pages - THIS IS THE IMPORTANT PART
  const productRoutes = products.map(product => ({
    url: `${baseUrl}/products/${product.slug}`, // or product.id
    lastModified: product.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...routes, ...categoryRoutes, ...productRoutes];
}