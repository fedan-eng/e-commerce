import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { sendEmail } from "@/lib/mailer";

export const config = {
  schedule: "0 10 * * *", // runs every day at 10:00 AM UTC
};

export async function GET() {
  await connectDB();

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await Order.find({
      createdAt: { $lte: sevenDaysAgo },
      followUpSent: false,
    });

    for (const order of orders) {
      const productNames = order.items.map((i) => i.name).join(", ");

      const html  = buildFollowUpEmail(order, productNames);
      const plain = buildPlainText(order, productNames);

      await sendEmail(
        order.email,
        `How is your FIL order, ${order.firstName}? We would love to hear from you`,
        plain,
        html
      );

      order.followUpSent = true;
      await order.save();

      console.log(`Follow-up email sent to ${order.email}`);
    }

    return new Response(
      JSON.stringify({ message: `Sent ${orders.length} follow-up emails.` }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Follow-up email error:", err);
    return new Response(
      JSON.stringify({
        message: "Error sending follow-up emails",
        error: err.message,
      }),
      { status: 500 }
    );
  }
}

// ── HTML builder ──────────────────────────────────────────────────────────────
function buildFollowUpEmail(order, productNames) {
  const firstName = order.firstName || "there";

  // Product name pills — one pill per item
  const productPillsHtml = order.items
    .map(
      (item) => `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"
        style="margin:4px auto;">
        <tr>
          <td style="background-color:#e8f5e9; color:#0a7a4a; padding:6px 18px; border-radius:20px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; border:1px solid #b2dfca; text-align:center;">
            ${item.name}${item.quantity > 1 ? ` &times;${item.quantity}` : ""}
          </td>
        </tr>
      </table>`
    )
    .join("");

  // Support items — inline table rows, no flexbox
  const supportItems = [
    { emoji: "&#128231;", text: "Email us at <a href=\"mailto:filfilecommerce@gmail.com\" style=\"color:#1565c0; font-weight:600; text-decoration:none;\">filfilecommerce@gmail.com</a>" },
    { emoji: "&#128241;", text: "Call our support team anytime" },
    { emoji: "&#128161;", text: "Get quick tips and product guidance" },
  ];

  const supportRowsHtml = supportItems
    .map(
      (s) => `
      <tr>
        <td style="padding-bottom:12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size:18px; line-height:1; vertical-align:top; padding-right:12px; padding-top:2px; width:28px;">
                ${s.emoji}
              </td>
              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#1a3a6b; line-height:21px; vertical-align:top;">
                ${s.text}
              </td>
            </tr>
          </table>
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
  <title>How is your FIL order? — FIL Store</title>
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
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    :root { color-scheme: light only; }

    @media only screen and (max-width: 620px) {
      .email-card  { width: 100% !important; }
      .mobile-pad  { padding-left: 20px !important; padding-right: 20px !important; }
      .header-pad  { padding: 30px 20px !important; }
      .header-h1   { font-size: 23px !important; }
      .section-pad { padding: 20px 16px !important; }
      .cta-td      { padding: 14px 28px !important; font-size: 14px !important; }
      .star-td     { font-size: 26px !important; padding: 0 4px !important; }
    }

    @media only screen and (max-width: 480px) {
      .mobile-pad  { padding-left: 14px !important; padding-right: 14px !important; }
      .header-h1   { font-size: 20px !important; }
      .cta-td      { padding: 12px 22px !important; }
      .star-td     { font-size: 22px !important; padding: 0 3px !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#f0f2f5;">

  <!-- Preheader -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    Hi ${firstName}, we hope your FIL order is treating you well! Share your experience with us &mdash; it only takes a minute. &#11088;
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
                    <p style="margin:0 0 12px 0; font-size:48px; line-height:1.2;">&#128153;</p>
                    <h1 class="header-h1"
                      style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:26px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">
                      How&rsquo;s Everything Going?
                    </h1>
                    <p style="margin:10px 0 0 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; color:#cdf4e3;">
                      We&rsquo;d love to hear from you, ${firstName}
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
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:25px; color:#444455; padding-bottom:22px;">
                    We hope your new purchase is already making life a little easier for you! &#127881;
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── ORDER BOX ── -->
          <tr>
            <td class="mobile-pad" style="padding:0 40px 10px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#f4faf7; border-radius:12px; border-left:4px solid #0fa968;">
                <tr>
                  <td class="section-pad" style="padding:20px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#1a1a2e; padding-bottom:14px;">
                          &#128230; Your Order
                        </td>
                      </tr>
                      <tr>
                        <td style="text-align:center;">
                          ${productPillsHtml}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── BODY TEXT ── -->
          <tr>
            <td class="mobile-pad" style="padding:20px 40px 0 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:25px; color:#444455; padding-bottom:12px;">
                    At FIL, we see every product as more than just an accessory &mdash; it&rsquo;s a way to keep you connected, productive, and empowered to do more with your day.
                  </td>
                </tr>
                <tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:25px; color:#444455; padding-bottom:26px;">
                    Your trust means the world to us, and we&rsquo;re honoured you chose to make us part of your journey. &#128153;
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── RATING SECTION ── -->
          <tr>
            <td class="mobile-pad" style="padding:0 40px 10px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#0fa968; border-radius:14px; overflow:hidden;">
                <tr>
                  <td class="section-pad" style="padding:30px 26px; text-align:center;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                      <!-- Heading -->
                      <tr>
                        <td style="text-align:center; padding-bottom:8px;">
                          <h2 style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:20px; font-weight:700; color:#ffffff;">
                            &#11088; Share Your Experience
                          </h2>
                        </td>
                      </tr>

                      <!-- Subtext -->
                      <tr>
                        <td style="text-align:center; padding-bottom:20px;">
                          <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#cdf4e3; line-height:22px;">
                            Your feedback helps us serve you and our entire FIL family better
                          </p>
                        </td>
                      </tr>

                      <!-- Stars row — inline table cells, no flexbox -->
                      <tr>
                        <td style="text-align:center; padding-bottom:20px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                            <tr>
                              <td class="star-td" style="font-size:30px; padding:0 5px; line-height:1;">&#11088;</td>
                              <td class="star-td" style="font-size:30px; padding:0 5px; line-height:1;">&#11088;</td>
                              <td class="star-td" style="font-size:30px; padding:0 5px; line-height:1;">&#11088;</td>
                              <td class="star-td" style="font-size:30px; padding:0 5px; line-height:1;">&#11088;</td>
                              <td class="star-td" style="font-size:30px; padding:0 5px; line-height:1;">&#11088;</td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- CTA Button -->
                      <tr>
                        <td style="text-align:center; padding-bottom:14px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                            <tr>
                              <td style="border-radius:30px; background-color:#ffffff;">
                                <a href="https://filstore.com.ng/products" target="_blank" class="cta-td"
                                  style="display:inline-block; padding:14px 36px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#0a7a4a; text-decoration:none; border-radius:30px; letter-spacing:0.3px;">
                                  Rate Your Product &#8594;
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Takes a minute note -->
                      <tr>
                        <td style="text-align:center;">
                          <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#cdf4e3;">
                            Takes less than a minute!
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── MID BODY TEXT ── -->
          <tr>
            <td class="mobile-pad" style="padding:22px 40px 10px 40px; background-color:#ffffff;">
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:25px; color:#444455; text-align:center;">
                We&rsquo;d love to hear how your experience has been so far. Your voice not only helps us improve &mdash; it helps us care better for every member of our FIL family.
              </p>
            </td>
          </tr>

          <!-- ── SUPPORT BOX ── -->
          <tr>
            <td class="mobile-pad" style="padding:16px 40px 10px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#e3f2fd; border-radius:12px; border-left:4px solid #2196f3;">
                <tr>
                  <td class="section-pad" style="padding:22px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                      <!-- Section heading -->
                      <tr>
                        <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1565c0; padding-bottom:12px;">
                          &#128172; We&rsquo;re Here For You
                        </td>
                      </tr>

                      <!-- Intro -->
                      <tr>
                        <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#1a3a6b; line-height:22px; padding-bottom:16px;">
                          Our support doesn&rsquo;t end after delivery. We&rsquo;re here whenever you need us:
                        </td>
                      </tr>

                      <!-- Support items — table rows, no flexbox -->
                      <tr>
                        <td>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            ${supportRowsHtml}
                          </table>
                        </td>
                      </tr>

                      <!-- Closing note -->
                      <tr>
                        <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#1a3a6b; line-height:22px; padding-top:4px;">
                          Whether it&rsquo;s for guidance, quick tips, or just to listen &mdash; we&rsquo;re only a message away.
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr>
            <td class="mobile-pad" style="padding:24px 40px 0 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:1px; background-color:#e8e8ee; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CLOSING ── -->
          <tr>
            <td class="mobile-pad" style="padding:22px 40px 28px 40px; text-align:center; background-color:#ffffff;">
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:24px; color:#555566;">
                Thank you once again for choosing FIL. We look forward to growing with you. &#127807;
              </p>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background-color:#f2f3f5; padding:26px 40px; border-top:1px solid #e2e2ea;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                <tr>
                  <td style="text-align:center; padding-bottom:2px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#888899;">
                      With Gratitude,
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="text-align:center; padding-bottom:4px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#1a1a2e;">
                      The FIL Team
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="text-align:center; padding-bottom:16px;">
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
                      Need help? Contact us at
                      <a href="mailto:filfilecommerce@gmail.com"
                        style="color:#aaaabc; text-decoration:underline;">filfilecommerce@gmail.com</a><br>
                      This is an automated email. Please do not reply directly to this message.
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
function buildPlainText(order, productNames) {
  const firstName = order.firstName || "there";

  return `
Hi ${firstName},

We hope your new order is already making life a little easier for you!

YOUR ORDER
==========================================
${productNames}

At FIL, we see every product as more than just an accessory — it's a way to keep
you connected, productive, and empowered to do more with your day. Your trust means
the world to us, and we're honoured you chose to make us part of your journey.

SHARE YOUR EXPERIENCE
==========================================
We'd love to hear how your experience has been so far. Your voice not only helps
us improve — it helps us care better for every member of our FIL family.

Rate your product here:
https://filstore.com.ng/products

WE'RE HERE FOR YOU
==========================================
Our support doesn't end after delivery. We're here whenever you need us:

  * Email: filfilecommerce@gmail.com
  * Call our support team anytime
  * Get quick tips and product guidance

Whether it's for guidance, quick tips, or just to listen — we're only a message away.

==========================================
Thank you once again for choosing FIL.
We look forward to growing with you.

With gratitude,
The FIL Team
Think Quality, Think FIL.
https://filstore.com.ng
  `.trim();
}