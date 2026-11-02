// lib/emails/supportEmails.js — contact form (admin copy + customer auto-reply), refund/return requests
// and anonymous feedback. Everything the customer typed is escaped before it goes into the HTML.
import { shortId } from "../orderStatus.js";
import { REQUEST_TYPES, statusInfo, isFinal, maskAccount } from "../returnRefund.js";
import {
  SITE, layout, heading, para, sectionTitle, button, details, note, productRow, priceText, strong, esc, naira, nairaText,
  formatDateTime, textFooter, codeBox,
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

// ── Refund / return requests ──────────────────────────────────────────────────
// r is a saved ReturnRefund (models/ReturnRefund.js); trackUrl comes from lib/trackLinks.js.

const addressOfRequest = (r) => [r.address, r.city, r.region].filter(Boolean).join(", ");
const itemRow = (r) =>
  productRow(
    {
      image: r.item.image,
      name: r.item.name,
      sub: [r.item.color && esc(r.item.color), `Qty ${esc(r.quantity)}`].filter(Boolean).join(" &middot; "),
      right: priceText(naira(r.item.price)),
    },
    { first: true }
  );

export function buildRequestAdminEmail(r) {
  const { label } = REQUEST_TYPES[r.type];
  const adminUrl = `${SITE}/admin_console/returns/${encodeURIComponent(r._id)}`;
  const subject = `${label} request ${r.code}: ${r.item.name}`;
  const intro = r.type === "refund"
    ? "A customer is asking for their money back. Check the reason, then approve or decline it in the admin console."
    : "A customer wants to send an item in. Check the reason, then approve or decline it in the admin console.";
  const body = `
${heading(`${esc(label)} request ${esc(r.code)}`)}
${para(intro)}
${button(`Open ${r.code}`, adminUrl)}
${sectionTitle("Item")}
${itemRow(r)}
${details([
  ["Order", `#${shortId(r.orderId)}`],
  ["Condition", r.condition],
])}
${sectionTitle("Reason")}
${note(quote(r.reason))}
${sectionTitle("Customer")}
${details([
  ["Name", [r.firstName, r.lastName].filter(Boolean).join(" ")],
  ["Phone", r.phone],
  ["Email", r.email],
  ["Address", r.type === "return" ? addressOfRequest(r) : ""],
])}
${r.type === "refund" ? `${sectionTitle("Refund to")}
${details([
  ["Amount", nairaText(r.amount)],
  ["Bank", r.bank.bankName],
  ["Account number", r.bank.accountNumber],
  ["Account name", r.bank.accountName],
])}` : ""}
${para(`Requested ${esc(formatDateTime(r.createdAt))}`, { small: true, muted: true, gap: 0 })}`;

  const html = layout({ title: subject, preheader: `${r.item.name} · ${String(r.reason).slice(0, 80)}`, label, body, admin: true });
  const text = [
    `${label.toUpperCase()} REQUEST ${r.code} (order #${shortId(r.orderId)})`,
    `Open: ${adminUrl}`,
    "",
    `Product: ${r.item.name} (${nairaText(r.item.price)}) ×${r.quantity}`,
    r.condition && `Condition: ${r.condition}`,
    `Reason: ${r.reason}`,
    "",
    `Customer: ${[r.firstName, r.lastName].filter(Boolean).join(" ")}, ${r.phone || "no phone"}, ${r.email || "no email"}`,
    r.type === "return" && `Address: ${addressOfRequest(r) || "—"}`,
    r.type === "refund" && `Refund ${nairaText(r.amount)} to: ${r.bank.bankName} · ${r.bank.accountNumber} · ${r.bank.accountName}`,
    "",
    `Requested: ${formatDateTime(r.createdAt)}`,
  ].filter((l) => l || l === "").join("\n");
  return { subject, html, text };
}

// Sent when the request is made (status "requested") and on every status change after that
export function buildRequestStatusEmail(r, trackUrl) {
  const { label } = REQUEST_TYPES[r.type];
  const info = statusInfo(r.type, r.status);
  const isNew = r.status === "requested";
  const subject = isNew
    ? `We've got your ${label.toLowerCase()} request (${r.code})`
    : `Your ${label.toLowerCase()} ${r.code}: ${info.label}`;
  const headline = isNew ? `We've got your ${label.toLowerCase()} request` : `${esc(label)} update: ${esc(info.label)}`;
  const refunded = r.type === "refund" && r.status === "refunded";
  const body = `
${heading(headline)}
${para(`Hi ${esc(r.firstName || "there")},`, { gap: 8 })}
${para(esc(info.customer))}
${isNew ? `${para("Keep this ID to check on it any time:")}${codeBox(r.code)}` : ""}
${r.customerNote ? `${sectionTitle("Note from our team")}${note(quote(r.customerNote))}` : ""}
${button(`Track ${r.code}`, trackUrl)}
${sectionTitle(`Your ${label.toLowerCase()}`)}
${itemRow(r)}
${details([
  ["Request ID", r.code],
  ["Status", info.label],
  ["Order", `#${shortId(r.orderId)}`],
  ["Amount refunded", refunded ? nairaText(r.refundedAmount ?? r.amount) : ""],
  ["Transfer reference", refunded ? r.refundReference : ""],
  ["Refund to", r.type === "refund" ? `${r.bank.bankName} ${maskAccount(r.bank.accountNumber)}` : ""],
  ["Deliver back to", r.type === "return" && !isFinal(r.type, r.status) ? addressOfRequest(r) : ""],
])}`;

  const html = layout({
    title: subject,
    preheader: info.customer,
    label,
    body,
    reason: `You're getting this because you asked for a ${label.toLowerCase()} on filstore.com.ng.`,
  });
  const text = [
    `Hi ${r.firstName || "there"},`,
    "",
    info.customer,
    "",
    `Request ID: ${r.code}`,
    `Status: ${info.label}`,
    `Item: ${r.item.name} ×${r.quantity}`,
    refunded && `Amount refunded: ${nairaText(r.refundedAmount ?? r.amount)}${r.refundReference ? ` (ref ${r.refundReference})` : ""}`,
    r.customerNote && `\nNote from our team:\n${r.customerNote}`,
    "",
    `Track it: ${trackUrl}`,
    "",
    textFooter,
  ].filter((l) => l || l === "").join("\n");
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
