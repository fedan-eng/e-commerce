"use client";

import React, { useState, useRef } from 'react';
import { Star, Zap, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const categories = ['Power Banks', 'Earbuds', 'Chargers', 'Lifestyle'];

const products = [
  // —— Power Banks (max 4) ——
  {
    id: 1,
    category: 'Power Banks',
    badge: 'Best Seller',
    title: 'FIL Thunder 30,000mAh Portable 2.1A Fast Charging Power Bank',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: 'Fast Charging' },
      { icon: 'check', text: 'Multiple Device Support' },
    ],
    rating: 0,
    reviews: 0,
    price: 25000,
    originalPrice: 35500,
  },
  {
    id: 2,
    category: 'Power Banks',
    badge: 'New',
    title: 'FIL Mag Flex Power Bank (10,000mAh)',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: 'USB-C Fast Charge' },
      { icon: 'check', text: 'Pocket-Friendly' },
    ],
    rating: 4.7,
    reviews: 118,
    price: 10000,
    originalPrice: null,
  },
  {
    id: 3,
    category: 'Power Banks',
    badge: 'Best Seller',
    title: 'FIL Thunder Power Bank (30,000mAh)',
    image: 'https://images.unsplash.com/photo-1615526659158-c9f2284c7a52?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: '22.5W Fast Charging' },
      { icon: 'check', text: 'Dual USB Output' },
    ],
    rating: 4.8,
    reviews: 203,
    price: 30000,
    originalPrice: 35000,
  },
  {
    id: 4,
    category: 'Power Banks',
    badge: 'New',
    title: 'FIL Volt Cube 40,000mAh Powerbank',
    image: 'https://images.unsplash.com/photo-1628191081698-1411da8831bd?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: '65W Laptop Charging' },
      { icon: 'check', text: 'LED Power Display' },
    ],
    rating: 4.9,
    reviews: 156,
    price: 28000,
    originalPrice: 32000,
  },

  // —— Earbuds (max 4) ——
  {
    id: 5,
    category: 'Earbuds',
    badge: 'Best Seller',
    title: 'FIL Wireless Earbuds (ANC, 30hr)',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: 'Active Noise Cancelling' },
      { icon: 'check', text: '30-Hour Playtime' },
    ],
    rating: 4.9,
    reviews: 340,
    price: 20000,
    originalPrice: 25000,
  },
  {
    id: 6,
    category: 'Earbuds',
    badge: 'New',
    title: 'FIL Odogwu Earbuds Pro',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: 'Deep Bass Drivers' },
      { icon: 'check', text: 'IPX5 Water Resistant' },
    ],
    rating: 4.7,
    reviews: 212,
    price: 15000,
    originalPrice: 19000,
  },
  {
    id: 7,
    category: 'Earbuds',
    badge: 'Best Seller',
    title: 'FIL AirLite Earbuds',
    image: 'https://images.unsplash.com/photo-1572569433609-34f4fd20228b?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: 'Lightweight Fit' },
      { icon: 'check', text: '24-Hour Battery' },
    ],
    rating: 4.5,
    reviews: 178,
    price: 12000,
    originalPrice: null,
  },
  {
    id: 8,
    category: 'Earbuds',
    badge: 'New',
    title: 'FIL Sport Buds',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: 'Secure Ear Hooks' },
      { icon: 'check', text: 'Sweat Proof' },
    ],
    rating: 4.6,
    reviews: 95,
    price: 13500,
    originalPrice: 16000,
  },

  // —— Chargers (max 4) ——
  {
    id: 9,
    category: 'Chargers',
    badge: 'Best Seller',
    title: 'FIL 65W GaN Charger',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: '65W Fast Charge' },
      { icon: 'check', text: 'Foldable Pins' },
    ],
    rating: 4.8,
    reviews: 267,
    price: 18000,
    originalPrice: 22000,
  },
  {
    id: 10,
    category: 'Chargers',
    badge: 'New',
    title: 'FIL 3-in-1 Wireless Pad',
    image: 'https://images.unsplash.com/photo-1591290619762-c588f7e5b4a9?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: 'Phone + Watch + Buds' },
      { icon: 'check', text: 'MagSafe Compatible' },
    ],
    rating: 4.7,
    reviews: 143,
    price: 25000,
    originalPrice: null,
  },
  {
    id: 11,
    category: 'Chargers',
    badge: 'Best Seller',
    title: 'FIL 30W Dual Port Charger',
    image: 'https://images.unsplash.com/photo-1625948515292-696ee3a2146a?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: 'PD + QC 3.0' },
      { icon: 'check', text: 'Compact Design' },
    ],
    rating: 4.6,
    reviews: 198,
    price: 8500,
    originalPrice: 11000,
  },
  {
    id: 12,
    category: 'Chargers',
    badge: 'New',
    title: 'FIL Car Charger 45W',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: 'Dual USB-C Ports' },
      { icon: 'check', text: 'Fast Car Charging' },
    ],
    rating: 4.5,
    reviews: 76,
    price: 9500,
    originalPrice: 12000,
  },

  // —— Lifestyle (max 4) ——
  {
    id: 13,
    category: 'Lifestyle',
    badge: 'New',
    title: 'FIL Mini Projector (HD, Bluetooth)',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: 'Mobile Screen Mirroring' },
      { icon: 'check', text: 'Portable, HD Output' },
    ],
    rating: 4.6,
    reviews: 57,
    price: 115000,
    originalPrice: null,
  },
  {
    id: 14,
    category: 'Lifestyle',
    badge: 'Best Seller',
    title: 'FIL Desk Fan Pro',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: 'Ultra Quiet Motor' },
      { icon: 'check', text: 'Oscillating Head' },
    ],
    rating: 4.8,
    reviews: 124,
    price: 22000,
    originalPrice: 28000,
  },
  {
    id: 15,
    category: 'Lifestyle',
    badge: 'New',
    title: 'FIL LED Desk Lamp',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: '3 Color Temperatures' },
      { icon: 'check', text: 'Touch Controls' },
    ],
    rating: 4.7,
    reviews: 88,
    price: 15000,
    originalPrice: 19000,
  },
  {
    id: 16,
    category: 'Lifestyle',
    badge: 'Best Seller',
    title: 'FIL Portable Blender',
    image: 'https://images.unsplash.com/photo-1570197788417-0e0382395e01?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: 'USB-C Rechargeable' },
      { icon: 'check', text: 'BPA Free Bottle' },
    ],
    rating: 4.5,
    reviews: 156,
    price: 18000,
    originalPrice: 23000,
  },
];

