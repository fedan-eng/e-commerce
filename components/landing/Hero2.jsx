import React from 'react';
import Image from 'next/image';

const Hero2 = () => {
  return (
    <section className="relative w-full min-h-[550px] md:min-h-[700px] lg:min-h-[800px] flex flex-col items-center pt-10 sm:pt-14 md:pt-20 px-4 overflow-hidden">
      
      {/* 1. Background Image (Absolute Positioned) */}
      <Image
        src="/Hero2.jpg"
        alt="FIL MagFlex Power Bank background"
        fill
        className="object-cover object-center -z-10 select-none pointer-events-none"
        priority
      />

      {/* 2. Text & Button Overlay (Relative Positioned above image) */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
        
        {/* Top Tagline */}
        <span className="text-gray-300 uppercase tracking-[0.2em] text-xs sm:text-sm font-medium mb-3">
          FIL MagFlex Power Bank
        </span>

        {/* Title */}
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight sm:leading-tight md:leading-tight mb-6 tracking-tight">
          The World's Fastest and Coolest <br className="hidden sm:inline" />
          Wireless Power Bank
        </h1>

        {/* CTA Button */}
        <a
          href="https://filstore.com.ng/products"
          className="bg-white hover:bg-gray-200 text-black font-semibold text-xs sm:text-sm py-2.5 px-7 rounded-full transition-all duration-300 shadow-lg hover:scale-105"
        >
          Shop Now
        </a>

      </div>
    </section>
  );
};

export default Hero2;