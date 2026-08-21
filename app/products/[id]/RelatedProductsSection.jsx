"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatAmount } from "@/lib/utils";

function RelatedProductsSection({ relatedProducts, product }) {
  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <section className="mt-10 border-t border-b border-dashed border-gray-200 py-6 md:py-10 px-4 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-oswald font-bold text-xl md:text-2xl text-gray-900 tracking-tight">
          Related Product
        </h2>
        <Link
          href={`/products?categories=${encodeURIComponent(
            product?.category || ""
          )}`}
          className="text-xs md:text-sm text-gray-600 font-medium underline hover:text-black transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Product Grid: 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-6 sm:gap-4">
        {relatedProducts.map((rp) => (
          <Link
            key={rp._id}
            href={`/products/${rp._id}`}
            className="group flex flex-col"
          >
            {/* Image Container */}
            <div className="w-full aspect-[4/5] sm:aspect-square bg-[#f4f4f4] rounded-xl overflow-hidden flex items-center justify-center p-3 mb-2.5">
              <Image
                src={rp.image}
                alt={rp.name}
                width={200}
                height={200}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col flex-1 px-0.5">
              {/* Product Title */}
              <p className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1.5">
                {rp.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 mb-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-gray-900">
                  {formatAmount(rp.price)}
                </span>
                {rp.originalPrice && (
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                    {formatAmount(rp.originalPrice)}
                  </span>
                )}
              </div>

              {/* Rating & Sold Count */}
              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-auto">
                <svg
                  className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-semibold text-gray-800">
                  {(rp.averageRating || 4.5).toFixed(1)}
                </span>
                <span className="text-gray-300 mx-0.5">·</span>
                <span className="text-gray-500">
                  {rp.soldCount ? `${rp.soldCount} Sold` : "120 Sold"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default memo(RelatedProductsSection);