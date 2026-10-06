import React from 'react';
import Image from 'next/image';

const Hero1 = () => {
  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[80vh] flex flex-col items-center pt-16 md:pt-24 px-4 overflow-hidden">
      
      {/* 1. Background Image */}
      <Image
        src="/Hero1.png"
        alt="Fall Savings Start Now background"
        fill
        className="object-cover object-center -z-10 select-none pointer-events-none"
        priority
      />

      {/* 2. Text & Button Overlay */}
      <div className="relative z-10 flex flex-col items-center text-center">
        
        {/* Title */}
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-2 tracking-wide">
          Fall Savings Start Now
        </h1>

        {/* Subtitle */}
        <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-6 md:mb-8 font-medium">
          Save up to 50% on select FIL favorites.
        </p>

        {/* CTA Button */}
        <a
          href="/products"
          className="bg-[#2ab34a] hover:bg-[#23963e] text-white font-semibold py-2.5 px-8 rounded-full transition-colors duration-300 ease-in-out text-sm md:text-base shadow-lg"
        >
          Shop Now
        </a>

      </div>
    </section>
  );
};

export default Hero1;