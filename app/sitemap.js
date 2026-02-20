// app/sitemap.js (for App Router)
async function fetchAllProducts() {
  // Use absolute URL in production, relative in dev
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
    
  const response = await fetch(`${baseUrl}/api/products`);
  const data = await response.json();
  return data;
}

export default async function sitemap() {
  const products = await fetchAllProducts();
  
  
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