import { sendEmail } from "@/lib/mailer";

export async function sendWelcomeEmail(email, firstName) {

    
      const welcomeEmailHtml = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
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

<body style="margin:0; padding:0; background-color:#f0f2f5;">

  <!-- Hidden preheader -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    Welcome to FIL Store, ${firstName}! Here&rsquo;s your exclusive 10% OFF welcome gift. Start shopping today! &#127881;
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
                    Hi ${firstName}! &#128075;
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
                      <a href="mailto:support@filstore.com.ng"
                        style="color:#aaaabc; text-decoration:underline;">support@filstore.com.ng</a>
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

  const plainText = `
Hi ${firstName},

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

Need help? support@filstore.com.ng
  `.trim();


  await sendEmail(
    email,
    `Welcome to FIL Store, ${firstName}!`,
    plainText,
    welcomeEmailHtml
  );
}