// components/CheckoutModal.jsx
"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "@/store/features/authSlice";
import { formatAmount } from "@/lib/utils";
import { useGAEvent } from "@/hooks/useGAEvent";
import { useMetaPixelEvent } from "@/hooks/useMetaPixelEvent";
import RegionSelect from "@/components/RegionSelect";
import PromoCodeInput from "@/components/PromoCodeInput";
import {
  sanitizePhone,
  sanitizeEmail,
  sanitizeName,
  sanitizeText,
  sanitizeAddress,
  getPhoneDigits,
  isValidEmail,
  isValidPhone,
} from "@/lib/sanitize";
import { HiPlus, HiMinus } from "react-icons/hi";
import { MdOutlineClose, MdEdit } from "react-icons/md";
import { FaStar } from "react-icons/fa";

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

  useEffect(() => {
    if (user) {
      localStorage.removeItem("savedCheckoutInfo");
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
    } else {
      const savedInfo = localStorage.getItem("savedCheckoutInfo");
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo);
          setFormData((prev) => ({
            ...prev,
            firstName: parsed.firstName || "",
            lastName: parsed.lastName || "",
            email: parsed.email || "",
            phone: parsed.phone || "",
            addPhone: parsed.addPhone || "",
            region: parsed.region || { name: "", fee: 0 },
            city: parsed.city || "",
            address: parsed.address || "",
          }));
        } catch (e) {
          console.error("Failed to parse saved checkout info", e);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

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
    let sanitizedValue = value;

    if (type === "checkbox") {
      sanitizedValue = checked;
    } else {
      switch (name) {
        case "firstName":
        case "lastName":
          sanitizedValue = sanitizeName(value);
          break;
        case "email":
          sanitizedValue = sanitizeEmail(value);
          break;
        case "phone":
        case "addPhone":
          sanitizedValue = sanitizePhone(value);
          break;
        case "city":
          sanitizedValue = sanitizeName(value);
          break;
        case "address":
          sanitizedValue = sanitizeAddress(value);
          break;
        case "orderNote":
          sanitizedValue = sanitizeText(value, 500);
          break;
        default:
          sanitizedValue = value;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePromoApply = ({ promoCode: code, amount }) => {
    setPromoCode(code || null);
    setDiscount(amount || 0);
  };

  useEffect(() => {
    setDiscount(0);
    setPromoCode(null);
    setPromoResetKey((k) => k + 1);
  }, [cartItems]);

  useEffect(() => {
    if (subTotal < 10000 && formData.deliveryType === "Free") {
      setFormData((prev) => ({ ...prev, deliveryType: "Regular" }));
    }
  }, [subTotal, formData.deliveryType]);

  const validateStep1 = () => {
    const errs = {};

    if (!formData.firstName.trim()) {
      errs.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      errs.firstName = "First name is too short";
    }

    if (!formData.lastName.trim()) {
      errs.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      errs.lastName = "Last name is too short";
    }

    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!formData.phone.toString().trim()) {
      errs.phone = "Phone is required";
    } else if (!isValidPhone(formData.phone)) {
      errs.phone = "Please enter a valid phone number (10-14 digits)";
    }

    if (formData.addPhone && !isValidPhone(formData.addPhone)) {
      errs.addPhone = "Please enter a valid alternative number";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.region?.name) errs.region = "Region is required";
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.address.trim()) {
      errs.address = "Address is required";
    } else if (formData.address.trim().length < 5) {
      errs.address = "Please enter a complete address";
    }
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
    if (!isValidEmail(formData.email)) {
      alert("Invalid email address. Please go back and fix it.");
      goToStep(1);
      return;
    }
    if (!isValidPhone(formData.phone)) {
      alert("Invalid phone number. Please go back and fix it.");
      goToStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanFormData = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: sanitizeEmail(formData.email),
        phone: getPhoneDigits(formData.phone),
        addPhone: formData.addPhone ? getPhoneDigits(formData.addPhone) : "",
        city: formData.city.trim(),
        address: formData.address.trim(),
        orderNote: formData.orderNote.trim(),
      };

      if (cleanFormData.saveForLater && user) {
        await dispatch(
          updateUser({
            firstName: cleanFormData.firstName,
            lastName: cleanFormData.lastName,
            phone: cleanFormData.phone,
            addPhone: cleanFormData.addPhone,
            region: cleanFormData.region,
            city: cleanFormData.city,
            address: cleanFormData.address,
          })
        );
      }

      if (cleanFormData.saveForLater && !user) {
        localStorage.setItem(
          "savedCheckoutInfo",
          JSON.stringify({
            firstName: cleanFormData.firstName,
            lastName: cleanFormData.lastName,
            email: cleanFormData.email,
            phone: cleanFormData.phone,
            addPhone: cleanFormData.addPhone,
            region: cleanFormData.region,
            city: cleanFormData.city,
            address: cleanFormData.address,
          })
        );
      }

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

      trackInitiateCheckout(cartItems, total);

      const res = await fetch("/api/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          deliveryInfo: cleanFormData,
          discount,
          promoCode,
        }),
      });

      const data = await res.json();
      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert(data?.message || "Payment initiation failed. Please try again.");
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
      label: "Regular Delivery: 2 - 3 Days (Lagos), 3 - 5 Days (Interstate)",
    },
    {
      id: "Express",
      label:
        "Express Delivery (Within 24 hours, for orders placed before 10am, Lagos only)",
    },
    {
      id: "Free",
      label: "Free Delivery on Thursdays (5 - 7 working days, Lagos only)",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4 py-0 sm:py-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal shell */}
      <div className="relative bg-white w-full sm:rounded-xl sm:max-w-[700px] max-h-[95vh] sm:max-h-[92vh] overflow-y-auto shadow-2xl rounded-t-2xl">

        {/* ── HEADER (sticky so close button never clashes) ── */}
        <div className="sticky top-0 z-20 bg-white border-b border-[#f0f0f0]">
          {/* Close button row */}
          <div className="flex justify-end px-4 sm:px-6 pt-4 pb-2">
            <button
              onClick={onClose}
              aria-label="Close checkout"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
            >
              <MdOutlineClose className="text-lg" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center px-4 sm:px-8 pb-4">
            {STEPS.map((label, i) => {
              const num = i + 1;
              const isComplete = step > num;
              const isActive = step === num;

              return (
                <div
                  key={label}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {/* Circle */}
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors flex-shrink-0 ${
                        isComplete
                          ? "bg-black text-white"
                          : isActive
                          ? "bg-filgreen text-white"
                          : "bg-white text-[#999] border border-[#d9d9d9]"
                      }`}
                    >
                      {isComplete ? (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        num
                      )}
                    </div>
                    {/* Label — hidden on very small screens, visible from sm */}
                    <span
                      className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                        isActive || isComplete ? "text-dark" : "text-[#999]"
                      }`}
                    >
                      {label}
                    </span>
                  </div>

                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px mx-2 sm:mx-4 bg-[#d9d9d9]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── STEP CONTENT ── */}
        <div className="px-4 sm:px-8 py-6">

          {/* ════════════════════════════
               STEP 1 — CONTACT
          ════════════════════════════ */}
          {step === 1 && (
            <div>
              <p className="text-xs text-filgreen font-medium mb-1.5">
                Step 1 of 3
              </p>
              <h2 className="font-bold text-xl sm:text-2xl mb-2 text-dark">
                Who's this order for?
              </h2>
              <p className="text-sm text-[#767676] mb-6">
                Just your name and number — we'll get delivery details on the
                next step.
              </p>

              {/* First + Last name — always 2 cols (short labels, fits fine) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="text-sm mb-1.5 block font-medium">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (/^\d$/.test(e.key)) e.preventDefault();
                    }}
                    placeholder="Lanre"
                    maxLength={50}
                    className={`w-full bg-[#f6f6f6] px-3 sm:px-4 py-3 rounded-md text-sm outline-0 border ${
                      errors.firstName
                        ? "border-red-400"
                        : "border-transparent"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm mb-1.5 block font-medium">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (/^\d$/.test(e.key)) e.preventDefault();
                    }}
                    placeholder="Koleola"
                    maxLength={50}
                    className={`w-full bg-[#f6f6f6] px-3 sm:px-4 py-3 rounded-md text-sm outline-0 border ${
                      errors.lastName
                        ? "border-red-400"
                        : "border-transparent"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email — full width on its own row (always) */}
              <div className="mb-4">
                <label className="text-sm mb-1.5 block font-medium">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={(e) => {
                    if (e.target.value && !isValidEmail(e.target.value)) {
                      setErrors((prev) => ({
                        ...prev,
                        email: "Please enter a valid email address",
                      }));
                    }
                  }}
                  placeholder="koleola.k@gmail.com"
                  disabled={!!user}
                  maxLength={254}
                  className={`w-full bg-[#f6f6f6] px-3 sm:px-4 py-3 rounded-md text-sm outline-0 border ${
                    user ? "opacity-60 cursor-not-allowed" : ""
                  } ${
                    errors.email ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone + Alternative — stacked on mobile, 2-col on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div>
                  <label className="text-sm mb-1.5 block font-medium">
                    Phone number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (/^[a-zA-Z]$/.test(e.key)) e.preventDefault();
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text");
                      if (/[a-zA-Z]/.test(pasted)) {
                        e.preventDefault();
                        const cleaned = sanitizePhone(pasted);
                        setFormData((prev) => ({ ...prev, phone: cleaned }));
                      }
                    }}
                    placeholder="080 000 0000"
                    maxLength={15}
                    className={`w-full bg-[#f6f6f6] px-3 sm:px-4 py-3 rounded-md text-sm outline-0 border ${
                      errors.phone ? "border-red-400" : "border-transparent"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm mb-1.5 block font-medium">
                    Alternative number{" "}
                    <span className="text-[#999] font-normal">(optional)</span>
                  </label>
                  <input
                    name="addPhone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={formData.addPhone}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (/^[a-zA-Z]$/.test(e.key)) e.preventDefault();
                    }}
                    placeholder="In case we can't reach you"
                    maxLength={15}
                    className={`w-full bg-[#f6f6f6] px-3 sm:px-4 py-3 rounded-md text-sm outline-0 border ${
                      errors.addPhone
                        ? "border-red-400"
                        : "border-transparent"
                    }`}
                  />
                  {errors.addPhone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.addPhone}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-filgreen hover:bg-green-700 py-3.5 rounded-md font-medium text-white text-sm transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {/* ════════════════════════════
               STEP 2 — DELIVERY
          ════════════════════════════ */}
          {step === 2 && (
            <div>
              <p className="text-xs text-filgreen font-medium mb-1.5">
                Step 2 of 3
              </p>
              <h2 className="font-bold text-xl sm:text-2xl mb-2 text-dark">
                Where should we deliver?
              </h2>
              <p className="text-sm text-[#767676] mb-6">
                Please enter your correct delivery details. Your order will be
                delivered to this address.
              </p>

              {/* Region + City — stacked on mobile, 2-col on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="text-sm mb-1.5 block font-medium">
                    Region <span className="text-red-500">*</span>
                  </label>
                  <RegionSelect
                    value={formData.region}
                    onChange={(selected) => {
                      setFormData((prev) => ({ ...prev, region: selected }));
                      if (errors.region)
                        setErrors((prev) => ({ ...prev, region: "" }));
                    }}
                  />
                  {errors.region && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.region}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm mb-1.5 block font-medium">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Select City"
                    className={`w-full bg-[#f6f6f6] px-3 sm:px-4 py-3 rounded-md text-sm outline-0 border ${
                      errors.city ? "border-red-400" : "border-transparent"
                    }`}
                  />
                  <p className="text-xs text-[#999] mt-1">
                    Updates automatically once a region is picked.
                  </p>
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>
              </div>

              {/* Full-width address */}
              <div className="mb-4">
                <label className="text-sm mb-1.5 block font-medium">
                  Delivery address <span className="text-red-500">*</span>
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House number, street, landmark"
                  className={`w-full bg-[#f6f6f6] px-3 sm:px-4 py-3 rounded-md text-sm outline-0 border ${
                    errors.address ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              {/* Order note accordion */}
              <div className="mb-5 border border-[#e5e5e5] rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setNoteOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm text-dark font-medium">
                    <MdEdit className="text-base flex-shrink-0" />
                    Add order note
                  </span>
                  <span className="w-7 h-7 border border-[#d9d9d9] rounded flex items-center justify-center text-[#767676] flex-shrink-0">
                    {noteOpen ? <HiMinus /> : <HiPlus />}
                  </span>
                </button>
                {noteOpen && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#e5e5e5]">
                    <textarea
                      name="orderNote"
                      value={formData.orderNote}
                      onChange={handleChange}
                      placeholder="Order special instructions"
                      rows={4}
                      className="w-full bg-[#f6f6f6] px-4 py-3 rounded-md text-sm outline-0 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Delivery type options */}
              <div className="space-y-3 mb-6">
                {deliveryOptions.map((option) => {
                  const isFreeDelivery = option.id === "Free";
                  const isDisabled = isFreeDelivery && subTotal < 10000;
                  const isSelected = formData.deliveryType === option.id;

                  return (
                    <label
                      key={option.id}
                      className={`flex items-start gap-3 ${
                        isDisabled
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        value={option.id}
                        checked={isSelected}
                        onChange={handleChange}
                        disabled={isDisabled}
                        className="sr-only peer"
                      />
                      {/* Custom radio circle — aligned to first line */}
                      <span
                        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-filgreen bg-white"
                            : "border-[#d9d9d9] bg-white"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-filgreen"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>
                      <span
                        className={`text-sm leading-snug ${
                          isSelected
                            ? "text-filgreen font-medium"
                            : "text-dark"
                        }`}
                      >
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3.5 border border-[#d9d9d9] hover:bg-gray-50 rounded-md font-medium text-dark text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-filgreen hover:bg-green-700 py-3.5 rounded-md font-medium text-white text-sm transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════
               STEP 3 — REVIEW
          ════════════════════════════ */}
          {step === 3 && (
            <div>
              <p className="text-xs text-filgreen font-medium mb-1.5">
                Step 3 of 3
              </p>
              <h2 className="font-bold text-xl sm:text-2xl mb-2 text-dark">
                Confirm your details
              </h2>
              <p className="text-sm text-[#767676] mb-5">
                Check that everything is correct before placing the order
              </p>

              {/* Contact summary */}
              <div className="mb-3 p-4 border border-[#e5e5e5] rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-[#999]">Contact</p>
                  <button
                    onClick={() => goToStep(1)}
                    className="text-filgreen text-xs font-medium hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm font-semibold text-dark mb-1">
                  {formData.firstName} {formData.lastName}
                </p>
                <p className="text-sm text-[#767676] break-words">
                  {formData.phone}
                  {formData.addPhone && (
                    <span className="text-[#999]">
                      {" "}
                      · {formData.addPhone} (alternate number)
                    </span>
                  )}
                  {" · "}
                  <span className="text-filgreen break-all">
                    {formData.email}
                  </span>
                </p>
              </div>

              {/* Delivery summary */}
              <div className="mb-4 p-4 border border-[#e5e5e5] rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-[#999]">Delivery</p>
                  <button
                    onClick={() => goToStep(2)}
                    className="text-filgreen text-xs font-medium hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm font-semibold text-dark mb-1">
                  {formData.address}
                </p>
                <p className="text-sm text-[#767676]">
                  {formData.city}, {formData.region?.name}
                </p>
                {formData.orderNote && (
                  <p className="text-xs text-[#999] mt-1 italic">
                    Note: {formData.orderNote}
                  </p>
                )}
              </div>

              {/* Save for later — non-logged-in only */}
              {!user && (
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="saveForLater"
                    checked={formData.saveForLater}
                    onChange={handleChange}
                    className="w-4 h-4 accent-filgreen"
                  />
                  <span className="text-sm text-filgreen">
                    Save this info for later
                  </span>
                </label>
              )}

              {/* Cart items */}
              <div className="mb-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item._id}-${item.color}`}
                    className="flex items-center gap-3 py-3 border-b border-[#e5e5e5] last:border-0"
                  >
                    <div className="flex-shrink-0 w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] bg-[#f6f6f6] rounded-md flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1 text-dark">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-0.5 my-1">
                        {[...Array(5)].map((_, idx) => (
                          <FaStar
                            key={idx}
                            className="w-3 h-3 text-[#fbbf24]"
                          />
                        ))}
                      </div>
                      <p className="text-sm font-medium text-dark">
                        {formatAmount(item.price * item.quantity)}
                      </p>
                    </div>
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
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#767676]">Sub Total</span>
                  <span className="font-medium text-dark">
                    {formatAmount(subTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#767676]">Discount</span>
                  <span className="font-medium text-dark">
                    -{formatAmount(discount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#767676]">Delivery Fees</span>
                  <span className="font-medium text-dark">
                    {formatAmount(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#e5e5e5]">
                  <span className="font-semibold text-dark text-base">
                    Total
                  </span>
                  <span className="font-semibold text-dark text-base">
                    {formatAmount(total)}
                  </span>
                </div>
              </div>

              {/* Info banner */}
              <div className="mb-4 px-4 py-3 bg-[#f0faf0] border border-filgreen/40 rounded-md">
                <p className="text-xs text-[#5a7a5a] text-center">
                  You'll get an order confirmation by mail once the order is
                  placed.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3.5 border border-[#d9d9d9] hover:bg-gray-50 rounded-md font-medium text-dark text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 bg-filgreen hover:bg-green-700 py-3.5 rounded-md font-medium text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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