// lib/emails/passwordEmails.js — reset request (code + link), reset done, and password changed.
import { SITE, CONTACT, layout, heading, para, sectionTitle, button, codeBox, note, link, esc, formatDateTime, textFooter } from "./layout.js";

const notYou = `Wasn't you? ${link(CONTACT.whatsappUrl, `WhatsApp us on ${CONTACT.whatsapp}`)} or reply to this email straight away and we'll secure your account.`;
const notYouText = `Wasn't you? WhatsApp us on ${CONTACT.whatsapp} or reply to this email straight away and we'll secure your account.`;
const reason = "You're getting this security email because of activity on your filstore.com.ng account.";

export function buildPasswordResetEmail({ firstName, code, link: resetLink }) {
  const subject = `${code} is your FIL password reset code`;
  const body = `
${heading("Reset your password")}
${para(`Hi ${esc(firstName || "there")}, we got a request to reset your FIL password. Use the button or the code below. Both expire in 10 minutes.`)}
${button("Reset my password", resetLink)}
${sectionTitle("Or enter this code")}
${codeBox(code, "Valid for 10 minutes &middot; works once")}
${note("Didn't ask for this? Ignore this email and your password stays the same.")}`;

  const html = layout({ title: subject, preheader: "Your reset link and code expire in 10 minutes.", label: "Security", body, reason });
  const text = `Hi ${firstName || "there"},

We got a request to reset your FIL password.

Reset it here: ${resetLink}
Or enter this code: ${code}

Both expire in 10 minutes. Didn't ask for this? Ignore this email and your password stays the same.

${textFooter}`;
  return { subject, html, text };
}

// Sent after a reset (via link or code) and after changing it from the profile page
export function buildPasswordChangedEmail({ firstName, reset = false, at = new Date() }) {
  const subject = reset ? "Your FIL password has been reset" : "Your FIL password was changed";
  const when = formatDateTime(at);
  const body = `
${heading(reset ? "Password reset" : "Password changed")}
${para(`Hi ${esc(firstName || "there")}, the password for your FIL account was ${reset ? "reset" : "changed"} on ${esc(when)}. You can now sign in with your new password.`)}
${button("Sign in", `${SITE}/login`)}
${note(notYou)}`;

  const html = layout({ title: subject, preheader: `Changed on ${when}.`, label: "Security", body, reason });
  const text = `Hi ${firstName || "there"},

The password for your FIL account was ${reset ? "reset" : "changed"} on ${when}. You can now sign in with your new password: ${SITE}/login

${notYouText}

${textFooter}`;
  return { subject, html, text };
}
