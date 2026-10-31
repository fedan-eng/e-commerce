// lib/returns.js — the return window, shared by the order page and POST /api/returns
import { normalizeStatusKey } from "@/lib/orderStatus";

export const RETURN_DAYS = 7;

// When the order was delivered, or null if it isn't (yet). Uses the latest "delivered"
// history entry in any casing; old orders without one fall back to their last history date.
export function getDeliveredAt(order) {
  if (normalizeStatusKey(order?.status) !== "delivered") return null;
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
  const entry =
    [...history].reverse().find((h) => normalizeStatusKey(h.status) === "delivered") || history[history.length - 1];
  const date = entry?.date ? new Date(entry.date) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

// End of the last day returns are accepted, or null when the order isn't delivered
export function getReturnDeadline(order) {
  const deliveredAt = getDeliveredAt(order);
  if (!deliveredAt) return null;
  const deadline = new Date(deliveredAt);
  deadline.setDate(deadline.getDate() + RETURN_DAYS);
  deadline.setHours(23, 59, 59, 999);
  return deadline;
}

export function isReturnOpen(order, now = new Date()) {
  const deadline = getReturnDeadline(order);
  return Boolean(deadline) && now <= deadline;
}

export const formatReturnDate = (date) =>
  date.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
