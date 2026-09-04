import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateCode } from "@/lib/utils";
import { sendEmail } from "@/lib/mailer";
import { signToken, verifyToken } from "@/lib/auth";

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resetCode = generateCode();
  const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);
  
  const resetToken = signToken({ email });
  const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.resetPasswordCode = resetCode;
  user.resetPasswordExpiry = codeExpiry;
  user.resetPasswordToken = resetToken;
  user.resetPasswordTokenExpiry = tokenExpiry;
  await user.save();

  const origin = req.headers.get("origin") || req.headers.get("host") || "https://filstore.com.ng";
  const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;
  const resetLink = `${baseUrl}/reset-password/token?token=${resetToken}`;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
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
    .code-box {
      background-color: #f8f9fa;
      border: 2px dashed #1cc978;
      padding: 30px;
      margin: 30px 0;
      border-radius: 10px;
      text-align: center;
    }
    .code {
      font-size: 36px;
      font-weight: bold;
      color: #1cc978;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #777;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
      <p>FIL Store</p>
    </div>
    
    <div class="content">
      <p>Hi ${user.firstName || 'there'},</p>
      
      <p>We received a request to reset your password for your FIL Store account.</p>
      
      <p>You can reset your password by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          Reset My Password
        </a>
      </div>
      
      <p style="text-align: center; font-size: 14px; color: #666; margin: 20px 0;">or</p>
      
      <p>Use the code below to reset your password:</p>
      
      <div class="code-box">
        <div class="code">${resetCode}</div>
        <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
          This code expires in <strong>10 minutes</strong>
        </p>
      </div>
      
      <div class="warning">
        ⚠️ <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email and your password will remain unchanged.
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        For security reasons, this code can only be used once and will expire after 10 minutes.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0;"><strong>The FIL Team</strong></p>
      <p style="margin: 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
    </div>
  </div>
</body>
</html>
  `;

  const plainText = `
Hi ${user.firstName || 'there'},

We received a request to reset your password for your FIL Store account.

You can reset your password by clicking this link:
${resetLink}

Or use this reset code: ${resetCode}

Both the link and code expire in 10 minutes.

If you didn't request this password reset, please ignore this email.

The FIL Team
Think Quality, Think FIL.
  `.trim();

  await sendEmail(
    email,
    "Password Reset Request - FIL Store",
    plainText,
    emailHtml
  );

  return new Response(JSON.stringify({ message: "Reset code sent" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({ message: "Missing token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return new Response(JSON.stringify({ message: "Invalid or expired token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (user.resetPasswordToken !== token || new Date() > user.resetPasswordTokenExpiry) {
    return new Response(JSON.stringify({ message: "Invalid or expired token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ valid: true, email: user.email }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PATCH(req) {
  await connectDB();
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return new Response(JSON.stringify({ message: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return new Response(JSON.stringify({ message: "Invalid or expired token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (user.resetPasswordToken !== token || new Date() > user.resetPasswordTokenExpiry) {
    return new Response(
      JSON.stringify({ message: "Invalid or expired reset token" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordCode = undefined;
  user.resetPasswordExpiry = undefined;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiry = undefined;

  await user.save();

  const successEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
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
      padding: 20px;
      margin: 30px 0;
      border-radius: 5px;
      text-align: center;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #777;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>✅ Password Reset Successful</h1>
      <p>FIL Store</p>
    </div>
    
    <div class="content">
      <p>Hi ${user.firstName || 'there'},</p>
      
      <div class="success-box">
        <h2 style="margin: 0; color: #1cc978;">🎉 Success!</h2>
        <p style="margin: 10px 0 0 0;">Your password has been successfully reset.</p>
      </div>
      
      <p>You can now log in to your FIL Store account using your new password.</p>
      
      <p style="margin-top: 30px;">If you didn't make this change or believe an unauthorized person has accessed your account, please contact our support team immediately.</p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0;"><strong>The FIL Team</strong></p>
      <p style="margin: 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
    </div>
  </div>
</body>
</html>
  `;

  const successPlainText = `
Hi ${user.firstName || 'there'},

Your password has been successfully reset.

You can now log in to your FIL Store account using your new password.

If you didn't make this change, please contact our support team immediately.

The FIL Team
Think Quality, Think FIL.
  `.trim();

  await sendEmail(
    email,
    "Password Reset Successful - FIL Store",
    successPlainText,
    successEmailHtml
  );

  return new Response(
    JSON.stringify({ message: "Password reset successfully" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function PUT(req) {
  await connectDB();
  const { email, resetCode, newPassword } = await req.json();

  if (!email || !resetCode || !newPassword) {
    return new Response(JSON.stringify({ message: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check if resetCode matches either the numeric code or the token
  const isCodeValid = user.resetPasswordCode === resetCode && new Date() <= user.resetPasswordExpiry;
  const isTokenValid = user.resetPasswordToken === resetCode && new Date() <= user.resetPasswordTokenExpiry;

  if (!isCodeValid && !isTokenValid) {
    return new Response(
      JSON.stringify({ message: "Invalid or expired reset code/token" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordCode = undefined;
  user.resetPasswordExpiry = undefined;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiry = undefined;

  await user.save();

  const successEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
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
      padding: 20px;
      margin: 30px 0;
      border-radius: 5px;
      text-align: center;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #777;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>✅ Password Reset Successful</h1>
      <p>FIL Store</p>
    </div>
    
    <div class="content">
      <p>Hi ${user.firstName || 'there'},</p>
      
      <div class="success-box">
        <h2 style="margin: 0; color: #1cc978;">🎉 Success!</h2>
        <p style="margin: 10px 0 0 0;">Your password has been successfully reset.</p>
      </div>
      
      <p>You can now log in to your FIL Store account using your new password.</p>
      
      <p style="margin-top: 30px;">If you didn't make this change or believe an unauthorized person has accessed your account, please contact our support team immediately.</p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0;"><strong>The FIL Team</strong></p>
      <p style="margin: 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
    </div>
  </div>
</body>
</html>
  `;

  const successPlainText = `
Hi ${user.firstName || 'there'},

Your password has been successfully reset.

You can now log in to your FIL Store account using your new password.

If you didn't make this change, please contact our support team immediately.

The FIL Team
Think Quality, Think FIL.
  `.trim();

  await sendEmail(
    email,
    "Password Reset Successful - FIL Store",
    successPlainText,
    successEmailHtml
  );

  return new Response(
    JSON.stringify({ message: "Password reset successfully" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}