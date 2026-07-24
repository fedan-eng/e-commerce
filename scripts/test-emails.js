/**
 * Email Test Script
 * 
 * This script fires all email types in the FIL Store system to a test email address.
 * Run with: node scripts/test-emails.js
 * 
 * Make sure to set up your .env with EMAIL_USER and EMAIL_PASS before running.
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

// Inline generateCode function
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};

// Inline sendEmail function
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html, attachments = []) => {
  try {
    console.log(`📧 Sending email to: ${to}`);
    
    const mailOptions = {
      from: `"FIL Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, // Plain text fallback
    };

    // If HTML is provided, add it
    if (html) {
      mailOptions.html = html;
    }

    // If attachments provided, add them
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email failed:`, error.message);
    throw error;
  }
};

// Test email address
const TEST_EMAIL = 'excellenceay33@gmail.com';
const TEST_FIRST_NAME = 'Test User';

// Mock order data for order-related emails
const mockOrder = {
  _id: 'TEST-ORDER-12345',
  firstName: TEST_FIRST_NAME,
  lastName: 'Testerson',
  email: TEST_EMAIL,
  phone: '+234 800 000 0000',
  addPhone: '+234 800 000 0001',
  address: '123 Test Street, Test Area',
  city: 'Lagos',
  region: { name: 'Lagos', fee: 2500 },
  deliveryType: 'Express',
  paymentMethod: 'paystack',
  paymentReference: 'REF-TEST-12345',
  items: [
    { name: 'FIL Power Bank 20000mAh', quantity: 2, price: 15000, color: 'Black' },
    { name: 'FIL Wireless Earbuds', quantity: 1, price: 8500, color: 'White' }
  ],
  subTotal: 38500,
  deliveryFee: 5000,
  discount: 2000,
  promoCode: 'TEST20',
  total: 41500,
  status: 'Confirmed'
};

// Helper to build order status email (from orders/[id]/route.js)
const STATUS_EMAIL_CONFIG = {
  shipped: {
    subject: "Your FIL Order Has Been Shipped!",
    headline: "Your Order Is On Its Way!",
    subheading: "Great news — your order has been shipped",
    badge: "Shipped",
    badgeEmoji: "🚚",
    headerBg: "#7b2ff7",
    headerText: "#f0e6ff",
    badgeBg: "#ffffff",
    badgeTextColor: "#5a1fd1",
    accentColor: "#7b2ff7",
    accentLight: "#f3ecff",
    accentBorder: "#c9a8f5",
    ctaText: "Contact Us",
    ctaLink: "https://filstore.com.ng/contact",
    messageLines: [
      "Your order is now in the hands of our delivery team and on its way to you!",
      "We know how much you've been looking forward to this, and we're just as excited for you to experience your new product. Every FIL package is prepared with care, because to us, you're not just a customer — you're family.",
      "While your order is on the move, know this: our promise goes beyond delivery. We're here to make sure your experience with FIL feels smooth, supportive, and empowering every step of the way.",
      "Thank you for trusting us to be part of your journey. The best is yet to come. 💙",
    ],
    plainMessage: () =>
      `Your order has been shipped and is on its way!\nExpected delivery: 1-3 working days (Lagos) or 5-7 working days (other regions).\nContact us: https://filstore.com.ng/contact`,
  },
  delivered: {
    subject: "Your FIL Order Has Been Delivered!",
    headline: "Order Delivered!",
    subheading: "We hope you love your new product",
    badge: "Delivered",
    badgeEmoji: "✓",
    headerBg: "#0fa968",
    headerText: "#cdf4e3",
    badgeBg: "#ffffff",
    badgeTextColor: "#0a7a4a",
    accentColor: "#0fa968",
    accentLight: "#f0faf5",
    accentBorder: "#b2dfca",
    ctaText: "Continue Shopping",
    ctaLink: "https://filstore.com.ng/products",
    messageLines: [
      "Your order has been marked as delivered. We hope everything arrived in perfect condition!",
      "We'd love to hear what you think — feel free to leave a review on the product page. Your feedback helps us serve you and thousands of others better.",
      "Thank you for choosing <strong style=\"color:#1a1a2e;\">FIL Store</strong>. We're always here if you need anything. 💙",
    ],
    plainMessage: () =>
      `Your order has been delivered! We hope everything arrived in perfect condition. Thank you for choosing FIL Store.\nShop again: https://filstore.com.ng/products`,
  },
};

function emailHead(title) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${title}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    :root {
      --bg-primary: #f0f2f5;
      --bg-card: #ffffff;
      --text-primary: #1a1a2e;
      --text-secondary: #444455;
      --text-muted: #666677;
      --border-color: #e2e2ea;
      --accent-light: #f0faf5;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #1a1a2e;
        --bg-card: #2d2d3a;
        --text-primary: #ffffff;
        --text-secondary: #d1d1e0;
        --text-muted: #a0a0b0;
        --border-color: #3d3d4a;
        --accent-light: #1a2a25;
      }
    }
    body { margin:0 !important; padding:0 !important; background-color:var(--bg-primary) !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    @media only screen and (max-width: 620px) {
      .email-card  { width:100% !important; }
      .mobile-pad  { padding-left:20px !important; padding-right:20px !important; }
      .header-pad  { padding:30px 20px !important; }
      .section-pad { padding:18px 14px !important; }
      .cta-td      { padding:13px 26px !important; font-size:14px !important; }
      .header-h1   { font-size:22px !important; }
      .items-th    { padding:10px 6px !important; font-size:12px !important; }
      .items-td    { padding:10px 6px !important; font-size:12px !important; }
    }
    @media only screen and (max-width: 480px) {
      .mobile-pad  { padding-left:14px !important; padding-right:14px !important; }
      .header-h1   { font-size:20px !important; }
      .cta-td      { padding:12px 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:var(--bg-primary);">`;
}

function buildStatusEmail(order, cfg) {
  const firstName = order.firstName || "Customer";
  const total     = order.total    ?? order.subTotal ?? 0;
  const subTotal  = order.subTotal ?? 0;
  const delivFee  = order.deliveryFee ?? 0;
  const discount  = order.discount ?? 0;
  const regionName = order.region?.name || order.region || "—";

  const itemRowsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td class="items-td" style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; vertical-align:top;">${item.name || "Product"}</td>
        <td class="items-td" style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:center; vertical-align:top;">${item.quantity}</td>
        <td class="items-td" style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right; vertical-align:top;">&#x20A6;${Number(item.price || 0).toLocaleString()}</td>
        <td class="items-td" style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#333333; text-align:right; vertical-align:top;">&#x20A6;${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const messageParagraphsHtml = cfg.messageLines
    .map(
      (line) =>
        `<tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:25px; color:#444455; padding-bottom:12px;">${line}</td></tr>`
    )
    .join("");

  return `
${emailHead(cfg.headline)}

  <!-- Preheader -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    ${cfg.subheading} &mdash; Order #${order._id}
  </div>

  <!-- Full-width background -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:28px 10px;">

        <!-- ═══ EMAIL CARD ═══ -->
        <table class="email-card" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px; width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- ── HEADER ── -->
          <tr>
            <td class="header-pad" style="background-color:${cfg.headerBg}; padding:44px 40px; text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 10px 0; font-size:46px; line-height:1.2;">${cfg.badgeEmoji}</p>
                    <h1 class="header-h1" style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:27px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">
                      ${cfg.headline}
                    </h1>
                    <p style="margin:10px 0 16px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; color:${cfg.headerText};">
                      ${cfg.subheading}
                    </p>
                    <!-- Status badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="background-color:${cfg.badgeBg}; color:${cfg.badgeTextColor}; padding:7px 24px; border-radius:20px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700;">
                          ${cfg.badgeEmoji} ${cfg.badge}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── GREETING & MESSAGE ── -->
          <tr>
            <td class="mobile-pad" style="padding:34px 40px 0 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:18px; font-weight:700; color:#1a1a2e; padding-bottom:14px;">
                    Hi ${firstName}! 👋
                  </td>
                </tr>
                ${messageParagraphsHtml}
                <!-- CTA -->
                <tr>
                  <td style="text-align:center; padding:20px 0 30px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="border-radius:30px; background-color:${cfg.accentColor};">
                          <a href="${cfg.ctaLink}" target="_blank" class="cta-td"
                            style="display:inline-block; padding:15px 38px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:30px; letter-spacing:0.3px;">
                            ${cfg.ctaText} →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── ORDER SUMMARY BOX ── -->
          <tr>
            <td class="mobile-pad" style="padding:0 40px 10px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:${cfg.accentLight}; border-radius:12px; border-left:4px solid ${cfg.accentColor};">
                <tr>
                  <td class="section-pad" style="padding:22px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                      <!-- Section heading -->
                      <tr>
                        <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e; padding-bottom:14px; border-bottom:2px solid ${cfg.accentBorder};">
                          📋 Order Summary
                        </td>
                      </tr>

                      <!-- Order ID -->
                      <tr><td style="padding:10px 0; border-bottom:1px solid ${cfg.accentBorder};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Order ID</td>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#1a1a2e; text-align:right;">${order._id}</td>
                        </tr></table>
                      </td></tr>

                      <!-- Status -->
                      <tr><td style="padding:10px 0; border-bottom:1px solid ${cfg.accentBorder};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Status</td>
                          <td style="text-align:right;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right"><tr>
                              <td style="background-color:${cfg.accentColor}; color:#ffffff; padding:4px 14px; border-radius:12px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:12px; font-weight:700;">
                                ${cfg.badge}
                              </td>
                            </tr></table>
                          </td>
                        </tr></table>
                      </td></tr>

                      <!-- Name -->
                      <tr><td style="padding:10px 0; border-bottom:1px solid ${cfg.accentBorder};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Name</td>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${order.firstName || "—"}</td>
                        </tr></table>
                      </td></tr>

                      <!-- Email -->
                      <tr><td style="padding:10px 0; border-bottom:1px solid ${cfg.accentBorder};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Email</td>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${order.email || "—"}</td>
                        </tr></table>
                      </td></tr>

                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── ITEMS TABLE ── -->
          <tr>
            <td class="mobile-pad" style="padding:24px 40px 10px 40px; background-color:#ffffff;">
              <p style="margin:0 0 12px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e;">
                📦 Your Items
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border-radius:10px; overflow:hidden; border:1px solid #e0e0ee;">
                <!-- Header row -->
                <tr style="background-color:${cfg.accentColor};">
                  <th class="items-th" style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:left; border:none;">Item</th>
                  <th class="items-th" style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:center; border:none; white-space:nowrap;">Qty</th>
                  <th class="items-th" style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:right; border:none; white-space:nowrap;">Price</th>
                  <th class="items-th" style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:right; border:none; white-space:nowrap;">Total</th>
                </tr>
                ${itemRowsHtml}
              </table>
            </td>
          </tr>

          <!-- ── ORDER FINANCIAL SUMMARY ── -->
          <tr>
            <td class="mobile-pad" style="padding:18px 40px 30px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border:2px solid ${cfg.accentColor}; border-radius:12px; overflow:hidden;">
                <tr>
                  <td style="padding:20px 18px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                      <!-- Subtotal -->
                      <tr><td style="padding:8px 0; border-bottom:1px solid ${cfg.accentBorder};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#555566;">Subtotal</td>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#333333; text-align:right;">&#x20A6;${Number(subTotal).toLocaleString()}</td>
                        </tr></table>
                      </td></tr>

                      <!-- Delivery Fee -->
                      <tr><td style="padding:8px 0; border-bottom:1px solid ${cfg.accentBorder};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#555566;">Delivery Fee</td>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#333333; text-align:right;">&#x20A6;${Number(delivFee).toLocaleString()}</td>
                        </tr></table>
                      </td></tr>

                      ${
                        discount > 0
                          ? `
                      <!-- Discount -->
                      <tr><td style="padding:8px 0; border-bottom:1px solid ${cfg.accentBorder};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#0a7a4a; font-weight:600;">Discount</td>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#0a7a4a; font-weight:600; text-align:right;">-&#x20A6;${Number(discount).toLocaleString()}</td>
                        </tr></table>
                      </td></tr>`
                          : ""
                      }

                      <!-- Total -->
                      <tr><td style="padding:16px 0 4px 0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:17px; font-weight:700; color:${cfg.accentColor};">Total Amount</td>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:20px; font-weight:800; color:${cfg.accentColor}; text-align:right;">&#x20A6;${Number(total).toLocaleString()}</td>
                        </tr></table>
                      </td></tr>

                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background-color:#f2f3f5; padding:26px 40px; border-top:1px solid #e2e2ea;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="text-align:center; padding-bottom:4px;">
                  <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e;">The FIL Team</p>
                </td></tr>
                <tr><td style="text-align:center; padding-bottom:14px;">
                  <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-style:italic; color:#0fa968;">Think Quality, Think FIL.</p>
                </td></tr>
                <tr><td style="text-align:center; padding-bottom:10px;">
                  <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#666677;">
                    Visit us at <a href="https://filstore.com.ng" target="_blank" style="color:#0fa968; text-decoration:none; font-weight:600;">filstore.com.ng</a>
                  </p>
                </td></tr>
                <tr><td style="text-align:center;">
                  <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:11px; color:#aaaabc; line-height:18px;">
                    This is an automated message. Please do not reply directly to this email.
                  </p>
                </td></tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- ═══ END EMAIL CARD ═══ -->

        <!-- Bottom spacer -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="padding:20px 0;">&nbsp;</td></tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

function buildPlainText(order, cfg) {
  const firstName  = order.firstName || "Customer";
  const total      = order.total ?? order.subTotal ?? 0;
  const subTotal   = order.subTotal ?? 0;
  const delivFee   = order.deliveryFee ?? 0;
  const discount   = order.discount ?? 0;
  const regionName = order.region?.name || order.region || "—";

  const itemLines = (order.items || [])
    .map(
      (i) =>
        `  - ${i.name} x${i.quantity}  NGN ${Number(i.price || 0).toLocaleString()}  =  NGN ${(Number(i.price || 0) * Number(i.quantity || 1)).toLocaleString()}`
    )
    .join("\n");

  return `
Hi ${firstName},

${cfg.plainMessage(order)}

ORDER SUMMARY
==========================================
Order ID     : ${order._id}
Status       : ${cfg.badge}
Name         : ${order.firstName || "—"}
Email        : ${order.email || "—"}

ITEMS
==========================================
${itemLines}

FINANCIALS
==========================================
Subtotal     : NGN ${Number(subTotal).toLocaleString()}
Delivery Fee : NGN ${Number(delivFee).toLocaleString()}${discount > 0 ? `\nDiscount     : -NGN ${Number(discount).toLocaleString()}` : ""}
TOTAL        : NGN ${Number(total).toLocaleString()}

==========================================
${cfg.ctaText}: ${cfg.ctaLink}

Thank you for choosing FIL Store.
Think Quality, Think FIL.
https://filstore.com.ng
  `.trim();
}

// Build order confirmation email (simplified version from verify-payment/route.js)
function buildOrderConfirmationEmail(orderData, isAdmin = false) {
  const hasColor = orderData.items.some((item) => item.color);
  const regionName = orderData.region?.name || orderData.region || "";
  const orderedAt = new Date().toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long",
    day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const itemRowsHtml = orderData.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; vertical-align:top;">${item.name}</td>
          <td style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:center; vertical-align:top;">${item.quantity}</td>
          <td style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right; vertical-align:top;">&#x20A6;${Number(item.price).toLocaleString()}</td>
          ${hasColor ? `<td style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:center; vertical-align:top;">${item.color || "-"}</td>` : ""}
          <td style="padding:12px 10px; border-bottom:1px solid #e8e8ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#333333; text-align:right; vertical-align:top;">&#x20A6;${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
        </tr>`
    )
    .join("");

  const itemsTableHeader = `
      <tr style="background-color:#0fa968;">
        <th style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:left; border:none;">Item</th>
        <th style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:center; border:none; white-space:nowrap;">Qty</th>
        <th style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:right; border:none; white-space:nowrap;">Unit Price</th>
        ${hasColor ? `<th style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:center; border:none;">Color</th>` : ""}
        <th style="padding:12px 10px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-align:right; border:none; white-space:nowrap;">Total</th>
      </tr>`;

  const summaryRowsHtml = `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #e8f5e9;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#555566;">Subtotal</td>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#333333; text-align:right;">&#x20A6;${Number(orderData.subTotal).toLocaleString()}</td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #e8f5e9;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#555566;">Delivery Fee</td>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#333333; text-align:right;">&#x20A6;${Number(orderData.deliveryFee).toLocaleString()}</td>
          </tr></table>
        </td>
      </tr>
      ${orderData.discount > 0 ? `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #e8f5e9;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#0a7a4a; font-weight:600;">Discount</td>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#0a7a4a; font-weight:600; text-align:right;">-&#x20A6;${Number(orderData.discount).toLocaleString()}</td>
          </tr></table>
        </td>
      </tr>` : ""}
      ${orderData.promoCode ? `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #e8f5e9;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#555566;">Promo Code</td>
            <td style="text-align:right;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right"><tr>
                <td style="background-color:#f0faf5; color:#0a7a4a; padding:3px 12px; border-radius:10px; font-family:'Courier New',Courier,monospace; font-size:12px; font-weight:700; border:1px dashed #0a7a4a;">${orderData.promoCode}</td>
              </tr></table>
            </td>
          </tr></table>
        </td>
      </tr>` : ""}
      <tr>
        <td style="padding:16px 0 4px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:17px; font-weight:700; color:#0a7a4a;">Total Amount</td>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:20px; font-weight:800; color:#0a7a4a; text-align:right;">&#x20A6;${Number(orderData.total).toLocaleString()}</td>
          </tr></table>
        </td>
      </tr>`;

  const emailHead = (title) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${title}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    :root {
      --bg-primary: #f0f2f5;
      --bg-card: #ffffff;
      --text-primary: #1a1a2e;
      --text-secondary: #444455;
      --text-muted: #666677;
      --border-color: #e2e2ea;
      --accent-light: #f0faf5;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #1a1a2e;
        --bg-card: #2d2d3a;
        --text-primary: #ffffff;
        --text-secondary: #d1d1e0;
        --text-muted: #a0a0b0;
        --border-color: #3d3d4a;
        --accent-light: #1a2a25;
      }
    }
    body { margin:0 !important; padding:0 !important; background-color:var(--bg-primary) !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    @media only screen and (max-width:620px) {
      .email-card { width:100% !important; }
      .mobile-pad { padding-left:20px !important; padding-right:20px !important; }
      .header-pad { padding:30px 20px !important; }
      .section-pad { padding:18px 14px !important; }
      .cta-td { padding:13px 26px !important; font-size:14px !important; }
      .header-h1 { font-size:22px !important; }
      .items-th { padding:10px 6px !important; font-size:12px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:var(--bg-primary);">`;

  const wrapOpen = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;"><tr><td align="center" style="padding:28px 10px;"><table class="email-card" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">`;
  const wrapClose = `</table><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding:20px 0;">&nbsp;</td></tr></table></td></tr></table></body></html>`;

  const sharedFooter = `
      <tr>
        <td style="background-color:#f2f3f5; padding:26px 40px; border-top:1px solid #e2e2ea;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="text-align:center; padding-bottom:4px;">
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e;">The FIL Team</p>
            </td></tr>
            <tr><td style="text-align:center; padding-bottom:14px;">
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-style:italic; color:#0fa968;">Think Quality, Think FIL.</p>
            </td></tr>
            <tr><td style="text-align:center;">
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#666677;">
                Visit us at <a href="https://filstore.com.ng" target="_blank" style="color:#0fa968; text-decoration:none; font-weight:600;">filstore.com.ng</a>
              </p>
            </td></tr>
          </table>
        </td>
      </tr>`;

  if (isAdmin) {
    // Admin email - red theme
    return `
${emailHead(`New Order - FIL Admin`)}

  <!-- Preheader -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    New order from ${orderData.firstName} ${orderData.lastName || ""} &mdash; Order #TEST-ORDER-12345 &mdash; &#x20A6;${Number(orderData.total).toLocaleString()}
  </div>

  ${wrapOpen}

    <!-- HEADER -->
    <tr>
      <td class="header-pad" style="background-color:#c0392b; padding:36px 40px; text-align:center;">
        <p style="margin:0 0 8px 0; font-size:42px; line-height:1.2;">🔔</p>
        <h1 class="header-h1" style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:26px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">New Order Received</h1>
        <p style="margin:8px 0 14px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#f5c6c2;">A customer just placed an order &mdash; action may be required</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
          <tr>
            <td style="background-color:#ffffff; color:#c0392b; padding:6px 20px; border-radius:20px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700;">
              ⚠️ Review & Fulfil
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- QUICK STATS BAR -->
    <tr>
      <td style="background-color:#fdf2f2; padding:18px 40px; border-bottom:1px solid #f5c6c2;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width:33%; text-align:center; border-right:1px solid #f5c6c2; padding:0 10px;">
              <p style="margin:0 0 4px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:11px; font-weight:600; color:#999999; text-transform:uppercase; letter-spacing:0.5px;">Order ID</p>
              <p style="margin:0; font-family:'Courier New',Courier,monospace; font-size:12px; font-weight:700; color:#1a1a2e;">#TEST-12345</p>
            </td>
            <td style="width:33%; text-align:center; border-right:1px solid #f5c6c2; padding:0 10px;">
              <p style="margin:0 0 4px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:11px; font-weight:600; color:#999999; text-transform:uppercase; letter-spacing:0.5px;">Total</p>
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:800; color:#c0392b;">&#x20A6;${Number(orderData.total).toLocaleString()}</p>
            </td>
            <td style="width:33%; text-align:center; padding:0 10px;">
              <p style="margin:0 0 4px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:11px; font-weight:600; color:#999999; text-transform:uppercase; letter-spacing:0.5px;">Provider</p>
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#1a1a2e; text-transform:capitalize;">${orderData.paymentMethod}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CUSTOMER INFO -->
    <tr>
      <td class="mobile-pad" style="padding:24px 40px 10px 40px; background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background-color:#f8f9fa; border-radius:12px; border-left:4px solid #c0392b;">
          <td class="section-pad" style="padding:20px 18px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e; padding-bottom:14px; border-bottom:2px solid #e9ecef;">👤 Customer Information</td></tr>
              <tr><td style="padding:10px 0; border-bottom:1px solid #e9ecef;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Full Name</td>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#1a1a2e; text-align:right;">${orderData.firstName} ${orderData.lastName || ""}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:10px 0; border-bottom:1px solid #e9ecef;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Email</td>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.email}</td>
                </tr></table>
              </td></tr>
              <tr><td style="padding:10px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Phone</td>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.phone}</td>
                </tr></table>
              </td></tr>
            </table>
          </td>
        </table>
      </td>
    </tr>

    <!-- ITEMS -->
    <tr>
      <td class="mobile-pad" style="padding:20px 40px 10px 40px; background-color:#ffffff;">
        <p style="margin:0 0 12px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e;">📦 Items Ordered</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="border-radius:10px; overflow:hidden; border:1px solid #e0e0e0;">
          ${itemsTableHeader}
          ${itemRowsHtml}
        </table>
      </td>
    </tr>

    <!-- SUMMARY -->
    <tr>
      <td class="mobile-pad" style="padding:16px 40px 20px 40px; background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="border:2px solid #c0392b; border-radius:12px; overflow:hidden;">
          <tr><td style="padding:18px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${summaryRowsHtml}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>

    ${sharedFooter}

  ${wrapClose}`;
  } else {
    // Customer email - green theme
    return `
${emailHead(`Order Confirmed - FIL Store`)}

  <!-- Preheader -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    Your FIL Store order is confirmed! Order #TEST-ORDER-12345 &mdash; we're preparing it now. 🎉
  </div>

  ${wrapOpen}

    <!-- HEADER -->
    <tr>
      <td class="header-pad" style="background-color:#0fa968; padding:44px 40px; text-align:center;">
        <p style="margin:0 0 10px 0; font-size:48px; line-height:1.2;">🎉</p>
        <h1 class="header-h1" style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:28px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">Order Confirmed!</h1>
        <p style="margin:10px 0 16px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; color:#cdf4e3;">Thank you for choosing FIL Store</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
          <tr>
            <td style="background-color:#ffffff; color:#0a7a4a; padding:7px 22px; border-radius:20px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700;">
              ✓ Payment Successful
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- GREETING -->
    <tr>
      <td class="mobile-pad" style="padding:34px 40px 0 40px; background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:18px; font-weight:700; color:#1a1a2e; padding-bottom:12px;">
              Hi ${orderData.firstName}! 👋
            </td>
          </tr>
          <tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:24px; color:#444455; padding-bottom:10px;">
              Thank you for choosing <strong style="color:#1a1a2e;">Fedan Investment Limited (FIL)</strong> &mdash; we're so glad to have you as part of our family! 💙
            </td>
          </tr>
          <tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:24px; color:#444455; padding-bottom:10px;">
              Your order is confirmed ✓ and our team is already preparing it with care. You'll receive a shipping update as soon as it's on the way.
            </td>
          </tr>
          <tr>
            <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:24px; color:#444455; padding-bottom:26px;">
              At FIL, every product is an opportunity to empower you and make your daily life smoother, easier, and more connected &mdash; because to us, you're not just a customer, you're family.
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="text-align:center; padding-bottom:30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="border-radius:30px; background-color:#0fa968;">
                    <a href="https://filstore.com.ng/products" target="_blank" class="cta-td"
                      style="display:inline-block; padding:15px 38px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:30px; letter-spacing:0.3px;">
                      Explore More Products →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ORDER DETAILS -->
    <tr>
      <td class="mobile-pad" style="padding:0 40px 10px 40px; background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background-color:#f4faf7; border-radius:12px; border-left:4px solid #0fa968;">
          <tr>
            <td class="section-pad" style="padding:22px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:700; color:#1a1a2e; padding-bottom:14px; border-bottom:2px solid #d4ece1;">📋 Order Details</td></tr>
                <tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                    <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Order ID</td>
                    <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#1a1a2e; text-align:right;">TEST-ORDER-12345</td>
                  </tr></table>
                </td></tr>
                <tr><td style="padding:11px 0; border-bottom:1px solid #e0ece6;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                    <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Status</td>
                    <td style="text-align:right;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right"><tr>
                        <td style="background-color:#e8f5e9; color:#1a7a4a; padding:4px 14px; border-radius:12px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:12px; font-weight:700;">✓ Confirmed</td>
                      </tr></table>
                    </td>
                  </tr></table>
                </td></tr>
                <tr><td style="padding:11px 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                    <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Email</td>
                    <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${orderData.email}</td>
                  </tr></table>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ITEMS -->
    <tr>
      <td class="mobile-pad" style="padding:24px 40px 10px 40px; background-color:#ffffff;">
        <p style="margin:0 0 12px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:700; color:#1a1a2e;">📦 Your Items</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="border-radius:10px; overflow:hidden; border:1px solid #e0ece6;">
          ${itemsTableHeader}
          ${itemRowsHtml}
        </table>
      </td>
    </tr>

    <!-- SUMMARY -->
    <tr>
      <td class="mobile-pad" style="padding:18px 40px 30px 40px; background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="border:2px solid #0fa968; border-radius:12px; overflow:hidden;">
          <tr><td style="padding:20px 18px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${summaryRowsHtml}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>

    ${sharedFooter}

  ${wrapClose}`;
  }
}

function buildOrderConfirmationPlainText(orderData, isAdmin = false) {
  const itemList = orderData.items
    .map(
      (item) =>
        `  - ${item.name} x${item.quantity}  NGN ${Number(item.price).toLocaleString()}  =  NGN ${(Number(item.price) * Number(item.quantity)).toLocaleString()}`
    )
    .join("\n");

  if (isAdmin) {
    return `
NEW ORDER ALERT
==========================================
Order ID     : TEST-ORDER-12345
Payment Ref  : TEST-REF-12345
Provider     : ${orderData.paymentMethod}

CUSTOMER
==========================================
Name         : ${orderData.firstName} ${orderData.lastName || ""}
Email        : ${orderData.email}
Phone        : ${orderData.phone}

ITEMS
==========================================
${itemList}

SUMMARY
==========================================
Subtotal     : NGN ${Number(orderData.subTotal).toLocaleString()}
Delivery Fee : NGN ${Number(orderData.deliveryFee).toLocaleString()}${orderData.discount > 0 ? `\nDiscount     : -NGN ${Number(orderData.discount).toLocaleString()}` : ""}
TOTAL        : NGN ${Number(orderData.total).toLocaleString()}

FIL Store Admin — Think Quality, Think FIL.
    `.trim();
  } else {
    return `
Hi ${orderData.firstName},

Thank you for choosing Fedan Investment Limited (FIL)!
Your order is confirmed and our team is already preparing it.

ORDER DETAILS
==========================================
Order ID     : TEST-ORDER-12345
Status       : Confirmed
Name         : ${orderData.firstName} ${orderData.lastName || ""}
Email        : ${orderData.email}

ITEMS ORDERED
==========================================
${itemList}

ORDER SUMMARY
==========================================
Subtotal     : NGN ${Number(orderData.subTotal).toLocaleString()}
Delivery Fee : NGN ${Number(orderData.deliveryFee).toLocaleString()}${orderData.discount > 0 ? `\nDiscount     : -NGN ${Number(orderData.discount).toLocaleString()}` : ""}${orderData.promoCode ? `\nPromo Code   : ${orderData.promoCode}` : ""}
TOTAL        : NGN ${Number(orderData.total).toLocaleString()}

==========================================
Explore more: https://filstore.com.ng/products

With gratitude,
The FIL Team — Think Quality, Think FIL.
https://filstore.com.ng
    `.trim();
  }
}

// Build follow-up email (from send-followup-emails/route.js)
function buildFollowUpEmail(order) {
  const productNames = order.items.map((i) => i.name).join(", ");

  const followUpEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .emoji-large {
      font-size: 50px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.8;
    }
    .greeting {
      font-size: 20px;
      color: #333;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .product-box {
      background-color: #f8f9fa;
      border-left: 4px solid #1cc978;
      padding: 20px;
      margin: 25px 0;
      border-radius: 5px;
    }
    .product-box h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 18px;
    }
    .product-name {
      color: #1cc978;
      font-weight: 600;
      font-size: 16px;
    }
    .rating-section {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 30px;
      margin: 30px 0;
      border-radius: 10px;
      text-align: center;
    }
    .rating-section h2 {
      margin: 0 0 15px 0;
      font-size: 24px;
    }
    .star-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin: 20px 0;
    }
    .star-button {
      font-size: 32px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .cta-button {
      display: inline-block;
      background-color: white;
      color: #1cc978;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 30px;
      margin: 15px 0;
      font-weight: 600;
      font-size: 16px;
      border: 3px solid rgba(255,255,255,0.3);
    }
    .support-box {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 20px;
      margin: 30px 0;
      border-radius: 5px;
    }
    .support-box h3 {
      margin: 0 0 15px 0;
      color: #1565c0;
      font-size: 18px;
    }
    .support-icon {
      font-size: 20px;
      margin-right: 10px;
    }
    .support-item {
      display: flex;
      align-items: center;
      margin: 10px 0;
      color: #333;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #777;
      font-size: 14px;
    }
    .footer a {
      color: #1cc978;
      text-decoration: none;
    }
    .divider {
      height: 2px;
      background: linear-gradient(to right, transparent, #1cc978, transparent);
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="emoji-large">💙</div>
      <h1>How's Everything Going?</h1>
      <p>We'd love to hear from you</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${order.firstName},
      </div>
      
      <div class="message">
        <p>We hope your new purchase is already making life a little easier for you! 🎉</p>
        
        <div class="product-box">
          <h3>📦 Your Order:</h3>
          <div class="product-name">${productNames}</div>
        </div>
        
        <p>At FIL, we see every product as more than just an accessory — it's a way to keep you connected, productive, and empowered to do more with your day. Your trust means the world to us, and we're honored you chose to make us part of your journey. 💙</p>
      </div>
      
      <div class="rating-section">
        <h2>⭐ Share Your Experience</h2>
        <p style="margin: 0 0 20px 0; font-size: 16px; opacity: 0.95;">
          Your feedback helps us serve you and our entire FIL family better
        </p>
        <div class="star-buttons">
          <span class="star-button">⭐</span>
          <span class="star-button">⭐</span>
          <span class="star-button">⭐</span>
          <span class="star-button">⭐</span>
          <span class="star-button">⭐</span>
        </div>
        <a href="https://filstore.com.ng/products" class="cta-button">Rate Your Product</a>
        <p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">
          Takes less than a minute!
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 16px; color: #333; line-height: 1.8;">
          We'd love to hear how your experience has been so far. Your voice not only helps us improve — it helps us care better for every member of our FIL family.
        </p>
      </div>
      
      <div class="support-box">
        <h3>💬 We're Here For You</h3>
        <p style="margin: 0 0 15px 0; color: #333;">
          Our support doesn't end after delivery. We're here whenever you need us:
        </p>
        <div class="support-item">
          <span class="support-icon">📧</span>
          <span>Email us at filfilecommerce@gmail.com</span>
        </div>
        <div class="support-item">
          <span class="support-icon">📱</span>
          <span>Call our support team</span>
        </div>
        <div class="support-item">
          <span class="support-icon">💡</span>
          <span>Get quick tips and guidance</span>
        </div>
        <p style="margin: 15px 0 0 0; color: #333; font-size: 14px;">
          Whether it's for guidance, quick tips, or just to listen — we're only a message away.
        </p>
      </div>
      
      <div class="divider"></div>
      
      <p style="text-align: center; color: #666; font-size: 15px; line-height: 1.8;">
        Thank you once again for choosing FIL. We look forward to growing with you. 🌱
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>With Gratitude,</strong></p>
      <p style="margin: 0 0 5px 0; font-size: 16px; color: #333;"><strong>The FIL Team</strong></p>
      <p style="margin: 0 0 20px 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
      <p>Visit us at <a href="https://filstore.com.ng">filstore.com.ng</a></p>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        Need help? Contact us at filfilecommerce@gmail.com
      </p>
    </div>
  </div>
</body>
</html>`;

  const plainText = `
Hi ${order.firstName},

We hope your new ${productNames} is already making life a little easier for you. 🎉

📦 YOUR ORDER: ${productNames}

At FIL, we see every product as more than just an accessory — it's a way to keep you connected, productive, and empowered to do more with your day. Your trust means the world to us, and we're honored you chose to make us part of your journey. 💙

⭐ SHARE YOUR EXPERIENCE
We'd love to hear how your experience has been so far. Your voice not only helps us improve — it helps us care better for every member of our FIL family.

You can rate your product directly by visiting:
https://filstore.com.ng/products

💬 WE'RE HERE FOR YOU
Our support doesn't end after delivery. We're here whenever you need us:
- Email: filfilecommerce@gmail.com
- Call our support team
- Get quick tips and guidance

Whether it's for guidance, quick tips, or just to listen — we're only a message away.

Thank you once again for choosing FIL. We look forward to growing with you. 🌱

With gratitude,
The FIL Team
Think Quality, Think FIL.

Visit: https://filstore.com.ng
      `.trim();

  return { html: followUpEmailHtml, text: plainText };
}

// Build verification email (from auth/register/route.js)
function buildVerificationEmail(email, firstName, code) {
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.8;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      color: #333;
      margin-bottom: 30px;
    }
    .code-box {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px;
      margin: 30px 0;
    }
    .code-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    .verification-code {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 8px;
      margin: 10px 0;
      font-family: 'Courier New', monospace;
    }
    .expiry-note {
      font-size: 13px;
      opacity: 0.9;
      margin-top: 10px;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #1cc978;
      padding: 20px;
      margin: 30px 0;
      border-radius: 5px;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #333;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #777;
      font-size: 14px;
    }
    .footer a {
      color: #1cc978;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header {
        padding: 30px 20px;
      }
      .verification-code {
        font-size: 28px;
        letter-spacing: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>✉️ Verify Your Email</h1>
      <p>Welcome to FIL Store</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${firstName},
      </div>
      
      <div class="message">
        <p>Welcome to <strong>Fedan Investment Limited (FIL)</strong>! We're excited to have you join our family. 💚</p>
        
        <p>To complete your signup and start shopping, please verify your email address using the code below:</p>
      </div>
      
      <div class="code-box">
        <div class="code-label">YOUR VERIFICATION CODE</div>
        <div class="verification-code">${code}</div>
        <div class="expiry-note">⏰ This code expires in 10 minutes</div>
      </div>
      
      <div class="info-box">
        <p>💡 <strong>Tip:</strong> Copy and paste the code above into the verification page to complete your registration.</p>
      </div>
      
      <div class="message">
        <p>If you didn't create an account with FIL Store, you can safely ignore this email.</p>
        
        <p>Once verified, you'll have access to:</p>
        <ul style="color: #fff; line-height: 2;">
          <li>✓ Exclusive deals and promotions</li>
          <li>✓ Order tracking and history</li>
          <li>✓ Faster checkout experience</li>
          <li>✓ Priority customer support</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>The FIL Team</strong></p>
      <p style="margin: 0 0 20px 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
      <p>Visit us at <a href="https://filstore.com.ng">filstore.com.ng</a></p>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        This is an automated email. Please do not reply directly to this message.
      </p>
    </div>
  </div>
</body>
</html>`;

  const plainText = `
Hi ${firstName},

Welcome to Fedan Investment Limited (FIL)! To complete your signup, please verify your email address.

Your verification code is: ${code}

This code will expire in 10 minutes.

If you did not create an account with FIL, please ignore this message.

Thanks,
The FIL Team
Think Quality, Think FIL
`.trim();

  return { html: emailHtml, text: plainText };
}

// Build password reset email (from auth/reset-password/route.js)
function buildPasswordResetEmail(email, firstName, resetCode) {
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.8;
    }
    .code-box {
      background-color: #f8f9fa;
      border: 2px dashed #1cc978;
      padding: 30px;
      margin: 30px 0;
      border-radius: 10px;
      text-align: center;
    }
    .code {
      font-size: 36px;
      font-weight: bold;
      color: #1cc978;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #777;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
      <p>FIL Store</p>
    </div>
    
    <div class="content">
      <p>Hi ${firstName || 'there'},</p>
      
      <p>We received a request to reset your password for your FIL Store account.</p>
      
      <p>Use the code below to reset your password:</p>
      
      <div class="code-box">
        <div class="code">${resetCode}</div>
        <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
          This code expires in <strong>10 minutes</strong>
        </p>
      </div>
      
      <div class="warning">
        ⚠️ <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email and your password will remain unchanged.
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        For security reasons, this code can only be used once and will expire after 10 minutes.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0;"><strong>The FIL Team</strong></p>
      <p style="margin: 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
    </div>
  </div>
</body>
</html>`;

  const plainText = `
Hi ${firstName || 'there'},

We received a request to reset your password for your FIL Store account.

Your password reset code is: ${resetCode}

This code expires in 10 minutes.

If you didn't request this password reset, please ignore this email.

The FIL Team
Think Quality, Think FIL.
  `.trim();

  return { html: emailHtml, text: plainText };
}

// Build password reset success email
function buildPasswordResetSuccessEmail(email, firstName) {
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.8;
    }
    .success-box {
      background-color: #d4edda;
      border-left: 4px solid #1cc978;
      padding: 20px;
      margin: 30px 0;
      border-radius: 5px;
      text-align: center;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #777;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>✅ Password Reset Successful</h1>
      <p>FIL Store</p>
    </div>
    
    <div class="content">
      <p>Hi ${firstName || 'there'},</p>
      
      <div class="success-box">
        <h2 style="margin: 0; color: #1cc978;">🎉 Success!</h2>
        <p style="margin: 10px 0 0 0;">Your password has been successfully reset.</p>
      </div>
      
      <p>You can now log in to your FIL Store account using your new password.</p>
      
      <p style="margin-top: 30px;">If you didn't make this change or believe an unauthorized person has accessed your account, please contact our support team immediately.</p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0;"><strong>The FIL Team</strong></p>
      <p style="margin: 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
    </div>
  </div>
</body>
</html>`;

  const plainText = `
Hi ${firstName || 'there'},

Your password has been successfully reset.

You can now log in to your FIL Store account using your new password.

If you didn't make this change, please contact our support team immediately.

The FIL Team
Think Quality, Think FIL.
  `.trim();

  return { html: emailHtml, text: plainText };
}

// Main test function
async function testAllEmails() {
  console.log('🧪 Starting Email Test Script');
  console.log('📧 Test email address:', TEST_EMAIL);
  console.log('');

  try {
    // 1. Welcome Email
    console.log('1️⃣ Testing Welcome Email...');
    // Inline welcome email
    const welcomeEmailHtml = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Welcome to FIL Store!</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root {
      --bg-primary: #f0f2f5;
      --bg-card: #ffffff;
      --text-primary: #1a1a2e;
      --text-secondary: #444455;
      --text-muted: #666677;
      --border-color: #e2e2ea;
      --accent-light: #f0faf5;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #1a1a2e;
        --bg-card: #2d2d3a;
        --text-primary: #ffffff;
        --text-secondary: #d1d1e0;
        --text-muted: #a0a0b0;
        --border-color: #3d3d4a;
        --accent-light: #1a2a25;
      }
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: var(--bg-primary) !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

    @media only screen and (max-width: 620px) {
      .email-card  { width: 100% !important; }
      .mobile-pad  { padding-left: 20px !important; padding-right: 20px !important; }
      .header-pad  { padding: 32px 20px !important; }
      .promo-inner { padding: 24px 16px !important; }
      .promo-code-cell { font-size: 22px !important; padding: 12px 18px !important; letter-spacing: 2px !important; }
      .cta-td      { padding: 14px 28px !important; font-size: 14px !important; }
      .header-h1   { font-size: 26px !important; }
      .feature-icon-td { width: 38px !important; padding-right: 10px !important; }
    }

    @media only screen and (max-width: 480px) {
      .mobile-pad  { padding-left: 14px !important; padding-right: 14px !important; }
      .header-h1   { font-size: 22px !important; }
      .promo-code-cell { font-size: 19px !important; padding: 10px 14px !important; }
      .cta-td      { padding: 13px 22px !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:var(--bg-primary);">

  <!-- Hidden preheader -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    Welcome to FIL Store, ${TEST_FIRST_NAME}! Here&rsquo;s your exclusive 10% OFF welcome gift. Start shopping today! &#127881;
  </div>

  <!-- Full-width background -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:28px 10px;">

        <!-- ═══ EMAIL CARD ═══ -->
        <table class="email-card" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px; width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- ── HEADER ── -->
          <tr>
            <td class="header-pad" style="background-color:#0fa968; padding:48px 40px; text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 12px 0; font-size:54px; line-height:1.1;">&#127881;</p>
                    <h1 class="header-h1"
                      style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:30px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">
                      Welcome to FIL Store!
                    </h1>
                    <p style="margin:12px 0 0 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; color:#cdf4e3;">
                      We&rsquo;re thrilled to have you join our family
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── GREETING & INTRO ── -->
          <tr>
            <td class="mobile-pad" style="padding:36px 40px 0 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:19px; font-weight:700; color:#1a1a2e; padding-bottom:14px;">
                    Hi ${TEST_FIRST_NAME}! &#128075;
                  </td>
                </tr>
                <tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; line-height:26px; color:#444455; padding-bottom:12px;">
                    We&rsquo;re so excited to welcome you to the
                    <strong style="color:#1a1a2e;">Fedan Investment Limited (FIL)</strong> community! &#127881;
                  </td>
                </tr>
                <tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; line-height:26px; color:#444455; padding-bottom:28px;">
                    At FIL, we don&rsquo;t just make accessories &mdash; we believe in empowering people
                    by giving them the tools they need to stay connected, productive, and unstoppable.
                    Every product we create is built with care, empathy, and a drive to make your
                    everyday life a little easier.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── PROMO CODE BOX ── -->
          <tr>
            <td class="mobile-pad" style="padding:0 40px 10px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border-radius:14px; overflow:hidden; background-color:#0fa968;">
                <tr>
                  <td class="promo-inner" style="padding:30px 26px; text-align:center;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                      <!-- Promo heading -->
                      <tr>
                        <td style="text-align:center; padding-bottom:6px;">
                          <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:20px; font-weight:700; color:#ffffff;">
                            &#127873; Your Welcome Gift
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="text-align:center; padding-bottom:18px;">
                          <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; color:#cdf4e3;">
                            Enjoy <strong style="color:#ffffff;">10% OFF</strong> your first order!
                          </p>
                        </td>
                      </tr>

                      <!-- Code pill -->
                      <tr>
                        <td style="text-align:center; padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                            <tr>
                              <td class="promo-code-cell"
                                style="background-color:#ffffff; color:#0a7a4a; padding:15px 28px; font-family:'Courier New',Courier,monospace; font-size:28px; font-weight:700; border-radius:10px; letter-spacing:4px; border:2px dashed #0a7a4a;">
                                WELCOME10
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Promo details -->
                      <tr>
                        <td style="text-align:center;">
                          <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#cdf4e3;">
                            Valid for the next 14 days &bull; Use at checkout
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FEATURES BOX ── -->
          <tr>
            <td class="mobile-pad" style="padding:24px 40px 10px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#f4faf7; border-radius:12px; border-left:4px solid #0fa968;">
                <tr>
                  <td style="padding:26px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                      <!-- Section heading -->
                      <tr>
                        <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:700; color:#1a1a2e; padding-bottom:20px;">
                          &#127775; What Makes FIL Special?
                        </td>
                      </tr>

                      <!-- Feature 1 -->
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td class="feature-icon-td"
                                style="width:46px; vertical-align:top; padding-right:14px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="width:40px; height:40px; background-color:#fff3e0; border-radius:10px; text-align:center; line-height:40px; font-size:20px;">
                                      &#9889;
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align:top;">
                                <p style="margin:0 0 4px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#1a1a2e;">Quality Products</p>
                                <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#555566; line-height:19px;">
                                  From power banks that keep you charged on the go, to accessories designed to fit seamlessly into your lifestyle.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Feature 2 -->
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td class="feature-icon-td"
                                style="width:46px; vertical-align:top; padding-right:14px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="width:40px; height:40px; background-color:#e8f5e9; border-radius:10px; text-align:center; line-height:40px; font-size:20px;">
                                      &#128154;
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align:top;">
                                <p style="margin:0 0 4px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#1a1a2e;">Customer First</p>
                                <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#555566; line-height:19px;">
                                  We&rsquo;re not just here to sell to you &mdash; we&rsquo;re here to grow with you. Your satisfaction is our priority.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Feature 3 -->
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td class="feature-icon-td"
                                style="width:46px; vertical-align:top; padding-right:14px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="width:40px; height:40px; background-color:#e3f2fd; border-radius:10px; text-align:center; line-height:40px; font-size:20px;">
                                      &#128737;&#65039;
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align:top;">
                                <p style="margin:0 0 4px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#1a1a2e;">Built with Care</p>
                                <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#555566; line-height:19px;">
                                  Every product is created with empathy and a commitment to making your life easier and more connected.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CTA BUTTON ── -->
          <tr>
            <td style="padding:28px 40px; text-align:center; background-color:#ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="border-radius:30px; background-color:#0fa968;">
                    <a href="https://filstore.com.ng/products" target="_blank"
                      class="cta-td"
                      style="display:inline-block; padding:16px 46px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:30px; letter-spacing:0.3px;">
                      Start Shopping Now &#8594;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr>
            <td class="mobile-pad" style="padding:0 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:1px; background-color:#e8e8ee; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CLOSING NOTE ── -->
          <tr>
            <td class="mobile-pad" style="padding:24px 40px 28px 40px; text-align:center; background-color:#ffffff;">
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#555566; line-height:24px;">
                We&rsquo;re not just a store &mdash; we&rsquo;re a community. Welcome aboard, and thank you for
                trusting FIL. We&rsquo;re honoured to be part of your journey! &#128153;
              </p>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background-color:#f2f3f5; padding:28px 40px; border-top:1px solid #e2e2ea;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Brand -->
                <tr>
                  <td style="text-align:center; padding-bottom:4px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e;">
                      The FIL Team
                    </p>
                  </td>
                </tr>

                <!-- Tagline -->
                <tr>
                  <td style="text-align:center; padding-bottom:16px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-style:italic; color:#0fa968;">
                      Think Quality, Think FIL.
                    </p>
                  </td>
                </tr>

                <!-- Website -->
                <tr>
                  <td style="text-align:center; padding-bottom:12px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#666677;">
                      Visit us at
                      <a href="https://filstore.com.ng" target="_blank"
                        style="color:#0fa968; text-decoration:none; font-weight:600;">filstore.com.ng</a>
                    </p>
                  </td>
                </tr>

                <!-- Support -->
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:12px; color:#aaaabc; line-height:18px;">
                      Need help? Contact us at
                      <a href="mailto:filfilecommerce@gmail.com"
                        style="color:#aaaabc; text-decoration:underline;">filfilecommerce@gmail.com</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>
        <!-- ═══ END EMAIL CARD ═══ -->

        <!-- Bottom spacer -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="padding:20px 0;">&nbsp;</td></tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;

  const welcomePlainText = `
Hi ${TEST_FIRST_NAME},

We're so excited to welcome you to the Fedan Investment Limited (FIL) community!

At FIL, we don't just make accessories - we believe in empowering people by giving
them the tools they need to stay connected, productive, and unstoppable.

YOUR WELCOME GIFT
==========================================
Promo Code : WELCOME10
Discount   : 10% OFF your first order
Validity   : Valid for the next 14 days
How to use : Enter code at checkout

WHAT MAKES FIL SPECIAL?
==========================================
* Quality Products  - From power banks to accessories designed for your lifestyle.
* Customer First    - We're here to grow with you. Your satisfaction is our priority.
* Built with Care   - Every product crafted with empathy to make life easier.

==========================================

Start shopping now:
https://filstore.com.ng/products

We're not just a store - we're a community. Welcome aboard!

Warm regards,
The FIL Team
Think Quality, Think FIL.
https://filstore.com.ng

Need help? filfilecommerce@gmail.com
  `.trim();

  await sendEmail(
    TEST_EMAIL,
    `Welcome to FIL Store, ${TEST_FIRST_NAME}!`,
    welcomePlainText,
    welcomeEmailHtml
  );
  console.log('✅ Welcome Email sent\n');

    // Wait 1 second between emails
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Verification Email
    console.log('2️⃣ Testing Verification Email...');
    const verificationCode = generateCode();
    const verificationEmail = buildVerificationEmail(TEST_EMAIL, TEST_FIRST_NAME, verificationCode);
    await sendEmail(
      TEST_EMAIL,
      "Verify your email - FIL Store",
      verificationEmail.text,
      verificationEmail.html
    );
    console.log('✅ Verification Email sent\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Password Reset Request Email
    console.log('3️⃣ Testing Password Reset Request Email...');
    const resetCode = generateCode();
    const resetEmail = buildPasswordResetEmail(TEST_EMAIL, TEST_FIRST_NAME, resetCode);
    await sendEmail(
      TEST_EMAIL,
      "Password Reset Request - FIL Store",
      resetEmail.text,
      resetEmail.html
    );
    console.log('✅ Password Reset Request Email sent\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Password Reset Success Email
    console.log('4️⃣ Testing Password Reset Success Email...');
    const resetSuccessEmail = buildPasswordResetSuccessEmail(TEST_EMAIL, TEST_FIRST_NAME);
    await sendEmail(
      TEST_EMAIL,
      "Password Reset Successful - FIL Store",
      resetSuccessEmail.text,
      resetSuccessEmail.html
    );
    console.log('✅ Password Reset Success Email sent\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. Order Confirmation Email (Customer)
    console.log('5️⃣ Testing Order Confirmation Email (Customer)...');
    const orderConfirmationHtml = buildOrderConfirmationEmail(mockOrder, false);
    const orderConfirmationText = buildOrderConfirmationPlainText(mockOrder, false);
    await sendEmail(
      TEST_EMAIL,
      `Order Confirmed - FIL Store (#TEST-ORDER-12345)`,
      orderConfirmationText,
      orderConfirmationHtml
    );
    console.log('✅ Order Confirmation Email (Customer) sent\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 6. Order Confirmation Email (Admin)
    console.log('6️⃣ Testing Order Confirmation Email (Admin)...');
    const adminOrderHtml = buildOrderConfirmationEmail(mockOrder, true);
    const adminOrderText = buildOrderConfirmationPlainText(mockOrder, true);
    await sendEmail(
      TEST_EMAIL,
      `New Order: ${mockOrder.firstName} ${mockOrder.lastName || ""} — NGN ${Number(mockOrder.total).toLocaleString()} (#TEST-ORDER-12345)`,
      adminOrderText,
      adminOrderHtml
    );
    console.log('✅ Order Confirmation Email (Admin) sent\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 7. Order Shipped Email
    console.log('7️⃣ Testing Order Shipped Email...');
    const shippedConfig = STATUS_EMAIL_CONFIG.shipped;
    const shippedHtml = buildStatusEmail(mockOrder, shippedConfig);
    const shippedText = buildPlainText(mockOrder, shippedConfig);
    await sendEmail(
      TEST_EMAIL,
      shippedConfig.subject,
      shippedText,
      shippedHtml
    );
    console.log('✅ Order Shipped Email sent\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 8. Order Delivered Email
    console.log('8️⃣ Testing Order Delivered Email...');
    const deliveredConfig = STATUS_EMAIL_CONFIG.delivered;
    const deliveredHtml = buildStatusEmail(mockOrder, deliveredConfig);
    const deliveredText = buildPlainText(mockOrder, deliveredConfig);
    await sendEmail(
      TEST_EMAIL,
      deliveredConfig.subject,
      deliveredText,
      deliveredHtml
    );
    console.log('✅ Order Delivered Email sent\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 9. Follow-up Email
    console.log('9️⃣ Testing Follow-up Email...');
    const followUpEmail = buildFollowUpEmail(mockOrder);
    await sendEmail(
      TEST_EMAIL,
      "How's your FIL Store order? 💙",
      followUpEmail.text,
      followUpEmail.html
    );
    console.log('✅ Follow-up Email sent\n');

    console.log('🎉 All email tests completed successfully!');
    console.log(`📧 Check ${TEST_EMAIL} for all test emails`);

  } catch (error) {
    console.error('❌ Error during email testing:', error);
    process.exit(1);
  }
}

// Run the test
testAllEmails();