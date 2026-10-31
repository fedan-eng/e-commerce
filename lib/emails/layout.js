// lib/emails/layout.js — the shared FIL email shell (pine header, white card, footer) and the
// blocks every email is built from. Table layout + inline styles so it renders in Gmail/Outlook.
//
// Dark mode: Apple Mail and Outlook.com use the dark colours in the <style> block below. Gmail's
// apps ignore that and recolour the email themselves, so every cell that has a background also
// sets its own text colour (and bgcolor attribute), keeping each pair readable however it's flipped.
// The logo is white on a solid pine tile because email apps never recolour images.
//
// Imports here stay relative with extensions so scripts/email-preview.mjs can run them in plain Node.

import { siteUrl } from "../siteUrl.js";
import { TIMELINE_STEPS, normalizeStatusKey } from "../orderStatus.js";

export const SITE = siteUrl();
// Always the live site: email apps can't load images from localhost or a protected preview
const LOGO_URL = "https://www.filstore.com.ng/email/fil-logo-pine.png";

export const C = {
  pine: "#0f472b",
  pineDeep: "#0b3a23",
  mint: "#cff6df",
  tint: "#eef5f1",
  sage: "#f2f6f1",
  canvas: "#f6f7f6",
  edge: "#e6e9e7",
  white: "#ffffff",
  ink: "#111814",
  sub: "#4a5550",
  faint: "#6b7570",
};

const FONT = "Poppins, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "'Courier New', Courier, monospace";

export const CONTACT = {
  whatsapp: "0701 890 0705",
  whatsappUrl: "https://wa.me/2347018900705",
  phone: "0702 500 4757",
  phoneUrl: "tel:+2347025004757",
  email: "filfilecommerce@gmail.com",
  address: "20 Fedan St, Ojo, Lagos",
  instagram: "https://www.instagram.com/filstoreng/",
  tiktok: "https://www.tiktok.com/@filstoreng_",
  facebook: "https://www.facebook.com/filstoreng/",
};

export const esc = (s = "") =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const naira = (n) => `&#8358;${Number(n || 0).toLocaleString("en-NG")}`;
export const nairaText = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

export const formatDateTime = (d = new Date()) =>
  new Date(d).toLocaleString("en-NG", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos",
  });

// ── Shell ─────────────────────────────────────────────────────────────────────

