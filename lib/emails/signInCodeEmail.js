// lib/emails/signInCodeEmail.js — "Your FIL sign-in code" for signing in without a password.
// Table layout + inline styles so it renders in Gmail/Outlook.

const FOREST = "#004328";
const MINT = "#cff6df";
const MUTED = "#596e65";
const FONT = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function buildSignInCodeEmail({ code }) {
  const subject = `${code} is your FIL sign-in code`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Your sign-in code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f2f6f1;">
  <div style="display: none; max-height: 0; overflow: hidden;">Your FIL sign-in code is ${code}.</div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f2f6f1;">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="width: 560px; max-width: 100%; background-color: #ffffff; border-radius: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 36px 40px 0;">
              <p style="margin: 0 0 20px; font-family: ${FONT}; font-size: 22px; font-weight: 800; color: ${FOREST}; letter-spacing: 1px;">FIL</p>
              <h1 style="margin: 0; font-family: ${FONT}; font-size: 24px; line-height: 32px; font-weight: 700; color: ${FOREST};">Your sign-in code</h1>
              <p style="margin: 10px 0 0; font-family: ${FONT}; font-size: 15px; line-height: 24px; color: ${MUTED};">Enter this code on filstore.com.ng to sign in. It's valid for 30 minutes.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${MINT}; border-radius: 18px;">
                <tr>
                  <td style="padding: 22px; text-align: center; font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; color: ${FOREST}; letter-spacing: 8px;">${code}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 36px; font-family: ${FONT}; font-size: 13px; line-height: 21px; color: ${MUTED};">
              Didn't try to sign in? You can ignore this email. Nobody can get into your account without this code.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const text = `Your FIL sign-in code: ${code}

Enter it on filstore.com.ng to sign in. It's valid for 30 minutes.

Didn't try to sign in? You can ignore this email.

The FIL Team`;

  return { subject, html, text };
}
