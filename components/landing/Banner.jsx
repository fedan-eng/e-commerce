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

        {/* Battery: shell + nub sit side by side, so nothing overflows the container */}
        <div className="flex items-center w-full mb-6 md:mb-8" aria-hidden="true">
          {/* Outlined shell */}
          <div className="flex-1 h-[44px] sm:h-[50px] md:h-[56px] rounded-full border-[3px] md:border-[4px] border-[#0A321B] p-[4px] md:p-[5px]">
            {/* Filled charge bar */}
            <div className="w-full h-full rounded-full bg-[#0A321B] flex items-center justify-end pr-4 sm:pr-5">
              <span className="text-[#00E575] font-bold text-[12px] sm:text-[13px] md:text-[14px] tracking-wide">
                100%
              </span>
            </div>
          </div>

          {/* Terminal nub */}
          <div className="ml-[3px] w-[6px] md:w-[8px] h-[16px] sm:h-[18px] md:h-[22px] bg-[#0A321B] rounded-r-full" />
        </div>

        {/* Bottom Row: Copy + CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">

          <p className="text-[#0A321B] text-[14px] sm:text-[15px] leading-[1.45] font-bold max-w-[400px]">
            Find the power bank, earbuds or fan that fits your day.<br className="hidden sm:block" />
            {' '}Pay when it arrives.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0A321B] text-white text-[13px] font-semibold rounded-full hover:bg-black transition-colors duration-200 whitespace-nowrap"
            >
              Shop all products
            </Link>

            <a
              href="https://wa.me/2347018900705"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-transparent text-[#0A321B] text-[13px] font-semibold rounded-full border-[1.5px] border-[#0A321B] hover:bg-[#0A321B] hover:text-white transition-colors duration-200 whitespace-nowrap"
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