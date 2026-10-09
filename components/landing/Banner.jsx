import React from 'react';
import Link from 'next/link';

const Banner = () => {
  return (
    <section className="w-full bg-[#00E575] py-12 md:py-16 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Headline */}
        <h2 className="text-[36px] sm:text-[48px] md:text-[56px] leading-[1.05] font-bold text-[#0A321B] tracking-tight mb-6 md:mb-8">
          Stay on.
        </h2>

        {/* Battery / Charge Bar */}
        <div className="relative w-full mb-6 md:mb-8">
          {/* Main battery body */}
          <div className="relative w-full h-[40px] sm:h-[44px] md:h-[48px] bg-[#0A321B] rounded-full flex items-center justify-end pr-5 sm:pr-6">
            {/* 100% Label */}
            <span className="relative z-10 text-white font-bold text-[13px] sm:text-[14px] md:text-[15px] tracking-wide">
              100%
            </span>
          </div>

          {/* Battery terminal nub — short rounded capsule on the right */}
          <div className="absolute top-1/2 right-0 translate-x-[calc(100%+6px)] -translate-y-1/2 w-[6px] sm:w-[7px] h-[18px] sm:h-[20px] md:h-[22px] bg-[#0A321B] rounded-full" />
        </div>

        {/* Bottom Row: Copy + CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">

          {/* Supporting Text */}
          <p className="text-[#0A321B] text-[14px] sm:text-[15px] leading-[1.45] font-medium max-w-[320px]">
            Find the power bank, earbuds or fan that fits your day.<br className="hidden sm:block" />
            Pay when it arrives.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0A321B] text-white text-[13px] font-bold rounded-full hover:bg-black transition-colors duration-200 whitespace-nowrap"
            >
              Shop all products
            </Link>

            <a
              href="https://wa.me/2347018900705"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-transparent text-[#0A321B] text-[13px] font-bold rounded-full border-[1.5px] border-[#0A321B] hover:bg-[#0A321B] hover:text-white transition-colors duration-200 whitespace-nowrap"
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