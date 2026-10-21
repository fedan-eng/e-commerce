import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import { subscribeContact } from "@/lib/brevo";

export async function POST(req) {
  try {
    const { email: rawEmail, phone: rawPhone, smsOptIn } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Optional phone in E.164 form (e.g. +2348137678990), sent by the promo popup
    const phone =
      typeof rawPhone === "string" && /^\+\d{8,16}$/.test(rawPhone) ? rawPhone : null;

    // Add subscriber to the Brevo newsletter list
    const { status } = await subscribeContact({ email, phone, smsOptIn: smsOptIn === true });
    if (status === "exists") {
      return NextResponse.json(
        { message: "You're already subscribed!" },
        { status: 400 }
      );
    }

    const registerUrl = "https://filstore.com.ng/register";
    const font = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

    const newsletterEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Welcome to FIL</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; border-radius: 0 !important; }
      .px { padding-left: 24px !important; padding-right: 24px !important; }
      .hero-title { font-size: 30px !important; line-height: 36px !important; }
      .code { font-size: 24px !important; letter-spacing: 4px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f2f6f1;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    Welcome to the FIL family! Your 10% off code is inside. Create your free account to use it.
  </div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f2f6f1;">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="width: 600px; max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden;">

          <!-- Hero -->
          <tr>
            <td class="px" style="background-color: #004328; padding: 44px 48px 40px; text-align: left;">
              <p style="margin: 0 0 28px; font-family: ${font}; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">FIL</p>
              <h1 class="hero-title" style="margin: 0; font-family: ${font}; font-size: 36px; line-height: 42px; font-weight: 700; color: #ffffff;">Welcome to the family!</h1>
              <p style="margin: 14px 0 0; font-family: ${font}; font-size: 16px; line-height: 25px; color: #cff6df;">
                We're really glad you're here. Here's a little something to say thanks.
              </p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td class="px" style="padding: 36px 48px 0;">
              <p style="margin: 0; font-family: ${font}; font-size: 16px; line-height: 26px; color: #596e65;">
                Hi there,<br><br>
                Thanks for joining FIL. You'll be the first to hear about new gadgets, restocks and member-only deals.
                To get you started, your first order is <strong style="color: #111814;">10% off</strong>.
              </p>
            </td>
          </tr>

          <!-- Code -->
          <tr>
            <td class="px" style="padding: 28px 48px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #cff6df; border-radius: 18px;">
                <tr>
                  <td style="padding: 26px 24px; text-align: center;">
                    <p style="margin: 0 0 10px; font-family: ${font}; font-size: 13px; font-weight: 600; color: #004328; text-transform: uppercase; letter-spacing: 1.5px;">Your welcome code</p>
                    <p class="code" style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 30px; font-weight: 700; color: #004328; letter-spacing: 6px;">WELCOME10</p>
                    <p style="margin: 10px 0 0; font-family: ${font}; font-size: 14px; color: #004328;">10% off your first order</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sign-up step -->
          <tr>
            <td class="px" style="padding: 32px 48px 0;">
              <h2 style="margin: 0 0 10px; font-family: ${font}; font-size: 20px; font-weight: 700; color: #004328;">One quick step to use it</h2>
              <p style="margin: 0; font-family: ${font}; font-size: 16px; line-height: 26px; color: #596e65;">
                Your code works with a FIL account, so create yours first. It's free and takes less than a minute.
                Then shop as usual, enter <strong style="color: #111814;">WELCOME10</strong> at checkout, and the discount comes right off.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td class="px" style="padding: 28px 48px 0;" align="left">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #004328; border-radius: 999px;">
                    <a href="${registerUrl}" target="_blank" style="display: inline-block; padding: 15px 34px; font-family: ${font}; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 999px;">Create my free account</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 14px 0 0; font-family: ${font}; font-size: 13px; color: #6b7570;">
                Already have an account? <a href="https://filstore.com.ng/login" target="_blank" style="color: #004328; font-weight: 600;">Sign in</a> and use your code.
              </p>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td class="px" style="padding: 36px 48px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #dfe6e2;">
                <tr>
                  <td style="padding-top: 24px; font-family: ${font}; font-size: 15px; line-height: 24px; color: #596e65;">
                    Questions? Just reply to this email. We're always happy to help.<br><br>
                    Warmly,<br>
                    <strong style="color: #004328;">The FIL Team</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="margin: 20px 0 0; font-family: ${font}; font-size: 12px; line-height: 18px; color: #6b7570; text-align: center;">
          You're receiving this because you subscribed at <a href="https://filstore.com.ng" target="_blank" style="color: #6b7570;">filstore.com.ng</a>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const plainText = `
Welcome to the family!

Thanks for joining FIL. You'll be the first to hear about new gadgets, restocks and member-only deals. To get you started, your first order is 10% off.

Your welcome code: WELCOME10

One quick step to use it:
Your code works with a FIL account, so create yours first. It's free and takes less than a minute. Then shop as usual, enter WELCOME10 at checkout, and the discount comes right off.

Create my free account: ${registerUrl}
Already have an account? Sign in: https://filstore.com.ng/login

Questions? Just reply to this email. We're always happy to help.

Warmly,
The FIL Team
    `.trim();

    // Send welcome email to user
    await sendEmail(
      email,
      "Welcome to FIL! Your 10% off code is inside",
      plainText,
      newsletterEmailHtml
    );

    return NextResponse.json(
      { message: "Your code has been sent to your email!" },
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