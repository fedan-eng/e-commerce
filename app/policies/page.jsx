"use client";

import { useState } from "react";

const sections = [
  {
    id: "terms",
    label: "Terms of Service",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
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
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
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
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
      </svg>
    ),
    content: [
      {
        heading: "Return Eligibility",
        body: "Items may be returned within 7 days of delivery, provided they are unused, in their original packaging, and accompanied by proof of purchase. Perishable goods, digital products, and items marked as final sale are not eligible for return.",
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
        body: "Once your returned item is received and inspected, we will notify you via email of the approval or rejection of your refund. Approved refunds are processed within 5–10 business days and returned to your original payment method via Paystack or Flutterwave.",
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
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="w-full bg-gradient-to-br from-[#0d3d26] to-[#1cc978] px-6 py-16 text-center">
        <span className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white">
          Fedan Investment Limited
        </span>
        <h1 className="mb-3 text-4xl font-bold text-white md:text-5xl">
          Policies &amp; Terms
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-white/70">
          Everything you need to know about how we operate, protect your data, and serve you better.
        </p>
        <p className="mt-5 text-xs text-white/40">Last updated: March 2025</p>
      </section>

      {/* ── Layout ── */}
      <div className="mx-auto max-w-5xl px-4 py-12 md:flex md:items-start md:gap-8">

        {/* Sidebar */}
        <aside className="mb-6 shrink-0 md:sticky md:top-6 md:mb-0 md:w-56">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <p className="px-5 pb-2 pt-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Sections
            </p>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex w-full items-center gap-3 border-l-4 px-5 py-3.5 text-left text-sm font-medium transition-all duration-150
                  ${
                    active === s.id
                      ? "border-[#1cc978] bg-green-50 text-[#1cc978]"
                      : "border-transparent text-gray-500 hover:bg-green-50/60 hover:text-[#1cc978]"
                  }`}
              >
                <span className="shrink-0">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content panel */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Panel header */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-green-50/60 to-white px-8 py-7">
            <h2 className="text-2xl font-bold text-gray-900">{current.label}</h2>
            <p className="mt-1 text-sm text-gray-400">
              Please read this section carefully before using FIL Store.
            </p>
          </div>

          {/* Clauses */}
          {current.content.map((item, i) => (
            <div
              key={i}
              className="border-b border-gray-100 px-8 py-7 last:border-b-0 hover:bg-gray-50/50 transition-colors duration-100"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1cc978] to-[#16a05f] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold text-gray-800">{item.heading}</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-gray-200 bg-white px-6 py-10 text-center">
        <p className="text-sm text-gray-400">Questions about our policies?</p>
        <p className="mt-1 text-sm text-gray-400">
          We&apos;re happy to help — reach out to our support team.
        </p>
        <a
          href="mailto:filsmteam@gmail.com"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0d3d26] to-[#1cc978] px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          filsmteam@gmail.com
        </a>
      </div>
    </div>
  );
}