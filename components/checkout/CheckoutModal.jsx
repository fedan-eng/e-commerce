"use client";
// components/checkout/CheckoutModal.jsx — Contact → Delivery → Review, then Paystack.
// Pass `buyNowItem` to check out a single product instead of the cart.
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { updateUser } from "@/store/features/authSlice";
import { updatePrices } from "@/store/features/cartSlice";
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
  const [buyNowPrice, setBuyNowPrice] = useState(null); // today's price, once checked
  // Memoised: a fresh [buyNowItem] array every render would reset the promo code forever
  const items = useMemo(
    () => (buyNowItem ? [{ ...buyNowItem, price: buyNowPrice ?? buyNowItem.price }] : cartItemsFromStore),
    [buyNowItem, buyNowPrice, cartItemsFromStore]
  );

  // Payment is charged at today's prices (lib/pricing.js), so show those before anyone pays.
  // Checked once when checkout opens.
  const itemsAtOpen = useRef(items);
  useEffect(() => {
    const opened = itemsAtOpen.current;
    if (opened.length === 0) return;
    let cancelled = false;

    fetch("/api/cart/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: opened.map((item) => item._id) }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.prices) return;
        const { prices } = data;

        const unavailable = opened.filter((item) => !prices[item._id]?.available);
        if (unavailable.length > 0) {
          toast.error(`${unavailable.map((i) => i.name).join(", ")} is no longer available. Please remove it from your cart.`, { duration: 6000 });
        }

        const changed = opened.filter((item) => prices[item._id] && prices[item._id].price !== item.price);
        if (changed.length === 0) return;
        if (buyNowItem) setBuyNowPrice(prices[buyNowItem._id].price);
        else dispatch(updatePrices(Object.fromEntries(changed.map((item) => [item._id, prices[item._id].price]))));
        toast(
          `Price updated: ${changed.map((i) => `${i.name} is now ${formatAmount(prices[i._id].price)}`).join(", ")}`,
          { icon: "ℹ️", duration: 6000 }
        );
      })
      .catch(() => {}); // the payment step checks prices anyway

    return () => {
      cancelled = true;
    };
  }, [buyNowItem, dispatch]);

  const form = useCheckoutForm();
  const { values, user } = form;
  const { preferences, status } = useCookieConsent();
  const { trackInitiateCheckout } = useMetaPixelEvent();

  const [step, setStep] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState(null);
  const [promoResetKey, setPromoResetKey] = useState(0);
  const [promoRemoved, setPromoRemoved] = useState(false); // stops a creator link re-applying its code
  const [freeSwitched, setFreeSwitched] = useState(false); // we moved them off Free delivery for a code
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

  // Free delivery needs a minimum spend and no promo code. A code moves them to Regular,
  // and removing it again puts Free back (see handlePromoApply).
  const { setValue } = form;
  useEffect(() => {
    if (values.deliveryType !== "Free" || isFreeDeliveryAvailable(subTotal, promoCode)) return;
    setValue("deliveryType", "Regular");
    if (promoCode) setFreeSwitched(true);
  }, [subTotal, promoCode, values.deliveryType, setValue]);

  // Choosing Express themselves means there's nothing to undo. (Not "anything but Regular":
  // in the render that switches them, the old value is still Free.)
  useEffect(() => {
    if (values.deliveryType === "Express") setFreeSwitched(false);
  }, [values.deliveryType]);

  // Signed-in shoppers whose details are all saved start on Review; Back still lets them edit.
  // Checked once, right after the prefill, so typing on step 1 never jumps ahead.
  const { fromAccount, isComplete } = form;
  const skipChecked = useRef(false);
  useEffect(() => {
    if (!fromAccount || skipChecked.current) return;
    skipChecked.current = true;
    if (isComplete([...CONTACT_FIELDS, ...DELIVERY_FIELDS])) setStep(3);
  }, [fromAccount, isComplete]);

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

  const handlePromoApply = ({ promoCode: code, amount, removed }) => {
    setPromoCode(code || null);
    setDiscount(amount || 0);
    if (code) setPromoRemoved(false);
    if (removed) {
      setPromoRemoved(true);
      if (freeSwitched && isFreeDeliveryAvailable(subTotal)) setValue("deliveryType", "Free");
      setFreeSwitched(false);
    }
  };

  const freeNotice = freeSwitched && promoCode
    ? `Free delivery isn't available with promo codes, so we've switched you to Regular delivery (+${formatAmount(deliveryFee)}).`
    : null;

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
      {step === 2 && <DeliveryStep form={form} subTotal={subTotal} promoCode={promoCode} />}
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
          promo={{
            applied: promoCode ? { code: promoCode, amount: discount } : null,
            autoApplyRef: !promoRemoved,
            notice: freeNotice,
            removeLabel: freeNotice ? "Remove code and keep free delivery" : "Remove",
          }}
        />
      )}
    </ModalShell>
  );
}
