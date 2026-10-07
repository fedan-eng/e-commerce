"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Star, Zap, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const categories = ['Power Banks', 'Earbuds', 'Chargers', 'Lifestyle'];

const categoryMapping = {
  'Power Banks': 'Power Bank',
  'Earbuds': 'Wearables',
  'Chargers': 'Chargers',
  'Lifestyle': 'Lifestyle',
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
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('limit', '4'); // max 4
        params.append('specials', 'isBestseller');

        const mappedCategory = categoryMapping[activeCategory];
        if (mappedCategory) {
          params.append('categories', mappedCategory);
        }

        const res = await fetch(`/api/products?${params.toString()}`, {
          cache: 'no-store',
        });
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

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      
      {/* Header */}
      <div className="mb-5 md:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Best Sellers
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          What FIL customers are buying most, this week.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
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
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible scrollbar-hide">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col flex-shrink-0 w-[260px] sm:w-[240px] lg:w-auto bg-white border border-gray-200/90 rounded-[22px] p-3"
            >
              <div className="bg-[#f4f5f7] rounded-[16px] aspect-square animate-pulse" />
              <div className="pt-3.5 px-1 space-y-2.5">
                <div className="h-9 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded-full animate-pulse mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-gray-500">
          <p>Failed to load products. Please try again later.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No products found in this category.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Optional mid-size scroll arrows */}
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 hidden sm:flex lg:hidden w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center text-gray-700 hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 hidden sm:flex lg:hidden w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center text-gray-700 hover:bg-gray-50"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>

          {/* 
            Mobile  → horizontal scroll
            Desktop → 4-col grid
          */}
          <div
            ref={scrollRef}
            className="
              flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory
              scrollbar-hide
              sm:mx-0 sm:px-0
              lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 lg:snap-none
            "
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="
                  flex flex-col flex-shrink-0 w-[260px] sm:w-[240px] lg:w-auto
                  snap-start
                  bg-white border border-gray-200/90 rounded-[22px] p-3
                  shadow-xs hover:shadow-md transition-shadow duration-300
                "
              >
                {/* Nested gray image well */}
                <Link
                  href={`/products/${product.slug || product._id}`}
                  className="relative bg-[#f4f5f7] rounded-[16px] p-4 pt-8 pb-4 w-full aspect-square flex items-center justify-center overflow-hidden"
                >
                  {product.badge && (
                    <span className="absolute top-2.5 left-2.5 z-10 bg-[#22c55e] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full leading-none tracking-tight">
                      {product.badge}
                    </span>
                  )}

                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </Link>

                {/* Body */}
                <div className="flex flex-col flex-1 pt-3.5 px-1 pb-1">
                  <Link href={`/products/${product.slug || product._id}`}>
                    <h3 className="text-[13px] font-bold text-gray-900 leading-snug mb-2.5 line-clamp-2 min-h-[36px] hover:text-green-600 transition-colors">
                      {product.title}
                    </h3>
                  </Link>

                  {/* Features */}
                  {product.features.length > 0 && (
                    <ul className="space-y-1 mb-2.5">
                      {product.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                          {feat.icon === 'zap' ? (
                            <Zap size={11} className="text-emerald-500 shrink-0" fill="currentColor" />
                          ) : (
                            <Check size={11} className="text-emerald-500 shrink-0" strokeWidth={3} />
                          )}
                          <span>{feat.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2.5">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={
                            i < Math.floor(product.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-200 text-gray-200'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400 ml-0.5">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-[15px] font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/products/${product.slug || product._id}`}
                    className="mt-auto w-full bg-[#0d1321] hover:bg-black text-white text-[13px] font-semibold py-2.5 rounded-full transition-colors duration-200 text-center"
                  >
                    Add to Cart
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}