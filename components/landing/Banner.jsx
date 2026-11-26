import React from 'react';
import Link from 'next/link';
import BatteryCharge from './BatteryCharge';
import { Reveal } from '@/components/motion/Reveal';

const Banner = () => {
  return (
    <section className="w-full bg-[#00E575] py-12 md:py-16 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-6 lg:px-8">

        {/* Headline */}
        <Reveal as="h2" className="text-[28px] sm:text-[48px] md:text-[56px] leading-[1.05] font-bold text-[#0A321B] tracking-tight mb-6 md:mb-8">
          Stay on.
        </Reveal>

        {/* Battery: charges up when it scrolls into view */}
        <BatteryCharge />

        {/* Bottom Row: Copy + CTAs */}
        <Reveal delay={0.3} className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">

          <p className="text-[#0A321B] text-[14px] sm:text-[15px] leading-[1.45] font-bold max-w-[400px]">
            Find the power bank, earbuds or fan that fits your day.<br className="hidden sm:block" />
            Pay when it arrives.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/products/power-banks"
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
        </Reveal>

      </div>
    </section>
  );
};

export default Banner;