// app/api/cron/abandoned-cart/route.js

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  await connectDB();

  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const abandonedUsers = await User.find({
      "cart.items.0": { $exists: true },
      "cart.updatedAt": { $lte: fiveDaysAgo },
      "cart.abandonedEmailSent": false,
    }).select("firstName email cart");

    console.log(`Found ${abandonedUsers.length} abandoned carts`);

    const results = await Promise.allSettled(
      abandonedUsers.map(async (user) => {
        const html = buildAbandonedCartEmail(user);
        const plain = buildPlainText(user);

        await sendEmail(
          user.email,
          `${user.firstName || "Hey"}, you left something in your cart — FIL Store`,
          plain,
          html
        );

        await User.findByIdAndUpdate(user._id, {
          "cart.abandonedEmailSent": true,
        });

        console.log(`Abandoned cart email sent to ${user.email}`);
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({ message: "Done", sent, failed }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Abandoned cart cron error:", err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      { status: 500 }
    );
  }
}

// ── Email HTML builder ────────────────────────────────────────────────────────
function buildAbandonedCartEmail(user) {
  const firstName = user.firstName || "there";
  const items = user.cart?.items || [];
  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1),
    0
  );

  // ── Item rows ─────────────────────────────────────────────────────────────
  // NOTE: <img> inside email — always use absolute URLs with https.
  // Images won't load in many clients unless hosted publicly.
  // We use a two-column table row: image cell + details cell + price cell.
  const itemRowsHtml = items
    .map(
      (item) => `
      <tr>
        <!-- Image + details -->
        <td style="padding:14px 10px; border-bottom:1px solid #eef0f3; vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- Product image / placeholder -->
              <td style="vertical-align:top; padding-right:12px; width:52px;">
                ${
                  item.image
                    ? `<img src="${item.image}" alt="${item.name || "Product"}" width="50" height="50"
                        style="display:block; width:50px; height:50px; object-fit:cover; border-radius:8px; border:1px solid #e5e7eb;" />`
                    : `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr><td style="width:50px; height:50px; background-color:#f0f2f5; border-radius:8px; text-align:center; line-height:50px; font-size:22px;">&#128717;</td></tr>
                       </table>`
                }
              </td>
              <!-- Name / color / qty -->
              <td style="vertical-align:top;">
                <p style="margin:0 0 3px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#1a1a2e;">${item.name || "Product"}</p>
                ${item.color ? `<p style="margin:0 0 2px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:12px; color:#6b6b80;">Color: ${item.color}</p>` : ""}
                <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:12px; color:#6b6b80;">Qty: ${item.quantity || 1}</p>
              </td>
            </tr>
          </table>
        </td>
        <!-- Price -->
        <td style="padding:14px 10px; border-bottom:1px solid #eef0f3; vertical-align:top; text-align:right; white-space:nowrap;">
          <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#1a1a2e;">&#x20A6;${Number(item.price || 0).toLocaleString()}</p>
          <p style="margin:3px 0 0 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:11px; color:#6b6b80;">per unit</p>
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>You left something behind — FIL Store</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f0f2f5 !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    :root { color-scheme: light only; }

    @media only screen and (max-width: 620px) {
      .email-card  { width: 100% !important; }
      .mobile-pad  { padding-left: 20px !important; padding-right: 20px !important; }
      .header-pad  { padding: 30px 20px !important; }
      .header-h1   { font-size: 22px !important; }
      .cta-td      { padding: 14px 28px !important; font-size: 14px !important; }
      .section-pad { padding: 18px 14px !important; }
      .subtotal-label { font-size: 13px !important; }
      .subtotal-value { font-size: 16px !important; }
    }

    @media only screen and (max-width: 480px) {
      .mobile-pad  { padding-left: 14px !important; padding-right: 14px !important; }
      .header-h1   { font-size: 20px !important; }
      .cta-td      { padding: 13px 22px !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#f0f2f5;">

  <!-- Hidden preheader -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    Hi ${firstName}, your cart is still waiting! ${totalItems} item${totalItems > 1 ? "s" : ""} ready to check out &mdash; don&rsquo;t miss out. &#128cart;
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
            <td class="header-pad" style="background-color:#0fa968; padding:44px 40px; text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 12px 0; font-size:48px; line-height:1.2;">&#128cart;</p>
                    <h1 class="header-h1"
                      style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:26px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">
                      Did you forget something?
                    </h1>
                    <p style="margin:10px 0 0 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; color:#cdf4e3;">
                      Your cart is still waiting for you, ${firstName}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── GREETING ── -->
          <tr>
            <td class="mobile-pad" style="padding:34px 40px 0 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:18px; font-weight:700; color:#1a1a2e; padding-bottom:14px;">
                    Hi ${firstName}! &#128075;
                  </td>
                </tr>
                <tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:25px; color:#444455; padding-bottom:12px;">
                    We noticed you left <strong style="color:#1a1a2e;">${totalItems} item${totalItems > 1 ? "s" : ""}</strong> in your cart a few days ago &mdash; and we just wanted to check in. &#128153;
                  </td>
                </tr>
                <tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:25px; color:#444455; padding-bottom:12px;">
                    Is everything okay? Sometimes life gets busy, sometimes it&rsquo;s a question about the product, and sometimes it just slips through the cracks. Whatever the reason &mdash; we&rsquo;re here.
                  </td>
                </tr>
                <tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:25px; color:#444455; padding-bottom:26px;">
                    Your items are still available &mdash; but we can&rsquo;t hold them forever. Don&rsquo;t miss out!
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="text-align:center; padding-bottom:32px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="border-radius:30px; background-color:#0fa968;">
                          <a href="https://filstore.com.ng/cart" target="_blank" class="cta-td"
                            style="display:inline-block; padding:16px 42px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:30px; letter-spacing:0.3px;">
                            Complete My Order &#8594;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CART ITEMS BOX ── -->
          <tr>
            <td class="mobile-pad" style="padding:0 40px 10px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#f8f9fa; border-radius:12px; border:1px solid #e8e8ee; overflow:hidden;">

                <!-- Cart heading -->
                <tr>
                  <td style="padding:18px 20px 14px 20px; border-bottom:2px solid #e8e8ee;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e;">
                      &#128717; Your Cart &mdash; ${totalItems} item${totalItems > 1 ? "s" : ""}
                    </p>
                  </td>
                </tr>

                <!-- Item rows -->
                <tr>
                  <td style="padding:0 10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${itemRowsHtml}
                    </table>
                  </td>
                </tr>

                <!-- Subtotal row -->
                <tr>
                  <td style="padding:16px 20px; border-top:2px solid #e0e0ee;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="subtotal-label"
                          style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:600; color:#555566;">
                          Estimated Subtotal
                        </td>
                        <td class="subtotal-value" style="text-align:right;">
                          <span style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:18px; font-weight:800; color:#0a7a4a;">
                            &#x20A6;${subtotal.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- ── SECOND CTA ── -->
          <tr>
            <td style="padding:20px 40px 10px 40px; text-align:center; background-color:#ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="border-radius:30px; background-color:#0fa968;">
                    <a href="https://filstore.com.ng/cart" target="_blank" class="cta-td"
                      style="display:inline-block; padding:15px 38px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:30px; letter-spacing:0.3px;">
                      Go to My Cart &#8594;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── REASSURANCE BOX ── -->
          <tr>
            <td class="mobile-pad" style="padding:20px 40px 10px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#edf7f2; border-radius:10px; border-left:4px solid #0fa968;">
                <tr>
                  <td class="section-pad" style="padding:18px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                      <!-- Bullet 1 -->
                      <tr>
                        <td style="padding-bottom:10px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-size:18px; line-height:1; vertical-align:top; padding-right:10px; padding-top:2px;">&#128666;</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#1f5c3a; line-height:20px; vertical-align:top;">
                                <strong style="color:#1f5c3a;">Fast delivery</strong> across Lagos (1&ndash;3 days) and Nigeria-wide (5&ndash;7 days)
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Bullet 2 -->
                      <tr>
                        <td style="padding-bottom:10px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-size:18px; line-height:1; vertical-align:top; padding-right:10px; padding-top:2px;">&#128274;</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#1f5c3a; line-height:20px; vertical-align:top;">
                                <strong style="color:#1f5c3a;">Secure checkout</strong> via Paystack &amp; Flutterwave
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Bullet 3 -->
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-size:18px; line-height:1; vertical-align:top; padding-right:10px; padding-top:2px;">&#8617;&#65039;</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#1f5c3a; line-height:20px; vertical-align:top;">
                                <strong style="color:#1f5c3a;">7-day returns</strong> on all products
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

          <!-- ── HELP LINE ── -->
          <tr>
            <td class="mobile-pad" style="padding:20px 40px 28px 40px; background-color:#ffffff;">
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#6b6b80; line-height:22px; text-align:center;">
                Have a question about your cart or one of your items?
                <a href="https://filstore.com.ng/contact" target="_blank"
                  style="color:#0fa968; font-weight:700; text-decoration:underline;">Contact us</a>
                &mdash; we&rsquo;re happy to help.
              </p>
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

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background-color:#f2f3f5; padding:26px 40px; border-top:1px solid #e2e2ea;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                <tr>
                  <td style="text-align:center; padding-bottom:4px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e;">
                      The FIL Team
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="text-align:center; padding-bottom:14px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-style:italic; color:#0fa968;">
                      Think Quality, Think FIL.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="text-align:center; padding-bottom:12px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#666677;">
                      Visit us at
                      <a href="https://filstore.com.ng" target="_blank"
                        style="color:#0fa968; text-decoration:none; font-weight:600;">filstore.com.ng</a>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:11px; color:#aaaabc; line-height:18px;">
                      You&rsquo;re receiving this because you have an account at FIL Store.<br>
                      This is an automated reminder. Please do not reply directly to this email.
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
</html>`;
}

// ── Plain text fallback ───────────────────────────────────────────────────────
function buildPlainText(user) {
  const firstName = user.firstName || "there";
  const items = user.cart?.items || [];
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1),
    0
  );
  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const itemLines = items
    .map(
      (i) =>
        `  - ${i.name || "Product"} x${i.quantity || 1}  NGN ${Number(i.price || 0).toLocaleString()}  =  NGN ${(Number(i.price || 0) * Number(i.quantity || 1)).toLocaleString()}`
    )
    .join("\n");

  return `
Hi ${firstName},

We noticed you left ${totalItems} item${totalItems > 1 ? "s" : ""} in your cart a few days ago.
Your items are still available — but we can't hold them forever!

YOUR CART
==========================================
${itemLines}

Estimated Subtotal: NGN ${subtotal.toLocaleString()}

Complete your order here:
https://filstore.com.ng/cart

WHY SHOP WITH FIL?
==========================================
* Fast delivery — Lagos (1-3 days) & Nigeria-wide (5-7 days)
* Secure checkout via Paystack & Flutterwave
* 7-day returns on all products

Have a question? Contact us:
https://filstore.com.ng/contact

==========================================
The FIL Team
Think Quality, Think FIL.
https://filstore.com.ng
  `.trim();
}