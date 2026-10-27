// lib/emails/welcomeEmail.js — "Welcome to FIL" email with the WELCOME10 code, sent once an email
// is verified (and straight away for Google sign-ups).
import { SITE, FIL_PERKS, layout, heading, para, sectionTitle, button, codeBox, checklist, strong, esc, textFooter } from "./layout.js";

export function buildWelcomeEmail({ firstName }) {
  const name = firstName || "there";
  const subject = "Welcome to FIL! Here's 10% off your first order";

  const body = `
${heading(`Welcome to FIL, ${esc(name)}`)}
${para("We make everyday tech accessories that keep you charged, connected and moving. Thanks for joining us.")}
${sectionTitle("Your welcome gift")}
${para(`Take ${strong("10% off")} your first order with this code:`, { gap: 8 })}
${codeBox("WELCOME10", "Valid for 14 days &middot; enter it at checkout")}
${button("Start shopping", `${SITE}/products`)}
${sectionTitle("Why shoppers choose FIL")}
${checklist(FIL_PERKS)}`;

  const html = layout({
    title: subject,
    preheader: "Your 10% off code is inside. Valid for 14 days.",
    label: "Welcome",
    body,
    reason: "You're getting this because you created an account at filstore.com.ng.",
  });

  const text = `Welcome to FIL, ${name}!

We make everyday tech accessories that keep you charged, connected and moving. Thanks for joining us.

YOUR WELCOME GIFT
Take 10% off your first order with code WELCOME10 (valid for 14 days, enter it at checkout).

Start shopping: ${SITE}/products

${textFooter}`;

  return { subject, html, text };
}
