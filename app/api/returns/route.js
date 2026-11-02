// app/api/returns/route.js — a signed-in customer's refund and return requests
// POST — open one for an item on their order: { type, orderId, itemIndex, quantity, reason,
//        condition (returns), bankName / accountNumber / accountName (refunds) }
// GET  — ?orderId= → their requests on that order, for the order page
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { sendEmail } from "@/lib/mailer";
import { buildRequestAdminEmail, buildRequestStatusEmail } from "@/lib/emails/supportEmails";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Order from "@/models/Order";
import ReturnRefund from "@/models/ReturnRefund";
import { getReturnDeadline, formatReturnDate } from "@/lib/returns";
import { canRequest, generateCode, isFinal, isRequestType, statusLabel } from "@/lib/returnRefund";
import { trackLink } from "@/lib/trackLinks";

export const dynamic = "force-dynamic";

const clean = (v, max = 500) => String(v ?? "").trim().slice(0, max);
const bad = (message, status = 400) => NextResponse.json({ message }, { status });

// Same ownership rule as GET /api/orders: their account, or guest orders with their email
async function findOwnOrder(req, orderId) {
  const user = verifyToken(req.cookies.get("token")?.value);
  if (!user?.id) return { error: bad("Please log in first", 401) };
  if (!mongoose.isValidObjectId(orderId)) return { error: bad("Order not found", 404) };
  await connectDB();
  const owner = user.email ? { $or: [{ userId: user.id }, { email: user.email }] } : { userId: user.id };
  const order = await Order.findOne({ _id: orderId, ...owner }).collation({ locale: "en", strength: 2 }).lean();
  if (!order) return { error: bad("Order not found", 404) };
  return { user, order };
}

export async function GET(req) {
  const orderId = new URL(req.url).searchParams.get("orderId");
  const { error, order } = await findOwnOrder(req, orderId);
  if (error) return error;
  const requests = await ReturnRefund.find({ orderId: order._id })
    .sort({ createdAt: -1 })
    .select("code type status itemIndex createdAt")
    .lean();
  return NextResponse.json({
    requests: requests.map((r) => ({ ...r, statusLabel: statusLabel(r.type, r.status), open: !isFinal(r.type, r.status) })),
  });
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = body.type;
    if (!isRequestType(type)) return bad("Choose a refund or a return");

    const { error, user, order } = await findOwnOrder(req, body.orderId);
    if (error) return error;

    const itemIndex = Number(body.itemIndex);
    const item = Number.isInteger(itemIndex) ? order.items?.[itemIndex] : null;
    if (!item) return bad("That item isn't on this order");

    const maxQty = Number(item.quantity) || 1;
    const quantity = Math.floor(Number(body.quantity));
    if (!(quantity >= 1 && quantity <= maxQty)) return bad(`Quantity must be between 1 and ${maxQty}`);

    const reason = clean(body.reason, 2000);
    if (!reason) return bad("Tell us the reason");
    const condition = type === "return" ? clean(body.condition, 200) : "";
    if (type === "return" && !condition) return bad("Tell us the condition of the item");

    const bank = type === "refund"
      ? { bankName: clean(body.bankName, 100), accountNumber: clean(body.accountNumber, 20).replace(/\D/g, ""), accountName: clean(body.accountName, 150) }
      : {};
    if (type === "refund") {
      if (!bank.bankName || !bank.accountName) return bad("Enter your bank and account name");
      if (bank.accountNumber.length !== 10) return bad("Account numbers are 10 digits");
    }

    if (!canRequest(type, order)) {
      const deadline = getReturnDeadline(order);
      return bad(
        deadline
          ? `Requests for this order closed on ${formatReturnDate(deadline)}. Please contact support.`
          : type === "return"
            ? "Returns open once your order has been delivered."
            : "This order can't be refunded online. Please contact support."
      );
    }

    // One open request of each kind per item
    const existing = await ReturnRefund.findOne({ orderId: order._id, itemIndex, type }).sort({ createdAt: -1 }).lean();
    if (existing && !isFinal(type, existing.status)) {
      return NextResponse.json(
        { message: `You already have a ${type} request for this item (${existing.code})`, code: existing.code },
        { status: 409 }
      );
    }

    const fields = {
      type,
      orderId: order._id,
      userId: user.id,
      itemIndex,
      item: {
        productId: String(item.productId || item._id || ""),
        name: item.name || "Product",
        image: item.image || "",
        color: item.color || "",
        price: Number(item.price) || 0,
      },
      quantity,
      reason,
      condition,
      firstName: order.firstName || "",
      lastName: order.lastName || "",
      email: order.email || user.email || "",
      phone: order.phone != null ? String(order.phone) : "",
      ...(type === "return" && { address: order.address || "", city: order.city || "", region: order.region?.name || "" }),
      bank,
      amount: type === "refund" ? (Number(item.price) || 0) * quantity : 0,
      history: [{ status: "requested" }],
    };

    // Codes are random; retry the rare clash with an existing one
    let request;
    for (let attempt = 0; !request; attempt++) {
      try {
        request = await ReturnRefund.create({ ...fields, code: generateCode(type) });
      } catch (err) {
        if (err?.code !== 11000 || attempt >= 4) throw err;
      }
    }

    const plain = request.toObject();
    const trackUrl = trackLink(request.code);
    const admin = buildRequestAdminEmail(plain);
    const customer = buildRequestStatusEmail(plain, trackUrl);
    // The request is saved either way; a mail hiccup shouldn't make the customer resubmit
    await Promise.allSettled([
      sendEmail(process.env.ADMIN_EMAIL, admin.subject, admin.text, admin.html, [], { replyTo: plain.email || undefined }),
      plain.email && sendEmail(plain.email, customer.subject, customer.text, customer.html),
    ]);

    return NextResponse.json({ message: "Request sent", code: request.code, trackUrl }, { status: 201 });
  } catch (err) {
    console.error("Refund/return request failed:", err);
    return bad("We couldn't send your request. Please try again.", 500);
  }
}
