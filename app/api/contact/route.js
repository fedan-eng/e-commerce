// app/api/contact/route.js
// Handles general inquiries, complaints/redress, and suggestions.
// Sends email to admin with inquiry type + optional order context.

import { sendEmail } from "@/lib/mailer";

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

    const INQUIRY_LABELS = {
      general:    "💬 General Question",
      redress:    "⚠️ Complaint / Redress",
      suggestion: "💡 Suggestion / Recommendation",
    };

    const label = INQUIRY_LABELS[inquiryType] || inquiryType;

    const subject = `[FIL Contact] ${label} from ${name}`;

    const html = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5;">
        <div style="background:linear-gradient(135deg,#1cc978,#16a05f);padding:24px 30px;">
          <h2 style="margin:0;color:#fff;font-size:20px;">New Contact Form Submission</h2>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">${label}</p>
        </div>
        <div style="padding:28px 30px;color:#333;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#767676;width:140px;vertical-align:top;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#767676;vertical-align:top;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#16a05f;">${email}</a></td></tr>
            ${orderId     ? `<tr><td style="padding:8px 0;color:#767676;vertical-align:top;">Order ID</td><td style="padding:8px 0;font-family:monospace;">#${orderId}</td></tr>` : ""}
            ${productName ? `<tr><td style="padding:8px 0;color:#767676;vertical-align:top;">Product</td><td style="padding:8px 0;">${productName}</td></tr>` : ""}
            ${reason      ? `<tr><td style="padding:8px 0;color:#767676;vertical-align:top;">Reason</td><td style="padding:8px 0;">${reason}</td></tr>` : ""}
            ${attachments.length > 0 ? `<tr><td style="padding:8px 0;color:#767676;vertical-align:top;">Attachments</td><td style="padding:8px 0;">${attachments.length} file(s) attached</td></tr>` : ""}
          </table>
          <div style="margin-top:20px;padding:16px;background:#f8f9fa;border-left:4px solid #1cc978;border-radius:4px;">
            <p style="margin:0;font-size:13px;color:#767676;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Message</p>
            <p style="margin:0;font-size:14px;line-height:1.7;white-space:pre-wrap;">${question}</p>
          </div>
        </div>
        <div style="padding:16px 30px;background:#f8f9fa;font-size:12px;color:#aaa;text-align:center;">
          Sent from FIL Store contact form · filstore.com.ng
        </div>
      </div>
    `;

    const plain = `New contact form submission\n\nType: ${label}\nName: ${name}\nEmail: ${email}${orderId ? `\nOrder: #${orderId}` : ""}${productName ? `\nProduct: ${productName}` : ""}${reason ? `\nReason: ${reason}` : ""}${attachments.length > 0 ? `\nAttachments: ${attachments.length} file(s)` : ""}\n\nMessage:\n${question}`;

    // Send to admin WITH attachments
    await sendEmail(process.env.ADMIN_EMAIL, subject, plain, html, attachments);

    // Send confirmation to user
    const confirmHtml = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5;">
        <div style="background:linear-gradient(135deg,#1cc978,#16a05f);padding:30px;text-align:center;">
          <div style="font-size:36px;margin-bottom:8px;">✅</div>
          <h2 style="margin:0;color:#fff;font-size:22px;">We've received your message!</h2>
        </div>
        <div style="padding:30px;color:#333;line-height:1.8;">
          <p style="font-size:16px;">Hi <strong>${name}</strong>,</p>
          <p style="color:#555;">Thank you for reaching out. We've received your ${inquiryType === "redress" ? "complaint" : inquiryType === "suggestion" ? "suggestion" : "message"} and our team will get back to you within <strong>24–48 hours</strong>.</p>
          ${orderId ? `<p style="color:#555;">This is regarding order <strong>#${orderId}</strong>.</p>` : ""}
          <p style="color:#555;">In the meantime, feel free to browse our store or check your order status.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="https://filstore.com.ng/products" style="display:inline-block;background:linear-gradient(135deg,#1cc978,#16a05f);color:#fff;padding:12px 32px;text-decoration:none;border-radius:30px;font-weight:700;font-size:14px;">Continue Shopping</a>
          </div>
        </div>
        <div style="padding:20px 30px;background:#f8f9fa;text-align:center;color:#666;font-size:13px;">
          <p style="margin:0 0 4px;"><strong>The FIL Team</strong></p>
          <p style="margin:0;font-style:italic;color:#16a05f;">Think Quality, Think FIL.</p>
        </div>
      </div>
    `;

    await sendEmail(email, "We received your message — FIL Store", `Hi ${name}, we've received your message and will respond within 24–48 hours.\n\nThink Quality, Think FIL.\nhttps://filstore.com.ng`, confirmHtml);

    return new Response(JSON.stringify({ message: "Message sent successfully! We'll get back to you within 24–48 hours." }), { status: 200 });
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(JSON.stringify({ message: "Failed to send message. Please try again." }), { status: 500 });
  }
}