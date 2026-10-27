// lib/emails/supportEmails.js — contact form (admin copy + customer auto-reply), return requests
// and anonymous feedback. Everything the customer typed is escaped before it goes into the HTML.
import { shortId } from "../orderStatus.js";
import {
  SITE, layout, heading, para, sectionTitle, button, details, note, productRow, priceText, strong, esc, naira, nairaText,
  formatDateTime, textFooter,
} from "./layout.js";

const quote = (text) => esc(text).replace(/\n/g, "<br>");

// ── Contact form ──────────────────────────────────────────────────────────────

const INQUIRY = {
  general: { label: "Question", noun: "message" },
  redress: { label: "Complaint", noun: "complaint" },
  suggestion: { label: "Suggestion", noun: "suggestion" },
};
const inquiryOf = (type) => INQUIRY[type] || { label: type || "Message", noun: "message" };

// productImage: looked up from the order by the route, when the message is about a product
export function buildContactAdminEmail({ inquiryType, name, email, question, reason, productName, productImage, orderId, attachmentCount = 0 }) {
  const { label } = inquiryOf(inquiryType);
  const subject = `[FIL Contact] ${label} from ${name}`;
  const body = `
${heading(`${esc(label)} from ${esc(name)}`)}
${para("Sent from the contact form. Reply to this email to answer them directly.")}
${button(`Reply to ${esc(name.split(" ")[0] || name)}`, `mailto:${email}?subject=${encodeURIComponent(`Re: your ${label.toLowerCase()} to FIL`)}`)}
${productName ? `${sectionTitle("About")}${productRow({ image: productImage, name: productName, sub: orderId ? `Order #${shortId(orderId)}` : "" }, { first: true })}` : ""}
${sectionTitle("Details")}
${details([
  ["Name", name],
  ["Email", email],
  ["Order", orderId && `#${shortId(orderId)}`],
  ["Reason", reason],
  ["Attachments", attachmentCount ? `${attachmentCount} file(s), attached to this email` : ""],
])}
${sectionTitle("Message")}
${note(quote(question))}`;

  const html = layout({ title: subject, preheader: String(question).slice(0, 120), label, body, admin: true });
  const text = [
    `${label} from ${name} <${email}>`,
    orderId && `Order: #${shortId(orderId)}`,
    productName && `Product: ${productName}`,
    reason && `Reason: ${reason}`,
    attachmentCount && `Attachments: ${attachmentCount} file(s)`,
    "",
    question,
  ].filter((l) => l || l === "").join("\n");
  return { subject, html, text };
}

export function buildContactReplyEmail({ inquiryType, name, question, orderId }) {
  const { noun } = inquiryOf(inquiryType);
  const subject = "We've got your message | FIL";
  const body = `
${heading("We've got your message")}
${para(`Hi ${esc(name)}, thanks for getting in touch. We've received your ${noun}${orderId ? ` about order ${strong(`#${shortId(orderId)}`)}` : ""} and will reply within ${strong("24–48 hours")}.`)}
${sectionTitle("What you sent")}
${note(quote(question))}
${para("Need us sooner? WhatsApp is the fastest way to reach us (details below).", { small: true, muted: true })}
${button("Keep shopping", `${SITE}/products`)}`;

  const html = layout({
    title: subject,
    preheader: "We'll reply within 24–48 hours.",
    label: "Support",
    body,
    reason: "You're getting this because you contacted us through filstore.com.ng.",
  });
  const text = `Hi ${name},

Thanks for getting in touch. We've received your ${noun}${orderId ? ` about order #${shortId(orderId)}` : ""} and will reply within 24–48 hours.

What you sent:
${question}

${textFooter}`;
  return { subject, html, text };
}

// ── Return request (admin) ────────────────────────────────────────────────────

export function buildReturnRequestAdminEmail(r) {
  const subject = `Return request: ${r.productName} (#${shortId(r.orderId)})`;
  const body = `
${heading(`Return request: ${esc(r.productName)}`)}
${para("A customer wants to return an item. Check the reason, arrange pickup, and refund once the item is back and inspected.")}
${button("Open order", `${SITE}/admin_console/orders/${encodeURIComponent(r.orderId)}`)}
${sectionTitle("Item")}
${productRow(
  { image: r.productImage, name: r.productName, sub: `Qty ${esc(r.returnQuantity)}`, right: priceText(naira(r.productPrice)) },
  { first: true }
)}
${details([
  ["Order", `#${shortId(r.orderId)}`],
  ["Condition", r.productCondition],
])}
${sectionTitle("Reason")}
${note(quote(r.reasonForReturn))}
${sectionTitle("Pickup")}
${details([
  ["Phone", r.phone],
  ["Address", [r.address, r.city, r.region].filter(Boolean).join(", ")],
])}
${sectionTitle("Refund to")}
${details([
  ["Amount", nairaText(r.amount)],
  ["Bank", r.bankName],
  ["Account number", r.accountNumber],
  ["Account name", r.accountName],
  ["Requested", formatDateTime()],
])}`;

  const html = layout({ title: subject, preheader: `${r.productName} · ${r.productCondition}`, label: "Return", body, admin: true });
  const text = `RETURN REQUEST — order #${shortId(r.orderId)}
Open order: ${SITE}/admin_console/orders/${r.orderId}

Product: ${r.productName} (${nairaText(r.productPrice)}) ×${r.returnQuantity}
Condition: ${r.productCondition}
Reason: ${r.reasonForReturn}

Pickup: ${r.phone || "—"}, ${[r.address, r.city, r.region].filter(Boolean).join(", ") || "—"}

Refund ${nairaText(r.amount)} to:
${r.bankName} · ${r.accountNumber} · ${r.accountName}

Requested: ${formatDateTime()}`;
  return { subject, html, text };
}

// ── Anonymous feedback (admin) ────────────────────────────────────────────────

const RATING_WORDS = { 5: "Excellent", 4: "Very good", 3: "Good", 2: "Fair", 1: "Needs work" };

export function buildFeedbackAdminEmail({ rating: rawRating, comment }) {
  const rating = Math.min(5, Math.max(1, Math.round(rawRating)));
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const subject = `New feedback: ${rating}/5 ${stars}`;
  const body = `
${heading(`${rating}/5 &middot; ${RATING_WORDS[rating]}`)}
<p class="fx-link" style="margin:0 0 16px; font-size:26px; line-height:32px; letter-spacing:4px; color:#0f472b;">${stars}</p>
${sectionTitle("Comment")}
${note(comment ? quote(comment) : "<i>No comment left.</i>")}
${para(`Anonymous feedback from the site &middot; ${esc(formatDateTime())}`, { small: true, muted: true, gap: 0 })}`;

  const html = layout({ title: subject, preheader: comment ? String(comment).slice(0, 120) : "No comment left.", label: "Feedback", body, admin: true });
  const text = `NEW FEEDBACK: ${rating}/5 ${stars} (${RATING_WORDS[rating]})

${comment || "(No comment left)"}

${formatDateTime()}`;
  return { subject, html, text };
}
