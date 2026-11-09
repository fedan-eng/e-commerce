// lib/emails/welcomeEmail.js — "Welcome to the FIL tribe" email with the WELCOME10 code, sent once an
// email is verified (and straight away for Google sign-ups). The second welcome email follows 3 hours
// after sign-up (secondWelcomeEmail.js).
import { SITE, layout, heading, para, sectionTitle, button, codeBox, strong, esc, textFooter } from "./layout.js";

export function buildWelcomeEmail({ firstName }) {
  const name = firstName || "Hey";
  const subject = "Welcome to the FIL tribe";

  const body = `
${heading(`${esc(name)}, welcome to the FIL tribe!`)}
${para("I'm excited to announce you have great taste!! I mean, you chose FIL.")}
${para("We're glad you're here. And since first impressions matter, we thought we'd make yours a little sweeter.")}
${sectionTitle("Your welcome gift")}
${para(`Take ${strong("10% off")} your first order with this code:`, { gap: 8 })}
${codeBox("WELCOME10", "Valid for 14 days &middot; enter it at checkout")}
${button("Start shopping", `${SITE}/products`)}`;

  const html = layout({
    title: subject,
    preheader: "Your 10% off code is inside. Valid for 14 days.",
    label: "Welcome",
    body,
    reason: "You're getting this because you created an account at filstore.com.ng.",
  });

  const text = `${name}, welcome to the FIL tribe!

I'm excited to announce you have great taste!! I mean, you chose FIL.

We're glad you're here. And since first impressions matter, we thought we'd make yours a little sweeter.

YOUR WELCOME GIFT
Take 10% off your first order with code WELCOME10 (valid for 14 days, enter it at checkout).

Start shopping: ${SITE}/products

${textFooter}`;

  return { subject, html, text };
}
