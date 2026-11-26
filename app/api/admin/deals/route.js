// app/api/admin/deals/route.js — Black Friday flash deals (models/Deal.js)
// GET — every deal with its products; POST — create one
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Deal from "@/models/Deal";
// Registers the Product model for .populate(); without it the first request on a fresh server fails
import "@/models/Product";
import { parseDealBody } from "./parse";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  await connectDB();
  const deals = await Deal.find().sort({ sortOrder: 1, createdAt: 1 }).populate("products", "name price image").populate("giftProduct", "name image").populate("giftProducts", "name image").lean();
  return NextResponse.json({ deals });
}

export async function POST(req) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { deal, error } = parseDealBody(await req.json().catch(() => null));
  if (error) return NextResponse.json({ message: error }, { status: 400 });
  await connectDB();
  const created = await Deal.create(deal);
  return NextResponse.json(created, { status: 201 });
}
