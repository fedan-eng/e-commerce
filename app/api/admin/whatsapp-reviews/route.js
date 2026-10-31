// app/api/admin/whatsapp-reviews/route.js
// GET  — every screenshot (admin list) plus the placement options
// POST — add a screenshot
// PUT  — save the carousel order
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import WhatsAppReview from "@/models/WhatsAppReview";
import { PLACEMENTS, cleanPlacements, isHttpUrl, revalidatePlacements } from "@/lib/whatsappReviews";

export async function GET(req) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  await connectDB();
  const reviews = await WhatsAppReview.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  return NextResponse.json({
    reviews,
    placements: PLACEMENTS.map(({ value, label }) => ({ value, label })),
  });
}

export async function POST(req) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const imageUrl = (body.imageUrl || "").trim();
  const placements = cleanPlacements(body.placements);

  if (!isHttpUrl(imageUrl)) return NextResponse.json({ message: "Enter a valid image link (https://…)" }, { status: 400 });
  if (!placements.length) return NextResponse.json({ message: "Pick at least one page to show it on" }, { status: 400 });

  await connectDB();
  // New screenshots go to the front of the carousel
  const first = await WhatsAppReview.findOne().sort({ sortOrder: 1 }).select("sortOrder").lean();
  const review = await WhatsAppReview.create({
    imageUrl,
    placements,
    note: (body.note || "").trim().slice(0, 120),
    published: body.published !== false,
    sortOrder: (first?.sortOrder ?? 1) - 1,
  });

  revalidatePlacements(placements);
  return NextResponse.json({ review }, { status: 201 });
}

// PUT — save the carousel order: { order: [id, id, …] }, first id shows first
export async function PUT(req) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { order } = await req.json().catch(() => ({}));
  if (!Array.isArray(order) || !order.every((id) => mongoose.Types.ObjectId.isValid(id))) {
    return NextResponse.json({ message: "Invalid order" }, { status: 400 });
  }

  await connectDB();
  await WhatsAppReview.bulkWrite(
    order.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { sortOrder: i } } } }))
  );

  const touched = await WhatsAppReview.find({ _id: { $in: order } }).select("placements").lean();
  revalidatePlacements(touched.flatMap((r) => r.placements));
  return NextResponse.json({ message: "Order saved" });
}
