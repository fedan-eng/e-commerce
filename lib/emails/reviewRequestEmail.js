// lib/emails/reviewRequestEmail.js — "How's your new … ?" email with a Rate button per item.
import { layout, heading, para, productRow, smallButton, note, esc, textFooter } from "./layout.js";

// items: [{ name, image, color, link }]
export function buildReviewRequestEmail({ firstName, items, isReminder }) {
  const name = firstName || "there";
  const first = items[0]?.name || "your order";
  const subject = isReminder
    ? `${firstName || "Hey"}, got a minute to rate your ${first}?`
    : `How's your new ${first}, ${name}?`;
  const intro = isReminder
    ? "Quick reminder: your review helps other shoppers pick the right gear, and it takes less than a minute."
    : "We hope it's keeping you powered up. Could you tell other shoppers what you think? It takes less than a minute.";

  const rows = items
    .map((item, i) =>
      productRow(
        { image: item.image, name: item.name, sub: item.color ? esc(item.color) : "", right: smallButton("&#9733; Rate it", item.link) },
        { first: i === 0 }
      )
    )
    .join("");

  const body = `
${heading(isReminder ? "Got a minute to rate your order?" : `How's it going, ${esc(name)}?`)}
${para(intro)}
${rows}
${para("No account needed. Your review shows your first name and a <b>Verified buyer</b> badge.", { small: true, muted: true, gap: 0 })}
${note("Something not right with your order? Reply to this email and we'll sort it out.")}`;

  const html = layout({
    title: subject,
    preheader: intro,
    label: "Rate your order",
    body,
    reason: "You're getting this because you recently received an order from filstore.com.ng.",
  });

  const text = [
    `Hi ${name},`,
    "",
    intro,
    "",
    ...items.map((i) => `Rate ${i.name}: ${i.link}`),
    "",
    "No account needed. Something not right with your order? Just reply to this email.",
    "",
    textFooter,
  ].join("\n");

  return { subject, html, text };
}
