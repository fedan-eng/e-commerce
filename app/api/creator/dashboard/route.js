// app/api/creator/dashboard/route.js
// GET ?from&to — the signed-in creator's customers, orders, commission and payouts.
// Admins add ?code=CODE to see what that creator sees. Buyers show by first name only.
import { NextResponse } from "next/server";
import { creatorAccess } from "@/lib/creatorAccess";
import { creatorDashboard } from "@/lib/creatorStats";

export const dynamic = "force-dynamic";

const dateParam = (v) => {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d) ? d : null;
};

export async function GET(req) {
  const { denied, user, promos, asAdmin } = await creatorAccess(req);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const rates = Object.fromEntries(promos.map((p) => [p.code.toUpperCase(), Number(p.commissionPercent) || 0]));
  const data = await creatorDashboard({ rates, from: dateParam(searchParams.get("from")), to: dateParam(searchParams.get("to")) });

  return NextResponse.json(
    {
      creator: {
        name: promos[0]?.creatorName || user.firstName || "",
        handle: promos[0]?.creatorHandle || "",
        codes: promos.map((p) => ({
          code: p.code.toUpperCase(),
          discount: Number(p.discount) || 0,
          commissionPercent: Number(p.commissionPercent) || 0,
          active: p.active !== false,
        })),
      },
      asAdmin,
      ...data,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
