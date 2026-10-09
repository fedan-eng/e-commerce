"use client";

import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';

const categories = [
  {
    id: 1,
    title: 'Power Banks',
    subtitle: 'Pocket-sized backup for when light takes a break.',
    bg: 'bg-[#B2F0CB]', // Mint Green
    textTitle: 'text-[#043B1E]',
    textSub: 'text-[#043B1E]/80',
    btnBg: 'bg-white/50',
    btnIcon: 'text-[#043B1E]',
    image: 'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/Need1.png',
    blend: 'mix-blend-multiply',
  },
  {
    id: 2,
    title: 'Audio',
    subtitle: 'Earbuds that outlast your longest go-slow.',
    bg: 'bg-[#C9BCFF]', // Light Purple
    textTitle: 'text-[#0B0A10]',
    textSub: 'text-[#0B0A10]/70',
    btnBg: 'bg-white/50',
    btnIcon: 'text-black',
    image: 'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/Need2.png',
    blend: 'mix-blend-multiply',
  },
  {
    id: 3,
    title: 'Charging',
    subtitle: 'Fast chargers that get you from 5% to out the door.',
    bg: 'bg-[#FFCD4D]', // Yellow
    textTitle: 'text-black',
    textSub: 'text-black/70',
    btnBg: 'bg-white/50',
    btnIcon: 'text-black',
    image: 'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/Need3.png',
    blend: 'mix-blend-multiply',
  },
  {
    id: 4,
    title: 'Cables',
    subtitle: 'Tough enough for bags, buses and bedside drama.',
    bg: 'bg-[#FFA488]', // Peach/Orange
    textTitle: 'text-black',
    textSub: 'text-black/70',
    btnBg: 'bg-white/50',
    btnIcon: 'text-black',
    image: 'https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/Gemini-Generated-Image-i7i6igi7i6igi7i6-1.webp',
    blend: 'mix-blend-multiply',
  },
  {
    id: 5,
    title: 'Fans',
    subtitle: 'Rechargeable cool for hot nights and no light.',
    bg: 'bg-[#B0DDFF]', // Light Blue
    textTitle: 'text-black',
    textSub: 'text-black/70',
    btnBg: 'bg-white/50',
    btnIcon: 'text-black',
    image: 'https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/bfaa0d7e92484ec783dc80fcb299da8f5a08211d.png',
    blend: 'mix-blend-multiply',
  },
  {
    id: 6,
    title: 'Sockets',
    subtitle: 'Surge-protected extensions for every room.',
    bg: 'bg-[#0F472B]', // Dark Green
    textTitle: 'text-white',
    textSub: 'text-[#A5C3B2]',
    btnBg: 'bg-white/10',
    btnIcon: 'text-white',
    image: 'https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/d1b4692616e16fe21028d967cfa20bb6b85d07fc.png',
    blend: 'opacity-90', 
  },
];

const NeedsPower = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 330; 
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="w-full bg-white py-12 md:py-20 overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-6">
          <div>
            <h2 className="text-[32px] sm:text-[40px] leading-tight font-bold text-[#0A321B] tracking-tight">
              What needs Power today?
            </h2>
            <p className="text-gray-500 mt-2 text-[15px] sm:text-base">
              Swipe through our categories and pick where to start.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3 hidden sm:flex">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors group"
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" strokeWidth={2} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors group"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`flex-none w-[280px] sm:w-[310px] h-[380px] rounded-[32px] ${cat.bg} p-6 relative flex flex-col snap-start overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-300`}
            >
              {/* Card Header text */}
              <div className="relative z-10 pr-10">
                <h3 className={`text-[22px] font-bold ${cat.textTitle} mb-1.5 leading-tight`}>
                  {cat.title}
                </h3>
                <p className={`text-[14px] leading-[1.3] ${cat.textSub} font-medium`}>
                  {cat.subtitle}
                </p>
              </div>

              {/* Top Right Action Button */}
              <div className={`absolute top-6 right-6 w-[34px] h-[34px] rounded-full flex items-center justify-center ${cat.btnBg} z-10 transition-transform group-hover:scale-110`}>
                <ArrowUpRight className={`w-4 h-4 ${cat.btnIcon}`} strokeWidth={2.5} />
              </div>

              {/* Product Image Placeholder */}
              <div className="absolute -bottom-2 -left-4 -right-4 h-[65%] flex items-end justify-center pointer-events-none">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className={`w-[90%] h-full object-contain object-bottom ${cat.blend} transition-transform duration-500 group-hover:scale-105`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NeedsPower;