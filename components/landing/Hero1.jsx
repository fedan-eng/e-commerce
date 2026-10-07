import React from 'react';
import Image from 'next/image';

const Hero1 = () => {
  return (
    <section className="relative isolate w-full min-h-[550px] md:min-h-[700px] lg:min-h-[800px] flex flex-col items-center pt-16 md:pt-18 px-4 overflow-hidden bg-black">
      
      {/* Background Image (Placed in /public/Hero1.png) */}
      <Image
        src="https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/Hero1.png"
        alt="Fall Savings Start Now background"
        fill
        sizes="100vw"
        className="object-cover object-center z-0 select-none pointer-events-none"
        priority
      />

      {/* Text & Button Overlay */}
      <div className="relative z-10 flex flex-col items-center text-center">
        
        <h1 className="text-white text-3xl sm:text-4xl md:text-4xl font-bold mb-2 tracking-wide">
          Fall Savings Start Now
        </h1>

        <p className="text-gray-200 text-sm sm:text-base mb-6 md:mb-8 font-medium">
          Save up to 50% on select FIL favorites.
        </p>

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