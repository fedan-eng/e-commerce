// lib/emails/abandonedCartEmail.js — the two cart reminders the abandoned-cart cron alternates between:
// "Your cart is waiting" and "Quick question".
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

// "Are you really going to wait until your battery hits 5%?"
export function buildQuickQuestionCartEmail({ firstName, items = [] }) {
  const name = firstName || "there";
  const subject = "Quick question";
  const subtotal = items.reduce((n, i) => n + Number(i.price || 0) * Number(i.quantity || 1), 0);
  const question = "Are you really going to wait until your battery hits 5% before you start looking for a solution?";

  const body = `
${para(`Hi ${esc(name)},`)}
${para("Quick question:")}
${para(strong(question))}
${para("Your power bank and your new favourite gadgets are still sitting in your cart, and honestly, this might be the perfect time to get them.")}
${para(`Because when the light goes out, your phone shouldn't have to go with it. Whether you're working, creating, replying to customers, making content or just trying to stay connected, ${strong("your creative juice should keep flowing.")}`)}
${para("Don't wait for the emergency. Click below to get your power bank now.")}
${button("Get my power bank", `${SITE}/cart`)}
${sectionTitle("Still in your cart")}
${itemsTable(items)}
${summaryRow("Subtotal", naira(subtotal))}
${para("Keep creating. Keep going.", { gap: 16 })}
${para(`${strong("FIL Store")}<br><em>Powering Creators.</em>`, { gap: 0 })}`;

  const html = layout({
    title: subject,
    preheader: "Your power bank is still in your cart.",
    label: "Your cart",
    body,
    reason: "You're getting this because you left items in your cart at filstore.com.ng.",
  });

  const lines = items
    .map((i) => `- ${i.name || "Product"}${i.color ? ` (${i.color})` : ""} ×${i.quantity || 1}  ${nairaText(Number(i.price || 0) * Number(i.quantity || 1))}`)
    .join("\n");
  const text = `Hi ${name},

Quick question:

${question}

Your power bank and your new favourite gadgets are still sitting in your cart, and honestly, this might be the perfect time to get them.

Because when the light goes out, your phone shouldn't have to go with it. Whether you're working, creating, replying to customers, making content or just trying to stay connected, your creative juice should keep flowing.

Don't wait for the emergency. Get your power bank now: ${SITE}/cart

${lines}
Subtotal: ${nairaText(subtotal)}

Keep creating. Keep going.

FIL Store
Powering Creators.

${textFooter}`;

  return { subject, html, text };
}
