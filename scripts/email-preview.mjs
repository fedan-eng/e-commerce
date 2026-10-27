/**
 * Email preview + test send.
 *
 *   node scripts/email-preview.mjs                 → writes every email to .email-preview/ as
 *                                                     light, dark (Apple Mail / Outlook) and
 *                                                     forced-invert (Gmail app) HTML files
 *   node scripts/email-preview.mjs --send you@x.com → also sends each one there
 *                                                     (needs EMAIL_USER / EMAIL_PASS in .env)
 *   --only order                                    → just the emails whose name contains "order"
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { emailSamples } from "./email-samples.mjs";

dotenv.config();

const args = process.argv.slice(2);
const sendTo = args.includes("--send") ? args[args.indexOf("--send") + 1] : null;
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : "";
const outDir = path.resolve(".email-preview");

// Pin each preview to one scheme so it doesn't follow this computer's theme
const DARK_QUERY = "@media (prefers-color-scheme: dark)";
const forceLight = (html) => html.replace(DARK_QUERY, "@media not all");
// Apple Mail / Outlook.com: run the dark @media rules unconditionally
const forceDark = (html) => html.replace(DARK_QUERY, "@media all");
// Gmail's apps ignore our dark CSS and invert the colours themselves (images stay as they are)
const gmailInvert = (html) =>
  forceLight(html).replace(
    "</head>",
    `<style>html{filter:invert(1) hue-rotate(180deg);background:#fff}img{filter:invert(1) hue-rotate(180deg)}</style></head>`
  );

// Previews load the site's images from public/ (the logo is only live once deployed)
const localImages = (html) =>
  html.replace(/https:\/\/www\.filstore\.com\.ng\/([\w./-]+\.(?:png|jpe?g|webp))/g, (url, file) =>
    fs.existsSync(path.join("public", file)) ? `../public/${file}` : url
  );

fs.mkdirSync(outDir, { recursive: true });
const samples = emailSamples().filter(([name]) => name.includes(only));
const index = [];

for (const [name, email] of samples) {
  const html = localImages(email.html);
  fs.writeFileSync(path.join(outDir, `${name}.html`), forceLight(html));
  fs.writeFileSync(path.join(outDir, `${name}.dark.html`), forceDark(html));
  fs.writeFileSync(path.join(outDir, `${name}.gmail-dark.html`), gmailInvert(html));
  fs.writeFileSync(path.join(outDir, `${name}.txt`), `Subject: ${email.subject}\n\n${email.text}`);
  index.push(`<li><b>${name}</b> — ${email.subject.replace(/</g, "&lt;")} · <a href="${name}.html">light</a> · <a href="${name}.dark.html">dark</a> · <a href="${name}.gmail-dark.html">gmail dark</a> · <a href="${name}.txt">text</a></li>`);
}
fs.writeFileSync(path.join(outDir, "index.html"), `<!doctype html><meta charset="utf-8"><title>FIL emails</title><ul style="font:15px/2 sans-serif">${index.join("")}</ul>`);
console.log(`Wrote ${samples.length} emails to ${outDir}`);

if (sendTo) {
  const { sendEmail } = await import("../lib/mailer.js");
  for (const [name, email] of samples) {
    await sendEmail(sendTo, `[Test · ${name}] ${email.subject}`, email.text, email.html);
  }
  console.log(`Sent ${samples.length} emails to ${sendTo}`);
}
