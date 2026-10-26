// app/api/admin/promocodes/route.js
// GET  ?from&to — every code with its order stats for that range (all time without one)
// POST — create a code
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import PromoCode from "@/models/PromoCode";
import { EMPTY_STATS, parsePromoBody, promoStats, toClient } from "@/lib/promoCodes";
import { creatorAnalytics } from "@/lib/creatorStats";

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
  const codes = await PromoCode.find().sort({ createdAt: -1, _id: -1 }).lean();
  const creatorCodes = codes.filter((c) => c.type === "creator").map((c) => c.code.toUpperCase());
  const [stats, credited] = await Promise.all([
    promoStats({ from, to }),
    creatorAnalytics({ codes: creatorCodes, from, to }),
  ]);

  // Creator rows count every order credited to them, including link orders where nothing was typed
  const statsFor = (c) => {
    const code = c.code.toUpperCase();
    if (c.type !== "creator") return stats[code] || EMPTY_STATS;
    const { orders, cancelled, sales, customers, lastOrder } = credited.byCode[code];
    // Discount stays what this code itself took off (a link order may have used another code)
    return { ...EMPTY_STATS, orders, cancelled, sales, customers, discount: stats[code]?.discount || 0, lastUsed: lastOrder };
  };

  return NextResponse.json(
    { codes: codes.map((c) => ({ ...toClient(c), stats: statsFor(c) })) },
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
