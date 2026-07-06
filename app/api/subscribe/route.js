import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import mailchimp from "@mailchimp/mailchimp_marketing";

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    try {
      await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID, {
        email_address: email,
        status: "subscribed",
        tags: ["website_signup"],
      });
    } catch (mailchimpError) {
      if (
        mailchimpError.status === 400 &&
        mailchimpError.response?.body?.title === "Member Exists"
      ) {
        return NextResponse.json(
          { message: "You're already subscribed!" },
          { status: 400 }
        );
      }
      throw mailchimpError;
    }

    const newsletterEmailHtml = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Welcome to FIL!</title>
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
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    /* Force light mode — prevents Gmail/Apple auto dark inversion */
    :root { color-scheme: light only; }
    [data-ogsc] body { background-color: #f0f2f5 !important; }

    @media only screen and (max-width: 620px) {
      .email-wrapper { width: 100% !important; }
      .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .header-pad { padding: 30px 20px !important; }
      .promo-inner { padding: 25px 18px !important; }
      .promo-code-cell { font-size: 22px !important; padding: 12px 18px !important; letter-spacing: 2px !important; }
      .discount-size { font-size: 34px !important; }
      .cta-td { padding: 14px 28px !important; font-size: 15px !important; }
      .step-circle { width: 26px !important; height: 26px !important; font-size: 13px !important; line-height: 26px !important; }
      .icon-box { width: 38px !important; height: 38px !important; line-height: 38px !important; font-size: 18px !important; }
      .header-emoji { font-size: 40px !important; }
      .header-h1 { font-size: 26px !important; }
    }

    @media only screen and (max-width: 480px) {
      .mobile-pad { padding-left: 14px !important; padding-right: 14px !important; }
      .promo-code-cell { font-size: 19px !important; padding: 10px 14px !important; letter-spacing: 1px !important; }
      .discount-size { font-size: 28px !important; }
      .header-h1 { font-size: 22px !important; }
      .cta-td { padding: 13px 22px !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#f0f2f5;">

  <!-- Hidden preheader -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    Welcome to FIL! Here&rsquo;s your exclusive 10% OFF promo code. Sign in to redeem your discount today! &#127881;
  </div>

  <!-- Full-width background wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:28px 10px;">

        <!-- ═══ EMAIL CARD ═══ -->
        <table class="email-wrapper" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px; width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.09);">

          <!-- ── HEADER ── -->
          <tr>
            <td class="header-pad" style="background-color:#0fa968; padding:48px 40px; text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center;">
                    <p class="header-emoji" style="margin:0 0 10px 0; font-size:52px; line-height:1.2;">&#127881;</p>
                    <h1 class="header-h1" style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:32px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">
                      You&rsquo;re In!
                    </h1>
                    <p style="margin:10px 0 0 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; color:#cdf4e3; font-weight:400;">
                      Welcome to the FIL Exclusive Club
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── GREETING ── -->
          <tr>
            <td class="mobile-pad" style="padding:36px 40px 0 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:20px; font-weight:700; color:#1a1a2e; padding-bottom:10px;">
                    Hey there! &#128075;
                  </td>
                </tr>
                <tr>
                  <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; line-height:26px; color:#444455;">
                    Thanks for signing up for our exclusive offers! You&rsquo;re now part of the
                    <strong style="color:#1a1a2e;">FIL family</strong> and you&rsquo;ll be the
                    first to know about all the good stuff. &#128293;
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── PROMO CODE BOX ── -->
          <tr>
            <td class="mobile-pad" style="padding:28px 40px; background-color:#ffffff;">
              <!-- Promo card with solid bg so it renders universally -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border-radius:14px; overflow:hidden; background-color:#0fa968;">
                <tr>
                  <td class="promo-inner" style="padding:32px 28px; text-align:center;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <!-- Label -->
                      <tr>
                        <td style="text-align:center; padding-bottom:4px;">
                          <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:17px; font-weight:700; color:#ffffff;">
                            &#127873; Your Welcome Gift!
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="text-align:center; padding-bottom:18px;">
                          <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#cdf4e3;">
                            Use this code at checkout
                          </p>
                        </td>
                      </tr>
                      <!-- Code pill -->
                      <tr>
                        <td style="text-align:center; padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                            <tr>
                              <td class="promo-code-cell"
                                style="background-color:#ffffff; color:#0a7a4a; padding:15px 30px; font-family:'Courier New',Courier,monospace; font-size:28px; font-weight:700; border-radius:10px; letter-spacing:4px; border:2px dashed #0a7a4a;">
                                WELCOME10
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Discount -->
                      <tr>
                        <td style="text-align:center;">
                          <p class="discount-size" style="margin:0 0 6px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:42px; font-weight:800; color:#ffffff; letter-spacing:-1px;">
                            10% OFF
                          </p>
                          <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#cdf4e3;">
                            Your first purchase &bull; No minimum order
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── SIGN-IN ALERT ── -->
          <tr>
            <td class="mobile-pad" style="padding:0 40px 10px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border-radius:12px; border:2px solid #ff9800; background-color:#fff8e1; overflow:hidden;">
                <tr>
                  <td style="padding:22px 22px 20px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                      <!-- Alert title row -->
                      <tr>
                        <td style="padding-bottom:14px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-size:28px; line-height:1; vertical-align:middle; padding-right:10px;">
                                &#9888;&#65039;
                              </td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#b34d00; vertical-align:middle;">
                                Important: Sign In Required!
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Alert body -->
                      <tr>
                        <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; line-height:22px; color:#5d3a00; padding-bottom:18px;">
                          To use your <strong style="color:#b34d00;">WELCOME10</strong> promo code, you
                          <strong style="color:#5d3a00;">must be signed in</strong> to your FIL account.
                          The discount will only apply to orders placed by logged-in users.
                        </td>
                      </tr>

                      <!-- Steps -->
                      <tr>
                        <td>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                            <!-- Step 1 -->
                            <tr>
                              <td style="padding-bottom:12px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="vertical-align:top; padding-right:12px;">
                                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td class="step-circle"
                                            style="width:30px; height:30px; background-color:#ff9800; border-radius:50%; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#ffffff; text-align:center; line-height:30px;">
                                            1
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#5d3a00; line-height:20px; vertical-align:middle;">
                                      <strong style="color:#5d3a00;">Create an account</strong> or
                                      <strong style="color:#5d3a00;">sign in</strong> at filstore.com.ng
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <!-- Step 2 -->
                            <tr>
                              <td style="padding-bottom:12px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="vertical-align:top; padding-right:12px;">
                                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td class="step-circle"
                                            style="width:30px; height:30px; background-color:#ff9800; border-radius:50%; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#ffffff; text-align:center; line-height:30px;">
                                            2
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#5d3a00; line-height:20px; vertical-align:middle;">
                                      Add items to your cart and proceed to checkout
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <!-- Step 3 -->
                            <tr>
                              <td>
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="vertical-align:top; padding-right:12px;">
                                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td class="step-circle"
                                            style="width:30px; height:30px; background-color:#ff9800; border-radius:50%; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#ffffff; text-align:center; line-height:30px;">
                                            3
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#5d3a00; line-height:20px; vertical-align:middle;">
                                      Enter <strong style="color:#b34d00;">WELCOME10</strong> in the promo code field &amp; enjoy your discount!
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
              </table>
            </td>
          </tr>

          <!-- ── SIGN IN CTA BUTTON ── -->
          <tr>
            <td style="padding:22px 40px 10px 40px; text-align:center; background-color:#ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="border-radius:30px; background-color:#f57c00;">
                    <a href="https://filstore.com.ng/sign-in" target="_blank"
                      class="cta-td"
                      style="display:inline-block; padding:16px 40px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:30px; letter-spacing:0.3px;">
                      &#128272; Sign In / Create Account
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr>
            <td class="mobile-pad" style="padding:28px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:1px; background-color:#e8e8ee; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── BENEFITS SECTION ── -->
          <tr>
            <td class="mobile-pad" style="padding:0 40px 10px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#f4faf7; border-radius:12px; border-left:4px solid #0fa968;">
                <tr>
                  <td style="padding:26px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                      <!-- Section heading -->
                      <tr>
                        <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:700; color:#1a1a2e; padding-bottom:20px;">
                          &#128140; What You&rsquo;ll Get as a Subscriber
                        </td>
                      </tr>

                      <!-- Benefit 1 -->
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="width:50px; vertical-align:top; padding-right:14px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td class="icon-box"
                                      style="width:40px; height:40px; background-color:#e8f5e9; border-radius:10px; text-align:center; line-height:40px; font-size:20px;">
                                      &#127873;
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align:top;">
                                <p style="margin:0 0 3px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#1a1a2e;">Exclusive Deals</p>
                                <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#555566; line-height:18px;">Special discounts and offers only for subscribers</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Benefit 2 -->
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="width:50px; vertical-align:top; padding-right:14px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td class="icon-box"
                                      style="width:40px; height:40px; background-color:#e3f2fd; border-radius:10px; text-align:center; line-height:40px; font-size:20px;">
                                      &#128

;†
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align:top;">
                                <p style="margin:0 0 3px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#1a1a2e;">New Arrivals</p>
                                <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#555566; line-height:18px;">Be the first to discover our latest products</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Benefit 3 -->
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="width:50px; vertical-align:top; padding-right:14px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td class="icon-box"
                                      style="width:40px; height:40px; background-color:#fff3e0; border-radius:10px; text-align:center; line-height:40px; font-size:20px;">
                                      &#9889;
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align:top;">
                                <p style="margin:0 0 3px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#1a1a2e;">Flash Sales</p>
                                <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#555566; line-height:18px;">Early access to limited-time promotions</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Benefit 4 -->
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="width:50px; vertical-align:top; padding-right:14px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td class="icon-box"
                                      style="width:40px; height:40px; background-color:#f3e5f5; border-radius:10px; text-align:center; line-height:40px; font-size:20px;">
                                      &#128161;
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align:top;">
                                <p style="margin:0 0 3px 0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#1a1a2e;">Tips &amp; Tricks</p>
                                <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#555566; line-height:18px;">Tech tips and product care guides</p>
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

          <!-- ── SHOP NOW CTA ── -->
          <tr>
            <td style="padding:30px 40px; text-align:center; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center; padding-bottom:18px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; color:#1a1a2e; font-weight:600;">
                      Ready to explore? &#128717;
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;">
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
              </table>
            </td>
          </tr>

          <!-- ── REMINDER BOX ── -->
          <tr>
            <td class="mobile-pad" style="padding:0 40px 28px 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#edf7f2; border-radius:10px; border:1px solid #b2dfca;">
                <tr>
                  <td style="padding:16px 20px; text-align:center;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#1f5c3a; line-height:21px;">
                      &#128154; <strong style="color:#1f5c3a;">Remember:</strong> Sign in to your account before applying
                      <strong style="color:#0a7a4a;">WELCOME10</strong> at checkout.
                      No account yet?
                      <a href="https://filstore.com.ng/sign-up" target="_blank"
                        style="color:#0a7a4a; font-weight:700; text-decoration:underline;">Create one here</a>
                      — it only takes 30 seconds!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr>
            <td class="mobile-pad" style="padding:0 40px 0 40px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:1px; background-color:#e8e8ee; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CLOSING MESSAGE ── -->
          <tr>
            <td class="mobile-pad" style="padding:24px 40px 28px 40px; text-align:center; background-color:#ffffff;">
              <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; color:#555566; line-height:25px;">
                We&rsquo;re excited to have you with us! &#128522;<br>
                Stay tuned for amazing deals, new products, and more.
              </p>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background-color:#f2f3f5; padding:30px 40px; border-top:1px solid #e2e2ea;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Brand name -->
                <tr>
                  <td style="text-align:center; padding-bottom:4px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:700; color:#1a1a2e;">
                      The FIL Team
                    </p>
                  </td>
                </tr>

                <!-- Tagline -->
                <tr>
                  <td style="text-align:center; padding-bottom:20px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-style:italic; color:#0fa968;">
                      Think Quality, Think FIL.
                    </p>
                  </td>
                </tr>

                <!-- Social icons -->
                <tr>
                  <td style="text-align:center; padding-bottom:18px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="padding:0 8px;">
                          <a href="https://facebook.com/filstore" target="_blank" style="text-decoration:none; font-size:22px;">&#128216;</a>
                        </td>
                        <td style="padding:0 8px;">
                          <a href="https://instagram.com/filstore" target="_blank" style="text-decoration:none; font-size:22px;">&#128247;</a>
                        </td>
                        <td style="padding:0 8px;">
                          <a href="https://twitter.com/filstore" target="_blank" style="text-decoration:none; font-size:22px;">&#128038;</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Website link -->
                <tr>
                  <td style="text-align:center; padding-bottom:14px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#666677;">
                      Visit us at
                      <a href="https://filstore.com.ng" target="_blank" style="color:#0fa968; text-decoration:none; font-weight:600;">filstore.com.ng</a>
                    </p>
                  </td>
                </tr>

                <!-- Legal -->
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:11px; color:#aaaabc; line-height:18px;">
                      You&rsquo;re receiving this because you subscribed to the FIL Store newsletter.<br>
                      <a href="https://filstore.com.ng/unsubscribe" target="_blank" style="color:#aaaabc; text-decoration:underline;">Unsubscribe</a>
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
          <tr>
            <td style="padding:20px 0;">&nbsp;</td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `;

    const plainText = `
YOU'RE IN! WELCOME TO FIL EXCLUSIVE OFFERS
==========================================

Hey there!

Thanks for signing up for our exclusive offers!
You're now part of the FIL family and you'll be
the first to know about all the good stuff.

==========================================
YOUR WELCOME GIFT
==========================================

Promo Code : WELCOME10
Discount   : 10% OFF your first purchase
Min. Order : None

==========================================
IMPORTANT - SIGN IN REQUIRED
==========================================

To use WELCOME10, you MUST be signed in to
your FIL account. The discount only applies
to orders placed by logged-in users.

How to redeem:
  1. Create an account or sign in at filstore.com.ng
  2. Add items to your cart and go to checkout
  3. Enter WELCOME10 in the promo code field

Sign in / Create account:
https://filstore.com.ng/sign-in

==========================================
WHAT YOU GET AS A SUBSCRIBER
==========================================

* Exclusive Deals  — Discounts only for subscribers
* New Arrivals     — First to see our latest products
* Flash Sales      — Early access to promotions
* Tips & Tricks    — Tech tips and care guides

==========================================

Shop now: https://filstore.com.ng/products

Remember: Sign in before applying WELCOME10.
No account? https://filstore.com.ng/sign-up

We're excited to have you with us!
Stay tuned for amazing deals and more.

— The FIL Team
  Think Quality, Think FIL.
  https://filstore.com.ng
    `.trim();

    await sendEmail(
      email,
      "Welcome to FIL! Your 10% OFF Code Inside (Sign In to Redeem)",
      plainText,
      newsletterEmailHtml
    );

    return NextResponse.json(
      { message: "Subscription successful — Check your inbox!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscription Error: ", error);
    return NextResponse.json(
      { message: "Something went wrong. Try again!" },
      { status: 500 }
    );
  }
}