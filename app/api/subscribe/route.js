import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import mailchimp from "@mailchimp/mailchimp_marketing";

// Configure Mailchimp
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

    // Add subscriber to Mailchimp
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
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
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
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f0f2f5; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }

    /* Responsive */
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: 0 auto !important; }
      .fluid { max-width: 100% !important; height: auto !important; margin-left: auto !important; margin-right: auto !important; }
      .stack-column, .stack-column-center { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
      .stack-column-center { text-align: center !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-padding-header { padding: 30px 20px !important; }
      .mobile-center { text-align: center !important; }
      .mobile-text-lg { font-size: 26px !important; line-height: 34px !important; }
      .mobile-text-md { font-size: 16px !important; }
      .mobile-text-sm { font-size: 14px !important; }
      .promo-code-text { font-size: 26px !important; padding: 14px 24px !important; letter-spacing: 3px !important; }
      .discount-text { font-size: 38px !important; }
      .cta-button-td { padding: 16px 36px !important; }
      .mobile-spacer { height: 20px !important; }
      .benefit-table { width: 100% !important; }
      .benefit-icon-td { width: 45px !important; padding-right: 12px !important; }
      .alert-box { margin: 20px 0 !important; padding: 20px !important; }
      .alert-icon { font-size: 28px !important; }
      .alert-title { font-size: 15px !important; }
      .alert-text { font-size: 13px !important; }
      .promo-box-inner { padding: 25px 20px !important; }
      .header-emoji { font-size: 48px !important; }
      .header-title { font-size: 28px !important; }
      .step-number { width: 28px !important; height: 28px !important; font-size: 14px !important; line-height: 28px !important; }
    }

    @media only screen and (max-width: 480px) {
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-padding-header { padding: 25px 16px !important; }
      .mobile-text-lg { font-size: 22px !important; line-height: 30px !important; }
      .promo-code-text { font-size: 22px !important; padding: 12px 20px !important; letter-spacing: 2px !important; }
      .discount-text { font-size: 32px !important; }
      .cta-button-td { padding: 14px 28px !important; font-size: 15px !important; }
      .header-emoji { font-size: 40px !important; }
      .header-title { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5;">
  <center style="width: 100%; background-color: #f0f2f5;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f2f5;">
    <tr>
    <td>
    <![endif]-->

    <!-- Preheader (hidden text for email preview) -->
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
      Welcome to FIL! Here's your exclusive 10% OFF promo code. Sign in to redeem your discount today! 🎉
    </div>

    <!-- Spacer -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 20px 0 0 0;">&nbsp;</td>
      </tr>
    </table>

    <!-- Email Body -->
    <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">

      <!-- HEADER -->
      <tr>
        <td class="mobile-padding-header" style="background: linear-gradient(135deg, #1cc978 0%, #0fa968 50%, #0d9460 100%); padding: 50px 40px; text-align: center;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="text-align: center;">
                <div class="header-emoji" style="font-size: 56px; line-height: 1.2; margin-bottom: 12px;">🎉</div>
                <h1 class="header-title" style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 34px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">You're In!</h1>
                <p style="margin: 12px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 17px; color: rgba(255,255,255,0.92); font-weight: 400;">Welcome to the FIL Exclusive Club</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- GREETING -->
      <tr>
        <td class="mobile-padding" style="padding: 40px 40px 0 40px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 20px; font-weight: 600; color: #1a1a2e; padding-bottom: 8px;">
                Hey there! 👋
              </td>
            </tr>
            <tr>
              <td style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; line-height: 26px; color: #4a4a68; padding-top: 8px;">
                Thanks for signing up for our exclusive offers! You're now part of the <strong style="color: #1a1a2e;">FIL family</strong> and you'll be the first to know about all the good stuff. 🔥
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- PROMO CODE BOX -->
      <tr>
        <td class="mobile-padding" style="padding: 30px 40px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-radius: 14px; overflow: hidden;">
            <tr>
              <td class="promo-box-inner" style="background: linear-gradient(135deg, #1cc978 0%, #0fa968 50%, #0d9460 100%); padding: 35px 30px; text-align: center;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="text-align: center;">
                      <p style="margin: 0 0 6px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 18px; font-weight: 600; color: #ffffff;">🎁 Your Welcome Gift!</p>
                      <p style="margin: 0 0 18px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: rgba(255,255,255,0.9);">Use this code at checkout</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; padding: 5px 0;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                        <tr>
                          <td class="promo-code-text" style="background-color: #ffffff; color: #0d9460; padding: 16px 32px; font-family: 'Courier New', Courier, monospace; font-size: 30px; font-weight: 700; border-radius: 10px; letter-spacing: 4px; border: 2px dashed rgba(13, 148, 96, 0.3);">
                            WELCOME10
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; padding-top: 14px;">
                      <p class="discount-text" style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 44px; font-weight: 800; color: #ffffff; letter-spacing: -1px;">10% OFF</p>
                      <p style="margin: 8px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: rgba(255,255,255,0.88);">
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

      <!-- ⚠️ IMPORTANT SIGN-IN ALERT -->
      <tr>
        <td class="mobile-padding" style="padding: 0 40px 10px 40px;">
          <table class="alert-box" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-radius: 12px; overflow: hidden; border: 2px solid #ff9800; background-color: #fff8e1;">
            <tr>
              <td style="padding: 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <!-- Alert Header -->
                  <tr>
                    <td style="padding-bottom: 14px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td class="alert-icon" style="font-size: 32px; line-height: 1; vertical-align: middle; padding-right: 10px;">⚠️</td>
                          <td class="alert-title" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 700; color: #e65100; vertical-align: middle; letter-spacing: -0.3px;">
                            Important: Sign In Required!
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Alert Message -->
                  <tr>
                    <td class="alert-text" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 22px; color: #5d4037; padding-bottom: 18px;">
                      To use your <strong style="color: #e65100;">WELCOME10</strong> promo code, you <strong>must be signed in</strong> to your FIL account. The discount will only apply to orders placed by logged-in users.
                    </td>
                  </tr>
                  <!-- Steps -->
                  <tr>
                    <td style="padding-bottom: 6px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <!-- Step 1 -->
                        <tr>
                          <td style="padding-bottom: 10px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="vertical-align: top; padding-right: 12px;">
                                  <div class="step-number" style="width: 30px; height: 30px; background-color: #ff9800; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; font-weight: 700; text-align: center; line-height: 30px; border-radius: 50%;">1</div>
                                </td>
                                <td style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #5d4037; line-height: 20px; vertical-align: middle;">
                                  <strong>Create an account</strong> or <strong>sign in</strong> at filstore.com.ng
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <!-- Step 2 -->
                        <tr>
                          <td style="padding-bottom: 10px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="vertical-align: top; padding-right: 12px;">
                                  <div class="step-number" style="width: 30px; height: 30px; background-color: #ff9800; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; font-weight: 700; text-align: center; line-height: 30px; border-radius: 50%;">2</div>
                                </td>
                                <td style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #5d4037; line-height: 20px; vertical-align: middle;">
                                  Add items to your cart and proceed to checkout
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <!-- Step 3 -->
                        <tr>
                          <td>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="vertical-align: top; padding-right: 12px;">
                                  <div class="step-number" style="width: 30px; height: 30px; background-color: #ff9800; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; font-weight: 700; text-align: center; line-height: 30px; border-radius: 50%;">3</div>
                                </td>
                                <td style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #5d4037; line-height: 20px; vertical-align: middle;">
                                  Enter <strong style="color: #e65100;">WELCOME10</strong> in the promo code field &amp; enjoy your discount!
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

      <!-- SIGN IN CTA BUTTON -->
      <tr>
        <td style="padding: 10px 40px 10px 40px; text-align: center;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
            <tr>
              <td style="border-radius: 30px; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);">
                <a href="https://filstore.com.ng/register" target="_blank" class="cta-button-td" style="display: inline-block; padding: 16px 44px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 30px; letter-spacing: 0.3px;">
                  🔐 Sign In / Create Account
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Divider -->
      <tr>
        <td class="mobile-padding" style="padding: 20px 40px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="height: 1px; background: linear-gradient(to right, transparent, #e0e0e0, transparent); font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BENEFITS SECTION -->
      <tr>
        <td class="mobile-padding" style="padding: 0 40px 10px 40px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7faf9; border-radius: 12px; border-left: 4px solid #1cc978;">
            <tr>
              <td style="padding: 28px 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 18px; font-weight: 700; color: #1a1a2e; padding-bottom: 20px;">
                      📬 What You'll Get as a Subscriber
                    </td>
                  </tr>
                  <!-- Benefit 1 -->
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <table class="benefit-table" role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td class="benefit-icon-td" style="width: 50px; vertical-align: top; padding-right: 14px;">
                            <div style="width: 42px; height: 42px; background-color: #e8f5e9; border-radius: 10px; text-align: center; line-height: 42px; font-size: 20px;">🎁</div>
                          </td>
                          <td style="vertical-align: top; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                            <p style="margin: 0 0 3px 0; font-size: 15px; font-weight: 600; color: #1a1a2e;">Exclusive Deals</p>
                            <p style="margin: 0; font-size: 13px; color: #6b6b80; line-height: 19px;">Special discounts and offers only for subscribers</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Benefit 2 -->
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <table class="benefit-table" role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td class="benefit-icon-td" style="width: 50px; vertical-align: top; padding-right: 14px;">
                            <div style="width: 42px; height: 42px; background-color: #e3f2fd; border-radius: 10px; text-align: center; line-height: 42px; font-size: 20px;">🆕</div>
                          </td>
                          <td style="vertical-align: top; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                            <p style="margin: 0 0 3px 0; font-size: 15px; font-weight: 600; color: #1a1a2e;">New Arrivals</p>
                            <p style="margin: 0; font-size: 13px; color: #6b6b80; line-height: 19px;">Be the first to discover our latest products</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Benefit 3 -->
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <table class="benefit-table" role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td class="benefit-icon-td" style="width: 50px; vertical-align: top; padding-right: 14px;">
                            <div style="width: 42px; height: 42px; background-color: #fff3e0; border-radius: 10px; text-align: center; line-height: 42px; font-size: 20px;">⚡</div>
                          </td>
                          <td style="vertical-align: top; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                            <p style="margin: 0 0 3px 0; font-size: 15px; font-weight: 600; color: #1a1a2e;">Flash Sales</p>
                            <p style="margin: 0; font-size: 13px; color: #6b6b80; line-height: 19px;">Early access to limited-time promotions</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Benefit 4 -->
                  <tr>
                    <td>
                      <table class="benefit-table" role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td class="benefit-icon-td" style="width: 50px; vertical-align: top; padding-right: 14px;">
                            <div style="width: 42px; height: 42px; background-color: #f3e5f5; border-radius: 10px; text-align: center; line-height: 42px; font-size: 20px;">💡</div>
                          </td>
                          <td style="vertical-align: top; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                            <p style="margin: 0 0 3px 0; font-size: 15px; font-weight: 600; color: #1a1a2e;">Tips & Tricks</p>
                            <p style="margin: 0; font-size: 13px; color: #6b6b80; line-height: 19px;">Tech tips and product care guides</p>
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

      <!-- SHOP NOW CTA -->
      <tr>
        <td style="padding: 30px 40px; text-align: center;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="text-align: center;">
                <p style="margin: 0 0 18px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 17px; color: #1a1a2e; font-weight: 500;">
                  Ready to explore? 🛍️
                </p>
              </td>
            </tr>
            <tr>
              <td style="text-align: center;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                  <tr>
                    <td style="border-radius: 30px; background: linear-gradient(135deg, #1cc978 0%, #0d9460 100%); box-shadow: 0 4px 15px rgba(28, 201, 120, 0.35);">
                      <a href="https://filstore.com.ng/products" target="_blank" class="cta-button-td" style="display: inline-block; padding: 17px 48px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 30px; letter-spacing: 0.3px;">
                        Start Shopping Now →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Reminder note -->
      <tr>
        <td class="mobile-padding" style="padding: 0 40px 30px 40px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0faf5; border-radius: 10px;">
            <tr>
              <td style="padding: 18px 22px; text-align: center;">
                <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #2e7d57; line-height: 20px;">
                  💚 <strong>Remember:</strong> Sign in to your account before applying <strong>WELCOME10</strong> at checkout. No account yet? <a href="https://filstore.com.ng/register" target="_blank" style="color: #0d9460; font-weight: 700; text-decoration: underline;">Create one here</a> — it only takes 30 seconds!
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Divider -->
      <tr>
        <td class="mobile-padding" style="padding: 0 40px 10px 40px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="height: 1px; background: linear-gradient(to right, transparent, #e0e0e0, transparent); font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Closing message -->
      <tr>
        <td class="mobile-padding" style="padding: 20px 40px 30px 40px; text-align: center;">
          <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: #6b6b80; line-height: 24px;">
            We're excited to have you with us! 😊<br>
            Stay tuned for amazing deals, new products, and more.
          </p>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background-color: #f7f8fa; padding: 30px 40px; border-top: 1px solid #eaeaea;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="text-align: center;">
                <p style="margin: 0 0 4px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 700; color: #1a1a2e;">The FIL Team</p>
                <p style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding-bottom: 18px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                  <tr>
                    <td style="padding: 0 8px;">
                      <a href="https://facebook.com/filstore" target="_blank" style="text-decoration: none; font-size: 22px;">📘</a>
                    </td>
                    <td style="padding: 0 8px;">
                      <a href="https://instagram.com/filstore" target="_blank" style="text-decoration: none; font-size: 22px;">📷</a>
                    </td>
                    <td style="padding: 0 8px;">
                      <a href="https://twitter.com/filstore" target="_blank" style="text-decoration: none; font-size: 22px;">🐦</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="text-align: center;">
                <p style="margin: 0 0 14px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #8c8ca1;">
                  Visit us at <a href="https://filstore.com.ng" target="_blank" style="color: #1cc978; text-decoration: none; font-weight: 600;">filstore.com.ng</a>
                </p>
                <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; color: #b0b0c0; line-height: 18px;">
                  You're receiving this because you subscribed to FIL Store newsletter.<br>
                  <a href="https://filstore.com.ng/unsubscribe" target="_blank" style="color: #b0b0c0; text-decoration: underline;">Unsubscribe</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

    </table>

    <!-- Bottom Spacer -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 20px 0;">&nbsp;</td>
      </tr>
    </table>

    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
  </center>
</body>
</html>
    `;

    const plainText = `
🎉 YOU'RE IN! WELCOME TO FIL EXCLUSIVE OFFERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hey there! 👋

Thanks for signing up for our exclusive offers! 🔥

You're now part of the FIL family and you'll be the first to know about all the good stuff.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎁 YOUR WELCOME GIFT!

Use promo code: WELCOME10
To enjoy: 10% OFF your first purchase
No minimum order required!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANT: SIGN IN REQUIRED!

To use your WELCOME10 promo code, you MUST be signed in to your FIL account. The discount will only apply to orders placed by logged-in users.

How to redeem:
1. Create an account or sign in at filstore.com.ng
2. Add items to your cart and proceed to checkout
3. Enter WELCOME10 in the promo code field & enjoy your discount!

👉 Sign in / Create account: https://filstore.com.ng/register

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📬 WHAT YOU'LL GET AS A SUBSCRIBER:
🎁 Exclusive Deals - Special discounts just for subscribers
🆕 New Arrivals - Be first to see latest products
⚡ Flash Sales - Early access to promotions
💡 Tips & Tricks - Tech tips and care guides

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ready to explore? 🛍️
Shop now at: https://filstore.com.ng/products

💚 Remember: Sign in to your account before applying WELCOME10 at checkout.
No account yet? Create one here: https://filstore.com.ng/register — it only takes 30 seconds!

We're excited to have you with us! 😊
Stay tuned for amazing deals, new products, and more.

— The FIL Team
Think Quality, Think FIL.

Visit: https://filstore.com.ng
    `.trim();

    // Send welcome email to user
    await sendEmail(
      email,
      "Welcome to FIL! 🎉 Your 10% OFF Code Inside (Sign In to Redeem)",
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