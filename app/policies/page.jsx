"use client";

import { useState } from "react";

const sections = [
  {
    id: "terms",
    label: "Terms of Service",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    content: [
      {
        heading: "1. Acceptance of Terms",
        body: "By accessing or using FIL Store (filstore.com.ng), operated by Fedan Investment Limited, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to update these terms at any time, and continued use of the platform constitutes your acceptance of any changes.",
      },
      {
        heading: "2. Use of the Platform",
        body: "FIL Store is an e-commerce platform for purchasing products. You agree to use the platform only for lawful purposes and in a manner that does not infringe on the rights of others. You must be at least 18 years old or have the consent of a parent or guardian to make purchases. You are responsible for maintaining the confidentiality of your account credentials.",
      },
      {
        heading: "3. Product Listings & Availability",
        body: "All products listed on FIL Store are subject to availability. We make every effort to ensure accurate descriptions, pricing, and images, but we do not warrant that product descriptions or other content are error-free. We reserve the right to refuse or cancel any order at our sole discretion, including cases where a product is mispriced or out of stock.",
      },
      {
        heading: "4. Orders & Payments",
        body: "When you place an order, you are making an offer to purchase. We accept payments via Paystack and Flutterwave. All transactions are processed securely. Your order is confirmed only upon successful payment processing. Fedan Investment Limited is not liable for failed transactions due to insufficient funds, network errors, or payment gateway issues beyond our control.",
      },
      {
        heading: "5. Pricing & Taxes",
        body: "All prices are displayed in Nigerian Naira (NGN) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to modify prices without prior notice. The price at the time of order confirmation is the price you will be charged.",
      },
      {
        heading: "6. Intellectual Property",
        body: "All content on FIL Store — including logos, text, graphics, images, and software — is the property of Fedan Investment Limited and is protected under applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.",
      },
      {
        heading: "7. Limitation of Liability",
        body: "FIL Store is provided on an 'as-is' basis. Fedan Investment Limited shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including loss of data, revenue, or business opportunities. Our total liability to you shall not exceed the amount paid for the specific order in question.",
      },
      {
        heading: "8. Governing Law",
        body: "These Terms of Service are governed by the laws of the Federal Republic of Nigeria. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.",
      },
    ],
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    content: [
      {
        heading: "1. Information We Collect",
        body: "We collect information you provide directly, including your name, email address, phone number, delivery address, and payment details when you register or make a purchase. We also automatically collect usage data such as IP address, browser type, and pages visited through cookies and similar technologies.",
      },
      {
        heading: "2. How We Use Your Information",
        body: "Your information is used to process and fulfill orders, send transactional emails (order confirmations, shipping updates, receipts), provide customer support, improve our platform and product offerings, and comply with legal obligations. We do not sell or rent your personal data to third parties for their marketing purposes.",
      },
      {
        heading: "3. Data Sharing",
        body: "We may share your information with trusted third-party service providers such as payment processors (Paystack, Flutterwave), logistics partners, and email service providers solely to facilitate our services. These parties are contractually obligated to keep your data confidential and use it only for the specified purpose.",
      },
      {
        heading: "4. Cookies",
        body: "FIL Store uses HTTP-only cookies for session management and authentication. These cookies are essential to platform functionality. We do not use third-party advertising cookies. You can configure your browser to refuse cookies, but doing so may affect your ability to use certain features of the platform.",
      },
      {
        heading: "5. Data Security",
        body: "We implement industry-standard security measures including encrypted communications (HTTPS), secure password hashing, and HTTP-only JWT tokens to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
      },
      {
        heading: "6. Data Retention",
        body: "We retain your personal data for as long as your account is active or as needed to provide services. Order records may be retained for up to 7 years for accounting and legal compliance purposes. You may request deletion of your data at any time, subject to legal retention requirements.",
      },
      {
        heading: "7. Your Rights",
        body: "You have the right to access, correct, or delete your personal data. You may also request a copy of data we hold about you. To exercise these rights, contact us at filsmteam@gmail.com. We will respond to your request within 30 days.",
      },
      {
        heading: "8. Children's Privacy",
        body: "FIL Store is not directed at children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child under 13 has provided personal information, we will take steps to delete such information promptly.",
      },
    ],
  },
  {
    id: "returns",
    label: "Returns & Refunds",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
      </svg>
    ),
    content: [
      {
        heading: "1. Return Eligibility",
        body: "Items may be returned within 7 days of delivery, provided they are unused, in their original packaging, and accompanied by proof of purchase. Perishable goods, digital products, and items marked as final sale are not eligible for return.",
      },
      {
        heading: "2. How to Initiate a Return",
        body: "To initiate a return, log into your FIL Store account, navigate to your order history, and submit a return request through the Order Sheet. Alternatively, contact our support team at filsmteam@gmail.com with your order number and reason for return. Our team will respond within 2 business days with return instructions.",
      },
      {
        heading: "3. Return Shipping",
        body: "Customers are responsible for return shipping costs unless the item received was defective, damaged, or incorrect. We recommend using a trackable shipping method, as FIL Store is not responsible for items lost in transit during the return process.",
      },
      {
        heading: "4. Refund Processing",
        body: "Once your returned item is received and inspected, we will notify you via email of the approval or rejection of your refund. Approved refunds are processed within 5–10 business days and returned to your original payment method via Paystack or Flutterwave. Processing times may vary depending on your bank or card issuer.",
      },
      {
        heading: "5. Damaged or Incorrect Items",
        body: "If you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery with photos of the item and packaging. We will arrange for a replacement or full refund at no additional cost to you.",
      },
      {
        heading: "6. Exchange Policy",
        body: "We currently do not process direct exchanges. If you wish to exchange an item, please initiate a return for the original item and place a new order for the desired product. This ensures the fastest turnaround for you.",
      },
    ],
  },
  {
    id: "shipping",
    label: "Shipping Policy",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    content: [
      {
        heading: "1. Delivery Areas",
        body: "FIL Store currently delivers to locations across Nigeria. Delivery availability and timelines may vary depending on your location. During checkout, enter your delivery address to confirm availability and view estimated delivery times for your area.",
      },
      {
        heading: "2. Processing Time",
        body: "Orders are processed within 1–2 business days after payment confirmation. Orders placed on weekends or public holidays are processed on the next business day. You will receive an order confirmation email immediately after successful payment.",
      },
      {
        heading: "3. Delivery Timelines",
        body: "Standard delivery within Lagos typically takes 1–3 business days. Delivery to other states may take 3–7 business days depending on the destination. These are estimates and not guarantees; unforeseen circumstances may cause delays.",
      },
      {
        heading: "4. Shipping Fees",
        body: "Shipping fees are calculated at checkout based on your delivery location and the weight of your order. We occasionally offer free shipping promotions, which will be displayed on the platform when available.",
      },
      {
        heading: "5. Order Tracking",
        body: "Once your order has been dispatched, you will receive a shipping notification email with tracking information. You can also track your order through your FIL Store account under Order History.",
      },
      {
        heading: "6. Failed Deliveries",
        body: "If a delivery attempt fails due to an incorrect address or unavailability of the recipient, our logistics partner will make a second attempt. After two failed attempts, the order may be returned to us and a redelivery fee may apply.",
      },
    ],
  },
];

