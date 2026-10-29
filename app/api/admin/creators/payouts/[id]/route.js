// app/api/admin/creators/payouts/[id]/route.js
// DELETE — remove a payout recorded by mistake
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import CreatorPayout from "@/models/CreatorPayout";

export async function DELETE(req, context) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ message: "Payout not found" }, { status: 404 });

  await connectDB();
  const payout = await CreatorPayout.findByIdAndDelete(id);
  if (!payout) return NextResponse.json({ message: "Payout not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
