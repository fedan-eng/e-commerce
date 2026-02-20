// app/sitemap.js
export default function sitemap() {
  const baseUrl = 'https://www.filstore.com.ng';
  
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

  // Category pages - using clean URLs
  const categories = [
    'Power Bank',
    'Lifestyle', 
    'Extensions',
    'Wearables',
    'Chargers'
  ];
  
  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/products?categories=${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...mainPages, ...categoryPages];
}