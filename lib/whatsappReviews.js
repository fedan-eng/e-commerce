// lib/whatsappReviews.js — WhatsApp screenshot reviews managed from the admin console
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import WhatsAppReview from "@/models/WhatsAppReview";
import { CATEGORIES } from "@/lib/categories";

// Where a screenshot can appear: the homepage or any category page
export const PLACEMENTS = [
  { value: "home", label: "Homepage", path: "/" },
  ...Object.values(CATEGORIES).map((c) => ({ value: c.slug, label: c.title, path: `/products/${c.slug}` })),
];
const PLACEMENT_VALUES = PLACEMENTS.map((p) => p.value);

export const cleanPlacements = (list) =>
  [...new Set((Array.isArray(list) ? list : []).filter((p) => PLACEMENT_VALUES.includes(p)))];

export const isHttpUrl = (url) => {
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
};

// Published screenshots for one placement, in the admin's order → [{ id, src }]
// Never throws: a DB hiccup only hides the section.
export async function getWhatsAppReviews(placement) {
  try {
    await connectDB();
    const docs = await WhatsAppReview.find({ placements: placement, published: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select("imageUrl")
      .lean();
    return docs.map((d) => ({ id: String(d._id), src: d.imageUrl }));
  } catch (err) {
    console.error(`getWhatsAppReviews(${placement}) failed:`, err);
    return [];
  }
}

// Rebuild the storefront pages that show these placements
export function revalidatePlacements(placements) {
  for (const value of new Set(placements)) {
    const path = PLACEMENTS.find((p) => p.value === value)?.path;
    if (!path) continue;
    try {
      revalidatePath(path);
    } catch (err) {
      console.error(`revalidatePath(${path}) failed:`, err);
    }
  }
}
