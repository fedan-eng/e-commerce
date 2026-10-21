// components/VerifyPaymentPage.jsx — order confirmation after Paystack. Verifies the payment,
// removes what was bought from the cart, fires Meta/TikTok purchase events, and shows the order.
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import axios from "axios";
import { Check, Download, MapPin, PackageCheck, Truck, X } from "lucide-react";
import { useMetaPixelEvent } from "@/hooks/useMetaPixelEvent";
import { useTikTokEvent } from "@/hooks/useTikTokEvent";
import { removePurchased } from "@/store/features/cartSlice";
import Loading from "@/components/Loading";
import FeedbackForm from "@/components/FeedbackForm";
import { formatAmount } from "@/lib/utils";
import { ProductImage } from "./ProductImage";
import { DELIVERY_OPTIONS } from "./checkout/delivery";
import { downloadReceipt } from "./checkout/receiptPdf";
import SaveAccountCard from "./checkout/SaveAccountCard";

// Old checkout details kept in localStorage by earlier versions of the checkout
const OLD_CHECKOUT_KEYS = [
  "checkoutEmail", "checkoutFirstName", "checkoutAddress", "checkoutPhone",
  "checkoutaddPhone", "checkoutRegion", "checkoutCity", "checkoutDeliveryType",
];

const NEXT_STEPS = [
  { icon: Check, title: "Order confirmed", text: "Payment received" },
  { icon: PackageCheck, title: "Packing", text: "We get it ready" },
  { icon: Truck, title: "On the way", text: "We'll text you" },
  { icon: MapPin, title: "Delivered", text: "Enjoy!" },
];

