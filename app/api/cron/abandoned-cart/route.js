// app/api/cron/abandoned-cart/route.js
// Vercel Cron calls this daily at 10am.
// Finds users with carts untouched for 5+ days and sends one email per user.

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";

export async function GET(req) {
  // Protect the cron endpoint — Vercel sends this header automatically
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  await connectDB();

  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    // Use this for testing:
    //  const fiveDaysAgo = new Date(Date.now() - 1 * 60 * 1000); // 1 minute ago

    // Find users who:
    // 1. Have items in their cart
    // 2. Haven't touched their cart in 5+ days
    // 3. Haven't already received an abandoned cart email
    const abandonedUsers = await User.find({
      "cart.items.0":           { $exists: true }, // cart has at least 1 item
      "cart.updatedAt":         { $lte: fiveDaysAgo },
      "cart.abandonedEmailSent": false,
    }).select("firstName email cart");

    console.log(`Found ${abandonedUsers.length} abandoned carts`);

    const results = await Promise.allSettled(
      abandonedUsers.map(async (user) => {
        const html  = buildAbandonedCartEmail(user);
        const plain = buildPlainText(user);

        await sendEmail(
          user.email,
          "You left something behind 👀 — FIL Store",
          plain,
          html
        );

        // Mark as sent so we don't email them again
        await User.findByIdAndUpdate(user._id, {
          "cart.abandonedEmailSent": true,
        });

        console.log(`✅ Abandoned cart email sent to ${user.email}`);
      })
    );

    const sent   = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({ message: "Done", sent, failed }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Abandoned cart cron error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

// ── Email HTML ────────────────────────────────────────────────────────────────
function buildAbandonedCartEmail(user) {
  const firstName  = user.firstName || "there";
  const items      = user.cart?.items || [];
  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;">
        <div style="display:flex;align-items:center;gap:12px;">
          ${item.image
            ? `<img src="${item.image}" alt="${item.name}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #e5e5e5;" />`
            : `<div style="width:48px;height:48px;background:#f5f5f5;border-radius:6px;"></div>`
          }
          <div>
            <p style="margin:0;font-size:14px;font-weight:600;color:#222;">${item.name || "Product"}</p>
            ${item.color ? `<p style="margin:2px 0 0;font-size:12px;color:#888;">Color: ${item.color}</p>` : ""}
            <p style="margin:2px 0 0;font-size:12px;color:#888;">Qty: ${item.quantity || 1}</p>
          </div>
        </div>
      </td>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;color:#222;white-space:nowrap;">
        &#8358;${Number(item.price || 0).toLocaleString()}
      </td>
    </tr>
  `).join("");

  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1), 0
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1cc978 0%,#16a05f 100%);padding:40px 30px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🛒</div>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">Did you forget something?</h1>
      <p style="margin:10px 0 0;font-size:15px;color:#ffffff;opacity:0.95;">
        Your cart is waiting for you, ${firstName}
      </p>
    </div>

    <!-- Body -->
    <div style="padding:40px 30px;color:#333;line-height:1.8;">
      <p style="font-size:16px;color:#222;margin:0 0 16px;">Hi <strong>${firstName}</strong>,</p>

      <p style="color:#555;margin:0 0 14px;">
        We noticed you left ${totalItems} item${totalItems > 1 ? "s" : ""} in your cart a few days ago — and we just wanted to check in. 💙
      </p>
      <p style="color:#555;margin:0 0 14px;">
        Is everything okay? Sometimes life gets busy, sometimes it's a question about the product, and sometimes it just slips through the cracks. Whatever the reason, we're here.
      </p>
      <p style="color:#555;margin:0 0 28px;">
        Your items are still available — but we can't hold them forever. Don't miss out!
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:0 0 32px;">
        <a href="https://filstore.com.ng/cart"
           style="display:inline-block;background:linear-gradient(135deg,#1cc978,#16a05f);color:#ffffff;padding:16px 40px;text-decoration:none;border-radius:30px;font-weight:700;font-size:16px;letter-spacing:0.3px;">
          Complete My Order →
        </a>
      </div>

      <!-- Cart items -->
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:0 0 24px;">
        <h2 style="margin:0 0 16px;font-size:16px;color:#222;font-weight:700;">🛍️ Your cart (${totalItems} item${totalItems > 1 ? "s" : ""})</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tbody>${itemRows}</tbody>
        </table>
        <div style="margin-top:16px;padding-top:16px;border-top:2px solid #e5e5e5;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:15px;color:#555;">Estimated subtotal</span>
          <span style="font-size:18px;font-weight:700;color:#16a05f;">&#8358;${subtotal.toLocaleString()}</span>
        </div>
      </div>

      <!-- Reassurance -->
      <div style="border-left:3px solid #1cc978;padding:12px 16px;background:#f0fdf6;border-radius:0 6px 6px 0;margin:0 0 28px;">
        <p style="margin:0;font-size:13px;color:#444;line-height:1.7;">
          🚚 <strong>Fast delivery</strong> across Lagos (1–3 days) and Nigeria-wide (5–7 days)<br>
          🔒 <strong>Secure checkout</strong> via Paystack<br>
          ↩️ <strong>7-day returns</strong> on all products
        </p>
      </div>

      <p style="color:#888;font-size:13px;margin:0;">
        Have a question about your order or one of your items? 
        <a href="https://filstore.com.ng/contact" style="color:#16a05f;font-weight:600;text-decoration:none;">Contact us</a> — 
        we're happy to help.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8f9fa;padding:28px 30px;text-align:center;color:#666;font-size:13px;">
      <p style="font-size:15px;color:#222;margin:0 0 6px;"><strong>The FIL Team</strong></p>
      <p style="font-style:italic;color:#16a05f;margin:0 0 14px;">Think Quality, Think FIL.</p>
      <p style="margin:0;">Visit us at <a href="https://filstore.com.ng" style="color:#16a05f;text-decoration:none;font-weight:600;">filstore.com.ng</a></p>
      <p style="margin-top:16px;font-size:11px;color:#aaa;">
        You're receiving this because you have an account at FIL Store.<br>
        This is an automated reminder. Please do not reply directly to this email.
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ── Plain text fallback ───────────────────────────────────────────────────────
function buildPlainText(user) {
  const firstName = user.firstName || "there";
  const items     = user.cart?.items || [];
  const subtotal  = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1), 0
  );
  const itemLines = items
    .map((i) => `- ${i.name} x${i.quantity || 1} — N${Number(i.price || 0).toLocaleString()}`)
    .join("\n");

  return `
Hi ${firstName},

We noticed you left some items in your cart a few days ago — just checking in!

Your cart:
${itemLines}

Estimated subtotal: N${subtotal.toLocaleString()}

Complete your order here: https://filstore.com.ng/cart

Have questions? Contact us: https://filstore.com.ng/contact

The FIL Team
Think Quality, Think FIL.
https://filstore.com.ng
  `.trim();
}