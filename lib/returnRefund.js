// lib/returnRefund.js — the two after-sale flows customers can open on an order item, shared by
// the order page, the public /track page, the admin console and the API routes.
//
//   Refund (RF-…): money back to the customer's bank account. Nothing is shipped.
//   Return (RT-…): the customer sends the item in, we work on it, and deliver it back to them.
//
// Client-safe: no server imports.
import { normalizeStatusKey } from "./orderStatus.js";
import { getReturnDeadline } from "./returns.js";

const DECLINED = {
  key: "rejected",
  label: "Declined",
  customer: "We couldn't accept this request. See the note from our team below, or reach us on WhatsApp if you have questions.",
};

export const REQUEST_TYPES = {
  refund: {
    label: "Refund",
    prefix: "RF",
    steps: [
      { key: "requested", label: "Requested", action: "", customer: "We've got your refund request and will review it within 2 working days." },
      { key: "approved", label: "Approved", action: "Approve refund", customer: "Your refund has been approved and is being processed." },
      { key: "refunded", label: "Refunded", action: "Mark as refunded", customer: "We've sent your refund. It can take up to 24 hours to show in your account." },
    ],
  },
  return: {
    label: "Return",
    prefix: "RT",
    steps: [
      { key: "requested", label: "Requested", action: "", customer: "We've got your return request and will review it within 2 working days." },
      { key: "approved", label: "Approved", action: "Approve return", customer: "Your return has been approved. Please send the item to us. Our team will share how in the note below or on WhatsApp." },
      { key: "received", label: "Item received", action: "Mark item received", customer: "We've received your item and are checking it." },
      { key: "processing", label: "Being worked on", action: "Start work", customer: "Our team is working on your item." },
      { key: "outfordelivery", label: "Out for delivery", action: "Send out for delivery", customer: "Your item is on its way back to you." },
      { key: "returned", label: "Returned", action: "Mark as returned", customer: "Your item has been delivered back to you. Thanks for your patience." },
    ],
  },
};

export const isRequestType = (type) => Object.hasOwn(REQUEST_TYPES, type);

export const statusesOf = (type) => [...(REQUEST_TYPES[type]?.steps || []), DECLINED].map((s) => s.key);

export function statusInfo(type, status) {
  if (status === DECLINED.key) return DECLINED;
  return REQUEST_TYPES[type]?.steps.find((s) => s.key === status) || { key: status, label: status, customer: "" };
}

export const statusLabel = (type, status) => statusInfo(type, status).label;

export const isFinal = (type, status) => {
  const steps = REQUEST_TYPES[type]?.steps || [];
  return status === DECLINED.key || status === steps[steps.length - 1]?.key;
};

// Admin list tabs: new (waiting for a decision), active (in progress) and closed
export const STAGES = ["new", "active", "closed"];
export function stageOf(type, status) {
  if (status === "requested") return "new";
  return isFinal(type, status) ? "closed" : "active";
}
// Mongo filter on status for a stage, per type
export function stageStatuses(type, stage) {
  return statusesOf(type).filter((s) => stageOf(type, s) === stage);
}

// What the admin can do next: the next step, plus declining while it's still a new request
export function nextActions(type, status) {
  const steps = REQUEST_TYPES[type]?.steps || [];
  const i = steps.findIndex((s) => s.key === status);
  const actions = [];
  if (i >= 0 && i < steps.length - 1) actions.push({ to: steps[i + 1].key, label: steps[i + 1].action });
  if (status === "requested") actions.push({ to: DECLINED.key, label: "Decline", danger: true });
  return actions;
}

// ── Request codes ──────────────────────────────────────────────────────────────

// No 0/O, 1/I/L: codes get read out over the phone and typed from WhatsApp
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export function generateCode(type, random = Math.random) {
  let body = "";
  for (let i = 0; i < CODE_LENGTH; i++) body += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return `${REQUEST_TYPES[type].prefix}-${body}`;
}

// "rt 7k3f9q", "RT7K3F9Q" → "RT-7K3F9Q"; anything else → ""
export function normalizeCode(input) {
  const raw = String(input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const prefixes = Object.values(REQUEST_TYPES).map((t) => t.prefix);
  const prefix = prefixes.find((p) => raw.startsWith(p));
  const body = prefix ? raw.slice(prefix.length) : "";
  if (body.length !== CODE_LENGTH || [...body].some((c) => !CODE_ALPHABET.includes(c))) return "";
  return `${prefix}-${body}`;
}

export const typeOfCode = (code) =>
  Object.keys(REQUEST_TYPES).find((t) => String(code).startsWith(`${REQUEST_TYPES[t].prefix}-`)) || null;

// ── Who can see a request ──────────────────────────────────────────────────────

// Last 10 digits, so 0803…, 803… and +234803… all match
const phoneKey = (p) => String(p ?? "").replace(/\D/g, "").slice(-10);

// The /track page asks for the email or phone on the order alongside the code
export function contactMatches(request, contact) {
  const value = String(contact || "").trim();
  if (!value) return false;
  if (value.includes("@")) return Boolean(request.email) && request.email.toLowerCase() === value.toLowerCase();
  const key = phoneKey(value);
  return key.length === 10 && phoneKey(request.phone) === key;
}

export const maskAccount = (n) => {
  const digits = String(n || "").replace(/\D/g, "");
  return digits ? `••••${digits.slice(-4)}` : "";
};

// ── Who can open one ───────────────────────────────────────────────────────────

// Returns: within the return window after delivery (lib/returns.js).
// Refunds: before delivery (incl. cancelled orders), or within that same window after it.
export function canRequest(type, order, now = new Date()) {
  const status = normalizeStatusKey(order?.status);
  if (status === "returned") return false;
  const deadline = getReturnDeadline(order);
  const windowOpen = Boolean(deadline) && now <= deadline;
  if (type === "return") return windowOpen;
  if (type === "refund") {
    if (order.paymentStatus && order.paymentStatus !== "paid") return false; // nothing to refund
    return status !== "delivered" || windowOpen;
  }
  return false;
}
