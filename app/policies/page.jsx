"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Mail, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const sections = [
  {
    id: "terms",
    label: "Terms of Service",
    icon: FileText,
    content: [
      {
        heading: "Acceptance of Terms",
        body: "By accessing or using FIL Store (filstore.com.ng), operated by Fedan Investment Limited, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to update these terms at any time, and continued use of the platform constitutes your acceptance of any changes.",
      },
      {
        heading: "Use of the Platform",
        body: "FIL Store is an e-commerce platform for purchasing products. You agree to use the platform only for lawful purposes and in a manner that does not infringe on the rights of others. You must be at least 18 years old or have the consent of a parent or guardian to make purchases. You are responsible for maintaining the confidentiality of your account credentials.",
      },
      {
        heading: "Product Listings & Availability",
        body: "All products listed on FIL Store are subject to availability. We make every effort to ensure accurate descriptions, pricing, and images, but we do not warrant that product descriptions or other content are error-free. We reserve the right to refuse or cancel any order at our sole discretion, including cases where a product is mispriced or out of stock.",
      },
      {
        heading: "Orders & Payments",
        body: "When you place an order, you are making an offer to purchase. We accept payments via Paystack and Flutterwave. All transactions are processed securely. Your order is confirmed only upon successful payment processing. Fedan Investment Limited is not liable for failed transactions due to insufficient funds, network errors, or payment gateway issues beyond our control.",
      },
      {
        heading: "Pricing & Taxes",
        body: "All prices are displayed in Nigerian Naira (NGN) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to modify prices without prior notice. The price at the time of order confirmation is the price you will be charged.",
      },
      {
        heading: "Intellectual Property",
        body: "All content on FIL Store — including logos, text, graphics, images, and software — is the property of Fedan Investment Limited and is protected under applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.",
      },
      {
        heading: "Limitation of Liability",
        body: "FIL Store is provided on an 'as-is' basis. Fedan Investment Limited shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including loss of data, revenue, or business opportunities. Our total liability to you shall not exceed the amount paid for the specific order in question.",
      },
      {
        heading: "Governing Law",
        body: "These Terms of Service are governed by the laws of the Federal Republic of Nigeria. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.",
      },
    ],
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    icon: ShieldCheck,
    content: [
      {
        heading: "Information We Collect",
        body: "We collect information you provide directly, including your name, email address, phone number, delivery address, and payment details when you register or make a purchase. We also automatically collect usage data such as IP address, browser type, and pages visited through cookies and similar technologies.",
      },
      {
        heading: "How We Use Your Information",
        body: "Your information is used to process and fulfill orders, send transactional emails (order confirmations, shipping updates, receipts), provide customer support, improve our platform and product offerings, and comply with legal obligations. We do not sell or rent your personal data to third parties for their marketing purposes.",
      },
      {
        heading: "Data Sharing",
        body: "We may share your information with trusted third-party service providers such as payment processors (Paystack, Flutterwave), logistics partners, and email service providers solely to facilitate our services. These parties are contractually obligated to keep your data confidential and use it only for the specified purpose.",
      },
      {
        heading: "Cookies",
        body: "FIL Store uses HTTP-only cookies for session management and authentication. These cookies are essential to platform functionality. We do not use third-party advertising cookies. You can configure your browser to refuse cookies, but doing so may affect your ability to use certain features of the platform.",
      },
      {
        heading: "Data Security",
        body: "We implement industry-standard security measures including encrypted communications (HTTPS), secure password hashing, and HTTP-only JWT tokens to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
      },
      {
        heading: "Data Retention",
        body: "We retain your personal data for as long as your account is active or as needed to provide services. Order records may be retained for up to 7 years for accounting and legal compliance purposes. You may request deletion of your data at any time, subject to legal retention requirements.",
      },
      {
        heading: "Your Rights",
        body: "You have the right to access, correct, or delete your personal data. You may also request a copy of data we hold about you. To exercise these rights, contact us at filsmteam@gmail.com. We will respond to your request within 30 days.",
      },
      {
        heading: "Children's Privacy",
        body: "FIL Store is not directed at children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child under 13 has provided personal information, we will take steps to delete such information promptly.",
      },
    ],
  },
  {
    id: "returns",
    label: "Returns & Refunds",
    icon: RotateCcw,
    content: [
      {
        heading: "Return Eligibility",
        body: "Items may be returned within 7 days of delivery, provided they are unused, in their original packaging, and accompanied by proof of purchase. Non-defected products are not eligible for return.",
      },
      {
        heading: "How to Initiate a Return",
        body: "To initiate a return, log into your FIL Store account, navigate to your order history, and submit a return request through the Order Sheet. Alternatively, contact our support team at filsmteam@gmail.com with your order number and reason for return. Our team will respond within 2 business days with return instructions.",
      },
      {
        heading: "Return Shipping",
        body: "Customers are responsible for return shipping costs unless the item received was defective, damaged, or incorrect. We recommend using a trackable shipping method, as FIL Store is not responsible for items lost in transit during the return process.",
      },
      {
        heading: "Refund Processing",
        body: "Once your returned item is received and inspected, we will notify you via email of the approval or rejection of your refund. Approved refunds are processed within 5–10 business days and returned to your original payment method via Paystack.",
      },
      {
        heading: "Damaged or Incorrect Items",
        body: "If you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery with photos of the item and packaging. We will arrange for a replacement or full refund at no additional cost to you.",
      },
      {
        heading: "Exchange Policy",
        body: "We currently do not process direct exchanges. If you wish to exchange an item, please initiate a return for the original item and place a new order for the desired product. This ensures the fastest turnaround for you.",
      },
    ],
  },
  {
    id: "shipping",
    label: "Shipping Policy",
    icon: Truck,
    content: [
      {
        heading: "Delivery Areas",
        body: "FIL Store currently delivers to locations across Nigeria. Delivery availability and timelines may vary depending on your location. During checkout, enter your delivery address to confirm availability and view estimated delivery times for your area.",
      },
      {
        heading: "Processing Time",
        body: "Orders are processed within 1–2 business days after payment confirmation. Orders placed on weekends or public holidays are processed on the next business day. You will receive an order confirmation email immediately after successful payment.",
      },
      {
        heading: "Delivery Timelines",
        body: "Standard delivery within Lagos typically takes 1–3 business days. Delivery to other states may take 3–7 business days depending on the destination. These are estimates and not guarantees; unforeseen circumstances may cause delays.",
      },
      {
        heading: "Shipping Fees",
        body: "Shipping fees are calculated at checkout based on your delivery location and the weight of your order. We occasionally offer free shipping promotions, which will be displayed on the platform when available.",
      },
      {
        heading: "Order Tracking",
        body: "Once your order has been dispatched, you will receive a shipping notification email with tracking information. You can also track your order through your FIL Store account under Order History.",
      },
      {
        heading: "Failed Deliveries",
        body: "If a delivery attempt fails due to an incorrect address or unavailability of the recipient, our logistics partner will make a second attempt. After two failed attempts, the order may be returned to us and a redelivery fee may apply.",
      },
    ],
  },
];

