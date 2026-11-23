// components/landing/BundleHero.jsx — one slide of the landing page hero for a bundle deal.
// bundle: a bundle product (getLiveBundles, lib/products.js). Its main image is the plain art
// (podium and products); the badge, name, prices and button are drawn here so they're real,
// clickable text. The art is portrait: on phones it fills the slide; on wider screens it sits
// on the right, over a blurred copy of itself so the background always matches its colours.
import Image from "next/image";
import Link from "next/link";
import { formatAmount } from "@/lib/utils";
import { bundlePieceCount } from "@/lib/bundles";

// Colour of the name's last word ("Trio"): lavender, or light blue on the blue Thunder art
const accentFor = (name) => (/thunder/i.test(name) ? "#7ee0ff" : "#c4b5fd");

// "Snap Trio" → "Snap " in white and "Trio" in the accent colour
function Title({ name }) {
  const cut = name.lastIndexOf(" ");
  if (cut < 0) return <>{name}</>;
  return (
    <>
      {name.slice(0, cut + 1)}
      <span style={{ color: accentFor(name) }}>{name.slice(cut + 1)}</span>
    </>
  );
}

// priority: the first slide's images load straight away.
// bundle.href: where "Shop now" goes when it isn't a real product yet (PREVIEW_BUNDLES)
export default function BundleHero({ bundle, priority = false }) {
  const href = bundle.href || `/products/${bundle._id}`;
  const count = bundlePieceCount(bundle);
  const pieces = count > 1 ? count : null;
  const original = bundle.originalPrice > bundle.price ? bundle.originalPrice : null;
  const Heading = priority ? "h1" : "h2"; // the first slide's title is the page's h1
  const art = bundle.heroImage || bundle.image; // the slide art, else the card art

  return (
    <div className="relative isolate h-full w-full overflow-hidden bg-[#0b3d4a]">
      {/* Phone: the art is the whole slide */}
      <div className="relative aspect-[1127/1396] w-full md:hidden">
        {art && <Image src={art} alt="" fill priority={priority} sizes="100vw" className="select-none object-cover object-bottom" />}
      </div>

      {/* Tablet and up: a blurred copy of the art as the background */}
      {art && (
        <div aria-hidden className="absolute inset-0 hidden md:block">
          <Image src={art} alt="" fill sizes="50vw" quality={30} className="scale-125 object-cover blur-3xl" />
          <div className="absolute inset-0 bg-black/15" />
        </div>
      )}

      <div className="absolute inset-0 z-10 mx-auto flex w-full max-w-[1280px] md:relative md:grid md:min-h-[560px] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-8 md:px-10 lg:min-h-[640px] lg:px-16">
        {/* Copy */}
        <div className="w-full px-5 pt-6 sm:px-8 sm:pt-10 md:px-0 md:py-16">
          <span className="inline-block rounded-full bg-[#e5252c] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md md:text-sm">
            Bundle deal{pieces && ` · ${pieces} items`}
          </span>

          <Heading className="mt-3 text-[34px] font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:mt-5 lg:text-6xl">
            <Title name={bundle.name} />
          </Heading>
          <p className="mt-1 text-[15px] font-medium text-white/90 sm:text-lg md:mt-3 lg:text-xl">
            {pieces ? `Get ${pieces} items for the price of one!` : "One price for the whole set."}
          </p>

          <div className="mt-4 flex items-center gap-5 md:mt-8">
            <p className="leading-none text-white">
              <span className="block text-[26px] font-extrabold sm:text-3xl lg:text-4xl">{formatAmount(bundle.price)}</span>
              {original && <span className="mt-1 block text-sm text-white/70 line-through lg:text-base">{formatAmount(original)}</span>}
            </p>
            <Link
              href={href}
              className="rounded-full bg-gradient-to-b from-[#3ee07a] to-[#16b04b] px-6 py-3 text-[15px] font-bold text-white shadow-[0_6px_18px_rgba(22,176,75,0.45)] transition-transform hover:scale-105 lg:px-8 lg:py-3.5 lg:text-base"
            >
              Shop now
            </Link>
          </div>
        </div>

        {/* Tablet and up: the art beside the copy, edges faded into the background */}
        <Link href={href} aria-label={`Shop the ${bundle.name}`} className="relative hidden aspect-[1127/1396] w-full max-w-[520px] justify-self-end md:block">
          {art && (
            <Image
              src={art}
              alt={`${bundle.name} bundle`}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 520px, 45vw"
              className="select-none object-contain [mask-image:radial-gradient(ellipse_75%_80%_at_50%_55%,black_60%,transparent_100%)]"
            />
          )}
        </Link>
      </div>
    </div>
  );
}
