"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';

/*
  bleed: how the image breaks out of the card (omit for contained images)
  - 'full'   → photo fills the lower card edge to edge (for images with their own background)
  - 'bottom' → cut-out runs off the bottom edge
  - 'left'   → cut-out runs off the left edge
  - 'right'  → cut-out runs off the right edge
*/
// Every image starts at IMAGE_TOP — just under the title/subtitle.
// Nudge this one value to move all card images up or down.
const IMAGE_TOP = 'top-[25%]';

const bleedPosition = {
  full: `inset-x-0 ${IMAGE_TOP} bottom-0`,
  bottom: `left-1/2 -translate-x-1/2 ${IMAGE_TOP} -bottom-[8%]`,
  left: `-left-[14%] ${IMAGE_TOP} bottom-5`,
  right: `-right-[14%] ${IMAGE_TOP} bottom-5`,
};

const categories = [
  {
    id: 1,
    title: 'Power Banks',
    href: '/products/power-banks',
    subtitle: 'Pocket-sized backup for when light takes a break.',
    bg: 'bg-[#B2F0CB]',
    textTitle: 'text-[#004328]',
    textSub: 'text-[#004328]/80',
    btnBg: 'bg-white/50',
    btnIcon: 'text-[#043B1E]',
    image: 'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/Need1.png',
    bleed: 'full',
  },
  {
    id: 2,
    title: 'Audio',
    href: '/products/wearables',
    subtitle: 'Earbuds that outlast your longest go-slow.',
    bg: 'bg-[#C9BCFF]',
    textTitle: 'text-[#004328]',
    textSub: 'text-[#004328]/70',
    btnBg: 'bg-white/50',
    btnIcon: 'text-black',
    image: 'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/Need2.png',
  },
  {
    id: 3,
    title: 'Charging',
    href: '/products/chargers',
    subtitle: 'Fast chargers that get you from 5% to out the door.',
    bg: 'bg-[#FFCD4D]',
    textTitle: 'text-[#004328]',
    textSub: 'text-[#004328]/70',
    btnBg: 'bg-white/50',
    btnIcon: 'text-black',
    image: 'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/Need3.png',
  },
  {
    id: 4,
    title: 'Cables',
    href: '/products/chargers',
    subtitle: 'Tough enough for bags, buses and bedside drama.',
    bg: 'bg-[#FFA488]',
    textTitle: 'text-[#004328]',
    textSub: 'text-[#004328]/70',
    btnBg: 'bg-white/50',
    btnIcon: 'text-black',
    image: 'https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/Gemini-Generated-Image-i7i6igi7i6igi7i6-1.webp',
    bleed: 'bottom',
  },
  {
    id: 5,
    title: 'Fans',
    href: '/products/lifestyle',
    subtitle: 'Rechargeable cool for hot nights and no light.',
    bg: 'bg-[#B0DDFF]',
    textTitle: 'text-[#004328]',
    textSub: 'text-[#004328]/70',
    btnBg: 'bg-white/50',
    btnIcon: 'text-black',
    image: 'https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/bfaa0d7e92484ec783dc80fcb299da8f5a08211d.png',
  },
  {
    id: 6,
    title: 'Sockets',
    href: '/products/extensions',
    subtitle: 'Surge-protected extensions for every room.',
    bg: 'bg-[#0F472B]',
    textTitle: 'text-white',
    textSub: 'text-[#A5C3B2]',
    btnBg: 'bg-white/10',
    btnIcon: 'text-white',
    image: 'https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/d1b4692616e16fe21028d967cfa20bb6b85d07fc.png',
    // Current asset's cable runs to the right. Switch to 'left' if you use the design's asset.
    bleed: 'right',
  },
];

const CategoryImage = ({ cat }) => {
  const imgMotion = 'transition-transform duration-500 group-hover:scale-[1.04]';

  // Contained (default)
  if (!cat.bleed) {
    return (
      <div className={`absolute ${IMAGE_TOP} bottom-0 left-0 right-0 px-4 pb-4 flex items-start justify-center pointer-events-none`}>
        <img
          src={cat.image}
          alt={cat.title}
          className={`w-full h-full object-contain object-top ${imgMotion}`}
        />
      </div>
    );
  }

  // Full photo bleed: fills the lower card, clipped by the card's rounded corners
  if (cat.bleed === 'full') {
    return (
      <div className={`absolute ${bleedPosition.full} pointer-events-none`}>
        <img
          src={cat.image}
          alt={cat.title}
          className={`w-full h-full object-cover object-left-top ${imgMotion}`}
        />
      </div>
    );
  }

  // Edge bleed: cut-out sized by height and pushed past one edge
  return (
    <div className={`absolute ${bleedPosition[cat.bleed]} pointer-events-none`}>
      <img
        src={cat.image}
        alt={cat.title}
        className={`h-full w-auto max-w-none ${imgMotion}`}
      />
    </div>
  );
};

const NeedsPower = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -340 : 340,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="w-full bg-white py-12 md:py-20 overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-6">
          <div>
            <h2 className="text-[32px] sm:text-[40px] leading-tight font-bold text-[#004328] tracking-tight">
              What needs Power today?
            </h2>
            <p className="text-gray-500 mt-2 text-[15px] sm:text-base">
              Swipe through our categories and pick where to start.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
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

        {/* Carousel */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              aria-label={`Shop ${cat.title}`}
              className={`flex-none w-[280px] sm:w-[300px] h-[410px] rounded-[28px] ${cat.bg} p-5 sm:p-6 relative flex flex-col snap-start overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-300`}
            >
              {/* Text stays above any bleeding image */}
              <div className="relative z-10 pr-10">
                <h3 className={`text-[20px] sm:text-[22px] font-bold ${cat.textTitle} mb-1.5 leading-tight`}>
                  {cat.title}
                </h3>
                <p className={`text-[13px] sm:text-[14px] leading-[1.35] ${cat.textSub} font-medium`}>
                  {cat.subtitle}
                </p>
              </div>

              {/* Arrow button */}
              <div className={`absolute top-5 right-5 sm:top-6 sm:right-6 w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center ${cat.btnBg} z-10 transition-transform group-hover:scale-110`}>
                <ArrowUpRight className={`w-4 h-4 ${cat.btnIcon}`} strokeWidth={2.5} />
              </div>

              <CategoryImage cat={cat} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NeedsPower;