export default function VerifyPaymentPage() {
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProvider, setPaymentProvider] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  const { trackPurchase: trackMetaPurchase } = useMetaPixelEvent();
  const { trackPurchase: trackTikTokPurchase } = useTikTokEvent();
  const hasVerified = useRef(false);

  const paystackRef = searchParams.get("reference");

  // ── Tracking ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderDetails) return;

    const lineItems = orderDetails.cartItems || orderDetails.items || [];
    const orderValue = Number(orderDetails.total ?? orderDetails.subTotal ?? 0);
    const txId = orderDetails.paymentReference || String(orderDetails._id) || "";
    if (!txId) return;

    // GA is tracked server-side (Paystack webhook) so it can't double-fire;
    // Meta Pixel and TikTok stay client-side
    trackMetaPurchase(orderDetails, lineItems);
    trackTikTokPurchase(lineItems, orderValue, txId);
  }, [orderDetails, trackMetaPurchase, trackTikTokPurchase]);

  // ── Verification ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasVerified.current) return;

    if (!paystackRef) {
      setError("No payment reference found.");
      setLoading(false);
      return;
    }

    hasVerified.current = true;
    setPaymentProvider("paystack");

    const verify = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.post("/api/verify-payment", {
          reference: paystackRef,
          provider: "paystack",
        });

        if (data.verified) {
          const order = data.order || data.orderData;
          setOrderDetails(order);
          // Only what was bought: a Buy Now order leaves the rest of the cart alone
          dispatch(removePurchased(order.cartItems || order.items || []));
          OLD_CHECKOUT_KEYS.forEach((key) => localStorage.removeItem(key));
        } else {
          setError("Payment verification failed. Please contact support.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "We couldn't verify your payment. Please try again or contact support."
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [paystackRef, dispatch]);

  const handleDownload = async () => {
    setDownloadingPdf(true);
    try {
      await downloadReceipt(orderDetails, paymentProvider);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Sorry, we couldn't generate your receipt. Please try again or contact support.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 font-roboto text-center">
        <Loading />
        <p className="text-[15px] text-muted">Confirming your payment…</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !orderDetails) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12 font-roboto">
        <div className="w-full max-w-md rounded-[28px] bg-sage p-8 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-filred">
            <X size={30} />
          </span>
          <h1 className="mt-5 text-[26px] font-bold tracking-tight text-forest">We couldn&apos;t confirm your payment</h1>
          <p className="mt-2 text-[15px] text-muted">{error || "No order details available."}</p>
          <p className="mt-2 text-sm text-muted">If money left your account, don&apos;t pay again. Contact us and we&apos;ll sort it out.</p>

          <div className="mt-7 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="h-12 rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="h-12 rounded-full border border-line bg-white text-[15px] font-semibold text-forest transition-colors hover:border-forest"
            >
              Back to Home
            </button>
          </div>
          <p className="mt-6 text-sm text-muted">
            Need help?{" "}
            <Link href="/contact" className="font-semibold text-forest underline underline-offset-2">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  const lineItems = orderDetails.cartItems || orderDetails.items || [];
  const itemCount = lineItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const regionName = orderDetails.region?.name || orderDetails.region || "";
  const delivery = DELIVERY_OPTIONS.find((o) => o.id === orderDetails.deliveryType);
  const orderDate = new Date(orderDetails.createdAt || Date.now()).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const trackHref = isAuthenticated ? "/profile?tab=My%20Orders" : `/contact?order=${orderDetails._id}#track`;

  const facts = [
    { label: "Order number", value: `#${orderDetails.paymentReference || orderDetails._id}` },
    { label: "Order date", value: orderDate },
    { label: "Payment", value: "Paid via Paystack" },
    { label: "Delivery", value: delivery ? delivery.title : orderDetails.deliveryType || "Regular delivery" },
  ];

  return (
    <main className="font-roboto">
      <FeedbackForm autoOpen={true} />

      <div className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-8 sm:px-6 md:pt-12">
        {/* ── Header ── */}
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-forest">
          <Check size={28} strokeWidth={2.5} />
        </span>
        <span className="mt-5 inline-block rounded-full bg-mint px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest">
          Order confirmed
        </span>
        <h1 className="mt-3 text-[30px] font-bold tracking-tight text-forest md:text-[40px]">
          Thank you, {orderDetails.firstName}!
        </h1>
        <p className="mt-1 max-w-xl text-[15px] text-muted">
          Your order is confirmed. We&apos;ve emailed your receipt to{" "}
          <strong className="break-all text-ink">{orderDetails.email}</strong>.
        </p>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {facts.map(({ label, value }) => (
                <div key={label} className="rounded-[20px] bg-sage p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-faint">{label}</dt>
                  <dd className="mt-1.5 break-all text-sm font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>

            {/* What happens next */}
            <section className="rounded-[24px] border border-line p-6">
              <h2 className="text-lg font-bold text-forest">What happens next</h2>
              {delivery && <p className="mt-1 text-sm text-muted">{delivery.detail}</p>}
              <ol className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {NEXT_STEPS.map(({ icon: Icon, title, text }, i) => (
                  <li key={title} className="flex flex-col gap-2">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        i === 0 ? "bg-forest text-white" : "bg-sage text-forest"
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="text-sm font-semibold text-ink">{title}</span>
                    <span className="-mt-1.5 text-xs text-muted">{text}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Delivery details */}
            <section className="rounded-[24px] border border-line p-6">
              <h2 className="text-lg font-bold text-forest">Delivering to</h2>
              <div className="mt-3 space-y-0.5 text-[15px] text-muted">
                <p className="font-semibold text-ink">
                  {orderDetails.firstName} {orderDetails.lastName}
                </p>
                <p>{orderDetails.address}</p>
                <p>
                  {orderDetails.city}
                  {regionName ? `, ${regionName}` : ""}
                </p>
                <p>{orderDetails.phone}</p>
                {orderDetails.addPhone && <p>{orderDetails.addPhone}</p>}
              </div>
            </section>

            {!isAuthenticated && orderDetails.email && <SaveAccountCard order={orderDetails} />}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={trackHref}
                className="flex h-12 items-center justify-center rounded-full bg-forest px-8 text-[15px] font-semibold text-white transition-colors hover:bg-black"
              >
                Track order
              </Link>
              <Link
                href="/products/power-banks"
                className="flex h-12 items-center justify-center rounded-full border border-line px-8 text-[15px] font-semibold text-forest transition-colors hover:border-forest hover:bg-sage"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* ── Order summary ── */}
          <aside className="rounded-[24px] bg-sage p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-forest">
              Your order <span className="font-normal text-muted">· {itemCount} {itemCount === 1 ? "item" : "items"}</span>
            </h2>
            <ul className="mt-5 flex flex-col gap-4">
              {lineItems.map((item, index) => (
                <li key={`${item._id || index}-${item.color || ""}`} className="flex items-center gap-3">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white">
                    <ProductImage src={item.image} alt={item.name} width={52} height={52} className="h-[52px] w-[52px] object-contain" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{item.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.color ? `${item.color} · ` : ""}Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-ink">{formatAmount(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="text-ink">{formatAmount(orderDetails.subTotal || 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="text-ink">{Number(orderDetails.deliveryFee) > 0 ? formatAmount(orderDetails.deliveryFee) : "Free"}</dd>
              </div>
              {orderDetails.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount{orderDetails.promoCode ? ` (${orderDetails.promoCode})` : ""}</dt>
                  <dd className="font-semibold text-forest">−{formatAmount(orderDetails.discount)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <dt className="text-base font-bold text-forest">Total paid</dt>
                <dd className="text-xl font-bold text-forest">{formatAmount(orderDetails.total || 0)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloadingPdf}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-forest bg-white text-[15px] font-semibold text-forest transition-colors hover:bg-mint disabled:cursor-wait disabled:opacity-60"
            >
              <Download size={17} /> {downloadingPdf ? "Preparing receipt…" : "Download Receipt"}
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
