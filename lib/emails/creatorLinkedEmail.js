// lib/emails/creatorLinkedEmail.js — sent when an admin ties a creator promo code to someone's
// account: their code, share link, commission and where to follow their sales.
import { SITE, layout, heading, para, sectionTitle, button, codeBox, details, note, strong, esc, textFooter } from "./layout.js";

export function buildCreatorLinkedEmail({ firstName, code, discount, commissionPercent = 0 }) {
  const name = firstName || "there";
  const shareLink = `${SITE}/?ref=${encodeURIComponent(code)}`;
  const dashboard = `${SITE}/creator`;
  const subject = `You're now a FIL creator. Your code is ${code}`;

  const rows = [["Shoppers get", `${discount}% off`]];
  if (commissionPercent > 0) rows.push(["You earn", `${commissionPercent}% of product sales`]);

  const body = `
${heading(`Welcome aboard, ${esc(name)}`)}
${para(`Your FIL account is now a creator account. Orders placed with your code or link count under your name.`)}
${sectionTitle("Your code")}
${codeBox(code, "Shoppers enter it at checkout")}
${details(rows)}
${sectionTitle("Your share link")}
${para(`This link fills your code in for shoppers: ${strong(esc(shareLink))}`)}
${button("Open my creator dashboard", dashboard)}
${note("Log in with this email address to see your orders, sales and commission.")}`;

  const html = layout({
    title: subject,
    preheader: `Share ${code} or your link. Your sales show on your creator dashboard.`,
    label: "Creator",
    body,
    reason: "You're getting this because the FIL team linked a creator code to your account.",
  });

  const text = `Welcome aboard, ${name}!

Your FIL account is now a creator account. Orders placed with your code or link count under your name.

Your code: ${code} (shoppers get ${discount}% off)${commissionPercent > 0 ? `\nYou earn: ${commissionPercent}% of product sales` : ""}
Your share link: ${shareLink}

Creator dashboard: ${dashboard}
Log in with this email address to see your orders, sales and commission.

${textFooter}`;

  return { subject, html, text };
}
