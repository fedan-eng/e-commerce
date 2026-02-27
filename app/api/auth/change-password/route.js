import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/mailer";
import jwt from "jsonwebtoken";

// 🔹 Middleware to check user from JWT (cookie-based auth)
async function authenticate(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Not authenticated");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id; // user id
  } catch {
    throw new Error("Invalid or expired token");
  }
}

export async function PUT(req) {
  await connectDB();
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ message: "Missing fields" }), {
        status: 400,
      });
    }

    // 🔑 Authenticate user
    const userId = await authenticate(req);
    const user = await User.findById(userId);
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // ❌ Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return new Response(
        JSON.stringify({ message: "Current password is incorrect" }),
        { status: 400 }
      );
    }

    // 🔒 Hash and update password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.8;
    }
    .success-box {
      background-color: #d4edda;
      border-left: 4px solid #1cc978;
      padding: 25px;
      margin: 30px 0;
      border-radius: 5px;
      text-align: center;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #1cc978;
      padding: 20px;
      margin: 30px 0;
      border-radius: 5px;
    }
    .info-item {
      display: flex;
      align-items: center;
      margin: 10px 0;
      color: #555;
    }
    .info-item span {
      margin-right: 10px;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
      font-size: 14px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #777;
      font-size: 14px;
    }
    .footer a {
      color: #1cc978;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🔐 Password Changed</h1>
      <p>Security Notification</p>
    </div>
    
    <div class="content">
      <p>Hi ${user.firstName || 'there'},</p>
      
      <div class="success-box">
        <div class="success-icon">✅</div>
        <h2 style="margin: 0; color: #1cc978; font-size: 22px;">Password Successfully Updated</h2>
        <p style="margin: 10px 0 0 0; color: #666;">Your FIL Store account password has been changed.</p>
      </div>
      
      <p>This email confirms that your password was successfully changed on <strong>${new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</strong>.</p>
      
      <div class="info-box">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Account Details</h3>
        <div class="info-item">
          <span>📧</span>
          <span><strong>Email:</strong> ${user.email}</span>
        </div>
        <div class="info-item">
          <span>👤</span>
          <span><strong>Name:</strong> ${user.firstName} ${user.lastName || ''}</span>
        </div>
        <div class="info-item">
          <span>📱</span>
          <span><strong>Phone:</strong> ${user.phone || 'Not provided'}</span>
        </div>
      </div>
      
      <div class="warning">
        ⚠️ <strong>Didn't make this change?</strong><br>
        If you didn't change your password, your account may be compromised. Please contact our support team immediately at support@filstore.com.ng or call us.
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        <strong>Security Tips:</strong>
      </p>
      <ul style="color: #666; font-size: 14px; line-height: 1.8;">
        <li>Never share your password with anyone</li>
        <li>Use a unique password for your FIL Store account</li>
        <li>Enable two-factor authentication if available</li>
        <li>Change your password regularly</li>
      </ul>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>The FIL Team</strong></p>
      <p style="margin: 0 0 20px 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
      <p>Visit us at <a href="https://filstore.com.ng">filstore.com.ng</a></p>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        This is an automated security notification.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const plainText = `
Hi ${user.firstName || 'there'},

Your FIL Store account password has been successfully changed.

Change Date: ${new Date().toLocaleString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

Account Details:
- Email: ${user.email}
- Name: ${user.firstName} ${user.lastName || ''}
- Phone: ${user.phone || 'Not provided'}

⚠️ IMPORTANT: If you didn't make this change, please contact our support team immediately at support@filstore.com.ng

Security Tips:
- Never share your password with anyone
- Use a unique password for your FIL Store account
- Enable two-factor authentication if available
- Change your password regularly

The FIL Team
Think Quality, Think FIL.
Visit: https://filstore.com.ng
    `.trim();

    // 📧 Send confirmation email
    await sendEmail(
      user.email,
      "Password Changed Successfully - FIL Store",
      plainText,
      emailHtml
    );

    return new Response(
      JSON.stringify({ message: "Password changed successfully" }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    });
  }
}