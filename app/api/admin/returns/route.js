// app/api/admin/returns/route.js
// GET ?type=refund|return&stage=new|active|closed&search=&page=&limit=
//     → { requests, total, counts: { refund: { new, active, closed }, return: { … } } }
//     Without type, both kinds are listed (the sidebar badge uses ?stage=new&limit=1).
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import ReturnRefund from "@/models/ReturnRefund";
import { REQUEST_TYPES, STAGES, isRequestType, stageStatuses } from "@/lib/returnRefund";

export const dynamic = "force-dynamic";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Status filter for one stage, across one type or both
function stageFilter(stage, types) {
  return { $or: types.map((type) => ({ type, status: { $in: stageStatuses(type, stage) } })) };
}

export async function GET(req) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const params = new URL(req.url).searchParams;
  const type = params.get("type");
  const stage = params.get("stage");
  const search = (params.get("search") || "").trim();
  const page = Math.max(1, parseInt(params.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.get("limit")) || 20));
  const types = isRequestType(type) ? [type] : Object.keys(REQUEST_TYPES);

  const and = [{ type: { $in: types } }];
  if (STAGES.includes(stage)) and.push(stageFilter(stage, types));
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    const digits = search.replace(/\D/g, "");
    and.push({
      $or: [
        { code: rx }, { firstName: rx }, { lastName: rx }, { email: rx }, { "item.name": rx },
        ...(digits.length >= 4 ? [{ phone: new RegExp(escapeRegex(digits.slice(-10))) }] : []),
      ],
    });
  }
  const query = { $and: and };

  await connectDB();
  const [requests, total, ...countList] = await Promise.all([
    ReturnRefund.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("code type status item quantity amount firstName lastName phone createdAt updatedAt")
      .lean(),
    ReturnRefund.countDocuments(query),
    ...Object.keys(REQUEST_TYPES).flatMap((t) => STAGES.map((s) => ReturnRefund.countDocuments(stageFilter(s, [t])))),
  ]);

  const counts = {};
  Object.keys(REQUEST_TYPES).forEach((t, ti) => {
    counts[t] = Object.fromEntries(STAGES.map((s, si) => [s, countList[ti * STAGES.length + si]]));
  });

  return NextResponse.json(
    { requests, total, page, totalPages: Math.max(1, Math.ceil(total / limit)), counts },
    { headers: { "Cache-Control": "no-store" } }
  );
}
