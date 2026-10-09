import React from 'react';
import Link from 'next/link';

const Banner = () => {
  return (
    <section className="w-full bg-[#00E575] py-10 md:py-14 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Headline */}
        <h2 className="text-[40px] sm:text-[52px] md:text-[64px] leading-[1.05] font-bold text-[#0A321B] tracking-tight mb-5 md:mb-6">
          Stay on.
        </h2>

        {/* Battery / Charge Bar */}
        <div className="relative w-full max-w-4xl h-[52px] sm:h-[60px] md:h-[68px] bg-[#0A321B] rounded-full mb-5 md:mb-6 flex items-center justify-end pr-6 sm:pr-8 shadow-inner">
          {/* Subtle inner track shine */}
          <div className="absolute inset-1.5 rounded-full bg-[#0A321B] border border-white/5" />

          {/* 100% Label */}
          <span className="relative z-10 text-white font-bold text-[15px] sm:text-[17px] md:text-[18px] tracking-wide">
            100%
          </span>

          {/* Battery terminal nub */}
          <div className="top-1/2 left-full absolute bg-[#0A321B] rounded-full w-[9px] sm:w-[11px] md:w-[13px] h-[55%] -translate-y-1/2 ml-1.5 sm:ml-2" />
        </div>

        {/* Bottom Row: Copy + CTAs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">

          {/* Supporting Text */}
          <p className="text-[#0A321B] text-[14px] sm:text-[15px] leading-snug font-medium max-w-md">
            Find the power bank, earbuds or fan that fits your day.<br className="hidden sm:block" />
            Pay when it arrives.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 bg-[#0A321B] text-white text-[13px] sm:text-[14px] font-bold rounded-full hover:bg-black transition-colors duration-200 whitespace-nowrap"
            >
              Shop all products
            </Link>

            <a
              href="https://wa.me/2340000000000" // Replace with real WhatsApp number
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 bg-transparent text-[#0A321B] text-[13px] sm:text-[14px] font-bold rounded-full border-2 border-[#0A321B]/80 hover:bg-[#0A321B] hover:text-white transition-colors duration-200 whitespace-nowrap"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Banner;