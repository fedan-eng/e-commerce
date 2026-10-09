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

// Exact pastel backgrounds from the screenshot
const cardBackgrounds = [
  'bg-[#93E8C1]', // Vibrant Mint Green (Featured)
  'bg-[#FFF4C2]', // Pale Yellow
  'bg-[#E6DEFF]', // Pale Purple
  'bg-[#FFE4D6]', // Pale Peach (Fallback if 4th loads)
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
    description: (product.features || []).slice(0, 2).join(', '), 
    badge: product.isBestseller ? 'Bestseller' : product.isWhatsNew ? 'New in' : 'New',
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

  return (
    <section className="w-full bg-[#F2F8F4] py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-md">
            <h2 className="text-[32px] sm:text-[40px] leading-tight font-bold text-[#0A321B] tracking-tight">
              What everyone's carrying
            </h2>
            <p className="text-gray-500 mt-2 text-[15px] sm:text-base">
              Our most-loved gear right now. Hover a product to see it out in the world.
            </p>
          </div>

          {/* Pixel-Perfect White Pill Filters */}
          <div className="flex overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="inline-flex items-center gap-1 bg-white rounded-full p-1.5 border border-[#0A321B]/10 shadow-sm whitespace-nowrap">
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-5 py-2 text-[13px] font-bold rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0A321B] text-white'
                        : 'text-[#0A321B] hover:bg-[#0A321B]/5'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`${
                  i === 0 ? 'lg:col-span-2' : 'lg:col-span-1'
                } flex flex-col animate-pulse`}
              >
                <div className="bg-gray-200 rounded-[28px] aspect-[4/3] md:aspect-auto md:h-[360px] mb-4" />
                <div className="px-1 space-y-3">
                  <div className="flex justify-between">
                     <div className="h-5 bg-gray-200 rounded w-1/2" />
                     <div className="h-5 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-10 bg-gray-200 rounded-full w-[140px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-[#0A321B]/5">
            <p>Failed to load products. Please try again later.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-[#0A321B]/5">
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
                    className={`relative ${bgColor} rounded-[28px] overflow-hidden aspect-[4/3] md:aspect-auto md:h-[360px] mb-4 cursor-pointer block`}
                  >
                    {/* Badge - Always solid white with dark text matching design */}
                    {product.badge && (
                      <span className="absolute top-5 left-5 z-10 bg-white text-[#0A321B] px-3.5 py-1.5 text-[11px] font-bold rounded-full shadow-sm">
                        {product.badge}
                      </span>
                    )}

                    {/* Product Image */}
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="px-1 flex-1 flex flex-col">
                    
                    {/* Title & Price Row */}
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <Link href={`/products/${product.slug || product._id}`}>
                        <h3 className="text-[16px] font-bold text-[#0A321B] leading-tight hover:text-[#0A321B]/70 transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      
                      <div className="flex items-baseline gap-1.5 flex-shrink-0">
                        <span className="text-[15px] font-bold text-[#0A321B]">
                          {product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[11px] text-gray-400 line-through">
                            {product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[13px] text-gray-500 mb-5 leading-snug line-clamp-1">
                      {product.description || 'Premium quality accessory.'}
                    </p>

                    {/* Refined CTA Button - Left Aligned, Hugs Content, Specific Icon */}
                    <Link
                      href={`/products/${product.slug || product._id}`}
                      className="mt-auto w-fit bg-[#0A321B] hover:bg-black text-white text-[13px] font-bold py-2.5 px-4 rounded-full flex items-center gap-2 transition-colors duration-200"
                    >
                      {/* White circle with dark green Plus icon inside */}
                      <div className="bg-white rounded-full p-[2px] flex items-center justify-center">
                        <Plus size={12} strokeWidth={4} className="text-[#0A321B]" />
                      </div>
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