"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatAmount } from "@/lib/utils";

function RelatedProductsSection({ relatedProducts, product }) {
  if (relatedProducts.length === 0) return null;

  return (
    <section className="mt-14 border-dashed border-b-3 border-gray-200 md:pb-20 pt-10 px-1">
      <div className="flex max-sm:px-5 items-center justify-between mb-5">
        <h2 className="font-oswald font-medium text-2xl md:text-3xl">
          Related Product
        </h2>
        <Link
          href={`/products?categories=${encodeURIComponent(product.category || "")}`}
          className="text-sm text-filgreen font-medium hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {relatedProducts.map((rp) => (
          <Link
            key={rp._id}
            href={`/products/${rp._id}`}
            className="snap-start flex-shrink-0 w-[190px] sm:w-[210px] rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="w-full aspect-square bg-gray-50 overflow-hidden">
              <Image
                src={rp.image}
                alt={rp.name}
                width={210}
                height={210}
                className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                sizes="(max-width: 640px) 190px, 210px"
              />
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1 leading-snug">
                {rp.name}
              </p>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                {rp.originalPrice && (
                  <span className="text-[11px] text-gray-400 line-through">
                    {formatAmount(rp.originalPrice)}
                  </span>
                )}
                <span className="text-sm font-semibold text-gray-900">
                  {formatAmount(rp.price)}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <svg
                  className="text-orange-400 w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-[11px] font-medium text-gray-700">
                  {(rp.averageRating || 0).toFixed(1)}
                </span>
                {rp.soldCount > 0 && (
                  <span className="text-[11px] text-gray-400 ml-1">
                    {rp.soldCount} Sold
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RelatedProductsSection;