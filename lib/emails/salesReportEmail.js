// lib/emails/salesReportEmail.js — the daily call list for the sales team: shoppers who left items in
// their cart, and shoppers who started paying but didn't finish. Sent by the sales-report cron with
// the same list attached as a CSV.
import { layout, heading, para, sectionTitle, details, productRow, priceText, link, esc, naira, nairaText, formatDateTime } from "./layout.js";

const telHref = (phone) => `tel:${String(phone).replace(/[^\d+]/g, "")}`;
const itemsLine = (items) => items.map((i) => `${i.name || "Product"} ×${i.quantity || 1}`).join(", ");

// lead: { name, phone, email, items: [{ name, quantity, price, image }], value, at, note }
function leadRow(lead, i) {
  const sub = [
    lead.phone ? link(telHref(lead.phone), esc(lead.phone)) : "No phone number",
    lead.email && link(`mailto:${lead.email}`, esc(lead.email)),
    esc(itemsLine(lead.items)),
    [lead.note, formatDateTime(lead.at)].filter(Boolean).map(esc).join(" &middot; "),
  ].filter(Boolean).join("<br>");
  return productRow({ image: lead.items[0]?.image, name: lead.name || "No name given", sub, right: priceText(naira(lead.value)) }, { first: i === 0 });
}

const section = (title, leads, empty) =>
  `${sectionTitle(`${title} (${leads.length})`)}${leads.length ? leads.map(leadRow).join("") : para(empty, { muted: true, small: true })}`;

export function buildSalesReportEmail({ carts, payments, from, to }) {
  const total = carts.length + payments.length;
  const value = [...carts, ...payments].reduce((n, l) => n + l.value, 0);
  const subject = `Daily call list: ${total} shopper${total === 1 ? "" : "s"} to call`;

  const body = `
${heading("Daily call list")}
${para(`Shoppers who left without buying between ${esc(formatDateTime(from))} and ${esc(formatDateTime(to))}. Payments first: they were one step from buying. The same list is attached as a spreadsheet.`)}
${details([
  ["Abandoned payments", String(payments.length)],
  ["Abandoned carts", String(carts.length)],
  ["Value left behind", nairaText(value)],
])}
${section("Abandoned payments", payments, "No unfinished payments today.")}
${section("Abandoned carts", carts, "No abandoned carts today.")}`;

  const html = layout({ title: subject, preheader: `${payments.length} unfinished payments, ${carts.length} abandoned carts`, label: "Sales", body, admin: true });

  const block = (title, leads) =>
    `${title.toUpperCase()} (${leads.length})\n` +
    (leads.map((l) => `- ${l.name || "No name"} | ${l.phone || "no phone"} | ${l.email || ""} | ${nairaText(l.value)} | ${itemsLine(l.items)}`).join("\n") || "None");
  const text = `Daily call list: ${formatDateTime(from)} to ${formatDateTime(to)}

${block("Abandoned payments", payments)}

${block("Abandoned carts", carts)}`;

  return { subject, html, text };
}
