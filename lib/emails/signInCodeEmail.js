// lib/emails/signInCodeEmail.js — "Your FIL sign-in code" for signing in without a password.
import { layout, heading, para, codeBox, note, textFooter } from "./layout.js";

export function buildSignInCodeEmail({ code }) {
  const subject = `${code} is your FIL sign-in code`;

  const body = `
${heading("Your sign-in code")}
${para("Enter this code on filstore.com.ng to sign in.")}
${codeBox(code, "Valid for 30 minutes")}
${note("Didn't try to sign in? You can ignore this email. Nobody can get into your account without this code.")}`;

  const html = layout({
    title: subject,
    preheader: `Your FIL sign-in code is ${code}.`,
    label: "Sign in",
    body,
    reason: "You're getting this because someone asked to sign in to this account.",
  });

  const text = `Your FIL sign-in code: ${code}

Enter it on filstore.com.ng to sign in. It's valid for 30 minutes.

Didn't try to sign in? You can ignore this email.

${textFooter}`;

  return { subject, html, text };
}
