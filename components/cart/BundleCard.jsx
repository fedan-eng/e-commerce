// components/cart/BundleCard.jsx — how a bundle deal (lib/bundles.js) shows in the cart, the
// checkout's review step and the order confirmation: banner art, "Special bundle" tag, a pieces
// sticker, its two highlights and the price against the price before discount.
import Image from "next/image";
import Link from "next/link";
import { Magnet, Trash2, Zap } from "lucide-react";
import { formatAmount } from "@/lib/utils";

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

  const banner = (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-[14px] bg-[#0b6b5f]">
      {item.image && (
        <Image src={item.image} alt={item.name} fill sizes="(min-width: 768px) 480px, 100vw" className="object-cover object-[50%_70%]" />
      )}
      <span className="absolute left-0 top-0 rounded-br-[14px] bg-[#b6f36a] px-3 py-1 text-xs font-bold italic text-forest">
        Special bundle
      </span>
      {count > 1 && (
        <span className="absolute right-2.5 top-2.5 flex h-11 w-11 rotate-12 flex-col items-center justify-center rounded-full border-2 border-white bg-[#22b14c] text-white shadow-md">
          <span className="text-base font-extrabold leading-none">{count}</span>
          <span className="text-[9px] font-semibold leading-none">items</span>
        </span>
      )}
      <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-forest px-2.5 py-1 text-right text-white shadow-md">
        {original && <span className="block text-[9px] leading-none text-white/70 line-through">{formatAmount(item.originalPrice)}</span>}
        <span className="block text-base font-bold leading-tight">{formatAmount(item.price)}</span>
      </span>
    </div>
  );

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="rounded-[18px] border-2 border-[#4cd964] p-1">
        {href ? <Link href={href} aria-label={item.name}>{banner}</Link> : banner}
      </div>

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
