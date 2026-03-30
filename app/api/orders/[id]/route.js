// app/api/orders/[id]/route.js

import {connectDB} from "@/lib/db";
import Order from "@/models/Order";
import {verifyToken} from "@/lib/auth";
import {sendEmail} from "@/lib/mailer";

export async function GET(req, context) {
  await connectDB();
  const {id} = await context.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return new Response(JSON.stringify({message: "Order not found"}), { status: 404 });
    }
    return new Response(JSON.stringify({order}), {status: 200});
  } catch (error) {
    return new Response(JSON.stringify({message: error.message}), { status: 500 });
  }
}

export async function PATCH(req, context) {
  await connectDB();
  const {id} = await context.params;

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({message: "Unauthorized"}), { status: 401 });
    }
    verifyToken(token);

    const {status} = await req.json();

    const validStatuses = [
      "processing", "shipped", "delivered", "cancelled", "confirmed", "processed",
    ];
    if (!validStatuses.includes(status.toLowerCase())) {
      return new Response(JSON.stringify({message: "Invalid status"}), { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(id, {status}, {new: true});
    if (!order) {
      return new Response(JSON.stringify({message: "Order not found"}), { status: 404 });
    }

    // Send status update email
    const customerEmail = order.email;
    if (customerEmail && STATUS_EMAIL_CONFIG[status.toLowerCase()]) {
      const cfg = STATUS_EMAIL_CONFIG[status.toLowerCase()];
      try {
        const html  = buildStatusEmail(order, cfg);
        const plain = buildPlainText(order, cfg);
        await sendEmail(customerEmail, cfg.subject, plain, html);
        console.log(`✅ Status email sent to ${customerEmail} for status: ${status}`);
      } catch (emailErr) {
        console.error("❌ Status email failed:", emailErr.message);
      }
    }

    return new Response(JSON.stringify({order}), {status: 200});
  } catch (error) {
    console.error("PATCH error:", error.message);
    return new Response(JSON.stringify({message: error.message}), { status: 500 });
  }
}

// ── Status email config ───────────────────────────────────────────────────────
const STATUS_EMAIL_CONFIG = {
  shipped: {
    subject:      "Your FIL Order Has Been Shipped! 🚚",
    headline:     "Your Order Is On Its Way!",
    subheading:   "Great news — your order has been shipped",
    badge:        "📦 Shipped",
    badgeColor:   "#a06ae8",
    ctaText:      "Track Your Order",
    ctaLink:      "https://filstore.com.ng/contact",
    message: (order) => `
      <p style="color:#444;margin:0 0 14px;">Your order is now in the hands of our delivery team and on its way to you!</p>
      <p style="color:#444;margin:0 0 14px;">We know how much you've been looking forward to this, and we're just as excited for you to experience your new product. Every FIL package is prepared with care, because to us, you're not just a customer — you're family.</p>
      <p style="color:#444;margin:0 0 14px;">While your order is on the move, know this: our promise goes beyond delivery. We're here to make sure your experience with FIL feels smooth, supportive, and empowering every step of the way.</p>
      <p style="color:#444;margin:0;">Thank you for trusting us to be part of your journey. The best is yet to come. 💙</p>
    `,
    plainMessage: () =>
      `Your order has been shipped and is on its way!\nExpected delivery: 1–3 working days (Lagos) or 5–7 working days (other regions).\nTrack your order: https://filstore.com.ng/contact`,
  },
  delivered: {
    subject:      "Your FIL Order Has Been Delivered! ✅",
    headline:     "Order Delivered!",
    subheading:   "We hope you love your new product",
    badge:        "✅ Delivered",
    badgeColor:   "#16a05f",
    ctaText:      "Continue Shopping",
    ctaLink:      "https://filstore.com.ng/products",
    message: (order) => `
      <p style="color:#444;margin:0 0 14px;">Your order has been marked as delivered. We hope everything arrived in perfect condition!</p>
      <p style="color:#444;margin:0 0 14px;">We'd love to hear what you think — feel free to leave a review on the product page. Your feedback helps us serve you and thousands of others better.</p>
      <p style="color:#444;margin:0;">Thank you for choosing <strong>FIL Store</strong>. We're always here if you need anything. 💙</p>
    `,
    plainMessage: () =>
      `Your order has been delivered! We hope everything arrived in perfect condition. Thank you for choosing FIL Store.\nShop again: https://filstore.com.ng/products`,
  },
};

// ── Email HTML builder ────────────────────────────────────────────────────────
function buildStatusEmail(order, cfg) {
  const itemRows = (order.items || []).map((item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e0e0e0;color:#333;">${item.name || "Product"}</td>
      <td style="padding:12px;border-bottom:1px solid #e0e0e0;text-align:center;color:#333;">${item.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #e0e0e0;text-align:right;color:#333;">&#8358;${Number(item.price || 0).toLocaleString()}</td>
      <td style="padding:12px;border-bottom:1px solid #e0e0e0;text-align:right;color:#333;">&#8358;${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</td>
    </tr>
  `).join("");

  const total    = order.total    ?? order.subTotal ?? 0;
  const subTotal = order.subTotal ?? 0;
  const delivFee = order.deliveryFee ?? 0;
  const discount = order.discount ?? 0;
  const firstName = order.firstName || "Customer";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin:0; padding:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background-color:#f4f4f4; }
    .container { max-width:600px; margin:20px auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1); }
    .header { background:linear-gradient(135deg,#1cc978 0%,#16a05f 100%); color:white; padding:40px 30px; text-align:center; }
    .header h1 { margin:0; font-size:26px; font-weight:600; color:#ffffff; }
    .header p { margin:10px 0 0; font-size:15px; color:#ffffff; opacity:0.95; }
    .badge { display:inline-block; padding:8px 20px; border-radius:20px; font-weight:700; margin:14px 0 0; font-size:14px; }
    .content { padding:40px 30px; color:#333; line-height:1.8; }
    .order-box { background:#f8f9fa; border-left:4px solid #1cc978; padding:20px; margin:24px 0; border-radius:5px; }
    .order-box h2 { margin:0 0 16px; font-size:18px; color:#222; }
    .row { display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px solid #e0e0e0; font-size:14px; }
    .row:last-child { border-bottom:none; }
    .row-label { font-weight:600; color:#444; }
    .row-value { color:#222; text-align:right; }
    table { width:100%; border-collapse:collapse; margin:20px 0; }
    table th { background:#1cc978; color:#ffffff; padding:12px; text-align:left; font-weight:600; font-size:13px; }
    .summary { background:#fff; border:2px solid #1cc978; border-radius:8px; padding:20px; margin:24px 0; }
    .summary-row { display:flex; justify-content:space-between; padding:7px 0; font-size:14px; color:#333; }
    .summary-total { border-top:2px solid #1cc978; margin-top:8px; padding-top:14px; font-size:17px; font-weight:bold; color:#16a05f; }
    .footer { background:#f8f9fa; padding:28px 30px; text-align:center; color:#666; font-size:13px; }
    .footer a { color:#16a05f; text-decoration:none; font-weight:600; }
  </style>
</head>
<body>
  <div class="container">

    <div class="header">
      <h1>${cfg.headline}</h1>
      <p>${cfg.subheading}</p>
      <div class="badge" style="background:rgba(255,255,255,0.25);color:#ffffff;border:1px solid rgba(255,255,255,0.5);">
        ${cfg.badge}
      </div>
    </div>

    <div class="content">
      <p style="font-size:17px;color:#222;">Hi <strong>${firstName}</strong>,</p>
      ${cfg.message(order)}

      <div style="text-align:center;margin:28px 0;">
        <a href="${cfg.ctaLink}"
           style="display:inline-block;background:linear-gradient(135deg,#1cc978,#16a05f);color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:30px;font-weight:700;font-size:15px;letter-spacing:0.3px;">
          ${cfg.ctaText}
        </a>
      </div>

      <div class="order-box">
        <h2>📋 Order Summary</h2>
        <div class="row"><span class="row-label">Order ID:</span><span class="row-value"><strong>#${order._id}</strong></span></div>
        <div class="row"><span class="row-label">Status:</span><span class="row-value" style="color:${cfg.badgeColor};font-weight:600;">${cfg.badge}</span></div>
        <div class="row"><span class="row-label">Name:</span><span class="row-value">${order.firstName || "—"}</span></div>
        <div class="row"><span class="row-label">Email:</span><span class="row-value">${order.email || "—"}</span></div>
        <div class="row"><span class="row-label">Phone:</span><span class="row-value">${order.phone || "—"}</span></div>
        <div class="row"><span class="row-label">Address:</span><span class="row-value">${order.address || "—"}</span></div>
        <div class="row"><span class="row-label">City:</span><span class="row-value">${order.city || "—"}</span></div>
        <div class="row"><span class="row-label">Region:</span><span class="row-value">${order.region?.name || order.region || "—"}</span></div>
        <div class="row"><span class="row-label">Delivery Type:</span><span class="row-value">${order.deliveryType || "—"}</span></div>
      </div>

      <h2 style="color:#222;margin-top:32px;">🛍️ Your Items</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div class="summary">
        <div class="summary-row"><span>Subtotal:</span><span>&#8358;${Number(subTotal).toLocaleString()}</span></div>
        <div class="summary-row"><span>Delivery Fee:</span><span>&#8358;${Number(delivFee).toLocaleString()}</span></div>
        ${discount > 0 ? `<div class="summary-row" style="color:#16a05f;"><span>Discount:</span><span>-&#8358;${Number(discount).toLocaleString()}</span></div>` : ""}
        <div class="summary-row summary-total"><span>Total:</span><span>&#8358;${Number(total).toLocaleString()}</span></div>
      </div>
    </div>

    <div class="footer">
      <p style="font-size:15px;color:#222;margin:0 0 6px;"><strong>The FIL Team</strong></p>
      <p style="font-style:italic;color:#16a05f;margin:0 0 14px;">Think Quality, Think FIL.</p>
      <p>Visit us at <a href="https://filstore.com.ng">filstore.com.ng</a></p>
      <p style="margin-top:16px;font-size:11px;color:#aaa;">This is an automated email. Please do not reply directly to this message.</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Plain text fallback ───────────────────────────────────────────────────────
function buildPlainText(order, cfg) {
  const firstName = order.firstName || "Customer";
  const total     = order.total ?? order.subTotal ?? 0;
  const itemLines = (order.items || [])
    .map((i) => `- ${i.name} x${i.quantity} — N${Number(i.price || 0).toLocaleString()}`)
    .join("\n");

  return `
Hi ${firstName},

${cfg.plainMessage(order)}

Order ID: #${order._id}
Status: ${cfg.badge}
Address: ${order.address}, ${order.city}, ${order.region?.name || order.region}

Items:
${itemLines}

Total: N${Number(total).toLocaleString()}

${cfg.ctaText}: ${cfg.ctaLink}

Thank you for choosing FIL Store.
Think Quality, Think FIL.
https://filstore.com.ng
  `.trim();
}