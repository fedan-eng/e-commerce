"use client";

import React, { useEffect, useState } from "react";
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
  const [isHovered, setIsHovered] = useState(false);
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

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Link
      href={`/products/${product._id}`}
      onClick={handleProductClick}
      // Changed to w-full max-w to allow it to shrink on tiny screens if needed
      className={`relative flex flex-col justify-between rounded-md w-full max-w-[163px] sm:max-w-[273px] ${className}`}
    >
      {/* 
        FIX 1: Made the background arch responsive. 
        Replaced fixed pixels (w-[163px]) with w-full and h-[70%] so it scales with the card.
      */}
      <div className="bottom-0 left-0 absolute bg-bright rounded-tl-[200px] rounded-tr-[200px] rounded-bl-md rounded-br-md w-full h-[75%] sm:h-[80%]"></div>

      <div className="xs:top-4 z-30 relative flex justify-between items-center xs:mr-4">
        {product.tag && (
          <div className="relative">
            {/* fast */}
            {product.tag === "fast" && (
              <>
                <Image src="/redtag.png" alt="Fast tag" width={60} height={24} />
                <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">
                  Selling fast
                </span>
              </>
            )}

            {/* new */}
            {product.tag === "new" && (
              <>
                <Image src="/blacktag.png" alt="New tag" width={60} height={24} />
                <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">
                  New
                </span>
              </>
            )}
            {/* discount */}
            {product.tag === "discount" && (
              <>
                <Image src="/bluetag.png" alt="Discount tag" width={60} height={24} />
                <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">
                  Save{" "}
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}
                  %
                </span>
              </>
            )}

            {/* hurry */}
            {product.tag === "hurry" && (
              <>
                <Image src="/orangetag.png" alt="New tag" width={60} height={24} />
                <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">
                  Hurry 2 Left
                </span>
              </>
            )}
          </div>
        )}
        {!product.tag && <div></div>}
        
        {/* Wishlist Button */}
        <WishlistButton className="relative" product={product} />
      </div>

      {/* 
  No wrapper div needed anymore.
  ProductImage IS the wrapper. 
  Give it fixed dimensions via containerClassName.
*/}
<ProductImage
  src={product.image}
  alt={product.name}
  fill
  sizes="(max-width: 640px) 120px, 200px"
  containerClassName="mx-auto w-[120px] sm:w-[200px] h-[120px] sm:h-[200px]"
/>

      {/* PRODUCT DETAILS */}
      <div className="z-20 mt-[14px] sm:mt-[4px]">
        <div className="flex justify-between px-[10px] sm:px-4">
          <p className="font-normal text-[#767676] text-[10px] sm:text-xs">
            {productCategory}
          </p>

          <div className="flex gap-0.5">
            <Image src="/star.png" width={16} height={16} alt="star" />
            <p className="text-[#1c1b1f] text-[10px] sm:text-xs">
              {productAverageRating}
            </p>
            <p className="text-[#1c1b1f] text-[10px] sm:text-xs">
              ({productRatingCount})
            </p>
          </div>
        </div>

        <h3 className="my-2 sm:mt-3 px-[10px] sm:px-4 font-roboto sm:font-oswald font-medium text-sm sm:text-base text-ellipsis line-clamp-1">
          {productName}
        </h3>

        {/* Price / Add To Cart */}
        {isLargeScreen && (
          <div className="relative mx-4 mt-8 pb-4 sm:pb-6 h-[40px]">
            <span className="flex gap-3">
              <p className="font-medium text-[#1c1b1f] text-base">
                {formatAmount(productPrice)}
              </p>

              {product.originalPrice > 0 && (
                <p className="text-[#767676] text-base line-through">
                  {formatAmount(originalPrice)}
                </p>
              )}
            </span>

            <div className="top-0 left-0 absolute opacity-0 hover:opacity-100 w-full transition-opacity duration-300">
              <AddToCartButton
                className={`flex justify-center ${
                  product.availability ? "bg-black" : "bg-gray-300 cursor-not-allowed"
                } py-2 rounded-md w-full text-white text-xs text-center`}
                product={product}
              />
            </div>
          </div>
        )}

        {/* small screen - show price and add to cart always */}
        {!isLargeScreen && (
          <div className="relative mx-2 mt-1 pb-2 sm:pb-6">
            <span className="flex flex-wrap gap-2">
              <p className="font-medium text-[#1c1b1f] text-xs">
                {formatAmount(productPrice)}
              </p>

              {product.originalPrice > 0 && (
                <p className="text-[#767676] text-xs line-through">
                  {formatAmount(originalPrice)}
                </p>
              )}
            </span>

            <div className="mt-2 w-full">
              <AddToCartButton
                className={`flex justify-center ${
                  product.availability ? "bg-black" : "bg-gray-300 cursor-not-allowed"
                } py-2 rounded-md w-full text-white text-xs text-center`}
                product={product}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;