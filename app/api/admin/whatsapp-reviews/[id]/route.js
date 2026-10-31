// app/api/admin/whatsapp-reviews/[id]/route.js
// PATCH  — edit a screenshot (imageUrl, placements, note, published)
// DELETE — remove it
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import WhatsAppReview from "@/models/WhatsAppReview";
import { cleanPlacements, isHttpUrl, revalidatePlacements } from "@/lib/whatsappReviews";

async function findReview(context) {
  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectDB();
  return WhatsAppReview.findById(id);
}

export async function PATCH(req, context) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const review = await findReview(context);
  if (!review) return NextResponse.json({ message: "Review not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const before = [...review.placements];

  if (body.imageUrl !== undefined) {
    const imageUrl = String(body.imageUrl).trim();
    if (!isHttpUrl(imageUrl)) return NextResponse.json({ message: "Enter a valid image link (https://…)" }, { status: 400 });
    review.imageUrl = imageUrl;
  }
  if (body.placements !== undefined) {
    const placements = cleanPlacements(body.placements);
    if (!placements.length) return NextResponse.json({ message: "Pick at least one page to show it on" }, { status: 400 });
    review.placements = placements;
  }
  if (body.note !== undefined) review.note = String(body.note).trim().slice(0, 120);
  if (body.published !== undefined) review.published = Boolean(body.published);

  await review.save();
  // Pages it left need rebuilding too
  revalidatePlacements([...before, ...review.placements]);
  return NextResponse.json({ review });
}

export async function DELETE(req, context) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const review = await findReview(context);
  if (!review) return NextResponse.json({ message: "Review not found" }, { status: 404 });

  await review.deleteOne();
  revalidatePlacements(review.placements);
  return NextResponse.json({ message: "Deleted" });
}
