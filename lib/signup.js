// lib/signup.js — email-only signup, shared by the promo popup (/api/subscribe) and the
// signup page (/api/auth/register). Creates the account with a generated password, then
// emails a 6-digit code and a link to verify it (see /api/auth/verify-code).
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/mailer";
import { buildAccountCreatedEmail } from "@/lib/emails/accountCreatedEmail";
import { codeRecentlySent, findUserByEmail, generatePassword, hasOrdered, issueVerification } from "@/lib/verification";
import User from "@/models/User";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "+2348137678990" → "08137678990" (how checkout stores Nigerian numbers); other countries keep their code
const accountPhone = (e164) => (e164.startsWith("+234") ? `0${e164.slice(4)}` : e164.slice(1));

/**
 * Starts (or restarts) signup for an email. Needs an open DB connection.
 * phone: optional E.164 number. callback: same-site path the verify link returns to.
 * Returns { ok: true, email } or { ok: false, status, message, hasAccount? }.
 */
export async function startEmailSignup({ email, phone, baseUrl, callback }) {
  let user = await findUserByEmail(User, email);

  if (user && (user.isVerified || user.googleId)) {
    return {
      ok: false,
      status: 409,
      hasAccount: true,
      message: "You already have a FIL account. Sign in instead.",
    };
  }
  if (user && codeRecentlySent(user)) {
    return { ok: false, status: 429, message: "We've just sent you a code. Please wait a moment before asking again." };
  }

  // A password is only emailed when we made it. An unverified popup account has never
  // been signed in to, so a fresh one is safe; someone who chose their own keeps it.
  let password = null;
  if (!user) {
    password = generatePassword();
    user = new User({
      email,
      password: bcrypt.hashSync(password, 10),
      provider: "local",
      isVerified: false,
      passwordIsGenerated: true,
    });
  } else if (user.passwordIsGenerated) {
    password = generatePassword();
    user.password = bcrypt.hashSync(password, 10);
  }
  if (phone && !user.phone) user.phone = accountPhone(phone);

  const safeCallback = callback && callback.startsWith("/") && !callback.startsWith("//") ? callback : null;
  const { code, link } = issueVerification(user, baseUrl, safeCallback);
  await user.save();

  const { subject, html, text } = buildAccountCreatedEmail({
    email: user.email,
    password,
    code,
    link,
    offer: !(await hasOrdered(user.email)),
  });
  await sendEmail(user.email, subject, text, html);

  return { ok: true, email: user.email };
}
