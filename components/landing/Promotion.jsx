import React from 'react';
import Link from 'next/link';

const offers = [
  {
    id: 1,
    title: 'Welcome Offer',
    description: 'Sign up and get 10% off your first order.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=400&h=400',
    href: '/offers/welcome',
  },
  {
    id: 2,
    title: 'Bundle & save',
    description: 'Buy a power bank and cable together and save.',
    image: 'https://images.unsplash.com/photo-1591290619762-c588f7e5b4a9?auto=format&fit=crop&q=80&w=400&h=400',
    href: '/offers/bundle',
  },
  {
    id: 3,
    title: "Today's deals",
    description: 'New prices every day while stock lasts.',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=400&h=400',
    href: '/offers/deals',
  },
  {
    id: 4,
    title: 'Bulk & corporate',
    description: 'Special pricing for businesses and resellers.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400&h=400',
    href: '/offers/bulk',
  },
];

export default function Promotion() {
  return (
    <section className="w-full bg-[#efefefdb] my-10 py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 md:mb-8 tracking-tight">
          More exclusive offers
        </h2>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {offers.map((offer) => (
            <Link
              key={offer.id}
              href={offer.href}
              className="group flex flex-col"
            >
              {/* Image Placeholder */}
              <div className="relative w-full aspect-[4/3] bg-[#d1d5db] overflow-hidden mb-4">
                {/* 
                  Using a solid gray block to match the screenshot exactly.
                  When you have real images, replace the div below with an <img> or next/image.
                */}
                <div className="absolute inset-0 bg-[#d1d5db] group-hover:bg-[#c4c9d0] transition-colors duration-300" />
                
                {/* Optional: Uncomment this when you want real images instead of gray boxes
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                /> 
                */}
              </div>

              {/* Text Content */}
              <div className="flex flex-col">
                <h3 className="text-[13px] font-semibold text-gray-900 mb-1">
                  {offer.title}
                </h3>
                <p className="text-[13px] text-gray-600 leading-snug">
                  {offer.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}