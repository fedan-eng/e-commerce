import React from 'react';
import { Truck, CalendarDays, Headset, Award } from 'lucide-react';

const marqueeItems = [
  {
    title: 'Free Shipping',
    subtitle: 'Fast and reliable delivery',
    icon: Truck,
  },
  {
    title: '7 Days Return',
    subtitle: 'Consumer protection program',
    icon: CalendarDays,
  },
  {
    title: '24/7 Support',
    subtitle: 'If you have any questions',
    icon: Headset,
  },
  {
    title: 'Best Quality',
    subtitle: 'Many years on the market',
    icon: Award,
  },
];

const Marquee = () => {
  return (
    <section className="w-full bg-[#A2E8CE] py-4 px-4 sm:px-6 lg:px-8 border-b border-black/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-0 sm:divide-y-0 lg:divide-x divide-black/10">
        {marqueeItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`flex items-center justify-center gap-3.5 py-2 px-4 transition-opacity duration-200 hover:opacity-80 ${
                index !== 0 ? 'lg:border-l lg:border-black/10' : ''
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 text-gray-900">
                <Icon size={28} strokeWidth={1.8} />
              </div>

              {/* Text Container */}
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-gray-900 leading-tight tracking-tight">
                  {item.title}
                </span>
                <span className="text-[12px] font-medium text-gray-700/80 leading-tight mt-0.5">
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Marquee;