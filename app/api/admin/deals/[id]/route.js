// app/api/admin/deals/[id]/route.js — PUT edits a deal (or just { active }), DELETE removes it
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Deal from "@/models/Deal";
import { parseDealBody } from "../parse";

export const dynamic = "force-dynamic";

export async function PUT(req, context) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "Invalid deal" }, { status: 400 });

  const body = await req.json().catch(() => null);
  await connectDB();

  // Pausing or resuming only
  if (body && Object.keys(body).length === 1 && typeof body.active === "boolean") {
    const deal = await Deal.findByIdAndUpdate(id, { active: body.active }, { new: true });
    return deal ? NextResponse.json(deal) : NextResponse.json({ message: "Deal not found" }, { status: 404 });
  }

  const { deal, error } = parseDealBody(body);
  if (error) return NextResponse.json({ message: error }, { status: 400 });
  const updated = await Deal.findByIdAndUpdate(id, deal, { new: true, runValidators: true });
  return updated ? NextResponse.json(updated) : NextResponse.json({ message: "Deal not found" }, { status: 404 });
}

export async function DELETE(req, context) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "Invalid deal" }, { status: 400 });
  await connectDB();
  await Deal.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
