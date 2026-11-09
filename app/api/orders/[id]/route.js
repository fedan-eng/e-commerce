// app/api/orders/[id]/route.js

import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { normalizeStatusKey, API_STATUSES } from "@/lib/orderStatus";
import { countOrderSales, uncountOrderSales, UNSOLD_STATUSES } from "@/lib/soldCount";
import { productIdOf, reviewLink, reviewableItems } from "@/lib/reviews";
import { buildOrderStatusEmail } from "@/lib/emails/orderEmails";

const STATUS_UPDATE_EMAILS = ["processing", "shipped", "intransit", "delivered"];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// What anyone with the order number sees (the public tracker in components/Tracking.jsx):
// progress and items, never the customer's name, address, phone or email
const publicOrder = (o) => ({
  _id: o._id,
  status: o.status,
  statusHistory: o.statusHistory,
  items: (o.items || []).map(({ name, color, quantity, price, image }) => ({ name, color, quantity, price, image })),
  total: o.total,
  createdAt: o.createdAt,
});

// Admins, and the customer it belongs to (their account, or their email on a guest order)
function canSeeFullOrder(user, order) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (order.userId && String(order.userId) === String(user.id)) return true;
  return Boolean(user.email && order.email && user.email.toLowerCase() === order.email.toLowerCase());
}

// The full id, or the 8-character order number the emails show (#1C57B6D4), with or without the #
async function findOrderByNumber(raw) {
  const id = String(raw || "").trim().replace(/^#+/, "").trim();
  if (/^[0-9a-f]{24}$/i.test(id)) return Order.findById(id).lean();
  if (!/^[0-9a-f]{8}$/i.test(id)) return null;
  // Newest first, in the unlikely case two orders share the last 8 characters
  return Order.findOne({ orderNumber: id.toUpperCase() }).sort({ _id: -1 }).lean();
}

export async function GET(req, context) {
  await connectDB();
  const { id } = await context.params;
  try {
    const order = await findOrderByNumber(id);
    if (order && !canSeeFullOrder(verifyToken(req.cookies.get("token")?.value), order)) {
      return new Response(JSON.stringify({ order: publicOrder(order) }), {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }
    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }
    return new Response(JSON.stringify({ order }), {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  }
}

export async function PATCH(req, context) {
  await connectDB();
  const { id } = await context.params;

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return new Response(JSON.stringify({ message: "Admin access required" }), {
        status: 403,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    const body = await req.json();
    if (body.contact) return updateContact(id, body.contact, body.resendConfirmation === true);
    const { status } = body;

    // Normalize status using shared helper
    const normalizedStatus = normalizeStatusKey(status);

    if (!API_STATUSES.includes(normalizedStatus)) {
      return new Response(JSON.stringify({ message: "Invalid status" }), {
        status: 400,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    // Guard against same-status updates
    if (normalizeStatusKey(order.status) === normalizedStatus) {
      return new Response(JSON.stringify({ order }), {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    // Update status and push to history
    order.status = normalizedStatus;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: normalizedStatus,
      date: new Date(),
    });
    await order.save();

    // Cancelled/returned orders stop counting as sold; reinstated ones count again
    if (UNSOLD_STATUSES.includes(normalizedStatus)) await uncountOrderSales(order._id);
    else await countOrderSales(order._id);

    const customerEmail = order.email;
    // "confirmed" already got its email at checkout
    if (customerEmail && STATUS_UPDATE_EMAILS.includes(normalizedStatus)) {
      try {
        const { subject, html, text } = buildOrderStatusEmail(order, normalizedStatus, statusEmailOptions(order, normalizedStatus));
        await sendEmail(customerEmail, subject, text, html);
        console.log(
          `Status email sent to ${customerEmail} for status: ${normalizedStatus}`
        );
      } catch (emailErr) {
        console.error("Status email failed:", emailErr.message);
      }
    }

    return new Response(JSON.stringify({ order }), {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error) {
    console.error("PATCH error:", error.message);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  }
}

// The delivered email's button opens the review form for the first product (a signed link,
// so guests can review too)
// Admin fixing a customer's typo in their name, email or phone (admin order page, Customer card).
// resendConfirmation: send the order confirmation again, e.g. to a corrected email address.
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneDigits = (v) => String(v || "").replace(/\D/g, "");
const noStore = { "Cache-Control": "no-store, no-cache, must-revalidate" };

async function updateContact(id, contact, resendConfirmation) {
  const firstName = String(contact.firstName ?? "").trim();
  const lastName = String(contact.lastName ?? "").trim();
  const email = String(contact.email ?? "").trim().toLowerCase();
  const phone = phoneDigits(contact.phone);
  const addPhone = phoneDigits(contact.addPhone);

  const order = await Order.findById(id);
  if (!order) return Response.json({ message: "Order not found" }, { status: 404, headers: noStore });

  const online = order.source !== "manual";
  if (email && !EMAIL_RE.test(email)) return Response.json({ message: "That email address doesn't look right" }, { status: 400, headers: noStore });
  if (online && !email) return Response.json({ message: "Online orders need an email address" }, { status: 400, headers: noStore });
  for (const [label, value] of [["Phone", phone], ["Alternate phone", addPhone]]) {
    if (value && (value.length < 10 || value.length > 14)) {
      return Response.json({ message: `${label} should be 10 to 14 digits` }, { status: 400, headers: noStore });
    }
  }
  if (online && !phone) return Response.json({ message: "Online orders need a phone number" }, { status: 400, headers: noStore });
  if (online && (!firstName || !lastName)) return Response.json({ message: "Online orders need a first and last name" }, { status: 400, headers: noStore });

  const before = { firstName: order.firstName, lastName: order.lastName, email: order.email, phone: order.phone, addPhone: order.addPhone };
  order.firstName = firstName;
  order.lastName = lastName;
  order.email = email;
  order.phone = phone ? Number(phone) : undefined; // stored as a number (see models/Order.js)
  order.addPhone = addPhone;
  await order.save();
  console.log(`Order ${id} contact details edited:`, before, "→", { firstName, lastName, email, phone, addPhone });

  let emailed = false;
  if (resendConfirmation && order.email) {
    try {
      const { subject, html, text } = buildOrderStatusEmail(order, "confirmed");
      await sendEmail(order.email, subject, text, html);
      emailed = true;
    } catch (err) {
      console.error("Confirmation resend failed:", err.message);
    }
  }

  return Response.json({ order, emailed }, { status: 200, headers: noStore });
}

function statusEmailOptions(order, status) {
  if (status !== "delivered") return {};
  const first = reviewableItems(order)[0];
  return first ? { ctaLink: reviewLink(order._id, productIdOf(first)) } : {};
}
