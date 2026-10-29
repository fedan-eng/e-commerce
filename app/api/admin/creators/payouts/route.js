// app/api/admin/creators/payouts/route.js
// GET  ?code=CODE — that creator's payouts and balance (earned, pending, paid out, owed)
// POST { code, amount, paidAt?, note? } — record money sent to a creator
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin, verifyToken } from "@/lib/auth";
import PromoCode from "@/models/PromoCode";
import CreatorPayout from "@/models/CreatorPayout";
import { creatorDashboard } from "@/lib/creatorStats";

export const dynamic = "force-dynamic";

const findCreator = (code) =>
  PromoCode.findOne({ code: String(code || "").trim().toUpperCase(), type: "creator" })
    .collation({ locale: "en", strength: 2 })
    .lean();

async function payoutsFor(promo) {
  const code = promo.code.toUpperCase();
  const { balance, payouts } = await creatorDashboard({ rates: { [code]: Number(promo.commissionPercent) || 0 } });
  return { code, balance, payouts };
}

export async function GET(req) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  await connectDB();
  const promo = await findCreator(new URL(req.url).searchParams.get("code"));
  if (!promo) return NextResponse.json({ message: "Creator code not found" }, { status: 404 });

  return NextResponse.json(await payoutsFor(promo), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const amount = Math.round(Number(body.amount) * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ message: "Enter an amount above ₦0" }, { status: 400 });
  const paidAt = body.paidAt ? new Date(body.paidAt) : new Date();
  if (isNaN(paidAt)) return NextResponse.json({ message: "Payment date isn't valid" }, { status: 400 });

  await connectDB();
  const promo = await findCreator(body.code);
  if (!promo) return NextResponse.json({ message: "Creator code not found" }, { status: 404 });

  await CreatorPayout.create({
    code: promo.code.toUpperCase(),
    amount,
    paidAt,
    note: String(body.note || "").trim().slice(0, 200),
    recordedBy: verifyToken(req.cookies.get("token")?.value)?.id || null,
  });

  return NextResponse.json(await payoutsFor(promo), { status: 201 });
}
