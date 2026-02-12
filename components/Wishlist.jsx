"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { formatAmount } from "lib/utils";
import AddToCartButton from "./AddToCart";
import { removeFromWishlist } from "@/store/features/wishlistSlice";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const wishlist = useSelector((state) => state.wishlist.items);
  const dispatch = useDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // skeleton placeholder
    return <div className="mx-auto p-6 max-w-3xl text-center">Loading...</div>;
  }

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto p-6 max-w-3xl text-center">
        <h2 className="mb-4 font-semibold text-2xl">
          Your Wishlist is Empty ❤️
        </h2>
        <p className="text-gray-600">Start adding products to your wishlist!</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-10 px-2 nav:px-6 border border-[#e5e5e5] rounded-md w-full max-w-[1140px]">
      <div className="justify-center gap-4">
        <div className="order-1 pb-4 sm:pb-10 rounded-md w-full max-w-[851px]">
          <div className="flex justify-between items-center mb-4 sm:mb-8 border-[#e3e3e3] border-b">
            <h2 className="py-2 s:py-4 font-oswald text-lg s:text-2xl">
              Wishlist
            </h2>
            <span className="text-[#767676] text-xs">
              {wishlist.length} results
            </span>
          </div>

          {/* table headers */}
          <div className="items-justify-center gap-2 lg:gap-4 grid grid-cols-[minmax(0,1fr)_80px_20px] nav:grid-cols-[20px_minmax(0,1fr)_70px_120px_20px] s:grid-cols-[minmax(0,1fr)_70px_80px_20px] bg-[#f2f2f2] p-2 rounded-md">
            <span className="max-nav:hidden min-w-0 font-medium text-sm text-center">
              #
            </span>
            <span className="min-w-0 font-medium text-sm">PRODUCT</span>
            <span className="max-s:hidden min-w-0 font-medium text-sm text-center whitespace-nowrap">
              UNIT PRICE
            </span>
            <span className="min-w-0 font-medium text-sm text-center">
              ACTION
            </span>
            <span className="min-w-0 font-medium text-sm"></span>
          </div>

          {/* wishlist items */}
          {wishlist.map((product, index) => (
            <div
              key={product._id || index}
              className="items-center gap-2 lg:gap-4 grid grid-cols-[minmax(0,1fr)_80px_20px] nav:grid-cols-[20px_minmax(0,1fr)_70px_120px_20px] s:grid-cols-[minmax(0,1fr)_70px_80px_20px] bg-[#fafafa] my-2 p-2 py-3 rounded-md text-sm sm:text-base"
            >
              <span className="max-nav:hidden min-w-0 text-sm text-center">
                {index + 1}
              </span>

              <div className="flex items-center gap-2 min-w-0">
                <div className="flex flex-shrink-0 justify-center items-center bg-[#f6f6f6] rounded-md w-[50px] s:w-[72px] h-[50px] s:h-[72px]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-[40px] s:w-[56px] h-[40px] s:h-[56px] object-contain"
                  />
                </div>
                <div>
                  <p className="min-w-0 font-oswald text-sm line-clamp-1">
                    {product.name}
                  </p>
                  <p className="my-1 text-[#767676] text-xs">Wearables</p>
                  <p className="text-[#007c42] text-xs">In Stock</p>
                </div>
              </div>

              <div className="max-s:hidden text-dark text-sm text-center">
                {formatAmount(product.price)}
              </div>

              <AddToCartButton
                className="bg-filgreen nav:px-4 py-2 rounded-md w-full font-medium text-dark text-xs nav:text-sm cursor-pointer"
                product={product}
              />

              <button
                onClick={() => dispatch(removeFromWishlist(product._id))}
                className="flex justify-center text-red-500 text-sm"
              >
                <RiDeleteBin6Line />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