export default function PolicyPage() {
  const [active, setActive] = useState("terms");
  const current = sections.find((s) => s.id === active);
  const CurrentIcon = current.icon;

  // Deep links like /policies#privacy open the matching section
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (sections.some((s) => s.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const select = (id) => {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-8 font-roboto sm:px-6 md:pt-12">
      {/* ── Header ── */}
      <span className="inline-block rounded-full bg-mint px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest">
        Legal
      </span>
      <h1 className="mt-4 text-[30px] font-bold tracking-tight text-forest md:text-[40px]">Policies &amp; terms</h1>
      <p className="mt-1 max-w-xl text-[15px] text-muted">
        How we operate, protect your data and get your orders to you. Questions? We&apos;re a message away.
      </p>
      <p className="mt-3 text-[13px] text-muted/80">Last updated: March 2025</p>

      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        {/* Section picker: scrolling pills on mobile, sticky list on desktop */}
        <nav aria-label="Policy sections" className="lg:sticky lg:top-24">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:rounded-[24px] lg:bg-sage lg:p-2">
            {sections.map(({ id, label, icon: Icon }) => {
              const on = active === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => select(id)}
                  aria-current={on ? "page" : undefined}
                  className={`flex h-11 shrink-0 items-center gap-2.5 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                    on
                      ? "bg-forest text-white"
                      : "bg-sage text-forest hover:bg-mint lg:bg-transparent lg:hover:bg-white"
                  }`}
                >
                  <Icon size={17} strokeWidth={2} />
                  {label}
                </button>
              );
            })}
          </div>

          <Link
            href="/cookie-policy"
            className="mt-4 hidden px-4 text-sm font-semibold text-forest underline-offset-4 hover:underline lg:block"
          >
            Cookie policy →
          </Link>
        </nav>

        {/* Content */}
        <article>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-forest">
              <CurrentIcon size={20} />
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-forest md:text-[28px]">{current.label}</h2>
          </div>

          <ol className="mt-6 divide-y divide-line border-y border-line">
            {current.content.map((item, i) => (
              <li key={item.heading} className="grid grid-cols-[32px_minmax(0,1fr)] gap-4 py-6 md:gap-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage text-[13px] font-bold text-forest">
                  {i + 1}
                </span>
                <div>
                  <h3 className="pt-1 text-base font-bold text-forest">{item.heading}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* ── Contact ── */}
          <div className="mt-10 flex flex-col items-start gap-4 rounded-[24px] bg-sage p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
            <div>
              <p className="text-lg font-bold text-forest">Questions about our policies?</p>
              <p className="mt-1 text-sm text-muted">We&apos;re happy to help. Reach out to our support team.</p>
            </div>
            <a
              href="mailto:filsmteam@gmail.com"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              <Mail size={16} />
              filsmteam@gmail.com
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
