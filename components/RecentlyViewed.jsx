"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRecentlyViewed } from "@/store/features/recentlyViewedSlice";
import Link from "next/link";
import Image from "next/image";
import { formatAmount } from "lib/utils";
import AddToCartButton from "@/components/AddToCart";
import WishlistButton from "@/components/WishlistButton";
import Header from "@/components/Header";

export default function RecentlyViewed() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.recentlyViewed.items);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("recentlyViewed");
    if (stored) {
      dispatch(setRecentlyViewed(JSON.parse(stored)));
    }
  }, [dispatch]);

  if (!items.length) return null;

  return (
    <div className="mt-8">
      <Header
        header="Recently Viewed"
        imageClassName="order-2"
        className="justify-end mt-12"
      />
      <div className="mx-auto overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar">
        <div className="inline-flex gap-4 px-4 sm:px-10 md:px-20 pt-6">
          {items.map((product) => (
            <div
              key={product._id}
              className="relative flex flex-col justify-between bg-[#f6f6f6] rounded-md w-[45%] box:w-[273px] mid:w-[240px] s:w-[46%] sm:w-[273px] md:h-[351px]"
            >
              <Link
                className="relative"
                href={`/products/${product._id}`}
              >
                {/* Tag and wishlistbutton */}
                <div className="xs:top-4 relative flex justify-between items-center xs:mr-4">
                  {product.tag && (
                    <div className="z-30 relative">
                      {/* fast */}
                      {product.tag === "fast" && (
                        <>
                          <img
                            src="/redtag.png"
                            alt="Fast tag"
                          />
                          <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">
                            Selling fast
                          </span>
                        </>
                      )}

                      {/* new */}
                      {product.tag === "new" && (
                        <>
                          <img
                            src="/blacktag.png"
                            alt="New tag"
                          />
                          <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">
                            New
                          </span>
                        </>
                      )}
                      {/* discount */}
                      {product.tag === "discount" && (
                        <>
                          <img
                            src="/bluetag.png"
                            alt="Discount tag"
                          />
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
                          <img
                            src="/orangetag.png"
                            alt="New tag"
                          />
                          <span className="top-1/2 left-0 absolute pl-2 font-light text-white text-xs leading-[0%] -translate-y-1/2">
                            Hurry 2 Left
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {!product.tag && <div></div>}
                  {/* Wishlist Button */}
                  <WishlistButton
                    className="relative"
                    product={product}
                  />
                </div>

                {/* PRODUCT IMAGE */}
                <div className="relative mx-auto px-5 sm:px-10 w-[80px] s:w-[100px] sm:w-[150px] max-w-[300px] cat:max-w-[241px] h-[100px] s:h-[150px] sm:h-[200px]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="absolute mx-auto w-full h-full object-contain"
                  />
                </div>

                {/* PRODUCT DETAILS */}
                <div className="z-20 mt-5 sm:mt-[5px]">
                  <div className="flex justify-between px-[10px] sm:px-4">
                    <p className="font-normal text-[#767676] text-xs sm:text-xs">
                      {product.category || "Uncategorized"}
                    </p>

                    <div className="flex gap-0.5">
                      <img
                        src="/star.png"
                        alt="Star"
                      />
                      <p className="text-[#1c1b1f] text-[10px] sm:text-xs">
                        {product.averageRating}
                      </p>
                      <p className="text-[#1c1b1f] text-[10px] sm:text-xs">
                        ({product.ratingsCount || 0})
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-2 px-[10px] sm:px-4 font-oswald font-medium text-base text-ellipsis line-clamp-1">
                    {product.name}
                  </h3>

                  {/* Price / Add To Cart */}
                  {isLargeScreen && (
                    <div className="relative mx-4 mt-8 pb-4 sm:pb-6 h-[40px]">
                      <span className="flex gap-3">
                        <p className="font-medium text-[#1c1b1f] text-base">
                          {formatAmount(product.price)}
                        </p>

                        {product.originalPrice > 0 && (
                          <p className="text-[#767676] text-base line-through">
                            {formatAmount(product.originalPrice)}
                          </p>
                        )}
                      </span>

                      <div className="top-0 left-0 absolute opacity-0 hover:opacity-100 w-full transition-opacity duration-300">
                        <AddToCartButton
                          className="flex justify-center bg-black py-2 rounded-md w-full text-white text-xs text-center"
                          product={product}
                        />
                      </div>
                    </div>
                  )}

                  {/* small screen - show price and add to cart always */}
                  {!isLargeScreen && (
                    <div className="relative mx-2 mt-4 pb-4 sm:pb-6">
                      <span className="flex gap-3">
                        <p className="font-medium text-[#1c1b1f] text-sm xs:text-base">
                          {formatAmount(product.price)}
                        </p>

                        {product.originalPrice > 0 && (
                          <p className="text-[#767676] text-sm xs:text-base line-through">
                            {formatAmount(product.originalPrice)}
                          </p>
                        )}
                      </span>

                      <div className="mt-4 w-full">
                        <AddToCartButton
                          className="flex justify-center bg-black py-2 rounded-md w-full text-white text-xs text-center"
                          product={product}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
