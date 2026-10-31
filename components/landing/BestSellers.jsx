"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCart';

const filters = ['All', 'Bestsellers', 'New in'];

const filterMapping = {
  'All': null,
  'Bestsellers': 'isBestseller',
  'New in': 'isWhatsNew',
};

const cardBackgrounds = [
  'bg-[#93E8C1]', // Mint (featured)
  'bg-[#FFF4C2]', // Pale yellow
  'bg-[#E6DEFF]', // Pale purple
  'bg-[#FFE4D6]', // Pale peach
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
    raw: product,
  };
}

// Used on the homepage (all categories) and on the category pages,
// where `category` is the stored Product.category value, e.g. "Power Bank".
// Category pages also pass `theme` (lib/categories.js): every card takes the category colour,
// and the top product moves into the wide card on the right.
// Bestseller cards get an "In 50+ people's cart" tag when enough real carts hold them.
// Pages can pass `initialProducts` (the "All" tab, loaded on the server) so the section
// renders with the page instead of fetching after hydration.
export default function BestSellers({ category = null, limit = 3, title = "What everyone’s carrying", theme = null, initialProducts = null }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [products, setProducts] = useState(() => (initialProducts || []).map(mapProductToDisplay));
  const [loading, setLoading] = useState(!initialProducts);
  const usedInitial = useRef(false);
  const loaded = useRef({}); // { [filter]: { products, cartTags } }, so revisiting a tab skips the skeleton
  const [error, setError] = useState(null);
  const [cartTags, setCartTags] = useState({}); // { [productId]: "50+" }, for bestsellers

  // Real counts from signed-in carts; no tag when it's under 10 or the lookup fails
  const loadCartTags = async (list, filter) => {
    setCartTags({});
    const ids = list.filter((p) => p.raw.isBestseller).map((p) => p._id);
    if (!ids.length) return;
    try {
      const res = await fetch(`/api/products/cart-counts?ids=${ids.join(',')}`);
      const { counts } = await res.json();
      setCartTags(counts || {});
      if (loaded.current[filter]) loaded.current[filter].cartTags = counts || {};
    } catch {
      // decoration only
    }
  };

  useEffect(() => {
    // First render of the "All" tab already has the server's products
    if (initialProducts && !usedInitial.current && activeFilter === 'All') {
      usedInitial.current = true;
      loaded.current.All = { products };
      loadCartTags(products, 'All');
      return;
    }

    const cached = loaded.current[activeFilter];
    if (cached) {
      setProducts(cached.products);
      setCartTags(cached.cartTags || {});
      setError(null);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('limit', String(limit));
        if (category) params.append('categories', category);

        const special = filterMapping[activeFilter];
        if (special) params.append('specials', special);

        const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();
        const list = (data.products || []).map(mapProductToDisplay);
        setProducts(list);
        loaded.current[activeFilter] = { products: list };
        loadCartTags(list, activeFilter);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeFilter, category, limit]);

  return (
    <section className="w-full bg-[#F2F8F4] py-10 md:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 md:mb-10 gap-4 md:gap-6">
          <div className="max-w-md">
            <h2 className="text-[24px] sm:text-[32px] md:text-[40px] leading-tight font-bold text-[#0A321B] tracking-tight">
              {title}
            </h2>
            <p className="text-gray-500 mt-1 sm:mt-2 text-[13px] sm:text-base">
              Our most-loved gear right now. Hover a product to see it out in the world.
            </p>
          </div>

          {/* Filters */}
          <div className="flex overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="inline-flex items-center gap-1 bg-white rounded-full p-1 sm:p-1.5 border border-[#0A321B]/10 shadow-sm whitespace-nowrap">
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 sm:px-5 sm:py-2 text-[12px] sm:text-[13px] font-bold rounded-full transition-all duration-200 ${
                      isActive ? 'bg-[#0A321B] text-white' : 'text-[#0A321B] hover:bg-[#0A321B]/5'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-5 md:gap-6">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className={`${i === 0 ? 'col-span-2' : 'col-span-1'} flex flex-col animate-pulse`}>
                <div className={`bg-gray-200 rounded-[20px] sm:rounded-[28px] ${i === 0 ? 'aspect-[16/10]' : 'aspect-square'} sm:aspect-[4/3] md:aspect-auto md:h-[360px] mb-3 sm:mb-4`} />
                <div className="px-1 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                    <div className="h-5 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-9 sm:h-11 bg-gray-200 rounded-full w-full sm:w-[170px] mt-3 sm:mt-5" />
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-5 md:gap-6">
            {products.map((product, index) => {
              // Only a 3-up row has room for a wide card; with fewer, every card stays narrow
              const isFeatured = index === 0 && (!theme || products.length >= 3);
              const cartTag = product.raw.isBestseller && cartTags[product._id];
              const bgColor = theme ? '' : cardBackgrounds[index % cardBackgrounds.length];
              const href = `/products/${product.slug || product._id}`;

              return (
                <div
                  key={product._id}
                  className={`${isFeatured ? 'col-span-2' : 'col-span-1'} ${isFeatured && theme ? 'lg:order-last' : ''} flex flex-col min-w-0 group`}
                >
                  {/* Image card */}
                  <Link
                    href={href}
                    data-product-id={product._id}
                    className={`relative ${bgColor} rounded-[20px] sm:rounded-[28px] overflow-hidden ${isFeatured ? 'aspect-[16/10]' : 'aspect-square'} sm:aspect-[4/3] md:aspect-auto md:h-[360px] mb-2.5 sm:mb-4 block`}
                    style={theme ? { backgroundColor: theme.cardBg } : undefined}
                  >
                    {product.badge && (
                      <span className="absolute top-2.5 left-2.5 sm:top-5 sm:left-5 z-10 bg-white text-[#0A321B] px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-[11px] font-bold rounded-full shadow-sm">
                        {product.badge}
                      </span>
                    )}

                    {/* Narrow phone cards can't fit both pills on one line, so the tag drops under the badge */}
                    {cartTag && (
                      <span className={`absolute ${isFeatured ? 'top-2.5 right-2.5' : 'top-9 left-2.5'} sm:top-5 sm:left-auto sm:right-5 z-10 bg-white text-[#0A321B] px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-[11px] font-bold rounded-full shadow-sm`}>
                        In {cartTag} people’s cart
                      </span>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="px-1 flex flex-col min-w-0">

                    {/* Title + price: title truncates, price never wraps; stacked on narrow phone cards */}
                    <div className={`flex ${isFeatured ? 'flex-row items-baseline gap-3' : 'flex-col gap-0.5'} sm:flex-row sm:items-baseline justify-between sm:gap-3 mb-1 min-w-0`}>
                      <Link href={href} title={product.title} className="min-w-0 flex-1">
                        <h3 className="truncate text-[14px] sm:text-[16px] font-bold text-[#0A321B] leading-tight hover:text-[#0A321B]/70 transition-colors">
                          {product.title}
                        </h3>
                      </Link>

                      <div className="flex items-baseline gap-1.5 shrink-0">
                        <span className="text-[14px] sm:text-[15px] font-bold text-[#0A321B]">{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-[11px] text-gray-400 line-through">{product.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    {/* Description: one line */}
                    <p
                      title={product.description}
                      className="truncate text-[12px] sm:text-[13px] text-gray-500 leading-snug"
                    >
                      {product.description || 'Premium quality accessory.'}
                    </p>

                    {/* CTA: fixed spacing, same width on every card */}
                    <AddToCartButton
                      product={product.raw}
                      animated={false}
                      className="mt-3 sm:mt-5 w-full sm:w-fit sm:min-w-[230px] flex items-center justify-center bg-[#004328] hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-[12px] sm:text-[13px] font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-full transition-colors duration-200"
                      label={
                        <span className="flex items-center gap-2">
                          <span className="bg-white rounded-full w-4 h-4 flex items-center justify-center">
                            <Plus size={11} strokeWidth={3.5} className="text-[#0A321B]" />
                          </span>
                          Buy Now
                        </span>
                      }
                    />
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