// app/cart/page.jsx
"use client";

import { useState, useEffect } from "react";
import { formatAmount } from "lib/utils";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQuantity } from "@/store/features/cartSlice";
import Link from "next/link";
import Image from "next/image";
import { MdOutlineDelete } from "react-icons/md";
import { HiMinus, HiPlus } from "react-icons/hi";
import CheckoutModal from "@/components/CheckoutModal";

const CartPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [hasMounted, setHasMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleRemove = (id, color) => {
    dispatch(removeFromCart({ _id: id, color }));
  };

  const handleQuantityChange = (id, color, value) => {
    const qty = parseInt(value);
    if (qty >= 1) {
      dispatch(updateQuantity({ _id: id, color, quantity: qty }));
    }
  };

  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (!hasMounted) return null;

  return (
    <>
      {showModal && <CheckoutModal onClose={() => setShowModal(false)} />}

      <div className="mx-auto mt-6 w-full max-w-[1140px]">
        <h1 className="bg-white mx-2 my-4 font-oswald font-medium text-2xl s:text-4xl">
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-[#f6f6f6] mx-2 mb-20 p-2 xxs:p-6 rounded-md">
            <h3 className="font-oswald text-xl s:text-2xl">
              Your FIL Cart is Feeling Light...
            </h3>
            <p className="my-4">
              Your cart is empty, but your next favorite gadget is just a click away.
            </p>
            <div>
              <h3 className="font-medium">Jump start Your Shopping:</h3>
              <div className="flex gap-2">
                <p>⚡</p>
                <p className="text-sm">
                  Explore Latest Deals - Power banks, chargers, accessories & more!
                </p>
              </div>
              <div className="flex gap-2">
                <p>⚡</p>
                <p className="text-sm">
                  Check your wishlist - Your saved items are waiting.
                </p>
              </div>
              <div className="flex gap-2">
                <p>⚡</p>
                <p className="text-sm">
                  Exclusive Member Deals - Unlock your special offers
                </p>
              </div>
            </div>
            <p className="my-6 text-sm">
              Need recommendations? Check{" "}
              <Link href="/products?specials=isWhatsNew" className="text-filgreen underline">
                New Arrivals
              </Link>
            </p>
            <h3 className="mb-10 font-medium text-sm">Think Quality, Think FIL</h3>
            <Link href="/products">
              <button className="shadow-button buttons">Start Shopping Now</button>
            </Link>
          </div>
        ) : (
          <div className="nav:flex justify-center items-start gap-2 lg:gap-4 mx-2 mb-20">
            {/* ── CART ITEMS ── */}
            <div className="px-2 lx:px-4 py-4 md:pb-[88px] border border-[#e3e3e3] rounded-md w-full nav:min-w-[500px] nav:max-w-[755px]">
              {/* Header row */}
              <div className="items-justify-center gap-2 lg:gap-4 grid grid-cols-[minmax(100px,1fr)_120px_20px] s:grid-cols-[20px_minmax(100px,1fr)_40px_60px_20px] sm:grid-cols-[20px_minmax(160px,1fr)_80px_70px_60px_20px] pb-2 border-[#e5e5e5] border-b">
                <span className="max-s:hidden min-w-0 font-medium text-sm text-center">#</span>
                <span className="max-s:hidden min-w-0 font-medium text-sm">Product</span>
                <span className="max-s:hidden min-w-0 font-medium text-sm">Qty</span>
                <span className="max-sm:hidden min-w-0 font-medium text-sm">Unit Price</span>
                <span className="min-w-0 font-medium text-sm">
                  <span className="s:hidden">Subtotal - ₦{subTotal.toLocaleString()}</span>
                  <span className="max-s:hidden">Total</span>
                </span>
                <span className="min-w-0 font-medium text-sm"></span>
              </div>

              {/* Cart items */}
              {cartItems.map((item, index) => (
                <>
                  {/* Desktop row */}
                  <div
                    key={item._id}
                    className="items-center max-s:hidden gap-2 lg:gap-4 grid grid-cols-[minmax(80px,1fr)_60px_20px] s:grid-cols-[20px_minmax(80px,1fr)_80px_60px_20px] sm:grid-cols-[20px_minmax(140px,1fr)_120px_70px_60px_20px] py-2 text-sm sm:text-base"
                  >
                    <span className="max-s:hidden min-w-0 text-sm text-center">{index + 1}</span>
                    <a href={`/products/${item._id}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex flex-shrink-0 justify-center items-center bg-[#f6f6f6] rounded-md w-[50px] xxs:w-[65px] h-[50px] xxs:h-[65px]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-[40px] xxs:w-[56px] h-[40px] xxs:h-[56px] object-contain"
                          />
                        </div>
                        <div>
                          <p className="min-w-0 font-oswald text-sm line-clamp-1">{item.name}</p>
                          <p className="text-[#767676] text-xs">{item.category}</p>
                          {item.color && <p className="text-xs">Color: {item.color}</p>}
                        </div>
                      </div>
                    </a>

                    <div className="max-s:hidden flex items-center gap-1 border border-[#d9d9d9] rounded-md w-fit">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.color, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex justify-center cursor-pointer items-center px-2 py-1 text-dark hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-md"
                      >
                        <HiMinus className="text-sm" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item._id, item.color, Math.max(1, Number(e.target.value)))
                        }
                        className="px-1 sm:px-2 py-1 border-x border-[#d9d9d9] outline-0 w-[40px] sm:w-[50px] text-center text-dark text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="1"
                      />
                      <button
                        onClick={() => handleQuantityChange(item._id, item.color, item.quantity + 1)}
                        className="flex justify-center cursor-pointer items-center px-2 py-1 text-dark hover:bg-gray-100 transition-colors rounded-r-md"
                      >
                        <HiPlus className="text-sm" />
                      </button>
                    </div>

                    <span className="max-sm:hidden min-w-0 text-dark text-sm">
                      {formatAmount(item.price)}
                    </span>
                    <span className="min-w-0 text-dark text-sm">
                      {formatAmount(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => handleRemove(item._id, item.color)}
                      className="flex justify-center min-w-0 text-red-500 hover:text-red-700 text-xl"
                    >
                      <MdOutlineDelete />
                    </button>
                  </div>

                  {/* Mobile row */}
                  <div className="flex flex-col my-5 s:hidden">
                    <a href={`/products/${item._id}`}>
                      <div className="flex flex-row gap-5">
                        <div className="flex flex-shrink-0 justify-center items-center bg-[#f6f6f6] rounded-md w-[50px] xxs:w-[65px] h-[50px] xxs:h-[65px]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-[40px] xxs:w-[56px] h-[40px] xxs:h-[56px] object-contain"
                          />
                        </div>
                        <div>
                          <p className="min-w-0 font-oswald text-sm line-clamp-1">{item.name}</p>
                          <p className="text-[#767676] text-xs">{item.category}</p>
                          {item.color && <p className="text-xs">Color: {item.color}</p>}
                          <span className="min-w-0 text-dark text-sm">{formatAmount(item.price)}</span>
                        </div>
                      </div>
                    </a>
                    <div className="flex my-5 flex-row items-center justify-between">
                      <button
                        onClick={() => handleRemove(item._id, item.color)}
                        className="flex items-center justify-center min-w-0 text-red-500 hover:text-red-700 text-xl"
                      >
                        <MdOutlineDelete />
                        <span className="text-red text-sm">Remove</span>
                      </button>
                      <div className="flex items-center gap-1 border border-[#d9d9d9] rounded-md w-[70%]">
                        <button
                          onClick={() =>
                            handleQuantityChange(item._id, item.color, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="flex justify-center w-[30%] cursor-pointer items-center px-2 py-1 text-dark hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-md"
                        >
                          <HiMinus className="text-sm" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item._id, item.color, Math.max(1, Number(e.target.value)))
                          }
                          className="px-1 sm:px-2 py-1 border-x border-[#d9d9d9] outline-0 w-[40%] text-center text-dark text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="1"
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(item._id, item.color, item.quantity + 1)
                          }
                          className="flex justify-center w-[30%] cursor-pointer items-center px-2 py-1 text-dark hover:bg-gray-100 transition-colors rounded-r-md"
                        >
                          <HiPlus className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ))}
            </div>

            {/* ── CART SUMMARY ── */}
            <div className="max-nav:flex max-sm:flex-col gap-2 items-start order-2 max-nav:mt-2 w-full nav:max-w-[369px]">
              <div className="p-2 md:p-4 border border-[#e3e3e3] rounded-md w-full">
                <h2 className="mb-4 font-oswald font-medium text-2xl">Cart Totals</h2>

                <div className="mt-[13px]">
                  <div className="flex justify-between items-center mb-[13px] py-2">
                    <p className="text-dark text-sm">
                      Subtotal · {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                    </p>
                    <p className="font-medium text-dark text-sm">{formatAmount(subTotal)}</p>
                  </div>
                  <div className="flex justify-between items-center mb-[13px] py-4 border-[#d9d9d9] border-t">
                    <p className="font-medium text-dark">Total</p>
                    <p className="font-medium text-dark">{formatAmount(subTotal)}</p>
                  </div>
                </div>

                <p className="text-xs text-[#767676] mb-4">
                  Delivery fees and discounts will be applied at checkout.
                </p>

                <div className="flex justify-center items-center gap-2 xxs:gap-4 py-4">
                  <Link
                    href="/products"
                    className="px-2 sm:px-6 py-3 border border-[#d9d9d9] rounded-md font-roboto font-medium text-dark text-sm max-xxs:whitespace-nowrap"
                  >
                    Back to Shopping
                  </Link>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-filgreen px-2 sm:px-6 py-3 rounded-md font-roboto font-medium text-dark text-xs sm:text-sm max-xxs:whitespace-nowrap"
                  >
                    Checkout
                  </button>
                </div>
              </div>

              {/* We Accept */}
              <div className="mt-4 p-4 border border-[#e3e3e3] rounded-md">
                <p className="mb-4 font-oswald font-medium text-2xl capitalize">WE ACCEPT</p>
                <div className="flex gap-3 items-center">
                  <div className="w-[88px] h-[32px]">
                    <Image
                      width={88}
                      height={32}
                      src="/paystack.png"
                      alt="paystack"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;