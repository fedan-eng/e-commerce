// lib/trackLinks.js — the "Track it" links in refund/return emails. The key signs the request
// code so the link opens it on /track without asking for the email or phone. Server only.
import crypto from "crypto";
import { siteUrl } from "./siteUrl.js";

const keyFor = (code) =>
  crypto.createHmac("sha256", `${process.env.JWT_SECRET}:track-links`).update(String(code)).digest("base64url").slice(0, 22);

export const trackLink = (code) => `${siteUrl()}/track?code=${encodeURIComponent(code)}&key=${keyFor(code)}`;

export function verifyTrackKey(code, key) {
  const expected = Buffer.from(keyFor(code));
  const given = Buffer.from(String(key || ""));
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}
