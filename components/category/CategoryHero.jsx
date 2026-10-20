// components/category/CategoryHero.jsx
// Desktop: the title and intro sit on a solid left panel (category.heroBg), and the hero image
// fills the right side, fading into that panel so the product art never runs under the text.
// Mobile: the phone-sized image (category.heroImageMobile) is the whole background,
// with a white wash behind the text.
import Image from "next/image";

export default function CategoryHero({ category }) {
  const panel = category.heroBg || "#FFFFFF";

  return (
    <section
      className="relative isolate flex min-h-[300px] items-center overflow-hidden sm:min-h-[340px] lg:min-h-[400px]"
      style={{ backgroundColor: panel }}
    >
      {/* Phones */}
      <div className="absolute inset-0 -z-20 md:hidden">
        <Image
          src={category.heroImageMobile || category.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
      </div>

      {/* Tablet and up */}
      <div className="absolute inset-y-0 right-0 -z-20 hidden md:block md:w-[55%] lg:w-[60%]">
        <Image
          src={category.heroImage}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 55vw"
          className="object-cover object-right"
        />
        {/* Blends the image's left edge into the panel */}
        <div
          className="absolute inset-y-0 left-0 hidden w-2/5 md:block"
          style={{ background: `linear-gradient(to right, ${panel}, transparent)` }}
        />
      </div>

      {/* Keeps the text readable on narrow screens, where the product art slides under it */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/90 via-white/60 to-transparent md:hidden" />

      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 md:px-16">
        <div className="max-w-[300px] sm:max-w-[420px] md:max-w-[38%] lg:max-w-[min(460px,34vw)]">
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
