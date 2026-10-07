import React from 'react';
import Link from 'next/link';

// Array of categories to keep the code clean and DRY
const categories = [
  {
    id: 1,
    name: 'Power Banks',
    // Unsplash placeholder
    image: 'https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/A-high-end-photorealistic-e-co-Nano-Banana-2-32642-qiaygn.webp',
    link: '/products?category=power-banks',
  },
  {
    id: 2,
    name: 'Chargers',
    image: 'https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/FIL-Turbo-Charger-4-USB-Ports-4-1-A-Output-3-pins-n0d9ze-1-removebg-preview-ikkrds.webp',
    link: '/products?category=chargers',
  },
  {
    id: 3,
    name: 'Extensions',
    image: 'https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/d1b4692616e16fe21028d967cfa20bb6b85d07fc.png',
    link: '/products?category=extensions',
  },
  {
    id: 4,
    name: 'Wearables',
    image: 'https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/Gemini-Generated-Image-jt24o6jt24o6jt24-removebg-preview-zyswn9.webp',
    link: '/products?category=wearables',
  },
  {
    id: 5,
    name: 'Lifestyle',
    image: 'https://pub-2793ec977eaa425a9595b78bd8c10d2b.r2.dev/products/bfaa0d7e92484ec783dc80fcb299da8f5a08211d.png',
    link: '/products?category=lifestyle',
  },
];

export default function TopProducts() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      
      {/* Section Title */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
        Explore FIL's Top Products By Category
      </h2>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        
        {categories.map((category) => (
          <Link 
            key={category.id} 
            href={category.link}
            className="group flex flex-col items-center justify-between bg-[#F5F6F8] aspect-square p-4 sm:p-6 transition-all duration-300 hover:shadow-md hover:bg-[#ebecef]"
          >
            {/* Image Container */}
            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden mb-4">
              <img
                src={category.image}
                alt={`${category.name} category`}
                className="object-cover w-full h-full sm:w-[80%] sm:h-[80%] mix-blend-multiply group-hover:scale-105 transition-transform duration-300 ease-in-out"
              />
            </div>

            {/* Category Name */}
            <span className="text-sm sm:text-base font-semibold text-gray-800 text-center">
              {category.name}
            </span>
          </Link>
        ))}

      </div>
    </section>
  );
}