'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const dummyProducts = [
  {
    id: 1,
    tab: 'new',
    title: 'Fil Thunder 30,000mAh Fast Charging Power Bank',
    price: '₦25,000',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&q=80&w=300&h=300',
    shopLink: '/products/fil-thunder-30000',
    learnLink: '/products/fil-thunder-30000',
  },
  {
    id: 2,
    tab: 'new',
    title: 'FIL Pocket Bank 20,000mAh Powerbank',
    price: '₦14,500',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=300&h=300',
    shopLink: '/products/pocket-bank-20000',
    learnLink: '/products/pocket-bank-20000',
  },
  {
    id: 3,
    tab: 'new',
    title: 'FIL Volt Cube 30,000mAh Powerbank',
    price: '₦22,500',
    image: 'https://images.unsplash.com/photo-1615526659158-c9f2284c7a52?auto=format&fit=crop&q=80&w=300&h=300',
    shopLink: '/products/volt-cube-30000',
    learnLink: '/products/volt-cube-30000',
  },
  {
    id: 4,
    tab: 'new',
    title: 'FIL Volt Cube 40,000mAh Powerbank',
    price: '₦30,000',
    image: 'https://images.unsplash.com/photo-1628191081698-1411da8831bd?auto=format&fit=crop&q=80&w=300&h=300',
    shopLink: '/products/volt-cube-40000',
    learnLink: '/products/volt-cube-40000',
  },
  {
    id: 5,
    tab: 'new',
    title: 'FIL Volt Cube 50,000mAh Powerbank',
    price: '₦35,000',
    image: 'https://images.unsplash.com/photo-1619489646924-b4f10abbfeee?auto=format&fit=crop&q=80&w=300&h=300',
    shopLink: '/products/volt-cube-50000',
    learnLink: '/products/volt-cube-50000',
  },
  {
    id: 6,
    tab: 'best',
    title: 'FIL MagFlex Wireless Charger',
    price: '₦18,000',
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=300&h=300',
    shopLink: '#',
    learnLink: '#',
  },
  {
    id: 7,
    tab: 'best',
    title: 'FIL Compact 10,000mAh Mini Bank',
    price: '₦9,500',
    image: 'https://images.unsplash.com/photo-1599849506684-2e987c2fb8b2?auto=format&fit=crop&q=80&w=300&h=300',
    shopLink: '#',
    learnLink: '#',
  },
];

function MustHave() {
  const [activeTab, setActiveTab] = useState('new');
  const displayedProducts = dummyProducts.filter(product => product.tab === activeTab);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6 tracking-tight">
        Must-Have Anker Selections
      </h2>

      <div className="flex mb-8">
        <div className="inline-flex bg-[#f3f4f6] p-1 rounded-sm">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-6 py-2.5 text-[15px] font-medium text-black transition-all duration-200 ${
              activeTab === 'new' ? 'bg-white' : ''
            }`}
          >
            New Arrivals
          </button>
          <button
            onClick={() => setActiveTab('best')}
            className={`px-6 py-2.5 text-[15px] font-medium text-black transition-all duration-200 ${
              activeTab === 'best' ? 'bg-white' : ''
            }`}
          >
            Bestsellers
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6">
        {displayedProducts.map((product) => (
          <div key={product.id} className="flex flex-col group">
            <div className="relative w-full aspect-square bg-[#f4f5f7] mb-4 flex items-center justify-center p-6 overflow-hidden">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>

            <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 h-10 mb-2">
              {product.title}
            </h3>
            
            <p className="text-sm font-bold text-gray-900 mb-4">
              {product.price}
            </p>

            <div className="flex gap-2 w-full mt-auto">
              <Link 
                href={product.shopLink}
                className="flex-1 flex justify-center items-center py-2 px-1 rounded-full border border-gray-300 bg-white text-black hover:bg-gray-50 transition-colors text-[11px] font-semibold whitespace-nowrap"
              >
                Shop Now
              </Link>
              <Link 
                href={product.learnLink}
                className="flex-1 flex justify-center items-center py-2 px-1 rounded-full border border-black bg-black text-white hover:bg-gray-800 transition-colors text-[11px] font-semibold whitespace-nowrap"
              >
                Learn More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MustHave;
