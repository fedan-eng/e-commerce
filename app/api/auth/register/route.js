import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateCode } from "@/lib/utils";
import { sendEmail } from "@/lib/mailer";
import PendingVerification from "@/models/PendingVerification";

export async function POST(req) {
  await connectDB();
  const { email, password, firstName } = await req.json();

  const existingPending = await PendingVerification.findOne({ email });

  if (existingPending) {
    const isExpired = existingPending.verificationCodeExpiry < new Date();

    if (!isExpired) {
      return new Response(
        JSON.stringify({ redirect: true, email }),
        { status: 200 }
      );
    }

    // Code expired — delete the old record and allow re-registration
    await PendingVerification.deleteOne({ email });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const code = generateCode();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await PendingVerification.create({
    email,
    hashedPassword,
    verificationCode: code,
    verificationCodeExpiry: expiry,
    firstName,
  });

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
      color: #555;
      margin-bottom: 30px;
    }
    .code-box {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px;
      margin: 30px 0;
    }
    .code-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    .verification-code {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 8px;
      margin: 10px 0;
      font-family: 'Courier New', monospace;
    }
    .expiry-note {
      font-size: 13px;
      opacity: 0.9;
      margin-top: 10px;
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
      color: #555;
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
      .verification-code {
        font-size: 28px;
        letter-spacing: 5px;
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
        
        <p>To complete your signup and start shopping, please verify your email address using the code below:</p>
      </div>
      
      <div class="code-box">
        <div class="code-label">YOUR VERIFICATION CODE</div>
        <div class="verification-code">${code}</div>
        <div class="expiry-note">⏰ This code expires in 10 minutes</div>
      </div>
      
      <div class="info-box">
        <p>💡 <strong>Tip:</strong> Copy and paste the code above into the verification page to complete your registration.</p>
      </div>
      
      <div class="message">
        <p>If you didn't create an account with FIL Store, you can safely ignore this email.</p>
        
        <p>Once verified, you'll have access to:</p>
        <ul style="color: #555; line-height: 2;">
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

Your verification code is: ${code}

This code will expire in 10 minutes.

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

  return Response.json({ message: "Verification code sent to email" });
}