// lib/seo-utils.js

export function generateProductSEO(product) {
  const price = `₦${product.price.toLocaleString()}`;
  const hasDiscount = product.originalPrice && product.price < product.originalPrice;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const discountText = hasDiscount ? ` - ${discountPercent}% OFF` : '';
  const inStock = product.availability ? 'In Stock' : 'Out of Stock';

  // Category-specific keywords
  const categoryKeywords = {
    'Power Bank': 'power bank Nigeria, portable charger Lagos, fast charging power bank',
    'Wearables': 'wireless earbuds Nigeria, ANC earbuds Lagos, Bluetooth earbuds',
    'Chargers': 'phone charger Nigeria, fast charger Lagos, USB cable',
    'Lifestyle': 'solar bulb Nigeria, rechargeable bulb, tech lifestyle',
    'Extensions': 'extension cable Nigeria, power strip Lagos, surge protector',
  };

  const description = product.description.substring(0, 120).trim();
  
  const enhancedDescription = `Buy ${product.name} in Nigeria. ${description}. Price: ${price}${discountText}. ${inStock}. ${product.features?.slice(0, 3).join(', ') || ''}. Fast delivery in Lagos, Abuja, Port Harcourt. Authentic FIL products. Shop now at FIL Store Nigeria.`;

  const baseKeywords = categoryKeywords[product.category] || 'tech products Nigeria';
  const keywords = `${product.name}, buy ${product.name} Nigeria, ${baseKeywords}, ${product.name} price Nigeria, ${product.category} Lagos`;

  const title = `${product.name} ${price}${discountText} | Buy in Nigeria - FIL Store`;

  const ogTitle = hasDiscount 
    ? `${product.name} - Save ${discountPercent}% | ${price} | FIL Store`
    : `${product.name} - ${price} | FIL Store Nigeria`;

  const ogDescription = `${description}. ${inStock}. ${hasDiscount ? `Special offer: ${discountPercent}% OFF!` : 'Best price in Nigeria.'} Fast delivery nationwide.`;

  return {
    title,
    description: enhancedDescription.substring(0, 160),
    keywords,
    ogTitle,
    ogDescription: ogDescription.substring(0, 200),
  };
}

export function generateProductJsonLd(product) {
  const hasDiscount = product.originalPrice && product.price < product.originalPrice;
  
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.image, ...(product.secondaryImages || [])],
    "description": product.description,
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": "FIL Store"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.filstore.com.ng/product/${product._id}`,
      "priceCurrency": "NGN",
      "price": product.price,
      "priceValidUntil": "2026-12-31",
      "availability": product.availability 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "FIL Store"
      }
    },
    "aggregateRating": product.averageRating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.averageRating,
      "reviewCount": product.ratingsCount,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "category": product.category
  };
}