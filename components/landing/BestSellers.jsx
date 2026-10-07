"use client";

import React, { useState, useEffect } from 'react';
import { Star, Zap, Check } from 'lucide-react';
import Link from 'next/link';

const categories = ['Power Banks', 'Earbuds', 'Chargers', 'Lifestyle'];

const categoryMapping = {
  'Power Banks': 'power-banks',
  'Earbuds': 'wearables',
  'Chargers': 'chargers',
  'Lifestyle': 'lifestyle',
};

function formatPrice(amount) {
  return `₦${amount?.toLocaleString('en-NG') || '0'}`;
}

function mapProductToDisplay(product) {
  return {
    _id: product._id,
    slug: product.slug,
    title: product.name,
    image: product.image || product.colors?.[0]?.images?.[0] || '/placeholder.png',
    price: product.price,
    originalPrice: product.originalPrice || null,
    rating: product.averageRating || 0,
    reviews: product.ratingsCount || 0,
    features: (product.features || []).slice(0, 2).map((feat, idx) => ({
      icon: idx === 0 ? 'zap' : 'check',
      text: feat,
    })),
    badge: product.isBestseller ? 'Best Seller' : product.isWhatsNew ? 'New' : null,
  };
}

export default function BestSellers() {
  const [activeCategory, setActiveCategory] = useState('Power Banks');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        params.append('limit', '8');
        params.append('specials', 'isBestseller');
        
        const mappedCategory = categoryMapping[activeCategory];
        if (mappedCategory) {
          params.append('categories', mappedCategory);
        }
        
        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        
        const data = await res.json();
        const mappedProducts = (data.products || []).map(mapProductToDisplay);
        setProducts(mappedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  const filtered = products;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Best Sellers
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          What FIL customers are buying most, this week.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 md:mb-10">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="relative bg-[#f6f7f9] p-6 pt-8 pb-4 animate-pulse">
                <div className="relative w-full aspect-square bg-gray-200" />
              </div>
              <div className="flex flex-col flex-1 p-4 sm:p-5">
                <div className="h-10 bg-gray-200 mb-3 rounded animate-pulse" />
                <div className="h-5 bg-gray-200 mb-3 rounded w-3/4 animate-pulse" />
                <div className="h-5 bg-gray-200 mb-3 rounded w-1/2 animate-pulse" />
                <div className="h-6 bg-gray-200 mb-4 rounded w-1/3 animate-pulse" />
                <div className="mt-auto h-10 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-gray-500">
          <p>Failed to load products. Please try again later.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {filtered.map((product) => (
            <div
              key={product._id}
              className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              {/* Image Area */}
              <Link href={`/products/${product.slug || product._id}`} className="relative bg-[#f6f7f9] p-6 pt-8 pb-4">
                {/* Badge */}
                {product.badge && (
                  <span
                    className="absolute top-3 left-3 z-10 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#22c55e] text-white"
                  >
                    {product.badge}
                  </span>
                )}

                <div className="relative w-full aspect-square flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
              </Link>

            {/* Info */}
            <div className="flex flex-col flex-1 p-4 sm:p-5">
              {/* Title */}
              <h3 className="text-sm font-bold text-gray-900 leading-snug mb-3 line-clamp-2 min-h-[40px]">
                {product.title}
              </h3>

              {/* Features */}
              <ul className="space-y-1.5 mb-3">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                    {feat.icon === 'zap' ? (
                      <Zap size={12} className="text-emerald-500 shrink-0" fill="currentColor" />
                    ) : (
                      <Check size={12} className="text-emerald-500 shrink-0" strokeWidth={3} />
                    )}
                    <span>{feat.text}</span>
                  </li>
                ))}
              </ul>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : i < product.rating
                          ? 'fill-amber-400 text-amber-400 opacity-60'
                          : 'fill-gray-200 text-gray-200'
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  {product.rating} ({product.reviews})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-base font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Add to Cart */}
              <Link
                href={`/products/${product.slug || product._id}`}
                className="mt-auto w-full bg-gray-900 hover:bg-black text-white text-sm font-semibold py-3 rounded-full transition-colors duration-200 text-center"
              >
                Add to Cart
              </Link>
            </div>
          </div>
        ))}
      </div>
      )}
    </section>
  );
}