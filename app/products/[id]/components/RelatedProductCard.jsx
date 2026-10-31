import Image from "next/image";
import Link from "next/link";
import { CirclePlus, Star } from "lucide-react";
import AddToCartButton from "@/components/AddToCart";
import { formatAmount } from "@/lib/utils";

function getBadge(p) {
  if (p.isBestseller) return "Bestseller";
  if (p.isWhatsNew) return "New";
  return null;
}

export default function RelatedProductCard({ product, bg }) {
  const href = `/products/${product._id}`;
  const image = product.image || product.colors?.[0]?.images?.[0] || "/placeholder.png";
  const badge = getBadge(product);

  return (
    <div className="group flex min-w-0 flex-col">
      <Link
        href={href}
        data-product-id={product._id}
        className="relative block aspect-[292/306] overflow-hidden rounded-[22px] md:rounded-[28px]"
        style={{ backgroundColor: bg }}
      >
        {badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-2.5 py-1.5 text-xs font-semibold text-forest md:left-3.5 md:top-3.5">
            {badge}
          </span>
        )}
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 300px, 50vw"
          className="object-contain p-[14%] transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Always rendered so every card lines up; only the sold count is optional */}
      <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted">
        <Star size={13} strokeWidth={0} className="fill-star" />
        <span className="font-semibold text-forest">{(product.averageRating || 0).toFixed(1)}</span>
        {product.soldCount > 0 && <span>{product.soldCount.toLocaleString()} sold</span>}
      </p>

      <Link href={href} className="mt-2 line-clamp-2 min-h-[2lh] text-[15px] font-semibold leading-snug text-forest md:text-base">
        {product.name}
      </Link>

      <p className="mt-2 text-base font-bold text-forest">{formatAmount(product.price)}</p>

      <AddToCartButton
        product={product}
        animated={false}
        label={
          <span className="flex items-center justify-center gap-2">
            <CirclePlus size={18} /> Buy Now
          </span>
        }
        className="mt-3 flex h-12 w-full items-center justify-center rounded-full bg-forest px-4 text-[15px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400 md:text-[17px]"
      />
    </div>
  );
}
