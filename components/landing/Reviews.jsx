"use client";

import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    quoteBg: 'bg-[#B2F0CB]', // Mint Green
    text: 'Review about the Thunder 30K goes here: how long it lasts and where they use it.',
    author: 'Lanre K.',
    city: 'Lagos',
    product: 'FIL Thunder 20K',
  },
  {
    id: 2,
    quoteBg: 'bg-[#B0DDFF]', // Light Blue
    text: 'Review about the Breeze fan goes here: how it handles hot nights when light goes.',
    author: 'Chioma A.',
    city: 'Abuja',
    product: 'FIL Breeze 16"',
  },
  {
    id: 3,
    quoteBg: 'bg-[#C9BCFF]', // Light Purple
    text: 'Review about the Pods Pro goes here: sound, battery life, comfort on long rides.',
    author: 'Emeka O.',
    city: 'Port Harcourt',
    product: 'FIL Pods Pro',
  },
  {
    id: 4,
    quoteBg: 'bg-[#FFCD4D]', // Yellow
    text: 'Review about the MagFlex goes here: the magnetic grip and fast wireless charging.',
    author: 'Blessing T.',
    city: 'Ibadan',
    product: 'FIL MagFlex 10K',
  },
  {
    id: 5,
    quoteBg: 'bg-[#FFA488]', // Peach
    text: 'Customer service was amazing and the product arrived in 2 days. Solid build quality.',
    author: 'Tunde F.',
    city: 'Kano',
    product: 'FIL Volt Cube 40K',
  },
];

export default function Reviews() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 340; // Card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="w-full bg-[#F1F5F2] py-16 md:py-24 overflow-hidden">
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-6">
          <div>
            <h2 className="text-[32px] sm:text-[40px] leading-tight font-bold text-[#0A321B] tracking-tight">
              FIL fans have spoken.
            </h2>
            <p className="text-gray-500 mt-2 text-[15px] sm:text-base">
              Real reviews from people using FIL every day.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-gray-300/80 bg-white/50 flex items-center justify-center hover:bg-white transition-colors group shadow-xs"
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-[#0A321B] transition-colors" strokeWidth={2} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-gray-300/80 bg-white/50 flex items-center justify-center hover:bg-white transition-colors group shadow-xs"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#0A321B] transition-colors" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex-none w-[280px] sm:w-[320px] md:w-[340px] bg-white rounded-[28px] p-6 sm:p-7 flex flex-col justify-between snap-start shadow-xs hover:shadow-md transition-shadow duration-300"
            >
              {/* Top: Colored Quote Badge */}
              <div>
                <div className={`w-12 h-12 rounded-full ${review.quoteBg} flex items-center justify-center mb-6`}>
                  <Quote className="w-5 h-5 text-[#0A321B] fill-[#0A321B] rotate-180" />
                </div>

                {/* Review Text */}
                <p className="text-[14px] sm:text-[15px] text-gray-600 italic leading-relaxed font-normal mb-8">
                  "{review.text}"
                </p>
              </div>

              {/* Bottom: Customer Info & Product */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-[14px] font-bold text-[#0A321B]">
                  {review.author}, <span className="font-normal text-gray-500">{review.city}</span>
                </h3>
                <p className="text-[12px] text-gray-500 mt-1">
                  Bought <span className="underline underline-offset-2 decoration-gray-300">{review.product}</span>
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}