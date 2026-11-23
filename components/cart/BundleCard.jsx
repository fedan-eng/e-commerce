// components/cart/BundleCard.jsx — how a bundle deal (lib/bundles.js) shows in the cart, the
// checkout's review step and the order confirmation: banner art, "Special bundle" tag, a pieces
// sticker, its two highlights and the price against the price before discount.
import Image from "next/image";
import Link from "next/link";
import { Magnet, Trash2, Zap } from "lucide-react";
import { formatAmount } from "@/lib/utils";

// The bundle's art with its tag, pieces sticker and price chip. Used by the cart card below and
// the landing page's Combo Deals (variant "combo": "Combo deal" tag on dark green, bright green
// price chip in the corner, no sticker). aspect: Tailwind aspect class.
// large: bigger tag and chip (the product page's main image)
export function BundleBanner({ image, name, count, price, originalPrice, aspect = "aspect-[2/1]", sizes = "(min-width: 768px) 560px, 100vw", variant = "cart", large = false, priority = false }) {
  if (variant === "combo") {
    return (
      <div className={`relative ${aspect} w-full overflow-hidden rounded-[14px] bg-[#eef1fb]`}>
        {image && <Image src={image} alt={name} fill sizes={sizes} priority={priority} quality={large ? 90 : 75} className="object-cover object-[50%_70%]" />}
        <span className={`absolute left-0 top-0 bg-[#014628] font-semibold text-white ${large ? "rounded-br-[18px] px-5 py-2 text-sm md:text-base" : "rounded-br-[12px] px-3 py-1 text-[11px] sm:text-xs"}`}>
          Combo deal
        </span>
        <span className={`absolute bottom-0 right-0 bg-[#1fd17a] text-right text-[#014628] ${large ? "rounded-tl-[22px] px-5 pb-2.5 pt-2" : "rounded-tl-[16px] px-3 pb-1.5 pt-1"}`}>
          {originalPrice > price && (
            <span className={`block leading-none text-[#014628]/60 line-through ${large ? "text-xs md:text-sm" : "text-[9px]"}`}>{formatAmount(originalPrice)}</span>
          )}
          <span className={`block font-extrabold leading-tight ${large ? "text-2xl md:text-3xl" : "text-[15px] sm:text-base"}`}>{formatAmount(price)}</span>
        </span>
      </div>
    );
  }

  // Cart, checkout and order confirmation: gradient frame, "Special bundle" tab, starburst
  // sticker and a dark price chip in the corner (the cart design)
  return (
    <div className="rounded-[22px] bg-gradient-to-br from-[#1fd769] to-[#b6f36a] p-[3px]">
      <div className={`relative ${aspect} w-full overflow-hidden rounded-[19px] bg-gradient-to-b from-[#e8f7ff] to-[#e6fbef]`}>
        {image && <Image src={image} alt={name} fill sizes={sizes} className="object-cover object-center" />}
        <span className="absolute left-0 top-0 rounded-br-[18px] bg-gradient-to-r from-[#1fd769] to-[#a5ef41] px-4 py-1.5 text-[15px] font-bold italic tracking-tight text-[#0b3d22] sm:px-6 sm:py-2 sm:text-lg">
          Special bundle
        </span>
        {count > 1 && <Starburst count={count} />}
        <span className="absolute bottom-0 right-0 rounded-tl-[18px] bg-[#0b1512] px-4 pb-2 pt-1.5 text-right text-white sm:px-5">
          {originalPrice > price && <span className="block text-[11px] leading-none text-white/60 line-through sm:text-xs">{formatAmount(originalPrice)}</span>}
          <span className="block text-xl font-extrabold leading-tight sm:text-2xl">{formatAmount(price)}</span>
        </span>
      </div>
    </div>
  );
}

// Scalloped "3 Items" badge: a 14-point star with a lime outline
const STAR_POINTS = Array.from({ length: 28 }, (_, i) => {
  const r = i % 2 === 0 ? 48 : 40;
  const a = (Math.PI * i) / 14 - Math.PI / 2;
  return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
}).join(" ");

function Starburst({ count }) {
  return (
    <span className="absolute right-3 top-3 h-14 w-14 -rotate-6 drop-shadow-md sm:h-[68px] sm:w-[68px]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <polygon points={STAR_POINTS} fill="#1fd769" stroke="#b6f36a" strokeWidth="5" strokeLinejoin="round" />
      </svg>
      <span className="relative flex h-full w-full flex-col items-center justify-center text-[#0b3d22]">
        <span className="text-xl font-black leading-none sm:text-2xl">{count}</span>
        <span className="text-[10px] font-bold leading-none sm:text-[11px]">Items</span>
      </span>
    </span>
  );
}

// One icon per highlight, in order (wireless charging, then charger and cable)
const HIGHLIGHT_ICONS = [Magnet, Zap];

// item: a cart or order line with { _id, name, price, originalPrice?, image, quantity, bundle: { count, highlights } }
// quantityControl: the stepper, when the quantity can be changed here
// onRemove: shows the bin button
// showLineTotal: price × quantity instead of the unit price (order confirmation)
export default function BundleCard({ item, quantityControl = null, onRemove = null, showLineTotal = false, className = "" }) {
  const count = item.bundle?.count || item.bundleContents?.length || 0;
  const highlights = item.bundle?.highlights || [];
  const qty = Number(item.quantity) || 1;
  const price = showLineTotal ? item.price * qty : item.price;
  const original = item.originalPrice > item.price ? (showLineTotal ? item.originalPrice * qty : item.originalPrice) : null;
  const href = item._id ? `/products/${item._id}` : null;

  const banner = <BundleBanner image={item.image} name={item.name} count={count} price={item.price} originalPrice={original ? item.originalPrice : null} />;

  return (
    // Full width on phones; capped on wider screens so the art isn't blown up
    <div className={`flex w-full flex-col md:max-w-[560px] ${className}`}>
      {href ? <Link href={href} aria-label={item.name} className="block">{banner}</Link> : banner}

      <div className="mt-3 flex items-start justify-between gap-3">
        <p className="text-[15px] font-bold text-forest">
          {item.name}
          {item.color && <span className="font-medium capitalize text-muted"> · {item.color}</span>}
          {showLineTotal && qty > 1 && <span className="font-medium text-muted"> × {qty}</span>}
        </p>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name}`}
            className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-forest transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>

      {highlights.length > 0 && (
        <ul className="mt-2 border-t border-line text-[13px] text-forest">
          {highlights.map((text, i) => {
            const Icon = HIGHLIGHT_ICONS[i] || Zap;
            return (
              <li key={text} className="flex items-center gap-2 border-b border-line py-2">
                <Icon size={14} className="shrink-0" fill={i === 1 ? "currentColor" : "none"} /> {text}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="flex items-baseline gap-2">
          <span className="text-base font-bold text-forest">{formatAmount(price)}</span>
          {original && <span className="text-xs text-muted line-through">{formatAmount(original)}</span>}
        </p>
        {quantityControl}
      </div>
    </div>
  );
}
