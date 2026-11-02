// app/api/admin/returns/[id]/route.js
// GET   — one refund/return request
// PATCH — { status?, customerNote?, adminNote?, refundedAmount?, refundReference? }
//         A status change is added to the history and emailed to the customer, with
//         customerNote as the message from the team.
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { buildRequestStatusEmail } from "@/lib/emails/supportEmails";
import ReturnRefund from "@/models/ReturnRefund";
import { statusesOf } from "@/lib/returnRefund";
import { trackLink } from "@/lib/trackLinks";

export const dynamic = "force-dynamic";

async function findRequest(context) {
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  return ReturnRefund.findById(id);
}

const notFound = () => NextResponse.json({ message: "Request not found" }, { status: 404 });

export async function GET(req, context) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const request = await findRequest(context);
  if (!request) return notFound();
  return NextResponse.json({ request, trackUrl: trackLink(request.code) }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req, context) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const request = await findRequest(context);
  if (!request) return notFound();

  const body = await req.json().catch(() => ({}));
  const bad = (message) => NextResponse.json({ message }, { status: 400 });

  if (body.customerNote !== undefined) request.customerNote = String(body.customerNote).trim().slice(0, 1000);
  if (body.adminNote !== undefined) request.adminNote = String(body.adminNote).trim().slice(0, 2000);
  if (body.refundReference !== undefined) request.refundReference = String(body.refundReference).trim().slice(0, 100);
  if (body.refundedAmount !== undefined) {
    const amount = body.refundedAmount === "" || body.refundedAmount === null ? null : Number(body.refundedAmount);
    if (amount !== null && !(amount >= 0)) return bad("Enter the amount you refunded");
    request.refundedAmount = amount;
  }

  const statusChanged = body.status !== undefined && body.status !== request.status;
  if (statusChanged) {
    if (!statusesOf(request.type).includes(body.status)) return bad("That status doesn't apply here");
    if (body.status === "refunded" && (request.refundedAmount == null || !request.refundReference)) {
      return bad("Add the amount and transfer reference before marking it refunded");
    }
    if (body.status === "rejected" && !request.customerNote) return bad("Tell the customer why it was declined");
    request.status = body.status;
    request.history.push({ status: body.status, note: request.customerNote });
  }

  await request.save();

  let emailed = false;
  if (statusChanged && request.email) {
    const { subject, text, html } = buildRequestStatusEmail(request.toObject(), trackLink(request.code));
    emailed = Boolean(await sendEmail(request.email, subject, text, html).catch(() => null));
  }

  return NextResponse.json({ request, emailed });
}
