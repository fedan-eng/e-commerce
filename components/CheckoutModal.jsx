// components/CheckoutModal.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "@/store/features/authSlice";
import { formatAmount } from "@/lib/utils";
import { useGAEvent } from "@/hooks/useGAEvent";
import { useMetaPixelEvent } from "@/hooks/useMetaPixelEvent";
import RegionSelect from "@/components/RegionSelect";
import PromoCodeInput from "@/components/PromoCodeInput";
import { HiPlus, HiMinus } from "react-icons/hi";
import { MdOutlineClose } from "react-icons/md";

const STEPS = ["Contact", "Delivery", "Review"];

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addPhone: "",
  region: { name: "", fee: 0 },
  city: "",
  address: "",
  orderNote: "",
  deliveryType: "Regular",
  saveForLater: false,
};

export default function CheckoutModal({ onClose }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  const { trackEvent } = useGAEvent();
  const { trackInitiateCheckout } = useMetaPixelEvent();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [noteOpen, setNoteOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState(null);
  const [promoResetKey, setPromoResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill from user on mount
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        addPhone: user.addPhone || "",
        region: user.region || { name: "", fee: 0 },
        city: user.city || "",
        address: user.address || "",
      }));
    }
  }, [user]);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  let deliveryFee = 0;
  if (formData.deliveryType === "Free") {
    deliveryFee = 0;
  } else if (formData.deliveryType === "Express") {
    deliveryFee = (formData.region?.fee || 0) * 2;
  } else {
    deliveryFee = formData.region?.fee || 0;
  }

  const total = Math.max(0, subTotal - discount + deliveryFee);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePromoApply = ({ promoCode: code, amount }) => {
    setPromoCode(code || null);
    setDiscount(amount || 0);
  };

  // Reset promo when cart changes
  useEffect(() => {
    setDiscount(0);
    setPromoCode(null);
    setPromoResetKey((k) => k + 1);
  }, [cartItems]);

  // Auto-reset Free delivery if subtotal drops below 10000
  useEffect(() => {
    if (subTotal < 10000 && formData.deliveryType === "Free") {
      setFormData((prev) => ({ ...prev, deliveryType: "Regular" }));
    }
  }, [subTotal, formData.deliveryType]);

  const validateStep1 = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    if (!formData.phone.toString().trim()) errs.phone = "Phone is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.region?.name) errs.region = "Region is required";
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.address.trim()) errs.address = "Address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goToStep = (target) => {
    setErrors({});
    setStep(target);
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    goToStep(step + 1);
  };

  const handleBack = () => goToStep(step - 1);

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // Save for later if checked
      if (formData.saveForLater && user) {
        await dispatch(
          updateUser({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            addPhone: formData.addPhone,
            region: formData.region,
            city: formData.city,
            address: formData.address,
          })
        );
      }

      // Track GA begin_checkout
      trackEvent("begin_checkout", {
        currency: "NGN",
        value: total,
        items: cartItems.map((item) => ({
          item_id: item._id,
          item_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // Track Meta InitiateCheckout
      trackInitiateCheckout(cartItems, total);

      const res = await fetch("/api/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          deliveryInfo: formData,
          discount,
          promoCode,
        }),
      });

      const data = await res.json();
      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert("Payment initiation failed. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const deliveryOptions = [
    {
      id: "Regular",
      label: "Regular Delivery: 2–3 Days (Lagos), 3–5 Days (Interstate)",
    },
    {
      id: "Express",
      label: "Express Delivery (Within 24 hours, orders before 10am, Lagos Only)",
    },
    {
      id: "Free",
      label: "Free Delivery on Thursdays (5–7 working days, Lagos Only)",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-xl w-full max-w-[540px] max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <MdOutlineClose className="text-xl" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center px-6 pt-6 pb-4 border-b border-[#e5e5e5]">
          {STEPS.map((label, i) => {
            const num = i + 1;
            const isComplete = step > num;
            const isActive = step === num;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      isComplete
                        ? "bg-filgreen text-white"
                        : isActive
                        ? "bg-filgreen text-white"
                        : "bg-[#e5e5e5] text-[#999]"
                    }`}
                  >
                    {isComplete ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      num
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-dark" : "text-[#999]"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-3 transition-colors ${
                      step > num ? "bg-filgreen" : "bg-[#e5e5e5]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="px-6 py-5">

          {/* ── STEP 1: CONTACT ── */}
          {step === 1 && (
            <div>
              <p className="text-xs text-filgreen font-medium mb-1">Step 1 of 3</p>
              <h2 className="font-oswald font-medium text-2xl mb-1">Who's this order for?</h2>
              <p className="text-sm text-[#767676] mb-5">
                Just your name and number, we'll get delivery details on the next step.
              </p>

              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-sm mb-1 block">
                    <span className="text-red-500">*</span> First name
                  </label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Lanre"
                    className={`w-full bg-[#f6f6f6] px-3 py-3 rounded-md text-sm outline-0 ${
                      errors.firstName ? "ring-1 ring-red-400" : ""
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-sm mb-1 block">
                    <span className="text-red-500">*</span> Last name
                  </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Koleola"
                    className={`w-full bg-[#f6f6f6] px-3 py-3 rounded-md text-sm outline-0 ${
                      errors.lastName ? "ring-1 ring-red-400" : ""
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm mb-1 block">
                  <span className="text-red-500">*</span> Email address
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="koleola.k@gmail.com"
                  disabled={!!user}
                  className={`w-full bg-[#f6f6f6] px-3 py-3 rounded-md text-sm outline-0 ${
                    user ? "opacity-60 cursor-not-allowed" : ""
                  } ${errors.email ? "ring-1 ring-red-400" : ""}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-sm mb-1 block">
                    <span className="text-red-500">*</span> Phone number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="080 000 0000"
                    className={`w-full bg-[#f6f6f6] px-3 py-3 rounded-md text-sm outline-0 ${
                      errors.phone ? "ring-1 ring-red-400" : ""
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-sm mb-1 block">
                    Alternative number{" "}
                    <span className="text-[#999] text-xs">(optional)</span>
                  </label>
                  <input
                    name="addPhone"
                    type="tel"
                    value={formData.addPhone}
                    onChange={handleChange}
                    placeholder="In case we can't reach you"
                    className="w-full bg-[#f6f6f6] px-3 py-3 rounded-md text-sm outline-0"
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-filgreen py-3 rounded-md font-roboto font-medium text-dark text-sm mt-2"
              >
                Continue
              </button>
            </div>
          )}

          {/* ── STEP 2: DELIVERY ── */}
          {step === 2 && (
            <div>
              <p className="text-xs text-filgreen font-medium mb-1">Step 2 of 3</p>
              <h2 className="font-oswald font-medium text-2xl mb-1">Where should we deliver?</h2>
              <p className="text-sm text-[#767676] mb-5">
                Please enter your correct delivery details. Your order will be delivered to this address.
              </p>

              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-sm mb-1 block">
                    <span className="text-red-500">*</span> Region
                  </label>
                  <RegionSelect
                    value={formData.region}
                    onChange={(selected) => {
                      setFormData((prev) => ({ ...prev, region: selected }));
                      if (errors.region) setErrors((prev) => ({ ...prev, region: "" }));
                    }}
                  />
                  {errors.region && (
                    <p className="text-red-500 text-xs mt-1">{errors.region}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-sm mb-1 block">
                    <span className="text-red-500">*</span> City
                  </label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={`w-full bg-[#f6f6f6] px-3 py-3 rounded-md text-sm outline-0 mt-2 ${
                      errors.city ? "ring-1 ring-red-400" : ""
                    }`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm mb-1 block">
                  <span className="text-red-500">*</span> Delivery address
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House number, street, landmark"
                  className={`w-full bg-[#f6f6f6] px-3 py-3 rounded-md text-sm outline-0 ${
                    errors.address ? "ring-1 ring-red-400" : ""
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              {/* Order note */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setNoteOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm text-[#767676] hover:text-dark transition-colors"
                >
                  <span className="text-xs border border-[#d9d9d9] rounded w-5 h-5 flex items-center justify-center">
                    {noteOpen ? <HiMinus /> : <HiPlus />}
                  </span>
                  Add order note
                </button>
                {noteOpen && (
                  <textarea
                    name="orderNote"
                    value={formData.orderNote}
                    onChange={handleChange}
                    placeholder="Order special instructions"
                    rows={3}
                    className="w-full bg-[#f6f6f6] px-3 py-3 rounded-md text-sm outline-0 mt-2 resize-none"
                  />
                )}
              </div>

              {/* Delivery type */}
              <div className="border-t border-[#e5e5e5] pt-2">
                {deliveryOptions.map((option) => {
                  const isFreeDelivery = option.id === "Free";
                  const isDisabled = isFreeDelivery && subTotal < 10000;
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 py-4 border-b border-[#e5e5e5] last:border-0 ${
                        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        value={option.id}
                        checked={formData.deliveryType === option.id}
                        onChange={handleChange}
                        disabled={isDisabled}
                        className="before:top-1/2 before:left-1/2 before:absolute relative before:bg-filgreen before:opacity-0 checked:before:opacity-100 border border-gray-400 checked:border-green-600 rounded-full before:rounded-full before:w-2 min-w-4 before:h-2 min-h-4 before:content-[''] before:-translate-x-1/2 before:-translate-y-1/2 appearance-none disabled:opacity-50"
                      />
                      <span
                        className={`text-sm ${
                          formData.deliveryType === option.id && !isDisabled
                            ? "text-filgreen"
                            : "text-dark"
                        }`}
                      >
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 border border-[#d9d9d9] rounded-md font-roboto font-medium text-dark text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-filgreen py-3 rounded-md font-roboto font-medium text-dark text-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: REVIEW ── */}
          {step === 3 && (
            <div>
              <p className="text-xs text-filgreen font-medium mb-1">Step 3 of 3</p>
              <h2 className="font-oswald font-medium text-2xl mb-4">Confirm your details</h2>
              <p className="text-sm text-[#767676] mb-5">
                Check that everything is correct before placing the order
              </p>

              {/* Contact summary */}
              <div className="flex justify-between items-start mb-4 p-3 bg-[#f6f6f6] rounded-md">
                <div>
                  <p className="text-xs text-[#999] mb-1">Contact</p>
                  <p className="text-sm font-medium">
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-sm text-[#767676]">{formData.phone}</p>
                  {formData.addPhone && (
                    <p className="text-sm text-[#767676]">{formData.addPhone}</p>
                  )}
                  <p className="text-sm text-[#767676]">{formData.email}</p>
                </div>
                <button
                  onClick={() => goToStep(1)}
                  className="text-filgreen text-xs underline font-medium"
                >
                  Edit
                </button>
              </div>

              {/* Delivery summary */}
              <div className="flex justify-between items-start mb-4 p-3 bg-[#f6f6f6] rounded-md">
                <div>
                  <p className="text-xs text-[#999] mb-1">Delivery</p>
                  <p className="text-sm font-medium">{formData.address}</p>
                  <p className="text-sm text-[#767676]">
                    {formData.city}, {formData.region?.name}
                  </p>
                  {formData.orderNote && (
                    <p className="text-xs text-[#999] mt-1 italic">
                      Note: {formData.orderNote}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => goToStep(2)}
                  className="text-filgreen text-xs underline font-medium"
                >
                  Edit
                </button>
              </div>

              {/* Cart items */}
              <div className="mb-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item._id}-${item.color}`}
                    className="flex items-center gap-3 py-3 border-b border-[#e5e5e5] last:border-0"
                  >
                    <div className="flex-shrink-0 w-[52px] h-[52px] bg-[#f6f6f6] rounded-md flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-[44px] h-[44px] object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-oswald text-sm line-clamp-1">{item.name}</p>
                      {item.color && (
                        <p className="text-xs text-[#767676]">{item.color}</p>
                      )}
                      <p className="text-xs text-[#767676]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-dark flex-shrink-0">
                      {formatAmount(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="mb-4">
                <PromoCodeInput
                  key={promoResetKey}
                  subTotal={subTotal}
                  onApply={handlePromoApply}
                  userId={user?._id}
                />
              </div>

              {/* Totals */}
              <div className="border-t border-[#e5e5e5] pt-3 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#767676]">Sub Total</span>
                  <span className="font-medium">{formatAmount(subTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#767676]">Discount</span>
                  <span className="font-medium">- {formatAmount(discount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#767676]">Delivery Fees</span>
                  <span className="font-medium">{formatAmount(deliveryFee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#e5e5e5]">
                  <span className="font-medium text-dark">Total</span>
                  <span className="font-medium text-dark">{formatAmount(total)}</span>
                </div>
              </div>

              {/* Save for later — logged-in only */}
              {user && (
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="saveForLater"
                    checked={formData.saveForLater}
                    onChange={handleChange}
                    className="w-4 h-4 accent-filgreen" 
                  />
                  <span className="text-sm text-[#767676]">Save this info for later</span>
                </label>
              )}

              <p className="text-xs text-[#999] mb-4 text-center">
                You'll get an order confirmation by mail once the order is placed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 border border-[#d9d9d9] rounded-md font-roboto font-medium text-dark text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 bg-filgreen py-3 rounded-md font-roboto font-medium text-dark text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : "Place order"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}