// components/category/CategoryHero.jsx
// The hero image is the whole background (product art sits on the right of each image);
// the title and intro text sit on top of it on the left.
import Image from "next/image";

export default function CategoryHero({ category }) {
  return (
    <section className="relative isolate flex min-h-[300px] items-center overflow-hidden sm:min-h-[340px] lg:min-h-[400px]">
      <Image
        src={category.heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-right"
      />
      {/* Keeps the text readable on narrow screens, where the product art slides under it */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/90 via-white/60 to-transparent md:from-white/50 md:via-white/10" />

      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 md:px-16">
        <div className="max-w-[300px] sm:max-w-[420px] lg:max-w-[460px]">
          <h1 className="text-[34px] font-bold leading-tight tracking-tight text-[#111] sm:text-[44px] lg:text-[52px]">
            {category.title}
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#2A2A2A] sm:mt-4 sm:text-[15px]">
            {category.heroText}
          </p>
        </div>
      </div>
    </section>
  );
}
