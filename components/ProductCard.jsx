"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatAmount } from "@/lib/utils";
import AddToCartButton from "./AddToCart";
import WishlistButton from "@/components/WishlistButton";
import { useGAEvent } from "@/hooks/useGAEvent";
import { ProductImage } from "@/components/ProductImage";

const ProductCard = ({
  productName,
  productImage,
  productPrice,
  originalPrice,
  productCategory,
  product,
  productAverageRating,
  productRatingCount,
  className = "",
}) => {
  const { trackEvent } = useGAEvent();

  const handleProductClick = () => {
    trackEvent("select_item", {
      items: [
        {
          item_id: product._id,
          item_name: product.name,
          price: product.price,
          category: productCategory,
        },
      ],
    });
  };

  return (
    <Link
      href={`/products/${product._id}`}
      onClick={handleProductClick}
      className={`relative flex flex-col justify-between rounded-md w-full max-w-[163px] sm:max-w-[273px] ${className}`}
    >
      {/* Background arch */}
      <div className="bottom-0 left-0 absolute bg-bright rounded-tl-[200px] rounded-tr-[200px] rounded-bl-md rounded-br-md w-full h-[75%] sm:h-[80%]" />

      {/* Tags + Wishlist */}
      <div className="xs:top-4 z-30 relative flex justify-between items-center xs:mr-4">
        {product.tag && (
          <div className="relative">
            {product.tag === "fast" && (
              <>
                <Image src="/redtag.png" alt="Fast tag" width={60} height={24} />
                <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">
                  Selling fast
                </span>
              </>
            )}
            {product.tag === "new" && (
              <>
                <Image src="/blacktag.png" alt="New tag" width={60} height={24} />
                <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">
                  New
                </span>
              </>
            )}
            {product.tag === "discount" && (
              <>
                <Image src="/bluetag.png" alt="Discount tag" width={60} height={24} />
                <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">
                  Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </>
            )}
            {product.tag === "hurry" && (
              <>
                <Image src="/orangetag.png" alt="Hurry tag" width={60} height={24} />
                <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">
                  Hurry 2 Left
                </span>
              </>
            )}
          </div>
        )}
        {!product.tag && <div />}
        <WishlistButton className="relative" product={product} />
      </div>

      {/* Image — parent defines the box, no layout shift */}
      <div className="relative mx-auto w-[120px] sm:w-[200px] h-[120px] sm:h-[200px]">
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 120px, 200px"
        />
      </div>

      {/* Product Details */}
      <div className="z-20 mt-[14px] sm:mt-[4px]">
        <div className="flex justify-between px-[10px] sm:px-4">
          <p className="font-normal text-[#767676] text-[10px] sm:text-xs">
            {productCategory}
          </p>
          <div className="flex gap-0.5">
            <Image src="/star.png" width={16} height={16} alt="star" />
            <p className="text-[#1c1b1f] text-[10px] sm:text-xs">{productAverageRating}</p>
            <p className="text-[#1c1b1f] text-[10px] sm:text-xs">({productRatingCount})</p>
          </div>
        </div>

        <h3 className="my-2 sm:mt-3 px-[10px] sm:px-4 font-roboto sm:font-oswald font-medium text-sm sm:text-base line-clamp-1">
          {productName}
        </h3>

        {/* Price + Cart — CSS only, no JS screen detection */}
        <div className="relative mx-2 sm:mx-4 mt-1 sm:mt-8 pb-2 sm:pb-6">
          <span className="flex flex-wrap gap-2 sm:gap-3">
            <p className="font-medium text-[#1c1b1f] text-xs sm:text-base">
              {formatAmount(productPrice)}
            </p>
            {product.originalPrice > 0 && (
              <p className="text-[#767676] text-xs sm:text-base line-through">
                {formatAmount(originalPrice)}
              </p>
            )}
          </span>

          {/* Mobile: always visible. Desktop: hover reveal */}
          <div className="mt-2 sm:mt-0 sm:absolute sm:top-0 sm:left-0 sm:opacity-0 sm:hover:opacity-100 w-full sm:transition-opacity sm:duration-300">
            <AddToCartButton
              className={`flex justify-center ${
                product.availability ? "bg-black" : "bg-gray-300 cursor-not-allowed"
              } py-2 rounded-md w-full text-white text-xs text-center`}
              product={product}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;