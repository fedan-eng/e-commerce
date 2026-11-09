// lib/emails/secondWelcomeEmail.js — "So, you probably do not know..." The FIL story, sent 3 hours
// after an account is created by the second-welcome cron.
import { SITE, layout, para, button, strong, esc, textFooter } from "./layout.js";

const PARAGRAPHS = [
  "So... we realised something.",
  "You might know FIL as the place where you get your cute powerbanks, but there's actually a lot more to us than that.",
  "For starters, we don't just sell gadgets. We actually manufacture them ourselves and here's the part that might surprise you: we've been doing this in Nigeria for over 30 years.",
  "FIL stands for Fedan Investment Limited, and we're a Nigerian-owned, family business. Yes, we are Nigeria's first phone accessories company.",
  `These days, we're building around one big idea: ${strong("Power Creators.")}`,
  "And when we say creators, we mean everyone. If you're creating a business, making music, building a community, raising a family or simply bringing an idea to life, you're a creator.",
  "We just want to make quality products and services that make your everyday life a little better.",
  "That's a little bit of our story.",
  "Glad you're here, stay tuned for more.",
];

export function buildSecondWelcomeEmail({ firstName }) {
  const name = firstName || "there";
  const subject = "So, you probably do not know...";

  const body = `
${para(`Hey ${esc(name)},`)}
${PARAGRAPHS.map((p) => para(p)).join("\n")}
${button("See what we make", `${SITE}/products`)}
${para(`${strong("FIL Store")}<br><em>Powering Creators.</em>`, { gap: 0 })}`;

  const html = layout({
    title: subject,
    preheader: "There's a lot more to FIL than cute powerbanks.",
    label: "Our story",
    body,
    reason: "You're getting this because you created an account at filstore.com.ng.",
  });

  const text = `Hey ${name},

${PARAGRAPHS.map((p) => p.replace(/<[^>]+>/g, "")).join("\n\n")}

See what we make: ${SITE}/products

FIL Store
Powering Creators.

${textFooter}`;

  return { subject, html, text };
}
