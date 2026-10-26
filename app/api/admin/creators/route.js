// app/api/admin/creators/route.js
// GET ?from&to — every creator code with link visits, add-to-carts, credited orders, sales and
// commission, plus a day-by-day series, top products and devices for the Creators page.
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import PromoCode from "@/models/PromoCode";
import { toClient } from "@/lib/promoCodes";
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
  const docs = await PromoCode.find({ type: "creator" }).sort({ createdAt: 1, _id: 1 }).lean();
  const creators = docs.map(toClient).map((c) => ({ ...c, code: c.code.toUpperCase() }));
  const { byCode, daily, products, devices } = await creatorAnalytics({ codes: creators.map((c) => c.code), from, to });

  return NextResponse.json(
    {
      creators: creators.map((c) => {
        const s = byCode[c.code];
        return {
          ...c,
          stats: { ...s, commission: (s.sales * c.commissionPercent) / 100 },
          products: products[c.code] || [],
          devices: devices[c.code] || { mobile: 0, tablet: 0, desktop: 0 },
        };
      }),
      daily,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
