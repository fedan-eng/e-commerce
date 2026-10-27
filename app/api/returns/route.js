import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { sendEmail } from "@/lib/mailer";
import { buildReturnRequestAdminEmail } from "@/lib/emails/supportEmails";
import { itemImage } from "@/lib/orderNotifications";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Order from "@/models/Order";
import { isReturnOpen, getReturnDeadline, formatReturnDate } from "@/lib/returns";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      productCondition,
      returnQuantity,
      reasonForReturn,
      bankName,
      accountNumber,
      accountName,
      amount,
      address,
      region,
      city,
      phone,
      orderId,
      productName,
      productPrice,
    } = body;

    // Validate input
    if (
      !productCondition ||
      !returnQuantity ||
      !reasonForReturn ||
      !bankName ||
      !accountNumber ||
      !accountName
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Only the customer's own delivered orders, within the return window
    const user = verifyToken(req.cookies.get("token")?.value);
    if (!user?.id) {
      return NextResponse.json({ message: "Please log in to request a return" }, { status: 401 });
    }
    if (!mongoose.isValidObjectId(orderId)) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    await connectDB();
    // Same ownership rule as GET /api/orders: their account, or guest orders with their email
    const owner = user.email ? { $or: [{ userId: user.id }, { email: user.email }] } : { userId: user.id };
    const order = await Order.findOne({ _id: orderId, ...owner })
      .collation({ locale: "en", strength: 2 })
      .select("status statusHistory items email")
      .lean();
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    if (!isReturnOpen(order)) {
      const deadline = getReturnDeadline(order);
      return NextResponse.json(
        {
          message: deadline
            ? `The return window for this order closed on ${formatReturnDate(deadline)}. Please contact support.`
            : "Returns open once your order has been delivered.",
        },
        { status: 400 }
      );
    }

    const { subject, html, text } = buildReturnRequestAdminEmail({
      orderId, productName, productPrice, returnQuantity, productCondition, reasonForReturn,
      productImage: itemImage(order, productName),
      phone, address, city, region, amount, bankName, accountNumber, accountName,
    });
    await sendEmail(process.env.ADMIN_EMAIL, subject, text, html, [], { replyTo: user.email || order.email });

    return NextResponse.json({ message: "Return request sent successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error sending return request" },
      { status: 500 }
    );
  }
}