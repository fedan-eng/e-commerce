import React from 'react';
import Image from 'next/image';
import { 
  Timer, 
  CalendarCheck, 
  CreditCard, 
  Headset,
  BadgeCheck, 
  BadgePercent 
} from 'lucide-react';

const features = [
  {
    id: 1,
    title: 'FAST, FREE DELIVERY',
    description: 'Free shipping in 2-5 days on orders within Lagos.',
    icon: Timer,
  },
  {
    id: 2,
    title: '30-DAY MONEY-BACK GUARANTEE',
    description: 'Return within 30 days for a full refund.',
    icon: CalendarCheck,
  },
  {
    id: 3,
    title: 'PAY WITH EASE',
    description: 'Pay online with Paystack or cash on delivery.',
    icon: CreditCard,
  },
  {
    id: 4,
    title: 'WE ARE HERE TO HELP',
    description: 'Contact our team via WhatsApp or live chat, 24/7.',
    icon: Headset,
  },
  {
    id: 5,
    title: '100% ORIGINAL PRODUCTS',
    description: 'Genuine products you can trust, every time.',
    icon: BadgeCheck,
  },
  {
    id: 6,
    title: 'HASSLE-FREE WARRANTY',
    description: 'Comprehensive warranty protection on all purchases.',
    icon: BadgePercent,
  },
];

export function Hero3() {
  return (
    <section className="relative isolate w-full min-h-[480px] py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#edf6fc]">
      
      {/* Background Image (Placed in /public/Hero3.jpg) */}
      <Image
        src="https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/Hero3.jpg"
        alt="Shop With Confidence background pattern"
        fill
        sizes="100vw"
        className="object-cover object-right z-0 pointer-events-none select-none"
        priority
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Section Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 md:mb-12 tracking-tight">
          Shop With Confidence at FIL
        </h2>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((item) => {
            const IconComponent = item.icon;

            return (
              <div
                key={item.id}
                className="bg-white p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow duration-300 min-h-[160px]"
              >
                {/* Card Header: Title & Lucide Icon */}
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xs sm:text-[13px] font-bold tracking-wider text-gray-900 uppercase leading-snug">
                    {item.title}
                  </h3>
                  <div className="shrink-0 text-gray-800">
                    <IconComponent size={24} strokeWidth={1.5} />
                  </div>
                </div>

                {/* Card Description */}
                <p className="text-xs sm:text-sm text-gray-600 mt-6 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default Hero3;