// label: the small tag in the header ("Order update"). reason: the "you're getting this because" line.
// admin: internal notifications get a slimmer footer without the shop links.
export function layout({ title, preheader = "", label = "", body, reason = "", admin = false }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body { margin:0 !important; padding:0 !important; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  a { text-decoration:underline; }
  @media only screen and (max-width:620px) {
    .fx-pad { padding-left:20px !important; padding-right:20px !important; }
    .fx-h1 { font-size:22px !important; line-height:30px !important; }
    .fx-step { font-size:10px !important; }
    .fx-hide-sm { display:none !important; }
  }
  @media (prefers-color-scheme: dark) {
    .fx-canvas { background-color:#0c1210 !important; }
    .fx-card { background-color:#141c18 !important; }
    .fx-soft { background-color:#1b2621 !important; }
    .fx-mint { background-color:#1f3a2c !important; color:#cff6df !important; }
    .fx-edge { border-color:#2b3631 !important; }
    .fx-ink { color:#eef3f0 !important; }
    .fx-sub { color:#bcc8c1 !important; }
    .fx-faint { color:#99a69f !important; }
    .fx-link { color:#7fe0ad !important; }
    .fx-btn { background-color:#cff6df !important; }
    .fx-btn a, a.fx-btn-a { color:#0f472b !important; }
    .fx-done { background-color:#3fbf7f !important; }
    .fx-todo { background-color:#2b3631 !important; }
  }
  [data-ogsc] .fx-ink { color:#eef3f0 !important; }
  [data-ogsc] .fx-sub { color:#bcc8c1 !important; }
  [data-ogsc] .fx-faint { color:#99a69f !important; }
  [data-ogsc] .fx-link { color:#7fe0ad !important; }
  [data-ogsc] .fx-mint { color:#cff6df !important; }
  [data-ogsb] .fx-canvas { background-color:#0c1210 !important; }
  [data-ogsb] .fx-card { background-color:#141c18 !important; }
  [data-ogsb] .fx-soft { background-color:#1b2621 !important; }
  [data-ogsb] .fx-mint { background-color:#1f3a2c !important; }
</style>
</head>
<body class="fx-canvas" style="margin:0; padding:0; background-color:${C.canvas};">
<div style="display:none; max-height:0; max-width:0; overflow:hidden; opacity:0; mso-hide:all; font-size:1px; line-height:1px; color:${C.canvas};">${esc(preheader)}${"&#8202;&zwnj;&nbsp;".repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.canvas}" class="fx-canvas" style="background-color:${C.canvas};">
<tr><td align="center" style="padding:24px 12px;">
  <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">
    <tr>
      <td bgcolor="${C.pine}" class="fx-pad" style="background-color:${C.pine}; border-radius:20px 20px 0 0; padding:22px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="vertical-align:middle;">
            <a href="${SITE}" target="_blank" style="text-decoration:none;"><img src="${LOGO_URL}" width="90" height="39" alt="FIL" style="display:block; width:90px; height:39px; background-color:${C.pine}; color:#ffffff; font-family:${FONT}; font-size:22px; font-weight:800; line-height:39px;"></a>
          </td>
          ${label ? `<td align="right" style="vertical-align:middle; font-family:${FONT}; font-size:12px; font-weight:600; letter-spacing:0.6px; text-transform:uppercase; color:${C.mint};">${esc(label)}</td>` : ""}
        </tr></table>
      </td>
    </tr>
    <tr>
      <td bgcolor="${C.white}" class="fx-card fx-pad" style="background-color:${C.white}; border-radius:0 0 20px 20px; padding:32px 32px 36px;">
${body}
      </td>
    </tr>
    <tr>
      <td class="fx-pad" style="padding:24px 32px 8px;">
${admin ? adminFooter() : footer(reason)}
      </td>
    </tr>
  </table>
  <!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

function footer(reason) {
  const link = (href, text) =>
    `<a href="${href}" target="_blank" class="fx-link" style="color:${C.pine}; font-weight:600; text-decoration:none;">${text}</a>`;
  return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center" class="fx-ink" style="font-family:${FONT}; font-size:14px; line-height:22px; font-weight:700; color:${C.ink}; padding-bottom:6px;">Need a hand?</td></tr>
          <tr><td align="center" class="fx-sub" style="font-family:${FONT}; font-size:13px; line-height:22px; color:${C.sub}; padding-bottom:14px;">
            Reply to this email, ${link(CONTACT.whatsappUrl, `WhatsApp ${CONTACT.whatsapp}`)} or call ${link(CONTACT.phoneUrl, CONTACT.phone)}
          </td></tr>
          <tr><td align="center" style="font-family:${FONT}; font-size:13px; line-height:22px; padding-bottom:14px;">
            ${link(CONTACT.instagram, "Instagram")} <span class="fx-faint" style="color:${C.faint};">&nbsp;&middot;&nbsp;</span>
            ${link(CONTACT.tiktok, "TikTok")} <span class="fx-faint" style="color:${C.faint};">&nbsp;&middot;&nbsp;</span>
            ${link(CONTACT.facebook, "Facebook")} <span class="fx-faint" style="color:${C.faint};">&nbsp;&middot;&nbsp;</span>
            ${link(SITE, "filstore.com.ng")}
          </td></tr>
          <tr><td align="center" class="fx-faint" style="font-family:${FONT}; font-size:12px; line-height:19px; color:${C.faint};">
            Think Quality, Think FIL.<br>Fedan Investment Limited &middot; ${CONTACT.address}${reason ? `<br>${esc(reason)}` : ""}
          </td></tr>
        </table>`;
}

function adminFooter() {
  return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center" class="fx-faint" style="font-family:${FONT}; font-size:12px; line-height:19px; color:${C.faint};">
            FIL Store admin notification &middot; <a href="${SITE}/admin_console" target="_blank" class="fx-link" style="color:${C.pine}; font-weight:600; text-decoration:none;">Open the admin console</a>
          </td></tr>
        </table>`;
}

// Plain-text sign-off shared by every customer email
export const textFooter = `—
The FIL Team · Think Quality, Think FIL.
Need a hand? Reply to this email, WhatsApp ${CONTACT.whatsapp} or call ${CONTACT.phone}.
${SITE}`;

// ── Blocks ────────────────────────────────────────────────────────────────────

export const heading = (text) =>
  `<h1 class="fx-ink fx-h1" style="margin:0 0 12px; font-family:${FONT}; font-size:26px; line-height:34px; font-weight:700; color:${C.ink};">${text}</h1>`;

export const para = (html, { muted = false, small = false, gap = 16 } = {}) =>
  `<p class="${muted ? "fx-faint" : "fx-sub"}" style="margin:0 0 ${gap}px; font-family:${FONT}; font-size:${small ? 13 : 15}px; line-height:${small ? 21 : 24}px; color:${muted ? C.faint : C.sub};">${html}</p>`;

export const sectionTitle = (text) =>
  `<p class="fx-ink" style="margin:28px 0 10px; font-family:${FONT}; font-size:13px; line-height:18px; font-weight:700; letter-spacing:0.6px; text-transform:uppercase; color:${C.ink};">${text}</p>`;

export const link = (href, text) =>
  `<a href="${esc(href)}" target="_blank" class="fx-link" style="color:${C.pine}; font-weight:600;">${text}</a>`;

export const strong = (text) => `<strong class="fx-ink" style="color:${C.ink};">${text}</strong>`;

export function button(label, href, { align = "left" } = {}) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="margin:8px 0 8px;">
  <tr><td bgcolor="${C.pine}" class="fx-btn" style="background-color:${C.pine}; border-radius:999px; mso-padding-alt:14px 28px;">
    <a href="${esc(href)}" target="_blank" class="fx-btn-a" style="display:inline-block; padding:14px 28px; font-family:${FONT}; font-size:15px; line-height:20px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:999px;">${label}</a>
  </td></tr>
</table>
<div style="clear:both; line-height:0; font-size:0;">&nbsp;</div>`;
}

// Soft sage panel for side notes ("Didn't request this?")
export const note = (html) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 12px;">
  <tr><td bgcolor="${C.sage}" class="fx-soft fx-sub" style="background-color:${C.sage}; border-radius:14px; padding:16px 18px; font-family:${FONT}; font-size:13px; line-height:21px; color:${C.sub};">${html}</td></tr>
</table>`;

// Big code on a mint tile (sign-in, verification, reset, promo codes)
export const codeBox = (code, caption = "") => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 16px;">
  <tr><td bgcolor="${C.mint}" align="center" class="fx-mint" style="background-color:${C.mint}; border-radius:16px; padding:20px 16px; font-family:${MONO}; font-size:32px; line-height:40px; font-weight:700; letter-spacing:6px; color:${C.pine};">${esc(code)}</td></tr>
  ${caption ? `<tr><td align="center" class="fx-faint" style="padding-top:8px; font-family:${FONT}; font-size:12px; line-height:18px; color:${C.faint};">${caption}</td></tr>` : ""}
</table>`;

// Label / value rows. Empty values are skipped so quick-checkout orders don't show blank lines.
export function details(rows) {
  const shown = rows.filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "");
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.sage}" class="fx-soft" style="background-color:${C.sage}; border-radius:14px;">
  <tr><td style="padding:6px 18px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${shown
        .map(
          ([label, value], i) => `
      <tr>
        <td class="fx-faint${i ? " fx-edge" : ""}" style="padding:10px 12px 10px 0; ${i ? `border-top:1px solid ${C.edge};` : ""} font-family:${FONT}; font-size:13px; line-height:20px; color:${C.faint}; vertical-align:top; white-space:nowrap;">${label}</td>
        <td class="fx-ink${i ? " fx-edge" : ""}" align="right" style="padding:10px 0; ${i ? `border-top:1px solid ${C.edge};` : ""} font-family:${FONT}; font-size:13px; line-height:20px; font-weight:600; color:${C.ink}; text-align:right; vertical-align:top; word-break:break-word;">${esc(value)}</td>
      </tr>`
        )
        .join("")}
    </table>
  </td></tr>
</table>`;
}

// Order or cart items: photo, name, colour · qty, line total
export function itemsTable(items = []) {
  return items
    .map((item, i) => {
      const qty = Number(item.quantity || 1);
      return productRow(
        {
          image: item.image,
          name: item.name,
          sub: [item.color && esc(item.color), `Qty ${qty}`].filter(Boolean).join(" &middot; "),
          right: priceText(naira(Number(item.price || 0) * qty)),
        },
        { first: i === 0 }
      );
    })
    .join("");
}

// Email apps need absolute https links; product images are sometimes saved as "/file.png"
export function imageUrl(src) {
  if (!src || typeof src !== "string") return "";
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/")) return `https://www.filstore.com.ng${src}`;
  return /^https?:\/\//.test(src) ? src : "";
}

export function totals({ subTotal = 0, deliveryFee = 0, discount = 0, promoCode = "", total = 0 }) {
  const row = (label, value, { bold = false, cls = "fx-sub" } = {}) => `
  <tr>
    <td class="${cls}" style="padding:4px 0; font-family:${FONT}; font-size:${bold ? 16 : 14}px; line-height:22px; ${bold ? "font-weight:700;" : ""} color:${bold ? C.ink : C.sub};">${label}</td>
    <td class="${cls}" align="right" style="padding:4px 0; font-family:${FONT}; font-size:${bold ? 18 : 14}px; line-height:22px; ${bold ? "font-weight:800;" : ""} color:${bold ? C.ink : C.sub}; text-align:right; white-space:nowrap;">${value}</td>
  </tr>`;
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="fx-edge" style="border-top:2px solid ${C.edge}; margin-top:4px;">
  <tr><td style="padding-top:10px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${row("Subtotal", naira(subTotal))}
      ${row("Delivery", naira(deliveryFee))}
      ${discount > 0 ? row(`Discount${promoCode ? ` (${esc(promoCode)})` : ""}`, `&minus;${naira(discount)}`) : ""}
      ${row("Total", naira(total), { bold: true, cls: "fx-ink" })}
    </table>
  </td></tr>
</table>`;
}

// The Confirmed → Delivered progress bar. Steps up to and including the current one are filled.
export function progress(status) {
  const current = Math.max(0, TIMELINE_STEPS.findIndex((s) => normalizeStatusKey(s) === normalizeStatusKey(status)));
  const cells = TIMELINE_STEPS.map((step, i) => {
    const done = i <= current;
    return `<td width="20%" style="padding:0 ${i < TIMELINE_STEPS.length - 1 ? 3 : 0}px 0 ${i ? 3 : 0}px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td height="6" bgcolor="${done ? C.pine : C.edge}" class="${done ? "fx-done" : "fx-todo"}" style="height:6px; background-color:${done ? C.pine : C.edge}; border-radius:3px; font-size:0; line-height:0;">&nbsp;</td>
        </tr></table>
      </td>`;
  }).join("");
  const labels = TIMELINE_STEPS.map((step, i) => {
    const isCurrent = i === current;
    const done = i < current;
    const cls = isCurrent ? "fx-ink" : done ? "fx-sub" : "fx-faint";
    const color = isCurrent ? C.ink : done ? C.sub : C.faint;
    return `<td width="20%" align="${i === 0 ? "left" : i === TIMELINE_STEPS.length - 1 ? "right" : "center"}" class="fx-step ${cls}" style="padding-top:8px; font-family:${FONT}; font-size:11px; line-height:15px; ${isCurrent ? "font-weight:700;" : ""} color:${color};">${step}</td>`;
  }).join("");
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px;">
  <tr>${cells}</tr>
  <tr>${labels}</tr>
</table>`;
}

// Short "why FIL" points, each with a pine tick
export const checklist = (points) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px;">
  ${points
    .map(
      (p) => `
  <tr>
    <td width="26" class="fx-link" style="padding:5px 0; font-family:${FONT}; font-size:15px; line-height:22px; font-weight:700; color:${C.pine}; vertical-align:top;">&#10003;</td>
    <td class="fx-sub" style="padding:5px 0; font-family:${FONT}; font-size:14px; line-height:22px; color:${C.sub}; vertical-align:top;">${p}</td>
  </tr>`
    )
    .join("")}
</table>`;

export const FIL_PERKS = [
  `${strong("Quality first.")} From power banks to everyday accessories, made to keep up with you.`,
  `${strong("Fast delivery.")} 1–3 working days in Lagos, 5–7 nationwide.`,
  `${strong("Easy returns.")} 7 days from delivery if something isn't right.`,
];

// One bold "label ……… value" line, e.g. a cart subtotal
export const summaryRow = (label, valueHtml) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="fx-edge" style="border-top:2px solid ${C.edge};">
  <tr>
    <td class="fx-ink" style="padding:12px 0 4px; font-family:${FONT}; font-size:15px; line-height:22px; font-weight:700; color:${C.ink};">${label}</td>
    <td class="fx-ink" align="right" style="padding:12px 0 4px; font-family:${FONT}; font-size:17px; line-height:22px; font-weight:800; color:${C.ink}; white-space:nowrap;">${valueHtml}</td>
  </tr>
</table>`;

// A product with its photo; `right` is the cell on the end (a price or a button)
export function productRow({ image: rawImage, name, sub = "", right = "" }, { first = false } = {}) {
  const border = first ? "" : `border-top:1px solid ${C.edge};`;
  const image = imageUrl(rawImage);
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="64" class="fx-edge" style="padding:12px 14px 12px 0; ${border} vertical-align:middle;">
      ${image
        ? `<img src="${esc(image)}" width="56" height="56" alt="" style="display:block; width:56px; height:56px; object-fit:contain; border-radius:12px; background-color:${C.sage};">`
        : `<table role="presentation" width="56" cellpadding="0" cellspacing="0" border="0"><tr><td width="56" height="56" bgcolor="${C.sage}" class="fx-soft" style="width:56px; height:56px; background-color:${C.sage}; border-radius:12px; font-size:0; line-height:0;">&nbsp;</td></tr></table>`}
    </td>
    <td class="fx-edge" style="padding:12px 8px 12px 0; ${border} font-family:${FONT}; vertical-align:middle;">
      <span class="fx-ink" style="font-size:14px; line-height:20px; font-weight:600; color:${C.ink};">${esc(name || "Product")}</span>
      ${sub ? `<br><span class="fx-faint" style="font-size:12px; line-height:18px; color:${C.faint};">${sub}</span>` : ""}
    </td>
    <td class="fx-edge" align="right" style="padding:12px 0; ${border} vertical-align:middle; white-space:nowrap;">${right}</td>
  </tr>
</table>`;
}

// Small pill button for inside a row (e.g. "Rate it")
export const smallButton = (label, href) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right"><tr>
  <td bgcolor="${C.mint}" class="fx-mint" style="background-color:${C.mint}; border-radius:999px;">
    <a href="${esc(href)}" target="_blank" class="fx-mint" style="display:inline-block; padding:8px 16px; font-family:${FONT}; font-size:13px; line-height:18px; font-weight:700; color:${C.pine}; text-decoration:none; border-radius:999px;">${label}</a>
  </td>
</tr></table>`;

export const priceText = (html) =>
  `<span class="fx-ink" style="font-family:${FONT}; font-size:14px; line-height:20px; font-weight:600; color:${C.ink};">${html}</span>`;

export const spacer = (h = 16) => `<div style="height:${h}px; line-height:${h}px; font-size:0;">&nbsp;</div>`;