function formatPrice(n) {
  return `₦${n.toLocaleString()}`;
}

export default function BestSellers() {
  const [activeCategory, setActiveCategory] = useState('Power Banks');
  const scrollRef = useRef(null);

  const filtered = products
    .filter((p) => p.category === activeCategory)
    .slice(0, 4);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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

      {/* Product List Container */}
      <div className="relative">
        
        {/* Mobile scroll controls */}
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

        {/* Viewport */}
        <div
          ref={scrollRef}
          className="
            flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory
            scrollbar-hide
            sm:mx-0 sm:px-0
            lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 lg:snap-none
          "
        >
          {filtered.map((product) => (
            <div
              key={product.id}
              className="
                flex flex-col flex-shrink-0 w-[260px] sm:w-[240px] lg:w-auto
                snap-start
                bg-white border border-gray-200/90 rounded-[22px] p-3
                shadow-xs hover:shadow-md transition-shadow duration-300
              "
            >
              {/* Inner Gray Image Container (with nested radius & badge) */}
              <div className="relative bg-[#f4f5f7] rounded-[16px] p-4 pt-8 pb-4 w-full aspect-square flex items-center justify-center">
                
                {/* Badge inside the gray box */}
                <span className="absolute top-2.5 left-2.5 z-10 bg-[#22c55e] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full leading-none tracking-tight">
                  {product.badge}
                </span>

                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              {/* Text Body */}
              <div className="flex flex-col flex-1 pt-3.5 px-1 pb-1">
                {/* Title */}
                <h3 className="text-[13px] font-bold text-gray-900 leading-snug mb-2.5 line-clamp-2 min-h-[36px]">
                  {product.title}
                </h3>

                {/* Features */}
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
                <button
                  type="button"
                  className="mt-auto w-full bg-[#0d1321] hover:bg-black text-white text-[13px] font-semibold py-2.5 rounded-full transition-colors duration-200"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}