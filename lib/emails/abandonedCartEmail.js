// lib/emails/abandonedCartEmail.js — "Your cart is waiting" reminder, sent by the abandoned-cart cron.
import {
  SITE, FIL_PERKS, layout, heading, para, sectionTitle, button, checklist, itemsTable,
  summaryRow, strong, esc, naira, nairaText, textFooter,
} from "./layout.js";

// items: the user's cart items [{ name, image, color, price, quantity }]
export function buildAbandonedCartEmail({ firstName, items = [] }) {
  const name = firstName || "there";
  const count = items.reduce((n, i) => n + Number(i.quantity || 1), 0);
  const subtotal = items.reduce((n, i) => n + Number(i.price || 0) * Number(i.quantity || 1), 0);
  const itemWord = `${count} item${count === 1 ? "" : "s"}`;
  const subject = `${firstName || "Hey"}, your cart is waiting`;

  const body = `
${heading("Still thinking it over?")}
${para(`Hi ${esc(name)}, you left ${strong(itemWord)} in your cart. They're still available, but we can't hold them forever.`)}
${button("Finish checkout", `${SITE}/cart`)}
${sectionTitle("In your cart")}
${itemsTable(items)}
${summaryRow("Subtotal", naira(subtotal))}
${sectionTitle("Why shoppers choose FIL")}
${checklist([...FIL_PERKS, `${strong("Secure checkout.")} Pay safely with Paystack.`])}`;

  const html = layout({
    title: subject,
    preheader: `${itemWord} still in your cart. Pick up where you left off.`,
    label: "Your cart",
    body,
    reason: "You're getting this because you left items in your cart at filstore.com.ng.",
  });

  const lines = items
    .map((i) => `- ${i.name || "Product"}${i.color ? ` (${i.color})` : ""} ×${i.quantity || 1}  ${nairaText(Number(i.price || 0) * Number(i.quantity || 1))}`)
    .join("\n");
  const text = `Hi ${name},

You left ${itemWord} in your cart. They're still available, but we can't hold them forever.

${lines}
Subtotal: ${nairaText(subtotal)}

Finish checkout: ${SITE}/cart

${textFooter}`;

  return { subject, html, text };
}
