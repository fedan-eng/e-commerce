"use client";

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Lanre K.',
    initials: 'LK',
    rating: 5,
    text: 'Sample review text. Replace with a real customer review about a FIL product and how it worked for them.',
    product: 'FIL Thunder Power Bank',
  },
  {
    id: 2,
    name: 'Chioma A.',
    initials: 'CA',
    rating: 5,
    text: 'The MagFlex is seriously the fastest wireless bank I’ve used. Charges my phone ridiculously quick.',
    product: 'FIL MagFlex Power Bank',
  },
  {
    id: 3,
    name: 'Emeka O.',
    initials: 'EO',
    rating: 5,
    text: 'Odogwu Earbuds have insane bass and the case looks premium. Battery life is excellent too.',
    product: 'FIL Odogwu Earbuds',
  },
  {
    id: 4,
    name: 'Blessing T.',
    initials: 'BT',
    rating: 5,
    text: 'Bought the 30,000mAh Thunder for my trip. Still had 40% left after 4 days of heavy use. Highly recommend!',
    product: 'FIL Thunder Power Bank',
  },
  {
    id: 5,
    name: 'Tunde F.',
    initials: 'TF',
    rating: 5,
    text: 'Customer service was amazing and the product arrived in 2 days. Solid build quality.',
    product: 'FIL Volt Cube 40,000mAh',
  },
  {
    id: 6,
    name: 'Aisha M.',
    initials: 'AM',
    rating: 5,
    text: 'The cable + power bank bundle saved me money and everything works perfectly together.',
    product: 'FIL Bundle Pack',
  },
];

export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);

  // Handle responsive number of visible cards
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1);
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2);
      } else {
        setCardsToShow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, reviews.length - cardsToShow);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <section className="w-full bg-white py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8 md:mb-10 tracking-tight">
          Straight From Our Fans
        </h2>

        {/* Carousel Container */}
        <div className="relative">
          
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-105 transition-all duration-200"
            aria-label="Previous reviews"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-105 transition-all duration-200"
            aria-label="Next reviews"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>

          {/* Cards Viewport */}
          <div className="overflow-hidden px-2">
            <div
              className="flex transition-transform duration-500 ease-out gap-4 md:gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)`,
              }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3"
                  style={{ width: `${100 / cardsToShow}%` }}
                >
                  <div className="h-full bg-[#f3f4f6] rounded-xl p-5 sm:p-6 flex flex-col border border-transparent hover:border-gray-200 transition-colors">
                    
                    {/* Header: Name + Stars + Avatar */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                          {review.name}
                        </h3>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-gray-300 text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gray-800 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                        {review.initials}
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
                      “{review.text}”
                    </p>

                    {/* Product Row */}
                    <div className="mt-auto pt-4">
                      <div className="inline-flex items-center gap-2.5 bg-white rounded-lg px-3 py-2 border border-gray-200/80">
                        {/* Product image placeholder */}
                        <div className="w-6 h-6 rounded bg-gray-200 shrink-0" />
                        <span className="text-xs font-medium text-gray-800 truncate max-w-[140px]">
                          {review.product}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots (Mobile friendly indicator) */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'bg-gray-800 w-5' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}