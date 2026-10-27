// app/api/contact/route.js
// Handles general inquiries, complaints/redress, and suggestions.
// Sends email to admin with inquiry type + optional order context.

import { sendEmail } from "@/lib/mailer";
import { buildContactAdminEmail, buildContactReplyEmail } from "@/lib/emails/supportEmails";
import { itemImageById } from "@/lib/orderNotifications";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const inquiryType = formData.get("inquiryType") || "general";
    const name        = formData.get("name")        || "";
    const email       = formData.get("email")       || "";
    const question    = formData.get("question")    || "";
    const reason      = formData.get("reason")      || "";
    const productName = formData.get("productName") || "";
    const orderId     = formData.get("orderId")     || ""; // set when coming from order page

    if (!name || !email || !question) {
      return new Response(JSON.stringify({ message: "Name, email and message are required." }), { status: 400 });
    }

    // Extract files from FormData
    const files = formData.getAll("files") || [];
    const attachments = [];

    // Convert File objects to attachments for nodemailer
    for (const file of files) {
      if (file && file.size > 0) {
        const buffer = await file.arrayBuffer();
        attachments.push({
          filename: file.name,
          content: Buffer.from(buffer),
          contentType: file.type || "application/octet-stream",
        });
      }
    }

    const admin = buildContactAdminEmail({
      inquiryType, name, email, question, reason, productName, orderId, attachmentCount: attachments.length,
      productImage: await itemImageById(orderId, productName),
    });
    // Send to admin WITH attachments; replying goes straight to the customer
    await sendEmail(process.env.ADMIN_EMAIL, admin.subject, admin.text, admin.html, attachments, { replyTo: email });

    // Send confirmation to user
    const reply = buildContactReplyEmail({ inquiryType, name, question, orderId });
    await sendEmail(email, reply.subject, reply.text, reply.html);

    return new Response(JSON.stringify({ message: "Message sent successfully! We'll get back to you within 24–48 hours." }), { status: 200 });
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(JSON.stringify({ message: "Failed to send message. Please try again." }), { status: 500 });
  }
}