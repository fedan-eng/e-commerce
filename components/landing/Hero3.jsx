import React from 'react';
import Image from 'next/image';

const features = [
  {
    id: 1,
    title: 'FAST, FREE DELIVERY',
    description: 'Free shipping in 2-5 days on orders within Lagos.',
    icon: (
      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9h2M3 15h3" />
      </svg>
    ),
  },
  {
    id: 2,
    title: '30-DAY MONEY-BACK GUARANTEE',
    description: 'Return within 30 days for a full refund.',
    icon: (
      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 16l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'PAY WITH EASE',
    description: 'Pay online with Paystack or cash on delivery.',
    icon: (
      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'WE ARE HERE TO HELP',
    description: 'Contact our team via WhatsApp or live chat, 24/7.',
    icon: (
      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: '100% ORIGINAL PRODUCTS',
    description: 'Genuine products you can trust, every time.',
    icon: (
      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    id: 6,
    title: 'HASSLE-FREE WARRANTY',
    description: 'Comprehensive warranty protection on all purchases.',
    icon: (
      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l7-3 7 3z" />
      </svg>
    ),
  },
];

export function Hero3() {
  return (
    <section className="relative isolate w-full min-h-[480px] py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#edf6fc]">
      
      {/* Background Image (Placed in /public/Hero3.jpg) */}
      <Image
        src="/Hero3.jpg"
        alt="Shop With Confidence background pattern"
        fill
        sizes="100vw"
        className="object-cover object-right z-0 pointer-events-none select-none"
        priority
      />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Section Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 md:mb-12 tracking-tight">
          Shop With Confidence at FIL
        </h2>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow duration-300 min-h-[160px]"
            >
              {/* Card Header: Title & Icon */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xs sm:text-[13px] font-bold tracking-wider text-gray-900 uppercase leading-snug">
                  {item.title}
                </h3>
                <div className="shrink-0">
                  {item.icon}
                </div>
              </div>

              {/* Card Description */}
              <p className="text-xs sm:text-sm text-gray-600 mt-6 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Hero3;