"use client";
// components/checkout/CheckoutModal.jsx — Contact → Delivery → Review, then Paystack.
// Pass `buyNowItem` to check out a single product instead of the cart.
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { updateUser } from "@/store/features/authSlice";
import { formatAmount } from "@/lib/utils";
import { isValidEmail, isValidPhone } from "@/lib/sanitize";
import { useMetaPixelEvent } from "@/hooks/useMetaPixelEvent";
import { useCookieConsent } from "@/context/CookieConsentContext";
import { getGAClientId } from "@/lib/analytics/gaClientId";
import ModalShell from "./ModalShell";
import StepIndicator from "./StepIndicator";
import { ContactStep, DeliveryStep, ReviewStep } from "./steps";
import useCheckoutForm, { CONTACT_FIELDS, DELIVERY_FIELDS, SAVED_INFO_KEY, cleanValues } from "./useCheckoutForm";
import { deliveryFeeFor, isFreeDeliveryAvailable } from "./delivery";

const STEPS = ["Contact", "Delivery", "Review"];

const STEP_COPY = {
  1: { title: "Who's this order for?", subtitle: "Your name and number. Delivery details come next." },
  2: { title: "Where should we deliver?", subtitle: "Your order goes to this address, so double-check it." },
  3: { title: "Confirm your order", subtitle: "Check everything looks right before you pay." },
};

// What to save on the account as each step is completed
const accountUpdateFor = (step, v) =>
  step === 1
    ? { firstName: v.firstName, lastName: v.lastName, phone: v.phone, addPhone: v.addPhone }
    : { region: v.region, city: v.city, address: v.address };

export default function CheckoutModal({ onClose, buyNowItem }) {
  const dispatch = useDispatch();
  const cartItemsFromStore = useSelector((s) => s.cart.items);
  // Memoised: a fresh [buyNowItem] array every render would reset the promo code forever
  const items = useMemo(() => (buyNowItem ? [buyNowItem] : cartItemsFromStore), [buyNowItem, cartItemsFromStore]);

  const form = useCheckoutForm();
  const { values, user } = form;
  const { preferences, status } = useCookieConsent();
  const { trackInitiateCheckout } = useMetaPixelEvent();

  const [step, setStep] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState(null);
  const [promoResetKey, setPromoResetKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const subTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryFeeFor(values.deliveryType, values.region);
  const total = Math.max(0, subTotal - discount + deliveryFee);

  // A promo applied to a different basket no longer holds
  useEffect(() => {
    setDiscount(0);
    setPromoCode(null);
    setPromoResetKey((k) => k + 1);
  }, [items]);

  // Free delivery needs a minimum spend
  const { setValue } = form;
  useEffect(() => {
    if (values.deliveryType === "Free" && !isFreeDeliveryAvailable(subTotal)) setValue("deliveryType", "Regular");
  }, [subTotal, values.deliveryType, setValue]);

  const goTo = (target) => {
    form.clearErrors();
    setStep(target);
  };

  const handleNext = async () => {
    if (!form.validate(step === 1 ? CONTACT_FIELDS : DELIVERY_FIELDS)) return;
    if (user) {
      // Keep the account up to date; checkout carries on even if this fails
      dispatch(updateUser(accountUpdateFor(step, cleanValues(values))));
    }
    goTo(step + 1);
  };

  const handlePromoApply = ({ promoCode: code, amount }) => {
    setPromoCode(code || null);
    setDiscount(amount || 0);
  };

  const handlePlaceOrder = async () => {
    if (!isValidEmail(values.email) || !isValidPhone(values.phone)) {
      toast.error("Please check your email and phone number.");
      goTo(1);
      return;
    }

    setSubmitting(true);
    const deliveryInfo = cleanValues(values);

    try {
      if (deliveryInfo.saveForLater && !user) {
        const { orderNote, deliveryType, saveForLater, ...contact } = deliveryInfo;
        localStorage.setItem(SAVED_INFO_KEY, JSON.stringify(contact));
      }

      trackInitiateCheckout(items, total);
      const gaClientId = await getGAClientId(preferences, status);

      const res = await fetch("/api/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: items,
          deliveryInfo,
          discount,
          promoCode,
          userId: user?._id || null,
          gaClientId,
          debugInfo: {
            consentStatus: status,
            hasGaCookie: document.cookie.includes("_ga"),
            hasSessionCookie: document.cookie.includes("fil_session_id"),
            windowGtagAvailable: typeof window.gtag === "function",
            envGaId: process.env.NEXT_PUBLIC_GA_ID,
            clientIdSource: gaClientId?.startsWith("sess_") ? "custom_session" : "ga",
          },
        }),
      });

      const data = await res.json();
      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
        return; // keep the button disabled while the browser leaves
      }
      toast.error(data?.message || "Couldn't start payment. Please try again.");
    } catch (err) {
      console.error("Checkout failed:", err);
      toast.error("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  const footer = (
    <div className="flex gap-3">
      {step > 1 && (
        <button
          type="button"
          onClick={() => goTo(step - 1)}
          className="flex h-[52px] items-center justify-center gap-1.5 rounded-full border-2 border-forest px-5 text-[15px] font-semibold text-forest transition-colors hover:bg-sage sm:px-7"
        >
          <ArrowLeft size={17} /> Back
        </button>
      )}
      {step < 3 ? (
        <button
          type="button"
          onClick={handleNext}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black"
        >
          Continue <ArrowRight size={17} />
        </button>
      ) : (
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Lock size={16} />
          {submitting ? "Taking you to payment…" : `Pay ${formatAmount(total)}`}
        </button>
      )}
    </div>
  );

  return (
    <ModalShell
      title={STEP_COPY[step].title}
      subtitle={STEP_COPY[step].subtitle}
      onClose={onClose}
      header={<StepIndicator steps={STEPS} current={step} />}
      footer={footer}
      labelledBy="checkout-title"
    >
      {step === 1 && <ContactStep form={form} emailLocked={Boolean(user)} />}
      {step === 2 && <DeliveryStep form={form} subTotal={subTotal} />}
      {step === 3 && (
        <ReviewStep
          form={form}
          items={items}
          totals={{ subTotal, discount, deliveryFee, total }}
          isGuest={!user}
          onEdit={goTo}
          onPromoApply={handlePromoApply}
          promoResetKey={promoResetKey}
          userId={user?._id}
        />
      )}
    </ModalShell>
  );
}
