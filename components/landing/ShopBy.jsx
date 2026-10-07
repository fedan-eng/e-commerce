import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const departments = [
  {
    id: 'power-banks',
    title: 'Power Banks',
    description: 'Our best-selling department, never run out of charge again.',
    cta: 'Shop Power Banks',
    href: '/products?category=power-banks',
    image: 'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/ShopBy1.png',
  },
  {
    id: 'chargers',
    title: 'Chargers',
    description: 'Fast, compact charging for every device.',
    cta: 'Shop Chargers',
    href: '/products?category=chargers',
    image: 'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/ShopBy3.png',
  },
  {
    id: 'wearables',
    title: 'Wearables',
    description: 'Earbuds and smartwatches.',
    cta: 'Shop Wearables',
    href: '/products?category=wearables',
    image: 'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/ShopBy2.png',
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    description: 'Projectors, lamps & fans.',
    cta: 'Shop Lifestyle',
    href: '/products?category=lifestyle',
    image: 'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/ShopBy4.png',
  },
  {
    id: 'extensions',
    title: 'Extensions',
    description: 'Power more devices, safely.',
    cta: 'Shop Extensions',
    href: '/products?category=extensions',
    image: 'https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/ShopBy5.png',
  },
];

function SmallCard({ item }) {
  return (
    <Link
      href={item.href}
      className="group relative isolate flex-1 overflow-hidden rounded-2xl min-h-[170px] lg:min-h-0 border border-gray-200/60"
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(max-width: 1024px) 100vw, 30vw"
        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
      />

      {/* soft light fade: text side only, product stays clear */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/25 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        <div>
          <h3 className="text-lg font-bold leading-tight text-gray-900">{item.title}</h3>
          <p className="mt-1 max-w-[150px] text-xs leading-snug text-gray-800 [text-wrap:balance]">
            {item.description}
          </p>
        </div>

        {/* Single unified underline covering text + Lucide icon */}
        <span className="inline-flex w-fit items-center gap-1 text-[11px] font-semibold text-gray-900 underline underline-offset-4 decoration-2">
          {item.cta}
          <ArrowRight size={13} className="shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function ShopBy() {
  const [featured, ...others] = departments;
  const topRow = others.slice(0, 2);
  const bottomRow = others.slice(2, 4);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Shop by Department
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Everything FIL sells, grouped the way you actually shop.
        </p>
      </div>

      {/* Flex layout: stacked on mobile, 38/62 split on desktop */}
      <div className="flex flex-col gap-3 lg:aspect-[1018/337] lg:flex-row">
        {/* Featured (left) */}
        <Link
          href={featured.href}
          className="group relative isolate min-h-[340px] overflow-hidden rounded-2xl bg-black lg:min-h-0 lg:basis-[38.4%] lg:shrink-0"
        >
          <Image
            src={featured.image}
            alt={featured.title}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/30" />

          <div className="relative z-10 flex h-full flex-col justify-between p-6">
            <div>
              <h3 className="text-lg font-bold leading-tight text-white">{featured.title}</h3>
              <p className="mt-1 text-xs leading-snug text-white/90">{featured.description}</p>
            </div>

            {/* Single unified underline covering text + Lucide icon */}
            <span className="inline-flex w-fit items-center gap-1 text-[11px] font-semibold text-white underline underline-offset-4 decoration-2">
              {featured.cta}
              <ArrowRight size={13} className="shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        {/* Right side: two flex rows */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            {topRow.map((item) => (
              <SmallCard key={item.id} item={item} />
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            {bottomRow.map((item) => (
              <SmallCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}