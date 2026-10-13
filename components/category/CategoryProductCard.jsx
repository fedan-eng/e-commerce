// components/category/CategoryProductCard.jsx — one product in the category grid
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import AddToCartButton from "@/components/AddToCart";

function formatPrice(amount) {
  return `₦${amount?.toLocaleString("en-NG") || "0"}`;
}

function getBadge(p) {
  if (p.isBestseller) return "Best seller";
  if (p.isWhatsNew) return "New";
  return null;
}

// cardBg: the category's image background (theme.cardBg in lib/categories.js)
export default function CategoryProductCard({ product, cardBg }) {
  const image = product.image || product.colors?.[0]?.images?.[0] || "/placeholder.png";
  const badge = getBadge(product);
  const href = `/products/${product._id}`;

  return (
    <div className="group flex min-w-0 flex-col">
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden rounded-[24px] sm:rounded-[28px]"
        style={{ backgroundColor: cardBg }}
      >
        {badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[#1FA34A] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white sm:left-4 sm:top-4 sm:text-[10px]">
            {badge}
          </span>
        )}
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* One line with an ellipsis; full name shows on hover */}
      <Link
        href={href}
        title={product.name}
        className="mt-3 min-w-0 truncate text-[13px] text-[#3A3A3A] sm:text-sm"
      >
        {product.name}
      </Link>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[15px] font-bold text-[#0A321B]">{formatPrice(product.price)}</span>
        {product.originalPrice > product.price && (
          <span className="text-[11px] text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
        )}
      </div>

      <AddToCartButton
        product={product}
        animated={false}
        label={
          <span className="flex items-center gap-2">
            <span className="bg-white rounded-full w-4 h-4 flex items-center justify-center">
              <Plus size={11} strokeWidth={3.5} className="text-[#0A321B]" />
            </span>
            Add to Cart
          </span>
        }
        className="mt-3 flex w-full items-center justify-center rounded-full bg-[#004328] px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
      />
    </div>
  );
}
