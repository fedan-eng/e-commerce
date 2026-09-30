// Shared order status constants and helpers
// Used across admin pages, API routes, and components

// Internal storage format (lowercase, no spaces)
export const STATUS_KEYS = {
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  INTRANSIT: "intransit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Display format (space-separated, Title Case)
export const STATUS_LABELS = {
  Confirmed: "Confirmed",
  Processing: "Processing",
  Shipped: "Shipped",
  InTransit: "In Transit",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
};

// Color codes for UI
export const STATUS_COLORS = {
  confirmed: "#e8c46a",
  pending: "#e8c46a",
  processing: "#6ab4e8",
  shipped: "#a06ae8",
  intransit: "#3b82f6",
  delivered: "#6ae8a0",
  cancelled: "#e86a6a",
};

// Timeline progression (canonical order)
export const TIMELINE_STEPS = ["Confirmed", "Processing", "Shipped", "In Transit", "Delivered"];

// All valid statuses for dropdowns
export const ALL_STATUSES = ["Confirmed", "Processing", "Shipped", "In Transit", "Delivered", "Cancelled"];

// API valid statuses (lowercase, no spaces)
export const API_STATUSES = [
  "confirmed",
  "processing",
  "shipped",
  "intransit",
  "delivered",
  "cancelled",
];

// Normalize status string to key format (lowercase, no spaces/hyphens/underscores)
export const normalizeStatusKey = (status) => {
  return status?.toLowerCase().replace(/[\s_-]/g, "") || "";
};

// Normalize status to display label (Title Case with spaces)
export const normalizeStatusLabel = (status) => {
  const key = normalizeStatusKey(status);
  const label = Object.entries(STATUS_LABELS).find(([k, v]) => normalizeStatusKey(k) === key);
  return label ? label[1] : status;
};

// Match any status format to canonical label
export const matchStatusLabel = (status) => {
  const key = normalizeStatusKey(status);
  return ALL_STATUSES.find(s => normalizeStatusKey(s) === key) || "";
};

// Get color for status
export const getStatusColor = (status) => {
  return STATUS_COLORS[normalizeStatusKey(status)] || "#888";
};

// Short ID helper (last 8 characters)
export const shortId = (id) => {
  return id ? String(id).slice(-8).toUpperCase() : "";
};

// Check if status is valid
export const isValidStatus = (status) => {
  return API_STATUSES.includes(normalizeStatusKey(status));
};
