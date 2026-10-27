// lib/emails/accountCreatedEmail.js — sent when someone signs up from the promo popup:
// their generated password (when there is one) plus a 6-digit code and a link to verify.
import { layout, heading, para, sectionTitle, button, codeBox, note, strong, esc, textFooter } from "./layout.js";

// password: the generated password, or null when the shopper chose their own.
// offer: mention the 10% first-order code (false for people who have already ordered).
export function buildAccountCreatedEmail({ email, password, code, link, offer = true }) {
  const nextStep = offer
    ? "Verify your email and we'll send your 10% off code."
    : "Verify your email to finish setting it up.";
  const subject = `${code} is your FIL verification code`;

  const body = `
${heading("Your FIL account is ready")}
${para(`Thanks for joining, ${esc(email)}. ${nextStep}`)}
${sectionTitle("Your verification code")}
${codeBox(code, "Enter it on filstore.com.ng &middot; valid for 30 minutes")}
${para("Or verify in one click:", { gap: 4 })}
${button("Verify my email", link)}
${password
  ? note(`Your starting password is ${strong(`<span style="font-family:'Courier New', Courier, monospace; font-size:15px;">${esc(password)}</span>`)}<br>You can change it any time under My profile.`)
  : ""}
${note("Didn't sign up at filstore.com.ng? You can ignore this email.")}`;

  const html = layout({
    title: subject,
    preheader: `Your code is ${code}. ${nextStep}`,
    label: "Verify email",
    body,
    reason: "You're getting this because this address was used to sign up at filstore.com.ng.",
  });

  const text = `Thanks for joining FIL, ${email}. ${nextStep}

Your verification code: ${code}
Enter it on filstore.com.ng. It's valid for 30 minutes.

Or verify with this link:
${link}
${password ? `\nYour starting password: ${password}\nYou can change it any time under My profile.\n` : ""}
Didn't sign up at filstore.com.ng? You can ignore this email.

${textFooter}`;

  return { subject, html, text };
}
