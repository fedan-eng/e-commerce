import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import User from "@/models/User";

export async function POST(req) {
  await connectDB();
  const { email, password, firstName, lastName } = await req.json();

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // If user exists but is not verified, resend verification email
    if (!existingUser.isVerified) {
      // Check if token is expired (older than 24 hours)
      const isTokenExpired = existingUser.verificationTokenExpiry < new Date();
      
      if (isTokenExpired || !existingUser.verificationToken) {
        // Generate new token
        const verificationToken = signToken({ email });
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        existingUser.verificationToken = verificationToken;
        existingUser.verificationTokenExpiry = verificationTokenExpiry;
        await existingUser.save();
      }

      const origin = req.headers.get("origin") || req.headers.get("host") || "https://filstore.com.ng";
      const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;
      const verificationLink = `${baseUrl}/verify-email?token=${existingUser.verificationToken}`;

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
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.8;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      color: #333;
      margin-bottom: 30px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .verify-button {
      display: inline-block;
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .expiry-note {
      font-size: 13px;
      color: #666;
      text-align: center;
      margin-top: 15px;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #1cc978;
      padding: 20px;
      margin: 30px 0;
      border-radius: 5px;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #333;
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
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header {
        padding: 30px 20px;
      }
      .verify-button {
        padding: 14px 30px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>✉️ Verify Your Email</h1>
      <p>Welcome to FIL Store</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${existingUser.firstName || "there"},
      </div>
      
      <div class="message">
        <p>We noticed you haven't verified your email yet. Here's a fresh verification link to complete your signup:</p>
      </div>
      
      <div class="button-container">
        <a href="${verificationLink}" class="verify-button">Verify My Email</a>
        <div class="expiry-note">⏰ This link expires in 24 hours</div>
      </div>
      
      <div class="info-box">
        <p>💡 <strong>Tip:</strong> Can't click the button? Copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #1cc978; font-size: 12px; margin-top: 8px;">${verificationLink}</p>
      </div>
      
      <div class="message">
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>The FIL Team</strong></p>
      <p style="margin: 0 0 20px 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
      <p>Visit us at <a href="https://filstore.com.ng">filstore.com.ng</a></p>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        This is an automated email. Please do not reply directly to this message.
      </p>
    </div>
  </div>
</body>
</html>
`;

      const plainText = `
Hi ${existingUser.firstName || "there"},

We noticed you haven't verified your email yet. Here's a fresh verification link to complete your signup:

${verificationLink}

This link will expire in 24 hours.

If you did not create an account with FIL, please ignore this message.

Thanks,
The FIL Team
Think Quality, Think FIL
`.trim();

      await sendEmail(
        existingUser.email,
        "Verify your email - FIL Store",
        plainText,
        emailHtml
      );

      return Response.json({ message: "Verification email resent. Please check your inbox." });
    }

    // User already verified
    return new Response(
      JSON.stringify({ message: "User already exists and is verified. Please login." }),
      { status: 400 }
    );
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  
  // Generate verification token (24hr expiry)
  const verificationToken = signToken({ email });
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create user with verification token
  await User.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    isVerified: false,
    verificationToken,
    verificationTokenExpiry,
  });

  const origin = req.headers.get("origin") || req.headers.get("host") || "https://filstore.com.ng";
  const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;
  const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;

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
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.8;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      color: #333;
      margin-bottom: 30px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .verify-button {
      display: inline-block;
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .expiry-note {
      font-size: 13px;
      color: #666;
      text-align: center;
      margin-top: 15px;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #1cc978;
      padding: 20px;
      margin: 30px 0;
      border-radius: 5px;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #333;
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
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header {
        padding: 30px 20px;
      }
      .verify-button {
        padding: 14px 30px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>✉️ Verify Your Email</h1>
      <p>Welcome to FIL Store</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${firstName},
      </div>
      
      <div class="message">
        <p>Welcome to <strong>Fedan Investment Limited (FIL)</strong>! We're excited to have you join our family. 💚</p>
        
        <p>To complete your signup and start shopping, simply click the button below to verify your email address:</p>
      </div>
      
      <div class="button-container">
        <a href="${verificationLink}" class="verify-button">Verify My Email</a>
        <div class="expiry-note">⏰ This link expires in 24 hours</div>
      </div>
      
      <div class="info-box">
        <p>💡 <strong>Tip:</strong> Can't click the button? Copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #1cc978; font-size: 12px; margin-top: 8px;">${verificationLink}</p>
      </div>
      
      <div class="message">
        <p>If you didn't create an account with FIL Store, you can safely ignore this email.</p>
        
        <p>Once verified, you'll have access to:</p>
        <ul style="color: #333; line-height: 2;">
          <li>✓ Exclusive deals and promotions</li>
          <li>✓ Order tracking and history</li>
          <li>✓ Faster checkout experience</li>
          <li>✓ Priority customer support</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>The FIL Team</strong></p>
      <p style="margin: 0 0 20px 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
      <p>Visit us at <a href="https://filstore.com.ng">filstore.com.ng</a></p>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        This is an automated email. Please do not reply directly to this message.
      </p>
    </div>
  </div>
</body>
</html>
`;

  const plainText = `
Hi ${firstName},

Welcome to Fedan Investment Limited (FIL)! To complete your signup, please verify your email address.

Click the link below to verify your email:
${verificationLink}

This link will expire in 24 hours.

If you did not create an account with FIL, please ignore this message.

Thanks,
The FIL Team
Think Quality, Think FIL
`.trim();

  await sendEmail(
    email,
    "Verify your email - FIL Store",
    plainText,
    emailHtml
  );

  return Response.json({ message: "Verification email sent. Please check your inbox." });
}