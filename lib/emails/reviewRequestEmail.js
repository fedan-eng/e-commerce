// lib/emails/reviewRequestEmail.js — "How's your new … ?" email with a Rate button per item.
// Table layout + inline styles so it renders in Gmail/Outlook.

const FOREST = "#004328";
const MINT = "#cff6df";
const MUTED = "#596e65";
const SITE = "https://www.filstore.com.ng";

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// items: [{ name, image, color, link }]
export function buildReviewRequestEmail({ firstName, items, isReminder }) {
  const name = esc(firstName || "there");
  const first = items[0]?.name || "your order";

  const subject = isReminder
    ? `${firstName || "Hey"}, got a minute to rate your ${first}?`
    : `How's your new ${first}, ${firstName || "there"}?`;

  const intro = isReminder
    ? "Quick reminder: your review helps other Nigerians pick the right gear, and it takes less than a minute."
    : "We hope it's keeping you powered up. Could you tell other shoppers what you think? It takes less than a minute.";

  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #dfe6e2;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="72" valign="middle">
                <div style="width:64px;height:64px;border-radius:14px;background:${MINT};text-align:center;">
                  ${item.image ? `<img src="${esc(item.image)}" alt="" width="56" height="56" style="display:inline-block;width:56px;height:56px;object-fit:contain;margin-top:4px;" />` : ""}
                </div>
              </td>
              <td valign="middle" style="padding:0 12px;font-family:Roboto,Arial,sans-serif;">
                <div style="font-size:15px;font-weight:700;color:${FOREST};line-height:1.35;">${esc(item.name)}</div>
                ${item.color ? `<div style="font-size:13px;color:${MUTED};margin-top:2px;text-transform:capitalize;">${esc(item.color)}</div>` : ""}
              </td>
              <td valign="middle" align="right" width="120">
                <a href="${esc(item.link)}" target="_blank"
                  style="display:inline-block;background:${FOREST};color:#ffffff;font-family:Roboto,Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:11px 18px;border-radius:999px;white-space:nowrap;">
                  &#9733; Rate it
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f2f6f1;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2f6f1;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:24px;">
          <tr>
            <td style="padding:32px 28px 8px;font-family:Roboto,Arial,sans-serif;">
              <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;color:${MUTED};text-transform:uppercase;">FIL Store</div>
              <h1 style="margin:12px 0 0;font-size:26px;line-height:1.2;color:${FOREST};">Hi ${name}, how's it going?</h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:${MUTED};">${intro}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 32px;font-family:Roboto,Arial,sans-serif;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:${MUTED};">
                No account needed. Your review shows with your first name and a <b>Verified buyer</b> badge.
                Something not right with your order? Just reply to this email and we'll sort it out.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-family:Roboto,Arial,sans-serif;font-size:12px;color:${MUTED};">
          Think Quality, Think FIL &middot; <a href="${SITE}" style="color:${FOREST};">filstore.com.ng</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Hi ${firstName || "there"},`,
    "",
    intro,
    "",
    ...items.map((item) => `${item.name}${item.color ? ` (${item.color})` : ""}\nRate it: ${item.link}\n`),
    "No account needed. Something not right with your order? Just reply to this email.",
    "",
    "The FIL Team",
    SITE,
  ].join("\n");

  return { subject, html, text };
}
