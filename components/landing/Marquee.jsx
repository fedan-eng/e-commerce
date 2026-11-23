// components/landing/Marquee.jsx — the four promises under the hero.
// A 2×2 grid on phones and tablets (as in the design), one row of four on desktop.
import React from 'react';
import { Truck, CalendarDays, Headset, Award } from 'lucide-react';

const marqueeItems = [
  { title: 'Free Shipping', subtitle: 'Fast and reliable delivery', icon: Truck },
  { title: '7 Days Return', subtitle: 'Consumer protection program', icon: CalendarDays },
  { title: '24/7 Support', subtitle: 'If you have any questions', icon: Headset },
  { title: 'Best Quality', subtitle: 'Many years on the market', icon: Award },
];

const Marquee = () => {
  return (
    <section className="w-full border-b border-black/5 bg-[#a8edc8] px-4 py-5 sm:px-6 lg:px-8 lg:py-4">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-3 gap-y-5 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-black/10">
        {marqueeItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-center gap-2.5 sm:justify-center sm:gap-3.5 lg:px-4 lg:py-2">
              <Icon className="h-6 w-6 shrink-0 text-gray-900 sm:h-7 sm:w-7" strokeWidth={1.8} aria-hidden />
              <div className="flex min-w-0 flex-col">
                <span className="text-[14px] font-bold leading-tight tracking-tight text-gray-900 sm:text-[15px]">{item.title}</span>
                <span className="mt-0.5 text-[11px] font-medium leading-tight text-gray-700/80 sm:text-[12px]">{item.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Marquee;
