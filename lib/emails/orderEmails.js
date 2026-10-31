// lib/emails/orderEmails.js — order confirmation, the status updates (processing → delivered)
// and the admin "new order" alert. All take a saved Order (or the same shape as a plain object).

import { shortId } from "../orderStatus.js";
import {
  SITE, CONTACT, layout, heading, para, sectionTitle, strong, button, note, details, itemsTable,
  totals, progress, esc, naira, nairaText, formatDateTime, textFooter,
} from "./layout.js";

const firstNameOf = (order) => order.firstName || "there";
const regionOf = (order) => order.region?.name || (typeof order.region === "string" ? order.region : "");
const fullName = (order) => [order.firstName, order.lastName].filter(Boolean).join(" ");
const addressOf = (order) => [order.address, order.city, regionOf(order)].filter(Boolean).join(", ");

const DELIVERY_TIMES = "Delivery usually takes 1–3 working days in Lagos and 5–7 working days elsewhere.";

// The order summary every customer order email ends with
function orderSummary(order) {
  return `
${sectionTitle(`Order #${shortId(order._id)}`)}
${details([
  ["Deliver to", fullName(order)],
  ["Address", addressOf(order)],
  ["Phone", order.phone],
  ["Delivery", order.deliveryType],
])}
${sectionTitle("Your items")}
${itemsTable(order.items)}
${totals(order)}`;
}

function orderSummaryText(order) {
  const items = (order.items || [])
    .map((i) => `- ${i.name}${i.color ? ` (${i.color})` : ""} ×${i.quantity || 1}  ${nairaText(Number(i.price || 0) * Number(i.quantity || 1))}`)
    .join("\n");
  return [
    `ORDER #${shortId(order._id)}`,
    ...textPair("Deliver to", fullName(order)),
    ...textPair("Address", addressOf(order)),
    ...textPair("Phone", order.phone),
    ...textPair("Delivery", order.deliveryType),
    "",
    items,
    "",
    `Subtotal: ${nairaText(order.subTotal)}`,
    `Delivery: ${nairaText(order.deliveryFee)}`,
    ...(order.discount > 0 ? [`Discount${order.promoCode ? ` (${order.promoCode})` : ""}: −${nairaText(order.discount)}`] : []),
    `Total: ${nairaText(order.total)}`,
  ].join("\n");
}

const textPair = (label, value) => (value ? [`${label}: ${value}`] : []);

// ── Customer: confirmation + status updates ───────────────────────────────────

const STATUS_COPY = {
  confirmed: {
    subject: (o) => `Your FIL order is confirmed (#${shortId(o._id)})`,
    label: "Order confirmed",
    headline: (o) => (o.firstName ? `Thanks, ${esc(o.firstName)}. Your order is confirmed.` : "Thanks! Your order is confirmed."),
    preheader: "We've got your payment and we're getting your order ready.",
    intro: "We've received your payment and our team is getting your order ready. We'll email you at every step until it reaches you.",
    cta: ["Keep shopping", `${SITE}/products`],
  },
  processing: {
    subject: (o) => `We're packing your FIL order (#${shortId(o._id)})`,
    label: "Order update",
    headline: () => "We're packing your order",
    preheader: "Your order is with our team and being packed with care.",
    intro: "Your order is with our team now. We're checking every item and packing it with care, and we'll email you again the moment it ships.",
    cta: ["Keep shopping", `${SITE}/products`],
  },
  shipped: {
    subject: (o) => `Your FIL order is on its way (#${shortId(o._id)})`,
    label: "Order update",
    headline: () => "Your order has shipped",
    preheader: "Your order has left us and is with our delivery team.",
    intro: `Your order has left us and is with our delivery team. ${DELIVERY_TIMES}`,
    cta: ["Ask about my delivery", CONTACT.whatsappUrl],
  },
  intransit: {
    subject: (o) => `Your FIL order is almost there (#${shortId(o._id)})`,
    label: "Order update",
    headline: () => "Your order is nearly there",
    preheader: "Your package is on its last stretch. Keep your phone close.",
    intro: "Your package is on its last stretch and should reach you soon. Please keep your phone close so the rider can reach you.",
    cta: ["Ask about my delivery", CONTACT.whatsappUrl],
  },
  delivered: {
    subject: (o) => `Delivered! How's your FIL order? (#${shortId(o._id)})`,
    label: "Delivered",
    headline: (o) => (o.firstName ? `It's arrived. Enjoy, ${esc(o.firstName)}!` : "It's arrived. Enjoy!"),
    preheader: "Your order has been delivered. Tell us what you think.",
    intro: "Your order has been delivered and we hope you love it. Got a minute? A quick review helps other shoppers choose with confidence.",
    cta: ["Rate your order", `${SITE}/products`],
    after: "Something not right? Reply to this email and we'll sort it out.",
  },
};

