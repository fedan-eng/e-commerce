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

export async function GET(req, context) {
  await connectDB();
  const { id } = await context.params;
  try {
    const order = await Order.findById(id);
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

    const { status } = await req.json();

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
function statusEmailOptions(order, status) {
  if (status !== "delivered") return {};
  const first = reviewableItems(order)[0];
  return first ? { ctaLink: reviewLink(order._id, productIdOf(first)) } : {};
}
