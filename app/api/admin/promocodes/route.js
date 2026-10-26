// app/api/admin/promocodes/route.js
// GET  ?from&to — every code with its order stats for that range (all time without one)
// POST — create a code
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import PromoCode from "@/models/PromoCode";
import { EMPTY_STATS, parsePromoBody, promoStats, toClient } from "@/lib/promoCodes";

export const dynamic = "force-dynamic";

const dateParam = (v) => {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d) ? d : null;
};

export async function GET(req) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const from = dateParam(searchParams.get("from"));
  const to = dateParam(searchParams.get("to"));

  await connectDB();
  const [codes, stats] = await Promise.all([
    PromoCode.find().sort({ createdAt: -1, _id: -1 }).lean(),
    promoStats({ from, to }),
  ]);

  return NextResponse.json(
    { codes: codes.map((c) => ({ ...toClient(c), stats: stats[c.code.toUpperCase()] || EMPTY_STATS })) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const { data, error } = parsePromoBody(body, { isNew: true });
  if (error) return NextResponse.json({ message: error }, { status: 400 });

  await connectDB();
  const taken = await PromoCode.exists({ code: data.code }).collation({ locale: "en", strength: 2 });
  if (taken) return NextResponse.json({ message: `${data.code} already exists` }, { status: 409 });

  const promo = await PromoCode.create(data);
  return NextResponse.json({ code: { ...toClient(promo.toObject()), stats: EMPTY_STATS } }, { status: 201 });
}
