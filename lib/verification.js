// lib/verification.js — email verification (6-digit code or link), signing in, and the
// generated password for accounts created from the promo popup.
import crypto from "crypto";
import { serialize } from "cookie";
import { signToken } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { buildWelcomeEmail } from "@/lib/emails/welcomeEmail";

export const CODE_TTL_MS = 30 * 60 * 1000;
export const MAX_CODE_ATTEMPTS = 5;
const LINK_TTL_MS = 24 * 60 * 60 * 1000;

const hashCode = (code) => crypto.createHash("sha256").update(String(code)).digest("hex");

// Case-insensitive lookup: older accounts may have been saved with capital letters
export const findUserByEmail = (User, email) =>
  User.findOne({ email }).collation({ locale: "en", strength: 2 });

// 10 characters with at least one upper, lower, digit and symbol, e.g. "Kf7uC(k2Fq"
export function generatePassword() {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789", "@$!%*?&#"];
  const all = sets.join("");
  const chars = [...sets.map((s) => s[crypto.randomInt(s.length)])];
  while (chars.length < 10) chars.push(all[crypto.randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export function baseUrlFrom(req) {
  const origin = req.headers.get("origin") || req.headers.get("host") || "https://filstore.com.ng";
  return origin.startsWith("http") ? origin : `https://${origin}`;
}

// Sets a fresh code and link token on the user (caller saves) and returns them for the email
export function issueVerification(user, baseUrl, callback) {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  user.verificationCode = hashCode(code);
  user.verificationCodeExpiry = new Date(Date.now() + CODE_TTL_MS);
  user.verificationCodeAttempts = 0;
  user.verificationToken = signToken({ email: user.email });
  user.verificationTokenExpiry = new Date(Date.now() + LINK_TTL_MS);

  const link = `${baseUrl}/verify-email?token=${user.verificationToken}${
    callback ? `&callback=${encodeURIComponent(callback)}` : ""
  }`;
  return { code, link };
}

// Returns "" when the code is right, otherwise a message for the shopper. Counts attempts (caller saves).
export function checkVerificationCode(user, code) {
  if (!user.verificationCode || !user.verificationCodeExpiry) return "Please request a new code.";
  if (user.verificationCodeExpiry < new Date()) return "This code has expired. Please request a new one.";
  if (user.verificationCodeAttempts >= MAX_CODE_ATTEMPTS) return "Too many attempts. Please request a new code.";

  const given = Buffer.from(hashCode(String(code).trim()));
  const stored = Buffer.from(user.verificationCode);
  if (given.length === stored.length && crypto.timingSafeEqual(given, stored)) return "";

  user.verificationCodeAttempts += 1;
  return "That code isn't right. Please check your email and try again.";
}

// Marks the user verified, saves, and sends the WELCOME10 email (a mail failure doesn't undo verification)
export async function completeVerification(user) {
  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  user.verificationCode = null;
  user.verificationCodeExpiry = null;
  user.verificationCodeAttempts = 0;
  await user.save();

  const { subject, html, text } = buildWelcomeEmail({ firstName: user.firstName });
  await sendEmail(user.email, subject, text, html).catch((err) =>
    console.error("Welcome email failed:", err.message)
  );
}

// The same 7-day session cookie /api/auth/login sets
export function sessionCookie(user) {
  const token = signToken({ id: user._id, email: user.email, role: user.role });
  return serialize("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}
