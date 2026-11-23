// Shared by the admin deals routes: checks and cleans a deal from the admin form
import mongoose from "mongoose";

export function parseDealBody(body) {
  const title = String(body?.title || "").trim();
  const type = body?.type === "gift" ? "gift" : body?.type === "discount" ? "discount" : null;
  const products = [...new Set((body?.products || []).map(String))].filter((id) => mongoose.isValidObjectId(id));
  const quota = parseInt(body?.quota, 10);
  const percent = parseInt(body?.percent, 10);
  const gift = String(body?.gift || "").trim();

  if (!title) return { error: "Give the deal a title" };
  if (!type) return { error: "Choose a deal type" };
  if (products.length === 0) return { error: "Pick at least one product" };
  if (!(quota >= 1)) return { error: "The quota must be at least 1" };
  if (type === "discount" && !(percent >= 1 && percent <= 90)) return { error: "The discount must be between 1% and 90%" };
  if (type === "gift" && !gift) return { error: "Say what the free gift is" };

  const deal = {
    title, type, products, quota,
    percent: type === "discount" ? percent : undefined,
    gift: type === "gift" ? gift : "",
    active: body?.active !== false,
    sortOrder: parseInt(body?.sortOrder, 10) || 0,
  };
  // Lets the admin correct the count (e.g. after a cancelled order)
  if (body?.claimed !== undefined && body.claimed !== "") {
    const claimed = parseInt(body.claimed, 10);
    if (!(claimed >= 0)) return { error: "Claimed can't be negative" };
    deal.claimed = claimed;
  }
  return { deal };
}
