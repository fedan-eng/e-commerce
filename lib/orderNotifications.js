// lib/orderNotifications.js — the emails that go out once a paid order is saved: the customer's
// confirmation and the admin's "new order" alert. Shared by verify-payment and the Paystack webhook.
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { sendEmail } from "@/lib/mailer";
import { buildOrderStatusEmail, buildNewOrderAdminEmail } from "@/lib/emails/orderEmails";

// The photo of the order item with this name (support and return emails only get the name)
export const itemImage = (order, productName) =>
  (order?.items || []).find((i) => i.name === productName)?.image || "";

// Same, when the route only has the order id. Never throws: a missing photo shouldn't block an email.
export async function itemImageById(orderId, productName) {
  if (!productName || !mongoose.isValidObjectId(orderId)) return "";
  try {
    await connectDB();
    return itemImage(await Order.findById(orderId).select("items").lean(), productName);
  } catch {
    return "";
  }
}

export async function sendOrderConfirmationEmails(order) {
  const customer = buildOrderStatusEmail(order, "confirmed");
  const admin = buildNewOrderAdminEmail(order);
  await Promise.all([
    sendEmail(order.email, customer.subject, customer.text, customer.html),
    sendEmail(process.env.ADMIN_EMAIL, admin.subject, admin.text, admin.html),
  ]);
}
