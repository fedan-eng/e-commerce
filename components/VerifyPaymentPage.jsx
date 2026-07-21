// components/VerifyPaymentPage.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useGAEvent } from "@/hooks/useGAEvent";
import { useMetaPixelEvent } from "@/hooks/useMetaPixelEvent";
import { useTikTokEvent } from "@/hooks/useTikTokEvent";
import { clearCart } from "@/store/features/cartSlice";
import axios from "axios";
import Loading from "@/components/Loading";
import Link from "next/link";
import TextSlider from "@/components/TextSlider";
import FeedbackForm from "@/components/FeedbackForm";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatAmount } from "@/lib/utils";

export default function VerifyPaymentPage() {
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProvider, setPaymentProvider] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { trackEvent } = useGAEvent();
  const { trackPurchase: trackMetaPurchase } = useMetaPixelEvent();
  const { trackPurchase: trackTikTokPurchase } = useTikTokEvent();
  const hasVerified = useRef(false);

  const paystackRef = searchParams.get("reference");
  const flutterwaveRef = searchParams.get("transaction_id");
  const flutterwaveStatus = searchParams.get("status");

  // ── Tracking ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderDetails) return;

    const lineItems = orderDetails.cartItems || orderDetails.items || [];
    const orderValue = Number(orderDetails.total ?? orderDetails.subTotal ?? 0);
    const txId =
      orderDetails.paymentReference || String(orderDetails._id) || "";

    if (!txId) return;

    trackEvent("purchase", {
      transaction_id: txId,
      currency: "NGN",
      value: orderValue,
      coupon: orderDetails.couponCode || undefined,
      shipping: Number(orderDetails.deliveryFee || 0),
      tax: 0,
      items: lineItems.map((item, index) => ({
        item_id: String(item._id || item.productId || index),
        item_name: item.name || "Unknown",
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
      })),
    });

    trackMetaPurchase(orderDetails, lineItems);
    trackTikTokPurchase(lineItems, orderValue, txId);
  }, [orderDetails, trackEvent, trackMetaPurchase, trackTikTokPurchase]);

  // ── Verification ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasVerified.current) return;

    let reference, provider;

    if (paystackRef) {
      reference = paystackRef;
      provider = "paystack";
    } else if (flutterwaveRef) {
      reference = flutterwaveRef;
      provider = "flutterwave";
      if (
        flutterwaveStatus !== "successful" &&
        flutterwaveStatus !== "completed"
      ) {
        setError("Payment was not successful. Please try again.");
        setLoading(false);
        return;
      }
    } else {
      setError("No payment reference found.");
      setLoading(false);
      return;
    }

    hasVerified.current = true;
    setPaymentProvider(provider);

    const verify = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.post("/api/verify-payment", {
          reference,
          provider,
        });

        if (data.verified) {
          setOrderDetails(data.order || data.orderData);
          dispatch(clearCart());
          localStorage.removeItem("cart");
          localStorage.removeItem("checkoutEmail");
          localStorage.removeItem("checkoutFirstName");
          localStorage.removeItem("checkoutAddress");
          localStorage.removeItem("checkoutPhone");
          localStorage.removeItem("checkoutaddPhone");
          localStorage.removeItem("checkoutRegion");
          localStorage.removeItem("checkoutCity");
          localStorage.removeItem("checkoutDeliveryType");
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
  }, [paystackRef, flutterwaveRef, flutterwaveStatus, dispatch]);

  // ── PDF receipt (unchanged) ───────────────────────────────────────────────
  const generateReceipt = () => {
    if (!orderDetails) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.setFontSize(60);
    doc.setTextColor(28, 201, 120);
    doc.text("FIL", pageWidth / 2, pageHeight / 2, {
      align: "center",
      angle: 45,
    });
    doc.setGState(new doc.GState({ opacity: 1 }));

    try {
      const logo = new Image();
      logo.src = "/fillogo.png";
      doc.addImage(logo, "PNG", pageWidth / 2 - 20, 10, 40, 40);
    } catch {}

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 201, 120);
    doc.text("Fedan Investment Limited", pageWidth / 2, 58, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Think Quality, Think FIL", pageWidth / 2, 65, { align: "center" });

    doc.setDrawColor(28, 201, 120);
    doc.setLineWidth(0.5);
    doc.line(14, 70, pageWidth - 14, 70);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 51, 51);
    doc.text("ORDER RECEIPT", pageWidth / 2, 80, { align: "center" });

    doc.setFillColor(248, 249, 250);
    doc.roundedRect(14, 88, pageWidth - 28, 16, 3, 3, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 201, 120);
    doc.text("Order Reference:", 18, 96);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 51, 51);
    doc.text(orderDetails.paymentReference, 58, 96);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 201, 120);
    doc.text("Date:", 18, 101);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 51, 51);
    doc.text(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      32,
      101
    );

    let yPos = 114;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 51, 51);
    doc.text("CUSTOMER INFORMATION", 14, yPos);
    yPos += 2;
    doc.setDrawColor(28, 201, 120);
    doc.setLineWidth(0.3);
    doc.line(14, yPos, 70, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);

    const customerInfo = [
      {
        label: "Name:",
        value: `${orderDetails.firstName} ${orderDetails.lastName || ""}`,
      },
      { label: "Email:", value: orderDetails.email },
      { label: "Phone:", value: orderDetails.phone },
      {
        label: "Address:",
        value: `${orderDetails.address}, ${orderDetails.city}`,
      },
      {
        label: "Region:",
        value: orderDetails.region?.name || orderDetails.region,
      },
      { label: "Delivery:", value: orderDetails.deliveryType },
    ];

    customerInfo.forEach((info) => {
      doc.setFont("helvetica", "bold");
      doc.text(info.label, 14, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(String(info.value || ""), 40, yPos);
      yPos += 6;
    });

    yPos += 4;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 51, 51);
    doc.text("PAYMENT DETAILS", 14, yPos);
    yPos += 2;
    doc.setDrawColor(28, 201, 120);
    doc.line(14, yPos, 70, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("Payment Method:", 14, yPos);
    doc.setFont("helvetica", "normal");
    const paymentMethod = paymentProvider
      ? paymentProvider.charAt(0).toUpperCase() + paymentProvider.slice(1)
      : "N/A";
    doc.text(paymentMethod, 50, yPos);
    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Status:", 14, yPos);
    doc.setTextColor(28, 201, 120);
    doc.text("✓ PAID", 50, yPos);

    yPos += 12;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 51, 51);
    doc.text("ORDER ITEMS", 14, yPos);
    yPos += 2;
    doc.setDrawColor(28, 201, 120);
    doc.line(14, yPos, 70, yPos);

    const tableData = orderDetails.cartItems.map((item, i) => [
      String(i + 1),
      item.name,
      String(item.quantity),
      `₦${Number(item.price).toLocaleString()}`,
      `₦${(Number(item.price) * Number(item.quantity)).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: yPos + 5,
      head: [["#", "Product", "Qty", "Unit Price", "Total"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [28, 201, 120],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
      },
      bodyStyles: { textColor: [51, 51, 51], fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 70 },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "right", cellWidth: 35 },
        4: { halign: "right", cellWidth: 35 },
      },
      margin: { left: 14, right: 14 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(pageWidth - 90, finalY, 76, 45, 3, 3, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const summaryY = finalY + 8;
    doc.text("Subtotal:", pageWidth - 85, summaryY);
    doc.text(
      `₦${Number(orderDetails.subTotal).toLocaleString()}`,
      pageWidth - 20,
      summaryY,
      { align: "right" }
    );
    doc.text("Delivery Fee:", pageWidth - 85, summaryY + 7);
    doc.text(
      `₦${Number(orderDetails.deliveryFee).toLocaleString()}`,
      pageWidth - 20,
      summaryY + 7,
      { align: "right" }
    );
    doc.text("Discount:", pageWidth - 85, summaryY + 14);
    doc.setTextColor(28, 201, 120);
    doc.text(
      `-₦${Number(orderDetails.discount).toLocaleString()}`,
      pageWidth - 20,
      summaryY + 14,
      { align: "right" }
    );
    doc.setDrawColor(28, 201, 120);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 85, summaryY + 18, pageWidth - 15, summaryY + 18);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 201, 120);
    doc.text("TOTAL:", pageWidth - 85, summaryY + 26);
    doc.setFontSize(14);
    doc.text(
      `₦${Number(orderDetails.total).toLocaleString()}`,
      pageWidth - 20,
      summaryY + 26,
      { align: "right" }
    );

    const footerY = pageHeight - 30;
    doc.setDrawColor(28, 201, 120);
    doc.setLineWidth(0.3);
    doc.line(14, footerY, pageWidth - 14, footerY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for choosing FIL Store!", pageWidth / 2, footerY + 6, {
      align: "center",
    });
    doc.text(
      "For support: filfilecommerce@gmail.com | Visit: filstore.com.ng",
      pageWidth / 2,
      footerY + 11,
      { align: "center" }
    );
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This is a computer-generated receipt and does not require a signature.",
      pageWidth / 2,
      footerY + 18,
      { align: "center" }
    );

    doc.save(`FIL-Receipt-${orderDetails.paymentReference}.pdf`);
  };

  // ── Loading / Error / Empty States (unchanged) ────────────────────────────
  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-oswald font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          {paymentProvider && (
            <p className="text-xs text-gray-500 mb-6">
              Payment Provider:{" "}
              <span className="capitalize font-medium">{paymentProvider}</span>
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/cart")}
              className="w-full bg-filgreen text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            Need help?{" "}
            <Link href="/contact" className="text-filgreen underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">No order details available.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-filgreen mt-4 px-4 py-2 rounded text-white"
        >
          Back Home
        </button>
      </div>
    );
  }

  // ── Success UI ────────────────────────────────────────────────────────────
  const lineItems = orderDetails.cartItems || orderDetails.items || [];
  const regionName = orderDetails.region?.name || orderDetails.region || "";
  const paymentMethodLabel = paymentProvider
    ? paymentProvider.charAt(0).toUpperCase() + paymentProvider.slice(1)
    : "N/A";

  return (
    <div className="relative">
      <div className="top-32 xs:right-6 z-50 fixed">
        <FeedbackForm />
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10">
        {/* ── Thank you header ── */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-9 h-9 bg-filgreen rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg
              className="w-5 h-5 text-white"
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
          </div>
          <div>
            <h1 className="font-bold text-xl sm:text-2xl text-dark leading-tight">
              Thank you, {orderDetails.firstName}!
            </h1>
            <p className="text-sm text-[#767676] mt-1">
              Your order is confirmed. A receipt has been sent to{" "}
              {orderDetails.email}
            </p>
          </div>
        </div>

        <div className="lg:flex gap-6 items-start">
          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0">
            {/* Order info card */}
            <div className="border border-[#e3e3e3] rounded-lg p-5 mb-8">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <p className="text-xs text-[#999] mb-1">Order number</p>
                  <p className="text-sm font-medium text-dark break-all">
                    #{orderDetails.paymentReference}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#999] mb-1">Order date</p>
                  <p className="text-sm font-medium text-dark">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#999] mb-1">Payment method</p>
                  <p className="text-sm font-medium text-dark capitalize">
                    {paymentMethodLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#999] mb-1">Estimated delivery</p>
                  <p className="text-sm font-medium text-dark">
                    2 – 4 working days
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div className="mb-8">
              <h2 className="font-bold text-base mb-3 text-dark">
                Shipping Address
              </h2>
              <div className="text-sm text-[#575757] space-y-1">
                <p>
                  {orderDetails.firstName} {orderDetails.lastName}
                </p>
                <p>{orderDetails.address}</p>
                <p>
                  {orderDetails.city}, {regionName}
                </p>
                <p>Nigeria</p>
                <p>{orderDetails.phone}</p>
                {orderDetails.addPhone && <p>{orderDetails.addPhone}</p>}
              </div>
            </div>

            {/* Billing address */}
            <div className="mb-8">
              <h2 className="font-bold text-base mb-3 text-dark">
                Billing Address
              </h2>
              <p className="text-sm text-[#767676]">Same as shipping address</p>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 mb-6">
              <Link
                href={`/contact?order=${orderDetails._id}`}
                className="bg-filgreen hover:bg-green-700 px-8 py-3 rounded-md font-medium text-white text-sm transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/products"
                className="px-8 py-3 border border-[#d9d9d9] hover:bg-gray-50 rounded-md font-medium text-dark text-sm transition-colors"
              >
                Continue Shopping
              </Link>
            </div>

            {/* PDF download link */}
            <button
              onClick={generateReceipt}
              className="text-filgreen text-sm underline cursor-pointer hover:text-green-700 transition-colors"
            >
              Download receipt (PDF)
            </button>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="lg:w-[380px] flex-shrink-0 max-lg:mt-8">
            <div className="bg-[#f6f6f6] rounded-lg p-5">
              {/* Items list */}
              <div className="space-y-5 mb-6">
                {lineItems.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 w-[70px] h-[70px] bg-white rounded-md flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-[56px] h-[56px] object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-dark leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      {item.color && (
                        <p className="text-xs text-[#767676] mt-1">
                          {item.color}
                        </p>
                      )}
                      <p className="text-xs text-[#767676] mt-0.5">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm text-dark flex-shrink-0 whitespace-nowrap">
                      {formatAmount(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-[#e0e0e0] pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#767676]">
                    Subtotal · {lineItems.length}{" "}
                    {lineItems.length === 1 ? "item" : "items"}
                  </span>
                  <span className="text-dark">
                    {formatAmount(orderDetails.subTotal || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#767676]">Shipping</span>
                  <span className="text-dark">
                    {formatAmount(orderDetails.deliveryFee || 0)}
                  </span>
                </div>
                {orderDetails.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#767676]">Discount</span>
                    <span className="text-filgreen">
                      - {formatAmount(orderDetails.discount)}
                    </span>
                  </div>
                )}
                <div className="flex border-t border-[#e0e0e0] pt-4 space-y-2.5 justify-between items-center">
                  <span className="font-bold text-dark text-lg">Total</span>
                  <span className="font-bold text-dark text-lg">
                    {formatAmount(orderDetails.total || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 overflow-hidden">
        <TextSlider />
      </div>
    </div>
  );
}