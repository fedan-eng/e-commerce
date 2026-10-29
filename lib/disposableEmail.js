// lib/disposableEmail.js — throwaway inboxes (yopmail, mailinator, …) that anyone can open
// without signing up. Blocked at signup, and they can't use first-order / once-per-person codes.
import { disposableEmailBlocklist } from "disposable-email-domains-js";

let blocked = null; // built on first use: ~9k domains

export function isDisposableEmail(email) {
  const domain = String(email || "").trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  blocked ||= new Set(disposableEmailBlocklist());
  // Also catches subdomains, e.g. anything.yopmail.com
  const parts = domain.split(".");
  return parts.some((_, i) => i < parts.length - 1 && blocked.has(parts.slice(i).join(".")));
}

export const DISPOSABLE_EMAIL_MESSAGE = "Please use your real email address. Temporary inboxes can't be used.";
