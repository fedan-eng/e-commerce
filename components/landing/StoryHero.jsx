// components/landing/StoryHero.jsx — "Power your Story" slide (photo: Hero3.png).
// The photo is portrait: on phones it fills the slide with the copy over the sky; on wider
// screens the copy sits on a matching sky gradient with the photo as a card beside it.
import Image from "next/image";
import Link from "next/link";

const PHOTO = "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/Hero3.png";

export default function StoryHero() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-[#2c76d5] md:bg-gradient-to-b md:from-[#2463c4] md:to-[#3d8be0]">
      {/* Phone: the photo is the whole slide */}
      <div className="relative aspect-[1127/1396] w-full md:hidden">
        <Image src={PHOTO} alt="Friends at the beach charging their phones from a FIL power bank" fill sizes="100vw" className="z-0 select-none object-cover" />
      </div>

      <div className="absolute inset-0 z-10 mx-auto w-full max-w-[1280px] md:static md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-12 md:px-10 md:py-16 lg:px-16">
        {/* Copy */}
        <div className="flex flex-col items-center px-6 pt-8 text-center sm:pt-12 md:items-start md:px-0 md:pt-0 md:text-left">
          <h2 className="text-[26px] font-bold leading-tight tracking-tight text-white [text-shadow:0_1px_12px_rgba(0,40,110,0.25)] sm:text-4xl lg:text-5xl">
            Power your Story.
            <br />
            Keep Memories Alive.
          </h2>
          <p className="mt-3 max-w-[480px] text-[13px] leading-relaxed text-white/95 sm:text-base md:mt-5 lg:text-lg">
            Nigeria&apos;s first phone accessories company, built on over 30 years of industry experience. Power banks, chargers
            and earbuds for creators and everyday go-getters.
          </p>
          <Link
            href="/products/power-banks"
            className="mt-5 rounded-full bg-[#2ab34a] px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#23963e] md:mt-8 md:px-10 md:py-3 md:text-base"
          >
            Shop Now
          </Link>
        </div>

        {/* Tablet and up: the photo as a card beside the copy */}
        <div className="relative hidden aspect-[1127/1396] w-full max-w-[480px] justify-self-end overflow-hidden rounded-[32px] shadow-2xl md:block">
          <Image src={PHOTO} alt="Friends at the beach charging their phones from a FIL power bank" fill sizes="(min-width: 1280px) 480px, 45vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
