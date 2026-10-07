"use client";

import React, { useState } from 'react';
import { Star, Zap, Check } from 'lucide-react';

const categories = ['Power Banks', 'Earbuds', 'Chargers', 'Lifestyle'];

const products = [
  // Power Banks
  {
    id: 1,
    category: 'Power Banks',
    badge: 'Best Seller',
    title: 'FIL Thunder Power Bank (30,000mAh)',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&q=80&w=400&h=400',
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
    title: 'FIL Volt Cube 40,000mAh',
    image: 'https://images.unsplash.com/photo-1615526659158-c9f2284c7a52?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: '65W Laptop Charging' },
      { icon: 'check', text: '4-Port Output' },
    ],
    rating: 4.9,
    reviews: 156,
    price: 28000,
    originalPrice: 32000,
  },
  {
    id: 4,
    category: 'Power Banks',
    badge: 'New',
    title: 'FIL Pocket Bank 20,000mAh',
    image: 'https://images.unsplash.com/photo-1628191081698-1411da8831bd?auto=format&fit=crop&q=80&w=400&h=400',
    features: [
      { icon: 'zap', text: '20W PD Charging' },
      { icon: 'check', text: 'LED Display' },
    ],
    rating: 4.6,
    reviews: 89,
    price: 14500,
    originalPrice: 18000,
  },

  // Earbuds
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

  // Chargers
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

  // Lifestyle
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

function formatPrice(amount) {
  return `₦${amount.toLocaleString()}`;
}

export default function BestSellers() {
  const [activeCategory, setActiveCategory] = useState('Power Banks');

  const filtered = products.filter((p) => p.category === activeCategory);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            {/* Image Area */}
            <div className="relative bg-[#f6f7f9] p-6 pt-8 pb-4">
              {/* Badge */}
              <span
                className={`absolute top-3 left-3 z-10 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  product.badge === 'Best Seller' || product.badge === 'Best seller'
                    ? 'bg-[#22c55e] text-white'
                    : 'bg-[#22c55e] text-white'
                }`}
              >
                {product.badge}
              </span>

              <div className="relative w-full aspect-square flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
            </div>

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
              <button
                type="button"
                className="mt-auto w-full bg-gray-900 hover:bg-black text-white text-sm font-semibold py-3 rounded-full transition-colors duration-200"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}