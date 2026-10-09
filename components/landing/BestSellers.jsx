"use client";

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const filters = ['All', 'Bestsellers', 'New in'];

const filterMapping = {
  'All': null,
  'Bestsellers': 'isBestseller',
  'New in': 'isWhatsNew',
};

// Pastel backgrounds to match the design aesthetics dynamically
const cardBackgrounds = [
  'bg-[#B2F0CB]', // Mint Green (Used for Featured)
  'bg-[#FFF0B8]', // Light Yellow
  'bg-[#E3DDFF]', // Light Purple
  'bg-[#FFE4D6]', // Light Peach
];

function formatPrice(amount) {
  return `₦${amount?.toLocaleString('en-NG') || '0'}`;
}

function mapProductToDisplay(product) {
  return {
    _id: product._id,
    slug: product.slug,
    title: product.name,
    image: product.image || product.colors?.[0]?.images?.[0] || '/placeholder.png',
    price: formatPrice(product.price),
    originalPrice: product.originalPrice ? formatPrice(product.originalPrice) : null,
    // Joining features to serve as the short description to match the new UI
    description: (product.features || []).slice(0, 2).join(', '), 
    badge: product.isBestseller ? 'Bestseller' : product.isWhatsNew ? 'New in' : null,
  };
}

export default function BestSellers() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('limit', '3'); // max 3 per design

        const special = filterMapping[activeFilter];
        if (special) {
          params.append('specials', special);
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
  }, [activeFilter]);

  // Dynamic badge color logic based on the badge text
  const getBadgeColor = (badgeText) => {
    if (badgeText === 'Bestseller') return 'bg-[#FFCD4D] text-gray-900';
    if (badgeText === 'New in') return 'bg-[#C9BCFF] text-gray-900';
    return 'bg-white text-gray-900';
  };

  return (
    <section className="w-full bg-white py-12 md:py-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-6">
          <div className="max-w-md">
            <h2 className="text-[32px] sm:text-[40px] leading-tight font-bold text-[#0A321B] tracking-tight">
              What everyone's carrying
            </h2>
            <p className="text-gray-500 mt-2 text-[15px] sm:text-base">
              Our most loved gear right now. Hover a product to see it out in the world.
            </p>
          </div>

          {/* New Pill-Style Filter Navigation */}
          <div className="flex overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="inline-flex items-center gap-1 bg-gray-100/70 rounded-full p-1 border border-gray-200/70 whitespace-nowrap">
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 sm:px-5 py-2 text-[13px] sm:text-[14px] font-semibold rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0F472B] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading Skeletons matching the Asymmetrical Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`${
                  i === 0 ? 'lg:col-span-2' : 'lg:col-span-1'
                } flex flex-col animate-pulse`}
              >
                <div className="bg-gray-200 rounded-[28px] aspect-[4/3] md:aspect-auto md:h-[320px] mb-4" />
                <div className="px-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-12 bg-gray-200 rounded-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-3xl">
            <p>Failed to load products. Please try again later.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-3xl">
            <p>No products found in this category.</p>
          </div>
        ) : (
          /* Products Asymmetrical Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {products.map((product, index) => {
              const isFeatured = index === 0;
              const bgColor = cardBackgrounds[index % cardBackgrounds.length];

              return (
                <div
                  key={product._id}
                  className={`${
                    isFeatured ? 'lg:col-span-2' : 'lg:col-span-1'
                  } flex flex-col group`}
                >
                  {/* Image Card wrapped in Link */}
                  <Link
                    href={`/products/${product.slug || product._id}`}
                    className={`relative ${bgColor} rounded-[28px] overflow-hidden aspect-[4/3] md:aspect-auto md:h-[320px] mb-4 cursor-pointer block`}
                  >
                    {/* Badge */}
                    {product.badge && (
                      <span
                        className={`absolute top-4 left-4 z-10 px-3 py-1 text-[11px] font-semibold rounded-full ${getBadgeColor(product.badge)}`}
                      >
                        {product.badge}
                      </span>
                    )}

                    {/* Product Image */}
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="px-1 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <Link href={`/products/${product.slug || product._id}`}>
                        <h3 className="text-[15px] font-bold text-[#0A321B] leading-tight hover:text-[#0F472B]/70 transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      
                      <div className="flex items-baseline gap-1.5 flex-shrink-0">
                        <span className="text-[14px] font-bold text-[#0A321B]">
                          {product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[11px] text-gray-400 line-through hidden sm:inline-block">
                            {product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[13px] text-gray-500 mb-4 leading-snug line-clamp-2">
                      {product.description || 'Premium quality accessory.'}
                    </p>

                    {/* Add to Cart CTA (Functions as a Link to product page based on original logic) */}
                    <Link
                      href={`/products/${product.slug || product._id}`}
                      className="mt-auto w-full bg-[#0F472B] hover:bg-[#0A321B] text-white text-[13px] font-semibold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      Add to Cart
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}