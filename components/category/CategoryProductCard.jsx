// components/category/CategoryProductCard.jsx
// Used by both the featured row and the filter grid (variant switches the layout).
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

export default function CategoryProductCard({ product, accent, variant = "grid" }) {
  const image = product.image || product.colors?.[0]?.images?.[0] || "/placeholder.png";
  const badge = getBadge(product);

  return (
    <div className="flex min-w-0 flex-col">
      {/* TODO: design — variant === "featured" vs "grid" */}
      <Link
        href={`/products/${product._id}`}
        className="relative block aspect-square overflow-hidden rounded-3xl"
        style={{ backgroundColor: accent }}
      >
        {badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-[10px] font-semibold">
            {badge}
          </span>
        )}
        <Image src={image} alt={product.name} fill className="object-contain p-6" />
      </Link>

      <div className="mt-3 flex min-w-0 items-start justify-between gap-2">
        {/* One line with an ellipsis; full name shows on hover */}
        <Link
          href={`/products/${product._id}`}
          title={product.name}
          className="min-w-0 flex-1 truncate text-sm font-medium"
        >
          {product.name}
        </Link>
        {variant === "featured" && <span className="shrink-0 text-sm font-semibold">{formatPrice(product.price)}</span>}
      </div>

      {variant === "grid" && (
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      )}

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
        className="mt-3 flex w-full items-center justify-center rounded-full bg-[#004328] px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
      />
    </div>
  );
}