export default function PolicyPage() {
  const [active, setActive] = useState("terms");

  const current = sections.find((s) => s.id === active);

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#f9f9f6" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pol-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #f7f7f4;
          color: #1a1a1a;
        }

        .pol-hero {
          background: linear-gradient(135deg, #0d3d26 0%, #1cc978 100%);
          padding: 64px 24px 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .pol-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.07) 0%, transparent 60%);
          pointer-events: none;
        }

        .pol-hero-badge {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 100px;
          margin-bottom: 20px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .pol-hero h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(32px, 5vw, 52px);
          color: #fff;
          line-height: 1.1;
          margin-bottom: 14px;
          font-style: italic;
        }

        .pol-hero p {
          color: rgba(255,255,255,0.75);
          font-size: 15px;
          max-width: 440px;
          margin: 0 auto;
          line-height: 1.6;
          font-weight: 300;
        }

        .pol-hero-updated {
          margin-top: 24px;
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        .pol-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .pol-layout {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 32px 16px 60px;
          }
        }

        .pol-nav {
          position: sticky;
          top: 24px;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e8e8e3;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .pol-nav-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #999;
          padding: 18px 20px 10px;
        }

        .pol-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 13px 20px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #555;
          text-align: left;
          transition: all 0.18s ease;
          border-left: 3px solid transparent;
        }

        .pol-nav-btn:hover {
          background: #f0fdf6;
          color: #1cc978;
        }

        .pol-nav-btn.active {
          background: linear-gradient(90deg, rgba(28,201,120,0.08) 0%, transparent 100%);
          color: #1cc978;
          border-left-color: #1cc978;
          font-weight: 600;
        }

        .pol-nav-btn svg {
          flex-shrink: 0;
          opacity: 0.7;
        }

        .pol-nav-btn.active svg {
          opacity: 1;
        }

        .pol-content {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e8e8e3;
          box-shadow: 0 2px 20px rgba(0,0,0,0.04);
          overflow: hidden;
        }

        .pol-content-header {
          padding: 36px 40px 28px;
          border-bottom: 1px solid #f0f0ea;
          background: linear-gradient(135deg, #f9fffe 0%, #fff 100%);
        }

        .pol-content-header h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: #111;
          margin-bottom: 6px;
        }

        .pol-content-header p {
          font-size: 13.5px;
          color: #888;
          font-weight: 400;
        }

        .pol-section {
          padding: 32px 40px;
          border-bottom: 1px solid #f5f5f0;
          transition: background 0.15s;
        }

        .pol-section:last-child {
          border-bottom: none;
        }

        .pol-section:hover {
          background: #fdfdfb;
        }

        .pol-section-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #1cc978, #16a05f);
          color: #fff;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 10px;
          flex-shrink: 0;
        }

        .pol-section h3 {
          font-family: 'DM Serif Display', serif;
          font-size: 17px;
          color: #111;
          margin-bottom: 10px;
          line-height: 1.3;
        }

        .pol-section p {
          font-size: 14.5px;
          line-height: 1.75;
          color: #555;
          font-weight: 300;
        }

        @media (max-width: 600px) {
          .pol-content-header, .pol-section {
            padding-left: 24px;
            padding-right: 24px;
          }
        }

        .pol-footer {
          text-align: center;
          padding: 40px 24px;
          border-top: 1px solid #eaeae5;
          background: #fff;
        }

        .pol-footer p {
          font-size: 13px;
          color: #999;
          margin-bottom: 8px;
        }

        .pol-footer a {
          color: #1cc978;
          text-decoration: none;
          font-weight: 500;
        }

        .pol-footer a:hover {
          text-decoration: underline;
        }

        .pol-contact-card {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
          background: linear-gradient(135deg, #0d3d26, #1cc978);
          color: #fff;
          padding: 14px 28px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
        }

        .pol-contact-card:hover {
          opacity: 0.9;
        }
      `}</style>

      <div className="pol-root">
        {/* Hero */}
        <div className="pol-hero">
          <div className="pol-hero-badge">Fedan Investment Limited</div>
          <h1>Policies & Terms</h1>
          <p>Everything you need to know about how we operate, protect your data, and serve you better.</p>
          <div className="pol-hero-updated">Last updated: March 2025</div>
        </div>

        {/* Main layout */}
        <div className="pol-layout">
          {/* Sidebar nav */}
          <nav className="pol-nav">
            <div className="pol-nav-title">Sections</div>
            {sections.map((s) => (
              <button
                key={s.id}
                className={`pol-nav-btn${active === s.id ? " active" : ""}`}
                onClick={() => setActive(s.id)}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>

          {/* Content panel */}
          <div className="pol-content">
            <div className="pol-content-header">
              <h2>{current.label}</h2>
              <p>Please read this section carefully before using FIL Store.</p>
            </div>

            {current.content.map((item, i) => (
              <div className="pol-section" key={i}>
                <div className="pol-section-num">{i + 1}</div>
                <h3>{item.heading.replace(/^\d+\.\s/, "")}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pol-footer">
          <p>Questions about our policies?</p>
          <p>We're happy to help — reach out to our support team.</p>
          <a className="pol-contact-card" href="mailto:filsmteam@gmail.com">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            filsmteam@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}