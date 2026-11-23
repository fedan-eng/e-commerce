// components/landing/StoryHero.jsx — "Power your Story" slide (photo: Hero3.png).
// The photo is portrait: on phones it fills the slide with the copy over the sky; on wider
// screens the copy sits on a matching sky gradient with the photo as a card beside it.
import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

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
        <Stagger gap={0.12} className="flex flex-col items-center px-6 pt-8 text-center sm:pt-12 md:items-start md:px-0 md:pt-0 md:text-left">
          <StaggerItem as="h2" className="text-[26px] font-bold leading-tight tracking-tight text-white [text-shadow:0_1px_12px_rgba(0,40,110,0.25)] sm:text-4xl lg:text-5xl">
            Power your Story.
            <br />
            Keep Memories Alive.
          </StaggerItem>
          <StaggerItem as="p" className="mt-3 max-w-[480px] text-[13px] leading-relaxed text-white/95 sm:text-base md:mt-5 lg:text-lg">
            Nigeria&apos;s first phone accessories company, built on over 30 years of industry experience. Power banks, chargers
            and earbuds for creators and everyday go-getters.
          </StaggerItem>
          <StaggerItem>
            <Link
              href="/products/power-banks"
              className="mt-5 inline-block rounded-full bg-[#2ab34a] px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#23963e] hover:shadow-[0_10px_24px_rgba(42,179,74,0.5)] md:mt-8 md:px-10 md:py-3 md:text-base"
            >
              Shop Now
            </Link>
          </StaggerItem>
        </Stagger>

        {/* Tablet and up: the photo as a card beside the copy */}
        <Reveal y={60} duration={0.9} className="group relative hidden aspect-[1127/1396] w-full max-w-[480px] justify-self-end overflow-hidden rounded-[32px] shadow-2xl md:block">
          <Image src={PHOTO} alt="Friends at the beach charging their phones from a FIL power bank" fill sizes="(min-width: 1280px) 480px, 45vw" className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
        </Reveal>
      </div>
    </section>
  );
}
