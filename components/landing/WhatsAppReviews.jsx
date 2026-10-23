"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';

// Fallback for the homepage until the admin adds screenshots (Admin → WhatsApp reviews)
const SAMPLE_SCREENSHOTS = [
  'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/ReviewW1.png',
  'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/ReviewW2.png',
  'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/ReviewW3.png',
];
// Only three samples — repeat them so the carousel has room to scroll
const SAMPLE_CHATS = Array.from({ length: SAMPLE_SCREENSHOTS.length * 3 }, (_, i) => ({
  id: `sample-${i}`,
  src: SAMPLE_SCREENSHOTS[i % SAMPLE_SCREENSHOTS.length],
}));

// Bubble colours, cycled across the cards
const BUBBLES = ['#D1FADF', '#DCEEFF', '#E4DEFF'];

// Admin links can point at any host; only optimise the ones next.config allows
const OPTIMISED_HOSTS = [
  'pub-2808252d92f04792b5072c00044ff5b2.r2.dev',
  'pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev',
  'res.cloudinary.com',
];
const canOptimise = (src) => {
  try {
    return OPTIMISED_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
};

// chats = [{ id, src }] from lib/whatsappReviews (empty → homepage samples)
// variant "home": intro + controls beside the cards; "category": title row above them
export default function WhatsAppReviews({
  chats: items = [],
  variant = 'home',
  title = 'What our customers are saying',
  subtitle = 'Real chats from WhatsApp. Names hidden for privacy.',
}) {
  const chats = (items.length ? items : SAMPLE_CHATS).map((chat, i) => ({ ...chat, bubble: BUBBLES[i % BUBBLES.length] }));
  const isCategory = variant === 'category';
  const scrollRef = useRef(null);
  // thumb: visible share of the track (%), progress: 0 → 1 across the scroll range
  const [bar, setBar] = useState({ thumb: 33, progress: 0 });

  const updateBar = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setBar({
      thumb: Math.min(100, (el.clientWidth / el.scrollWidth) * 100),
      progress: max > 0 ? el.scrollLeft / max : 0,
    });
  };

  useEffect(() => {
    updateBar();
    window.addEventListener('resize', updateBar);
    return () => window.removeEventListener('resize', updateBar);
  }, [chats.length]);

  const scroll = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -280 : 280,
      behavior: 'smooth',
    });
  };

  const atStart = bar.progress <= 0.01;
  const atEnd = bar.progress >= 0.99;

  const arrowClass = (inactive) =>
    `w-11 h-11 rounded-full border flex items-center justify-center transition-colors ${
      inactive
        ? 'border-gray-300 text-gray-400'
        : 'border-[#004328] text-[#004328] hover:bg-[#004328] hover:text-white'
    }`;

  const arrows = (
    <>
      <button onClick={() => scroll('left')} className={arrowClass(atStart)} aria-label="Previous chats">
        <ArrowLeft className="w-5 h-5" strokeWidth={2} />
      </button>
      {/* Progress (homepage only) */}
      {!isCategory && (
        <div className="relative flex-1 max-w-[110px] h-[2px] bg-gray-300 rounded-full">
          <div
            className="absolute inset-y-0 bg-[#004328] rounded-full transition-[left] duration-150"
            style={{ width: `${bar.thumb}%`, left: `${bar.progress * (100 - bar.thumb)}%` }}
          />
        </div>
      )}
      <button onClick={() => scroll('right')} className={arrowClass(atEnd)} aria-label="Next chats">
        <ArrowRight className="w-5 h-5" strokeWidth={2} />
      </button>
    </>
  );

  return (
    <section className="w-full bg-[#F1F5F2] py-16 md:py-24 overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${
          isCategory ? 'gap-8 sm:gap-10' : 'lg:flex-row lg:items-center gap-10 lg:gap-12'
        }`}
      >

        {isCategory ? (
          /* Title row with the arrows on the right */
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h2 className="text-[32px] sm:text-[40px] leading-tight font-bold text-[#0A321B] tracking-tight">{title}</h2>
              <p className="text-gray-500 mt-2 text-[15px] sm:text-base">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">{arrows}</div>
          </div>
        ) : (
          /* Intro + controls */
          <div className="lg:w-[240px] shrink-0">
            <Quote className="w-12 h-12 text-[#1FA34A] fill-[#1FA34A] rotate-180 mb-4" strokeWidth={0} />
            <h2 className="text-[32px] sm:text-[36px] leading-[1.1] font-bold text-[#004328] tracking-tight">{title}</h2>
            <p className="text-gray-500 mt-4 text-[14px] sm:text-[15px] leading-relaxed">{subtitle}</p>
            <div className="flex items-center gap-3 mt-8">{arrows}</div>
          </div>
        )}

        {/* Chat bubbles */}
        <div
          ref={scrollRef}
          onScroll={updateBar}
          className="flex-1 min-w-0 flex gap-5 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-10 -mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0"
        >
          {chats.map((chat) => (
            <div key={chat.id} className="relative flex-none w-[230px] sm:w-[250px] snap-start">
              <div className="rounded-[24px] p-2.5" style={{ backgroundColor: chat.bubble }}>
                <div className="relative aspect-[5/6] rounded-[16px] overflow-hidden bg-[#0B141A]">
                  <Image
                    src={chat.src}
                    alt="WhatsApp chat with a FIL customer"
                    fill
                    sizes="250px"
                    unoptimized={!canOptimise(chat.src)}
                    className="object-cover object-top"
                  />
                </div>
              </div>

              {/* Bubble tail */}
              <div
                aria-hidden
                className="absolute left-7 -bottom-[26px] w-7 h-7"
                style={{ backgroundColor: chat.bubble, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