export const STATUS_EMAIL_KEYS = Object.keys(STATUS_COPY);

// status: confirmed | processing | shipped | intransit | delivered.
// ctaLink overrides the button (the delivered email passes a signed review link).
export function buildOrderStatusEmail(order, status, { ctaLink } = {}) {
  const copy = STATUS_COPY[status];
  if (!copy) return null;
  const [ctaLabel, defaultLink] = copy.cta;
  const href = ctaLink || defaultLink;
  const greeting = status === "confirmed" || status === "delivered" ? "" : para(`Hi ${esc(firstNameOf(order))},`, { gap: 8 });

  const body = `
${heading(copy.headline(order))}
${greeting}
${para(copy.intro)}
${progress(status)}
${button(ctaLabel, href)}
${copy.after ? para(copy.after, { small: true, muted: true, gap: 0 }) : ""}
${orderSummary(order)}`;

  const html = layout({
    title: copy.subject(order),
    preheader: copy.preheader,
    label: copy.label,
    body,
    reason: "You're getting this because you placed an order at filstore.com.ng.",
  });

  const text = `Hi ${firstNameOf(order)},

${copy.intro}

${ctaLabel}: ${href}

${orderSummaryText(order)}

${textFooter}`;

  return { subject: copy.subject(order), html, text };
}

// ── Admin: new order alert ────────────────────────────────────────────────────

export function buildNewOrderAdminEmail(order) {
  const name = fullName(order) || order.email;
  const orderUrl = `${SITE}/admin_console/orders/${order._id}`;
  const subject = `New order: ${name} · ${nairaText(order.total)} (#${shortId(order._id)})`;

  const body = `
${heading(`New order: ${naira(order.total)}`)}
${para(`${strong(esc(name))} just paid for ${(order.items || []).reduce((n, i) => n + Number(i.quantity || 1), 0)} item(s). Check the payment, pack the items, then move the order to Processing.`)}
${button("Open order", orderUrl)}
${sectionTitle("Customer")}
${details([
  ["Order", `#${shortId(order._id)}`],
  ["Name", fullName(order)],
  ["Email", order.email],
  ["Phone", order.phone],
  ["Alt. phone", order.addPhone],
  ["Address", addressOf(order)],
  ["Delivery", order.deliveryType],
  ["Note", order.orderNote],
  ["Payment ref", order.paymentReference],
  ["Paid", formatDateTime(order.createdAt || new Date())],
])}
${sectionTitle("Items")}
${itemsTable(order.items)}
${totals(order)}`;

  const html = layout({ title: subject, preheader: `${name} · ${nairaText(order.total)}`, label: "New order", body, admin: true });

  const text = [
    `NEW ORDER — ${name}`,
    `Open order: ${orderUrl}`,
    "",
    ...textPair("Email", order.email),
    ...textPair("Alt. phone", order.addPhone),
    ...textPair("Note", order.orderNote),
    ...textPair("Payment ref", order.paymentReference),
    "",
    orderSummaryText(order),
  ].join("\n");

  return { subject, html, text };
}
