// app/cart/page.jsx
"use client";
import {useState, useEffect} from "react";
import {formatAmount} from "lib/utils";
import {useSelector, useDispatch} from "react-redux";
import {removeFromCart, updateQuantity} from "@/store/features/cartSlice";
import Link from "next/link";
import Image from "next/image";
import {MdOutlineDelete} from "react-icons/md";
import {HiMinus, HiPlus} from "react-icons/hi";
import CheckoutModal from "@/components/CheckoutModal";

const CartPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [hasMounted, setHasMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleRemove = (id, color) => {
    dispatch(removeFromCart({_id: id, color}));
  };

  const handleQuantityChange = (id, color, value) => {
    const qty = parseInt(value);
    if (qty >= 1) {
      dispatch(updateQuantity({_id: id, color, quantity: qty}));
    }
  };

  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  if (!hasMounted) return null;

  return (
    <>
      {showModal && <CheckoutModal onClose={() => setShowModal(false)} />}

      <div className="mx-auto mt-6 w-full max-w-[1240px]">
        {cartItems.length > 0 && (
          <h1 className="bg-white mx-2 my-4 font-oswald font-medium text-2xl s:text-4xl">
          Your goodies are waiting for you. Complete your checkout now.
        </h1>
      )}

        {cartItems.length === 0 ? (
          <div className="bg-[#f6f6f6] mx-2 mb-20 p-2 xxs:p-6 rounded-md">
            <h3 className="font-oswald text-xl s:text-2xl">
              Your FIL Cart is Feeling Light...
            </h3>
            <p className="my-4">
              Your cart is empty, but your next favorite gadget is just a click
              away.
            </p>
            <div>
              <h3 className="font-medium">Jump start Your Shopping:</h3>
              <div className="flex gap-2">
                <p>⚡</p>
                <p className="text-sm">
                  Explore Latest Deals - Power banks, chargers, accessories &
                  more!
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
              <Link
                href="/products?specials=isWhatsNew"
                className="text-filgreen underline"
              >
                New Arrivals
              </Link>
            </p>
            <h3 className="mb-10 font-medium text-sm">
              Think Quality, Think FIL
            </h3>
            <Link href="/products">
              <button className="shadow-button buttons">
                Start Shopping Now
              </button>
            </Link>
          </div>
        ) : (
          <div className="nav:flex justify-center items-start gap-4 mx-2 mb-20">
  {/* ── CART ITEMS ── */}
  <div className="px-4 lg:px-6 py-4 md:pb-[88px]  w-full nav:min-w-[500px] nav:max-w-[755px]">
    {/* Header row - hidden on mobile */}
    <div className="hidden sm:grid items-center gap-4 grid-cols-[minmax(200px,1fr)_140px_100px_100px_40px] pb-4 border-[#e5e5e5] border-b">
      <span className="min-w-0 font-medium text-xs text-[#767676] tracking-wider uppercase">
        Product
      </span>
      <span className="min-w-0 font-medium text-xs text-[#767676] tracking-wider uppercase text-center">
        Quantity
      </span>
      <span className="min-w-0 font-medium text-xs text-[#767676] tracking-wider uppercase text-center">
        Unit Price
      </span>
      <span className="min-w-0 font-medium text-xs text-[#767676] tracking-wider uppercase text-center">
        Total
      </span>
      <span className="min-w-0"></span>
    </div>

    {/* Mobile Subtotal Header */}
    <div className="sm:hidden pb-4 border-[#e5e5e5] border-b">
      <span className="font-medium text-xs text-[#767676] tracking-wider uppercase">
        Subtotal — ₦{subTotal.toLocaleString()}
      </span>
    </div>

    {/* Cart items */}
    {cartItems.map((item) => (
      <div key={`${item._id}-${item.color || "default"}`}>
        {/* Desktop row */}
        <div className="hidden sm:grid items-center gap-4 grid-cols-[minmax(200px,1fr)_140px_100px_100px_40px] py-6 border-b border-[#e5e5e5] last:border-b-0">
          <a href={`/products/${item._id}`}>
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex flex-shrink-0 justify-center items-center bg-[#f6f6f6] rounded-md w-[70px] h-[70px]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-[56px] h-[56px] object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="min-w-0 font-medium text-sm text-dark line-clamp-2">
                  {item.name}
                </p>
                {item.color && (
                  <p className="text-[#767676] text-xs mt-1">{item.color}</p>
                )}
              </div>
            </div>
          </a>

          <div className="flex items-center justify-center gap-1 border border-[#d9d9d9] rounded-md w-fit mx-auto">
            <button
              onClick={() =>
                handleQuantityChange(item._id, item.color, item.quantity - 1)
              }
              disabled={item.quantity <= 1}
              className="flex justify-center cursor-pointer items-center px-3 py-2 text-dark hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-md"
            >
              <HiMinus className="text-sm" />
            </button>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                handleQuantityChange(
                  item._id,
                  item.color,
                  Math.max(1, Number(e.target.value))
                )
              }
              className="py-2 outline-0 w-[40px] text-center text-dark text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="1"
            />
            <button
              onClick={() =>
                handleQuantityChange(item._id, item.color, item.quantity + 1)
              }
              className="flex justify-center cursor-pointer items-center px-3 py-2 text-dark hover:bg-gray-100 transition-colors rounded-r-md"
            >
              <HiPlus className="text-sm" />
            </button>
          </div>

          <span className="min-w-0 text-dark text-sm font-medium text-center">
            {formatAmount(item.price)}
          </span>
          <span className="min-w-0 text-dark text-sm font-medium text-center">
            {formatAmount(item.price * item.quantity)}
          </span>
          <button
            onClick={() => handleRemove(item._id, item.color)}
            className="flex justify-center items-center text-red-500 hover:text-red-700 text-xl border border-red-300 rounded-md w-9 h-9 hover:bg-red-50 transition-colors"
          >
            <MdOutlineDelete />
          </button>
        </div>

        {/* Mobile row */}
        <div className="flex flex-col py-5 sm:hidden border-b border-[#e5e5e5] last:border-b-0">
          <a href={`/products/${item._id}`}>
            <div className="flex flex-row gap-4">
              <div className="flex flex-shrink-0 justify-center items-center bg-[#f6f6f6] rounded-md w-[65px] h-[65px]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-[56px] h-[56px] object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="min-w-0 font-medium text-sm text-dark line-clamp-2">
                  {item.name}
                </p>
                {item.color && (
                  <p className="text-[#767676] text-xs mt-1">{item.color}</p>
                )}
                <span className="text-dark text-sm font-medium block mt-1">
                  {formatAmount(item.price)}
                </span>
              </div>
            </div>
          </a>
          <div className="flex mt-4 flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1 border border-[#d9d9d9] rounded-md flex-1">
              <button
                onClick={() =>
                  handleQuantityChange(item._id, item.color, item.quantity - 1)
                }
                disabled={item.quantity <= 1}
                className="flex justify-center flex-1 cursor-pointer items-center px-3 py-2 text-dark hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-md"
              >
                <HiMinus className="text-sm" />
              </button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(
                    item._id,
                    item.color,
                    Math.max(1, Number(e.target.value))
                  )
                }
                className="py-2 outline-0 w-[50px] text-center text-dark text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
              />
              <button
                onClick={() =>
                  handleQuantityChange(item._id, item.color, item.quantity + 1)
                }
                className="flex justify-center flex-1 cursor-pointer items-center px-3 py-2 text-dark hover:bg-gray-100 transition-colors rounded-r-md"
              >
                <HiPlus className="text-sm" />
              </button>
            </div>
            <button
              onClick={() => handleRemove(item._id, item.color)}
              className="flex justify-center items-center text-red-500 hover:text-red-700 text-xl border border-red-300 rounded-md w-10 h-10 hover:bg-red-50 transition-colors flex-shrink-0"
            >
              <MdOutlineDelete />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* ── CART SUMMARY ── */}
  <div className="w-full nav:max-w-[369px] max-nav:mt-4">
    <div className="p-5 md:p-6 bg-[#eeeeee]/30 rounded-md w-full">
      <h2 className="mb-4 font-medium text-base text-dark">Cart Totals</h2>

      <div>
        <div className="flex justify-between items-center py-3">
          <p className="text-[#767676] text-sm">
            Subtotal · {cartItems.length}{" "}
            {cartItems.length === 1 ? "item" : "items"}
          </p>
          <p className="text-dark text-sm">{formatAmount(subTotal)}</p>
        </div>
        <div className="flex justify-between items-center py-4 border-[#e5e5e5] border-t">
          <p className="font-bold text-dark text-base">Total</p>
          <p className="font-bold text-dark text-base">
            {formatAmount(subTotal)}
          </p>
        </div>
      </div>

      {!isAuthenticated && (
        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-filgreen underline">
            Login to checkout faster
          </Link>
        </p>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="mt-4 w-full bg-black hover:bg-gray-900 py-4 rounded-md font-roboto font-medium text-white text-sm uppercase tracking-wider transition-colors"
      >
        Check Out
      </button>
    </div>
  </div>
</div>
        )}
      </div>
    </>
  );
};

export default CartPage;
