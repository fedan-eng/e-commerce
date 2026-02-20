// app/cart/page.jsx
"use client";

import {useState, useEffect} from "react";
import {formatAmount} from "lib/utils";
import {useSelector, useDispatch} from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "@/store/features/cartSlice";
import Link from "next/link";
import Image from "next/image";
import {MdOutlineDelete} from "react-icons/md";
import RegionSelect from "@/components/RegionSelect";
import PromoCodeInput from "@/components/PromoCodeInput";
import {HiMinus, HiPlus} from "react-icons/hi";

const CartPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  const [hasMounted, setHasMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("paystack"); // New state

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addPhone: "",
    region: {name: "", fee: 0},
    city: "",
    address: "",
    deliveryType: "Regular",
  });

  // This useEffect will populate the form with user data on mount
  useEffect(() => {
    setHasMounted(true);
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        addPhone: user.addPhone || "",
        region: user.region || {name: "", fee: 0},
        city: user.city || "",
        address: user.address || "",
        deliveryType: user.deliveryType || "Regular",
      }));
      setShowForm(false);
    } else {
      setShowForm(true);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const options = [
    {
      id: "Regular",
      label: "Regular Delivery (1-3 Working Days)",
    },
    {
      id: "Express",
      label:
        "Express Delivery (Within 24 hours, for orders placed before 10am)",
    },
    {
      id: "Free",
      label: "Free Delivery on Thursdays",
    },
  ];

  // Payment methods
  const paymentMethods = [
    {
      id: "paystack",
      name: "Paystack",
      description: "Pay with Card, Bank Transfer, USSD",
      logo: "/paystack.png",
    },
    // {
    //   id: "flutterwave",
    //   name: "Flutterwave",
    //   description: "Pay with Card, Mobile Money, Bank Transfer",
    //   logo: "/flutterwave.png", // Uncomment when Flutterwave integration is ready
    // },
  ];

  if (!hasMounted) return null;

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleQuantityChange = (id, value) => {
    const qty = parseInt(value);
    if (qty >= 1) {
      dispatch(updateQuantity({_id: id, quantity: qty}));
    }
  };

  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    // If the user is not logged in, and the form is not open, show the form
    if (!user && !showForm) {
      setShowForm(true);
      alert("Please fill in your delivery details to continue.");
      return;
    }

    // Check if the form is fully filled out before proceeding
    if (!formData.email || !formData.phone || !formData.address) {
      alert("Please fill in all required delivery information.");
      return;
    }

    try {
      // Determine which API endpoint to use based on selected payment method
      const endpoint =
        selectedPaymentMethod === "paystack"
          ? "/api/paystack"
          : "/api/flutterwave";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          cartItems,
          deliveryInfo: formData,
          discount,
        }),
      });

      const data = await res.json();
      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert("Payment initiation failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong with payment initiation.");
    }
  };

  let deliveryFee = 0;

  if (formData.deliveryType === "Free") {
    deliveryFee = 0;
  } else if (formData.deliveryType === "Express") {
    deliveryFee = (formData.region?.fee || 0) * 2;
  } else {
    deliveryFee = formData.region?.fee || 0;
  }
  const total = subTotal - discount + deliveryFee;

  return (
    <div className="mx-auto mt-6 w-full max-w-[1140px]">
      <div className="flex justify-between w-full nav:max-w-[755px]">
        <h1 className="bg-white mx-2 my-4 font-oswald font-medium text-2xl s:text-4xl">
          {showForm ? "Delivery Information" : "Your Cart"}
        </h1>
      </div>

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
            <h3 className="font-medium"> Jump start Your Shopping: </h3>
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
                Exclusive Member Deals - Unloack your specail offers
              </p>
            </div>
          </div>
          <p className="my-6 text-sm">
            Need recommendations? Check{" "}
            <Link href="/" className="text-filgreen underline">
              New Arrivals
            </Link>{" "}
            or{" "}
            <Link href="/" className="text-filgreen underline">
              New Arrivals
            </Link>
          </p>
          <h3 className="mb-10 font-medium text-sm">
            Think Quality, Think FIL
          </h3>
          <button className="shadow-button buttons"> Start Shopping Now</button>
        </div>
      ) : (
        <div className="nav:flex justify-center items-start gap-2 lg:gap-4 mx-2 mb-20">
          {!(user && showForm) && (
            <div className="px-2 lx:px-4 py-4 md:pb-[88px] border border-[#e3e3e3] rounded-md w-full nav:min-w-[500px] nav:max-w-[755px]">
              {/* HEADER ROW */}
              <div className="items-justify-center gap-2 lg:gap-4 grid grid-cols-[minmax(100px,1fr)_60px_20px] s:grid-cols-[20px_minmax(100px,1fr)_40px_60px_20px] sm:grid-cols-[20px_minmax(160px,1fr)_80px_70px_60px_20px] pb-2 border-[#e5e5e5] border-b">
                <span className="max-s:hidden min-w-0 font-medium text-sm text-center">
                  #
                </span>
                <span className="min-w-0 font-medium text-sm">Product</span>
                <span className="max-s:hidden min-w-0 font-medium text-sm">
                  Qty
                </span>
                <span className="max-sm:hidden min-w-0 font-medium text-sm">
                  Unit Price
                </span>
                <span className="min-w-0 font-medium text-sm">Total</span>
                <span className="min-w-0 font-medium text-sm"></span>
              </div>
              {/* Cart Items */}
             {cartItems.map((item, index) => (
  <div
    key={item._id}
    className="items-center gap-2 lg:gap-4 grid grid-cols-[minmax(80px,1fr)_60px_20px] s:grid-cols-[20px_minmax(80px,1fr)_80px_60px_20px] sm:grid-cols-[20px_minmax(140px,1fr)_120px_70px_60px_20px] py-2 text-sm sm:text-base"
  >
    <span className="max-s:hidden min-w-0 text-sm text-center">
      {index + 1}
    </span>
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex flex-shrink-0 justify-center items-center bg-[#f6f6f6] rounded-md w-[50px] xxs:w-[65px] h-[50px] xxs:h-[65px]">
        <img
          src={item.image}
          alt={item.name}
          className="w-[40px] xxs:w-[56px] h-[40px] xxs:h-[56px] object-contain"
        />
      </div>
      <div>
        <p className="min-w-0 font-oswald text-sm line-clamp-1">
          {item.name}
        </p>
        <p className="text-[#767676] text-xs">{item.category}</p>
       {item.color && (
  <p className="text-xs">Color: {item.color}</p>
)}
      </div>
    </div>
    <div className="max-s:hidden flex items-center gap-1 border border-[#d9d9d9] rounded-md w-fit">
      <button
        onClick={() =>
          handleQuantityChange(item._id, item.quantity - 1)
        }
        disabled={item.quantity <= 1}
        className="flex justify-center cursor-pointer items-center px-2 py-1 text-dark hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-md"
      >
        <HiMinus className="text-sm" />
      </button>

      <input
        type="number"
        value={item.quantity}
        onChange={(e) =>
          handleQuantityChange(
            item._id,
            Math.max(1, Number(e.target.value)),
          )
        }
        className="px-1 sm:px-2 py-1 border-x border-[#d9d9d9] outline-0 w-[40px] sm:w-[50px] text-center text-dark text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min="1"
      />

      <button
        onClick={() =>
          handleQuantityChange(item._id, item.quantity + 1)
        }
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
      onClick={() => handleRemove(item._id)}
      className="flex justify-center min-w-0 text-red-500 hover:text-red-700 text-xl"
    >
      <MdOutlineDelete />
    </button>
  </div>
))}
            </div>
          )}

          <div
            className={
              showForm && user
                ? " max-sm:flex-col flex items-start w-full md:gap-4 gap-2  "
                : "max-nav:flex max-sm:flex-col gap-2 items-start  order-2 max-nav:mt-2  w-full nav:max-w-[369px]"
            }
          >
            {/* CART SUMMARY */}
            <div
              className={
                showForm
                  ? "  order-2 p-2 md:p-4 border border-[#e3e3e3] rounded-md w-full nav:max-w-[369px] items-start "
                  : "max-nav:order-2 p-2 md:p-4 border border-[#e3e3e3] rounded-md w-full nav:max-w-[369px] items-start"
              }
            >
              <h2 className="mb-4 font-oswald font-medium text-2xl">
                Cart Summary
              </h2>
              <PromoCodeInput subTotal={subTotal} onApply={setDiscount} />
              <div className="mt-[13px]">
                <div className="flex justify-between items-center mb-[13px] py-2">
                  <p className="text-dark text-sm">Sub Total</p>
                  <p className="font-medium text-dark text-sm">
                    {formatAmount(subTotal)}
                  </p>
                </div>
                <div className="flex justify-between items-center mb-[13px] py-2">
                  <p className="text-dark text-sm">Discount</p>
                  <p className="font-medium text-dark text-sm">
                    - {formatAmount(discount)}
                  </p>
                </div>
                <div className="flex justify-between items-center mb-[13px] py-2">
                  <p className="text-dark text-sm">Delivery Fees</p>
                  <p className="font-medium text-dark text-sm">
                    {formatAmount(deliveryFee)}
                  </p>
                </div>
                <div className="flex justify-between items-center mb-[13px] py-4 border-[#d9d9d9] border-t">
                  <p className="font-medium text-dark">Total</p>
                  <p className="font-medium text-dark">{formatAmount(total)}</p>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTION - NEW SECTION */}
              <div className="mb-4 pb-4 border-b border-[#e5e5e5]">
                <h3 className="mb-3 font-medium text-sm">
                  Select Payment Method
                </h3>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-3 border-2 rounded-md cursor-pointer transition-all ${
                        selectedPaymentMethod === method.id
                          ? "border-filgreen bg-green-50"
                          : "border-[#e3e3e3] hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) =>
                          setSelectedPaymentMethod(e.target.value)
                        }
                        className="before:top-1/2 before:left-1/2 before:absolute relative before:bg-filgreen before:opacity-0 checked:before:opacity-100 border border-gray-400 checked:border-green-600 rounded-full before:rounded-full before:w-2 min-w-4 before:h-2 min-h-4 before:content-[''] before:-translate-x-1/2 before:-translate-y-1/2 appearance-none"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{method.name}</p>
                            <p className="text-[#767676] text-xs">
                              {method.description}
                            </p>
                          </div>
                          {method.logo && (
                            <Image
                              src={method.logo}
                              alt={method.name}
                              width={60}
                              height={24}
                              className="object-contain"
                            />
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-center items-center gap-2 xxs:gap-4 py-4">
                <Link
                  href="/product"
                  className="px-2 sm:px-6 py-3 border border-[#d9d9d9] rounded-md font-roboto font-medium text-dark text-sm max-xxs:whitespace-nowrap"
                >
                  Back to Shopping
                </Link>
                <button
                  onClick={handleCheckout}
                  className="bg-filgreen px-2 sm:px-6 py-3 rounded-md font-roboto font-medium text-dark text-xs sm:text-sm max-xxs:whitespace-nowrap"
                >
                  Checkout
                </button>
              </div>
            </div>

            {/* DELIVERY INFO */}
            <div
              className={
                user && showForm
                  ? "  order-1 px-2 border border-[#e3e3e3] rounded-md max-w-[755px] w-full  "
                  : `max-nav:order-1 nav:mt-4 px-2 md:px-4 pt-2 md:pt-4 border border-[#e3e3e3] rounded-md w-full nav:max-w-[369px]`
              }
            >
              <div className="flex justify-between items-center">
                <h2 className="mb-4 font-oswald font-medium text-2xl">
                  {showForm ? "" : "Delivery Information"}
                </h2>
                {user && (
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-[#007c42] text-sm underline cursor-pointer"
                  >
                    {showForm ? "" : "Update"}
                  </button>
                )}
              </div>

              {/* Conditional rendering for the delivery form/info */}
              {user && !showForm ? (
                <>
                  {/* Display saved user info */}
                  <div className="mb-4">
                    <p className="mb-2 font-medium text-sm">{user.firstName}</p>
                    <p className="text-[#575757] text-sm">{user.address}</p>
                  </div>
                  <div className="relative flex mb-4">
                    <div>
                      <p className="mb-2 font-medium text-sm">Region</p>
                      <p className="text-[#575757] text-sm">
                        {formData.region?.name}
                      </p>
                    </div>
                    <div className="left-1/2 absolute">
                      <p className="mb-2 font-medium text-sm">City</p>
                      <p className="text-[#575757] text-sm">{user.city}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Show the form for guests or when a user clicks "Edit Info" */}
                  {
                    <p className="mb-4 text-red-500 text-sm">
                      Please fill in your details to complete your order.
                    </p>
                  }
                  <form className="w-full max-w-[755px]">
                    {/* EMAIL */}
                    {!user && (
                      <div className="mb-4 w-full">
                        <label className="text-sm" htmlFor="email">
                          <span className="text-red-600">*</span> Email
                        </label>
                        <input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Email"
                          className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                        />
                      </div>
                    )}

                    {/* FIRST AND LAST NAME */}
                    <div className="md:flex gap-4 md:mb-4 w-full">
                      <div className="max-xxs:mb-3 max-md:mb-3 w-full">
                        <label className="text-sm" htmlFor="firstName">
                          <span className="text-red-600">*</span> First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="First Name"
                          className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                        />
                      </div>

                      <div className="max-xxs:mb-3 max-md:mb-3 w-full">
                        <label className="text-sm" htmlFor="lastName">
                          <span className="text-red-600">*</span> Last Name
                        </label>
                        <input
                          type="lastName"
                          name="lastName"
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Last Name"
                          className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                        />
                      </div>
                    </div>

                    {/* PHONE AND ADDITIONAL PHONE */}
                    <div className="md:flex gap-4 md:mb-4 w-full">
                      <div className="max-md:mb-3 w-full">
                        <label className="text-sm" htmlFor="phone">
                          <span className="text-red-600">*</span> Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Phone Number"
                          className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                        />
                      </div>

                      <div className="max-md:mb-3 w-full">
                        <label className="text-[14px]" htmlFor="addPhone">
                          Add. Phone Number
                        </label>
                        <input
                          type="tel"
                          name="addPhone"
                          value={formData.addPhone}
                          onChange={handleChange}
                          placeholder="Add. Phone Number"
                          className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                        />
                      </div>
                    </div>

                    {/* ADDRESS */}
                    <div className="mb-4 w-full">
                      <label className="text-sm" htmlFor="address">
                        <span className="text-red-600">*</span> Delivery Address
                      </label>
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street Address, House Number, etc."
                        className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                      />
                    </div>

                    {/* REGION AND CITY */}
                    <div className="md:flex gap-4 md:mb-4 w-full">
                      <div className="max-md:mb-3 w-full">
                        <label className="text-sm" htmlFor="region">
                          <span className="text-red-600">*</span> Region
                        </label>
                        <RegionSelect
                          value={formData.region}
                          onChange={(selected) =>
                            setFormData({
                              ...formData,
                              region: selected,
                            })
                          }
                        />
                      </div>

                      <div className="w-full">
                        <label className="text-sm" htmlFor="lastName">
                          <span className="text-red-600">*</span> City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                          className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                        />
                      </div>
                    </div>

                    {/* BUTTONS */}
                    {showForm && user && (
                      <div className="flex justify-end items-center gap-2 xxs:gap-4 py-4">
                        <button
                          onClick={() => setShowForm(!showForm)}
                          className="px-2 sm:px-6 py-3 border border-[#d9d9d9] rounded-md font-roboto font-medium text-dark text-xs sm:text-sm whitespace-nowrap"
                        >
                          Only this Order
                        </button>
                        <Link
                          href="/profile"
                          onClick={handleCheckout}
                          className="bg-filgreen px-2 sm:px-6 py-3 rounded-md font-roboto font-medium text-dark text-xs sm:text-sm whitespace-nowrap"
                        >
                          Save As Default
                        </Link>
                      </div>
                    )}
                  </form>
                </>
              )}

              <div className="">
                {options.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-2 md:gap-4 border-[#e5e5e5] border-t py-[18px] cursor-pointer ${
                      formData.deliveryType === option.id ? "text-filgreen" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryType"
                      value={option.id}
                      checked={formData.deliveryType === option.id}
                      onChange={handleChange}
                      className="before:top-1/2 before:left-1/2 before:absolute relative before:bg-filgreen before:opacity-0 checked:before:opacity-100 border border-gray-400 checked:border-green-600 rounded-full before:rounded-full before:w-2 min-w-4 before:h-2 min-h-4 before:content-[''] before:-translate-x-1/2 before:-translate-y-1/2 appearance-none"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {!showForm && (
              <div className="max-nav:hidden mt-4 p-4 border border-[#e3e3e3] rounded-md">
                <p className="mb-4 font-oswald font-medium text-2xl capitalize">
                  WE ACCEPT
                </p>
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
                  {/* <div className="w-[88px] h-[32px]">
                    <Image
                      width={88}
                      height={32}
                      src="/flutterwave.png"
                      alt="flutterwave"
                      className="w-full h-full object-contain"
                    />
                  </div> */}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
