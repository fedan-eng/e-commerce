// app/api/orders/[id]/route.js

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";

export async function GET(req, context) {
  await connectDB();
  const { id } = await context.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify({ order }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}

export async function PATCH(req, context) {
  await connectDB();
  const { id } = await context.params;

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    verifyToken(token);

    const { status } = await req.json();

    const validStatuses = [
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "confirmed",
      "processed",
    ];
    if (!validStatuses.includes(status.toLowerCase())) {
      return new Response(JSON.stringify({ message: "Invalid status" }), {
        status: 400,
      });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }

    const customerEmail = order.email;
    if (customerEmail && STATUS_EMAIL_CONFIG[status.toLowerCase()]) {
      const cfg = STATUS_EMAIL_CONFIG[status.toLowerCase()];
      try {
        const html = buildStatusEmail(order, cfg);
        const plain = buildPlainText(order, cfg);
        await sendEmail(customerEmail, cfg.subject, plain, html);
        console.log(
          `Status email sent to ${customerEmail} for status: ${status}`
        );
      } catch (emailErr) {
        console.error("Status email failed:", emailErr.message);
      }
    }

    return new Response(JSON.stringify({ order }), { status: 200 });
  } catch (error) {
    console.error("PATCH error:", error.message);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}

// ── Status email config ───────────────────────────────────────────────────────
const STATUS_EMAIL_CONFIG = {
  shipped: {
    subject: "Your FIL Order Has Been Shipped!",
    headline: "Your Order Is On Its Way!",
    subheading: "Great news — your order has been shipped",
    badge: "Shipped",
    badgeEmoji: "&#128666;",
    // solid colors — no gradients (email client support)
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
      "Thank you for trusting us to be part of your journey. The best is yet to come. &#128153;",
    ],
    plainMessage: () =>
      `Your order has been shipped and is on its way!\nExpected delivery: 1-3 working days (Lagos) or 5-7 working days (other regions).\nContact us: https://filstore.com.ng/contact`,
  },
  delivered: {
    subject: "Your FIL Order Has Been Delivered!",
    headline: "Order Delivered!",
    subheading: "We hope you love your new product",
    badge: "Delivered",
    badgeEmoji: "&#10003;",
    headerBg: "#0fa968",
    headerText: "#cdf4e3",
    badgeBg: "#ffffff",
    badgeTextColor: "#0a7a4a",
    accentColor: "#0fa968",
    accentLight: "#f0faf5",
    accentBorder: "#b2dfca",
    ctaText: "Leave a Review",
    ctaLink: "https://filstore.com.ng/products",
    messageLines: [
      "Your order has been marked as delivered. We hope everything arrived in perfect condition!",
      "We'd love to hear what you think — feel free to leave a review on the product page. Your feedback helps us serve you and thousands of others better.",
      "Thank you for choosing <strong style=\"color:#1a1a2e;\">FIL Store</strong>. We're always here if you need anything. &#128153;",
    ],
    plainMessage: () =>
      `Your order has been delivered! We hope everything arrived in perfect condition. Thank you for choosing FIL Store.\nShop again: https://filstore.com.ng/products`,
  },
};

// ── Shared head block ─────────────────────────────────────────────────────────
function emailHead(title) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body { margin:0 !important; padding:0 !important; background-color:#f0f2f5 !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    :root { color-scheme: light only; }
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
<body style="margin:0; padding:0; background-color:#f0f2f5;">`;
}

// ── Main email builder ────────────────────────────────────────────────────────
function buildStatusEmail(order, cfg) {
  const firstName = order.firstName || "Customer";
  const total     = order.total    ?? order.subTotal ?? 0;
  const subTotal  = order.subTotal ?? 0;
  const delivFee  = order.deliveryFee ?? 0;
  const discount  = order.discount ?? 0;
  const regionName = order.region?.name || order.region || "—";

  // Determine CTA link for delivered status - link to product review section if single item
  let ctaLink = cfg.ctaLink;
  if (cfg.badge === "Delivered" && order.items && order.items.length === 1) {
    const singleItem = order.items[0];
    const productId = singleItem.productId || singleItem._id;
    if (productId) {
      ctaLink = `https://filstore.com.ng/products/${productId}#reviews-section`;
    }
  }

  // ── item rows ───────────────────────────────────────────────────────────────
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

  // ── message paragraphs ──────────────────────────────────────────────────────
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
                    Hi ${firstName}! &#128075;
                  </td>
                </tr>
                ${messageParagraphsHtml}
                <!-- CTA -->
                <tr>
                  <td style="text-align:center; padding:20px 0 30px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="border-radius:30px; background-color:${cfg.accentColor};">
                          <a href="${ctaLink}" target="_blank" class="cta-td"
                            style="display:inline-block; padding:15px 38px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:30px; letter-spacing:0.3px;">
                            ${cfg.ctaText} &#8594;
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
                          &#128203; Order Summary
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

                      <!-- Phone -->
                      <tr><td style="padding:10px 0; border-bottom:1px solid ${cfg.accentBorder};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Phone</td>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${order.phone || "—"}</td>
                        </tr></table>
                      </td></tr>

                      <!-- Address -->
                      <tr><td style="padding:10px 0; border-bottom:1px solid ${cfg.accentBorder};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%; vertical-align:top;">Address</td>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${order.address || "—"}</td>
                        </tr></table>
                      </td></tr>

                      <!-- City -->
                      <tr><td style="padding:10px 0; border-bottom:1px solid ${cfg.accentBorder};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">City</td>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${order.city || "—"}</td>
                        </tr></table>
                      </td></tr>

                      <!-- Region -->
                      <tr><td style="padding:10px 0; border-bottom:1px solid ${cfg.accentBorder};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Region</td>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${regionName}</td>
                        </tr></table>
                      </td></tr>

                      <!-- Delivery Type -->
                      <tr><td style="padding:10px 0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#555566; width:42%;">Delivery Type</td>
                          <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${order.deliveryType || "—"}</td>
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
                &#128717; Your Items
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

// ── Plain text fallback ───────────────────────────────────────────────────────
function buildPlainText(order, cfg) {
  const firstName  = order.firstName || "Customer";
  const total      = order.total ?? order.subTotal ?? 0;
  const subTotal   = order.subTotal ?? 0;
  const delivFee   = order.deliveryFee ?? 0;
  const discount   = order.discount ?? 0;
  const regionName = order.region?.name || order.region || "—";

  // Determine CTA link for delivered status - link to product review section if single item
  let ctaLink = cfg.ctaLink;
  if (cfg.badge === "Delivered" && order.items && order.items.length === 1) {
    const singleItem = order.items[0];
    const productId = singleItem.productId || singleItem._id;
    if (productId) {
      ctaLink = `https://filstore.com.ng/products/${productId}#reviews-section`;
    }
  }

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
Phone        : ${order.phone || "—"}
Address      : ${order.address || "—"}
City         : ${order.city || "—"}
Region       : ${regionName}
Delivery     : ${order.deliveryType || "—"}

ITEMS
==========================================
${itemLines}

FINANCIALS
==========================================
Subtotal     : NGN ${Number(subTotal).toLocaleString()}
Delivery Fee : NGN ${Number(delivFee).toLocaleString()}${discount > 0 ? `\nDiscount     : -NGN ${Number(discount).toLocaleString()}` : ""}
TOTAL        : NGN ${Number(total).toLocaleString()}

==========================================
${cfg.ctaText}: ${ctaLink}

Thank you for choosing FIL Store.
Think Quality, Think FIL.
https://filstore.com.ng
  `.trim();
}