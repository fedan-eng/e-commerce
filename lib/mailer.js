import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text, html, attachments = []) => {
  try {
    console.log(`📧 Sending email to: ${to}`);
    
    const mailOptions = {
      from: `"FIL Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, // Plain text fallback
    };

    // If HTML is provided, add it
    if (html) {
      mailOptions.html = html;
    }

    // If attachments provided, add them
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email failed:`, error.message);
    throw error;
  }
};