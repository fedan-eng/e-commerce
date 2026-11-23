// components/landing/BundleHero.jsx — the landing page's first slide during a bundle deal.
// bundle: from getFeaturedBundle() (lib/products.js), so the name, prices and link always
// match the product. The art (Hero4.png) is portrait: on phones it fills the slide, on wider
// screens it sits on the right with its teal edges faded into the background.
import Image from "next/image";
import Link from "next/link";
import { formatAmount } from "@/lib/utils";

const ART = "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/Hero4.png";

// "Snap Trio" → "Snap " in white and "Trio" in lavender
function Title({ name }) {
  const cut = name.lastIndexOf(" ");
  if (cut < 0) return <>{name}</>;
  return (
    <>
      {name.slice(0, cut + 1)}
      <span className="text-[#c4b5fd]">{name.slice(cut + 1)}</span>
    </>
  );
}

export default function BundleHero({ bundle }) {
  const href = `/products/${bundle._id}`;
  const pieces = bundle.count > 1 ? bundle.count : null;

  return (
    <section className="relative isolate w-full overflow-hidden bg-[#015d5e] md:bg-[radial-gradient(ellipse_at_70%_35%,#05a596_0%,#027f7a_38%,#015d5e_78%)]">
      {/* Phone: the art is the whole slide */}
      <div className="relative aspect-[1127/1396] w-full md:hidden">
        <Image src={ART} alt="" fill priority sizes="100vw" className="z-0 select-none object-cover object-bottom" />
      </div>

      <div className="absolute inset-0 z-10 mx-auto flex w-full max-w-[1280px] md:static md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-8 md:px-10 lg:px-16">
        {/* Copy */}
        <div className="w-full px-5 pt-6 sm:px-8 sm:pt-10 md:px-0 md:py-16">
          <span className="inline-block rounded-full bg-[#e5252c] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md md:text-sm">
            Bundle deal{pieces && ` · ${pieces} items`}
          </span>

          <h1 className="mt-3 text-[34px] font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:mt-5 lg:text-6xl">
            <Title name={bundle.name} />
          </h1>
          <p className="mt-1 text-[15px] font-medium text-white/90 sm:text-lg md:mt-3 lg:text-xl">
            {pieces ? `Get ${pieces} items for the price of one!` : "One price for the whole set."}
          </p>

          <div className="mt-4 flex items-center gap-5 md:mt-8">
            <p className="leading-none text-white">
              <span className="block text-[26px] font-extrabold sm:text-3xl lg:text-4xl">{formatAmount(bundle.price)}</span>
              {bundle.originalPrice && (
                <span className="mt-1 block text-sm text-white/70 line-through lg:text-base">{formatAmount(bundle.originalPrice)}</span>
              )}
            </p>
            <Link
              href={href}
              className="rounded-full bg-gradient-to-b from-[#3ee07a] to-[#16b04b] px-6 py-3 text-[15px] font-bold text-white shadow-[0_6px_18px_rgba(22,176,75,0.45)] transition-transform hover:scale-105 lg:px-8 lg:py-3.5 lg:text-base"
            >
              Shop now
            </Link>
          </div>
        </div>

        {/* Tablet and up: the art beside the copy */}
        <Link href={href} aria-label={`Shop the ${bundle.name}`} className="relative hidden aspect-[1127/1396] w-full max-w-[540px] justify-self-end md:block">
          <Image
            src={ART}
            alt={`${bundle.name} bundle`}
            fill
            priority
            sizes="(min-width: 1280px) 540px, 45vw"
            className="select-none object-contain [mask-image:radial-gradient(ellipse_75%_80%_at_50%_55%,black_60%,transparent_100%)]"
          />
        </Link>
      </div>
    </section>
  );
}
