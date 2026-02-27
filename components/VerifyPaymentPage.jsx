// components/VerifyPaymentPage.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "@/store/features/cartSlice";
import axios from "axios";
import Loading from "@/components/Loading";
import { formatAmount } from "lib/utils";
import Link from "next/link";
import TextSlider from "@/components/TextSlider";
import FeedbackForm from "@/components/FeedbackForm";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function VerifyPaymentPage() {
  const [orderDetails, setOrderDetails] = useState(null); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProvider, setPaymentProvider] = useState(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items || []);
  const user = useSelector((state) => state.auth.user || null);
  const hasVerified = useRef(false);

  // Get payment reference based on provider
  const paystackRef = searchParams.get("reference");
  const flutterwaveRef = searchParams.get("transaction_id");
  const flutterwaveStatus = searchParams.get("status");

  useEffect(() => {
    // Prevent double verification
    if (hasVerified.current) return;

    // Determine payment provider and reference
    let reference, provider;

    if (paystackRef) {
      reference = paystackRef;
      provider = "paystack";
    } else if (flutterwaveRef) {
      reference = flutterwaveRef;
      provider = "flutterwave";

      // Check Flutterwave status from URL
     if (flutterwaveStatus !== "successful" && flutterwaveStatus !== "completed") {
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
        // Call unified verification endpoint
        const { data } = await axios.post("/api/verify-payment", {
          reference,
          provider,
        });

        if (data.verified) {
          setOrderDetails(data.orderData);
          dispatch(clearCart());
           
          // Clear localStorage checkout data
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
        console.error(
          "Payment verification failed:",
          err.response?.data || err.message
        );
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

 const generateReceipt = () => {
  if (!orderDetails) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Add watermark
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.setFontSize(60);
  doc.setTextColor(28, 201, 120);
  doc.text('FIL', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45
  });
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Add logo at the top
  try {
    const logo = new Image();
    logo.src = '/fillogo.png';
    doc.addImage(logo, 'PNG', pageWidth / 2 - 20, 10, 40, 40);
  } catch (error) {
    console.log('Logo not found, skipping');
  }

  // Company name and tagline
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 201, 120);
  doc.text('Fedan Investment Limited', pageWidth / 2, 58, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Think Quality, Think FIL', pageWidth / 2, 65, { align: 'center' });

  // Divider line
  doc.setDrawColor(28, 201, 120);
  doc.setLineWidth(0.5);
  doc.line(14, 70, pageWidth - 14, 70);

  // Receipt title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('ORDER RECEIPT', pageWidth / 2, 80, { align: 'center' });

  // Order reference box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(14, 88, pageWidth - 28, 16, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 201, 120);
  doc.text('Order Reference:', 18, 96);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text(orderDetails.paymentReference, 58, 96);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 201, 120);
  doc.text('Date:', 18, 101);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text(new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }), 32, 101);

  // Customer Information Section
  let yPos = 114;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('CUSTOMER INFORMATION', 14, yPos);
  
  yPos += 2;
  doc.setDrawColor(28, 201, 120);
  doc.setLineWidth(0.3);
  doc.line(14, yPos, 70, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  const customerInfo = [
    { label: 'Name:', value: `${orderDetails.firstName} ${orderDetails.lastName || ''}` },
    { label: 'Email:', value: orderDetails.email },
    { label: 'Phone:', value: orderDetails.phone },
    { label: 'Address:', value: `${orderDetails.address}, ${orderDetails.city}` },
    { label: 'Region:', value: orderDetails.region?.name || orderDetails.region },
    { label: 'Delivery:', value: orderDetails.deliveryType },
  ];

  customerInfo.forEach((info) => {
    doc.setFont('helvetica', 'bold');
    doc.text(info.label, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(info.value, 40, yPos);
    yPos += 6;
  });

  // Payment Information Section
  yPos += 4;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('PAYMENT DETAILS', 14, yPos);
  
  yPos += 2;
  doc.setDrawColor(28, 201, 120);
  doc.line(14, yPos, 70, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  const paymentMethod = paymentProvider ? 
    paymentProvider.charAt(0).toUpperCase() + paymentProvider.slice(1) : 
    'N/A';
  doc.text(paymentMethod, 50, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 14, yPos);
  doc.setTextColor(28, 201, 120);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ PAID', 50, yPos);

  // Order Items Section
  yPos += 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('ORDER ITEMS', 14, yPos);
  
  yPos += 2;
  doc.setDrawColor(28, 201, 120);
  doc.line(14, yPos, 70, yPos);

  // Items Table
  const tableData = orderDetails.cartItems.map((item, i) => [
    String(i + 1),
    item.name,
    String(item.quantity),
    `₦${Number(item.price).toLocaleString()}`,
    `₦${(Number(item.price) * Number(item.quantity)).toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['#', 'Product', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [28, 201, 120],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
    },
    bodyStyles: {
      textColor: [51, 51, 51],
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 },
    },
    margin: { left: 14, right: 14 },
  });

  // Summary Section
  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Summary box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(pageWidth - 90, finalY, 76, 45, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  const summaryY = finalY + 8;
  doc.text('Subtotal:', pageWidth - 85, summaryY);
  doc.text(`₦${Number(orderDetails.subTotal).toLocaleString()}`, pageWidth - 20, summaryY, { align: 'right' });
  
  doc.text('Delivery Fee:', pageWidth - 85, summaryY + 7);
  doc.text(`₦${Number(orderDetails.deliveryFee).toLocaleString()}`, pageWidth - 20, summaryY + 7, { align: 'right' });
  
  doc.text('Discount:', pageWidth - 85, summaryY + 14);
  doc.setTextColor(28, 201, 120);
  doc.text(`-₦${Number(orderDetails.discount).toLocaleString()}`, pageWidth - 20, summaryY + 14, { align: 'right' });
  
  // Total line
  doc.setDrawColor(28, 201, 120);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 85, summaryY + 18, pageWidth - 15, summaryY + 18);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 201, 120);
  doc.text('TOTAL:', pageWidth - 85, summaryY + 26);
  doc.setFontSize(14);
  doc.text(`₦${Number(orderDetails.total).toLocaleString()}`, pageWidth - 20, summaryY + 26, { align: 'right' });

  // Footer
  const footerY = pageHeight - 30;
  doc.setDrawColor(28, 201, 120);
  doc.setLineWidth(0.3);
  doc.line(14, footerY, pageWidth - 14, footerY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing FIL Store!', pageWidth / 2, footerY + 6, { align: 'center' });
  doc.text('For support: support@filstore.com.ng | Visit: filstore.com.ng', pageWidth / 2, footerY + 11, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated receipt and does not require a signature.', pageWidth / 2, footerY + 18, { align: 'center' });

  // Save PDF
  doc.save(`FIL-Receipt-${orderDetails.paymentReference}.pdf`);
};

  // 1️⃣ Loading state
  if (loading) {
    return <Loading />;
  }

  // 2️⃣ Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          {/* Error Icon */}
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

  // 3️⃣ Success state
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

  return (
    <div className="relative">
      <div className="top-32 xs:right-6 z-50 fixed">
        <FeedbackForm />
      </div>

      <div className="mx-2">
        <div className="bg-[#f6f6f6] m-4 mx-auto p-2 md:p-4 rounded-md w-full max-w-[1140px]">
          <div className="mx-auto w-full max-w-[648px]">
            <div className="flex justify-center w-full">
              <div className="w-[85px] h-[85px]">
                <img
                  className="w-full h-full object-cover"
                  src="/success.gif"
                  alt="Order Success"
                />
              </div>
            </div>
            <h1 className="font-oswald text-[32px] text-filgreen text-center">
              Order Confirmed
            </h1>
            <p className="font-medium">
              Hello {orderDetails.firstName}
            </p>
            <p className="text-sm leading-[160%]">
              Your order has been confirmed and will be on its way soon. Thank
              you for shopping with us!
            </p>

            {/* Payment Provider Badge */}
            {paymentProvider && (
              <div className="mt-4 inline-block bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <p className="text-sm text-gray-600">
                  Paid via:{" "}
                  <span className="font-medium capitalize">{paymentProvider}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Reference: {orderDetails.paymentReference}
                </p>
              </div>
            )}

            <div className="flex gap-2 s:gap-20 mt-7">
              <div>
                <p className="mb-4 text-[#929292] text-xs s:text-base">
                  Order Reference
                </p>
                <p className="text-[#929292] text-xs s:text-base">Order Date</p>
              </div>
              <div>
                <p className="mb-4 font-medium text-dark text-xs s:text-base break-words">
                  {orderDetails.paymentReference}
                </p>
                <p className="font-medium text-dark text-xs s:text-base">
                  {new Date().toLocaleString()}
                </p>
              </div>
            </div>

            <div className="items-justify-center gap-2 lg:gap-4 grid grid-cols-[minmax(100px,1fr)_30px_60px] xs:grid-cols-[20px_minmax(100px,1fr)_60px_60px] mt-4 py-4 border-[#d9d9d9] border-t border-b">
              <span className="max-xs:hidden min-w-0 font-medium text-sm text-center">
                #
              </span>
              <span className="min-w-0 font-medium text-sm">Product</span>
              <span className="min-w-0 font-medium text-sm">Qty</span>
              <span className="min-w-0 font-medium text-sm">Price</span>
            </div>

            {orderDetails.cartItems?.map((item, index) => (
              <div
                key={item._id || index}
                className="items-center gap-2 lg:gap-4 grid grid-cols-[minmax(100px,1fr)_30px_60px] xs:grid-cols-[20px_minmax(100px,1fr)_60px_60px] py-2 text-sm sm:text-base"
              >
                <span className="max-xs:hidden min-w-0 text-sm text-center">
                  {index + 1}
                </span>

                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex flex-shrink-0 justify-center items-center w-[40px] xs:w-[81px] h-[40px] xs:h-[81px]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div>
                    <p className="min-w-0 font-oswald text-xs xs:text-sm line-clamp-1">
                      {item.name}
                    </p>
                    <p className="xs:my-2 text-[#767676] text-xs">Wearables</p>
                    <p className="text-xs">Color:Black</p>
                  </div>
                </div>

                <span className="min-w-0 text-dark text-sm">
                  {item.quantity}
                </span>

                <span className="min-w-0 text-dark text-sm">
                  {formatAmount(item.price)}
                </span>
              </div>
            ))}

            <div className="items-center gap-2 lg:gap-4 grid grid-cols-2 xs:grid-cols-[20px_minmax(100px,1fr)_100px_100px] mt-4 mb-6 py-4 border-[#d9d9d9] border-t border-b text-sm sm:text-base">
              <div></div>
              <div></div>
              <div>
                <p className="mb-2 text-[#929292] text-sm">Sub Total</p>
                <p className="mb-2 text-[#929292] text-sm">Delivery Fees</p>
                <p className="mb-2 text-[#929292] text-sm">Discount</p>
                <p className="mb-2 font-medium text-sm">Total</p>
              </div>
              <div>
                <p className="mb-2 font-medium text-sm">
                  {formatAmount(orderDetails.subTotal || 0)}
                </p>
                <p className="mb-2 font-medium text-sm">
                  {formatAmount(orderDetails.deliveryFee || 0)}
                </p>
                <p className="mb-2 font-medium text-sm">
                  - {formatAmount(orderDetails.discount || 0)}
                </p>
                <p className="mb-2 font-medium text-sm">
                  {formatAmount(orderDetails.total || 0)}
                </p>
              </div>
            </div>

            <div className="xs:flex gap-4 mt-6 w-full">
              <div className="xs:w-1/2">
                <h2 className="mb-4 font-oswald font-medium">
                  Delivery Information
                </h2>

                <h3 className="font-medium text-sm">
                  {orderDetails.firstName} {orderDetails.lastName}
                </h3>

                <h3 className="mb-3 font-medium text-sm">
                  {orderDetails.email}
                </h3>

                <p className="my-3 text-[#575757] text-sm">
                  {orderDetails.address}
                </p>

                <p className="mb-3 text-sm">
                  {orderDetails.city}, {orderDetails.region?.name || orderDetails.region}
                </p>

                <p className="mb-4 text-sm">{orderDetails.phone}</p>

                {orderDetails.addPhone && (
                  <p className="mb-4 text-sm">Alt: {orderDetails.addPhone}</p>
                )}

                <div className="flex items-center gap-2">
                  <div className="w-[20px] h-[20px]">
                    <img
                      src="/delivery.png"
                      alt="Delivery"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-sm capitalize">
                    {orderDetails.deliveryType}
                  </p>
                </div>
              </div>

              <div className="max-xs:hidden xs:w-1/2">
                <h2 className="mb-4 font-oswald font-medium">Payment Method</h2>
                <p className="text-sm capitalize font-medium mb-2">
                  {paymentProvider || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Pay with Cards, Bank Transfer or USSD
                </p>
              </div>
            </div>

            <div className="flex justify-center items-center gap-2 xxs:gap-4 mt-6 pt-4 pb-12 border-[#d9d9d9] border-t">
              <Link
                href="/contact"
                className="px-2 sm:px-6 py-3 border border-[#d9d9d9] rounded-md font-roboto font-medium text-dark text-xs sm:text-sm whitespace-nowrap"
              >
                Need Help
              </Link>
              <Link
                href="/products"
                className="bg-filgreen px-2 sm:px-6 py-3 rounded-md font-roboto font-medium text-dark text-xs sm:text-sm whitespace-nowrap"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 mt-6 mb-12">
        <button
          onClick={generateReceipt}
          className="bg-filgreen px-2 sm:px-6 py-3 rounded-md font-roboto font-medium text-dark text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:bg-green-600 transition-colors"
        >
          Download Receipt (PDF)
        </button>
      </div>

      <div className="mt-12 overflow-hidden">
        <TextSlider />
      </div>
    </div>
  );
}