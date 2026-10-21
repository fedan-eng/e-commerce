// lib/emails/accountCreatedEmail.js — sent when someone signs up from the promo popup:
// their generated password (when there is one) plus a 6-digit code and a link to verify.
// Table layout + inline styles so it renders in Gmail/Outlook.

const FOREST = "#004328";
const MINT = "#cff6df";
const MUTED = "#596e65";
const FONT = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// password: the generated password, or null when the shopper chose their own
export function buildAccountCreatedEmail({ email, password, code, link }) {
  const subject = `${code} is your FIL verification code`;

  const passwordBlock = password
    ? `
          <tr>
            <td class="px" style="padding: 28px 48px 0;">
              <p style="margin: 0; font-family: ${FONT}; font-size: 16px; line-height: 26px; color: ${MUTED};">
                Your account's initial password is
                <strong style="font-family: 'Courier New', Courier, monospace; font-size: 18px; color: #111814;">${esc(password)}</strong><br>
                You can change it any time from <strong style="color: #111814;">My profile</strong>.
              </p>
            </td>
          </tr>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Verify your email</title>
  <style>
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; border-radius: 0 !important; }
      .px { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f2f6f1;">
  <div style="display: none; max-height: 0; overflow: hidden;">Your code is ${code}. Verify your email to get 10% off your first order.</div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f2f6f1;">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="width: 600px; max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden;">
          <tr>
            <td class="px" style="background-color: ${FOREST}; padding: 40px 48px 36px;">
              <p style="margin: 0 0 24px; font-family: ${FONT}; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">FIL</p>
              <h1 style="margin: 0; font-family: ${FONT}; font-size: 30px; line-height: 38px; font-weight: 700; color: #ffffff;">Your FIL account is ready</h1>
              <p style="margin: 12px 0 0; font-family: ${FONT}; font-size: 16px; line-height: 25px; color: ${MINT};">
                Verify your email and your 10% off code is on its way.
              </p>
            </td>
          </tr>

          <tr>
            <td class="px" style="padding: 32px 48px 0;">
              <p style="margin: 0; font-family: ${FONT}; font-size: 16px; line-height: 26px; color: ${MUTED};">
                Hi ${esc(email)},<br><br>Thanks for joining FIL. We've created your account.
              </p>
            </td>
          </tr>
${passwordBlock}
          <tr>
            <td class="px" style="padding: 28px 48px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${MINT}; border-radius: 18px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 10px; font-family: ${FONT}; font-size: 13px; font-weight: 600; color: ${FOREST}; text-transform: uppercase; letter-spacing: 1.5px;">Your verification code</p>
                    <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; color: ${FOREST}; letter-spacing: 8px;">${code}</p>
                    <p style="margin: 10px 0 0; font-family: ${FONT}; font-size: 14px; color: ${FOREST};">Enter it on filstore.com.ng. It's valid for 30 minutes.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="px" style="padding: 28px 48px 0;">
              <p style="margin: 0 0 16px; font-family: ${FONT}; font-size: 16px; line-height: 26px; color: ${MUTED};">Or verify with one click:</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: ${FOREST}; border-radius: 999px;">
                    <a href="${link}" target="_blank" style="display: inline-block; padding: 15px 34px; font-family: ${FONT}; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 999px;">Verify my email</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="px" style="padding: 36px 48px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #dfe6e2;">
                <tr>
                  <td style="padding-top: 24px; font-family: ${FONT}; font-size: 14px; line-height: 22px; color: ${MUTED};">
                    Didn't sign up at filstore.com.ng? You can ignore this email.<br><br>
                    Warmly,<br><strong style="color: ${FOREST};">The FIL Team</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const text = `
Hi ${email},

Thanks for joining FIL. We've created your account.
${password ? `\nYour account's initial password: ${password}\n(You can change it any time from My profile.)\n` : ""}
Your verification code: ${code}
Enter it on filstore.com.ng. It's valid for 30 minutes.

Or verify with this link:
${link}

Once you're verified, we'll email your 10% off code.

Didn't sign up at filstore.com.ng? You can ignore this email.

The FIL Team
`.trim();

  return { subject, html, text };
}
