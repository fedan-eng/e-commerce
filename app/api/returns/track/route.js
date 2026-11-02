// app/api/returns/track/route.js — the public /track page.
// POST { code, contact } (the email or phone on the order) or { code, key } (signed email link)
// → what the customer may see of their refund/return. No login needed.
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ReturnRefund from "@/models/ReturnRefund";
import { contactMatches, maskAccount, normalizeCode, statusInfo, REQUEST_TYPES } from "@/lib/returnRefund";
import { verifyTrackKey } from "@/lib/trackLinks";
import { shortId } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

const NOT_FOUND = "We couldn't find a request with those details. Check the ID and the email or phone you ordered with.";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const code = normalizeCode(body.code);
  if (!code) return NextResponse.json({ message: "Enter your request ID, e.g. RT-7K3F9Q" }, { status: 400 });

  await connectDB();
  const r = await ReturnRefund.findOne({ code }).lean();
  // Same answer for a wrong code and a wrong contact, so IDs can't be checked one by one
  const allowed = r && (body.key ? verifyTrackKey(code, body.key) : contactMatches(r, body.contact));
  if (!allowed) return NextResponse.json({ message: NOT_FOUND }, { status: 404 });

  const steps = REQUEST_TYPES[r.type].steps.map(({ key, label }) => ({ key, label }));
  return NextResponse.json({
    request: {
      code: r.code,
      type: r.type,
      typeLabel: REQUEST_TYPES[r.type].label,
      status: r.status,
      statusLabel: statusInfo(r.type, r.status).label,
      statusMessage: statusInfo(r.type, r.status).customer,
      steps,
      history: (r.history || []).map(({ status, date }) => ({ status, label: statusInfo(r.type, status).label, date })),
      customerNote: r.customerNote || "",
      order: `#${shortId(r.orderId)}`,
      item: { name: r.item.name, image: r.item.image, color: r.item.color, price: r.item.price },
      quantity: r.quantity,
      reason: r.reason,
      createdAt: r.createdAt,
      firstName: r.firstName,
      ...(r.type === "refund" && {
        refundTo: `${r.bank?.bankName || ""} ${maskAccount(r.bank?.accountNumber)}`.trim(),
        amount: r.status === "refunded" ? r.refundedAmount ?? r.amount : r.amount,
        refundReference: r.status === "refunded" ? r.refundReference || "" : "",
      }),
      ...(r.type === "return" && { deliverTo: [r.address, r.city, r.region].filter(Boolean).join(", ") }),
    },
  });
}
