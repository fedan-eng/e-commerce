import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { serialize } from "cookie";
import { sendEmail } from "@/lib/mailer";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login?error=${tokenData.error}`);
    }

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userResponse.json();

    await connectDB();

    // Check if user exists by Google ID
    let user = await User.findOne({ googleId: googleUser.id });

    if (!user) {
      // Check if user exists by email (account linking)
      user = await User.findOne({ email: googleUser.email });

      if (user) {
        // Link existing account with Google
        user.googleId = googleUser.id;
        user.provider = "google";
        await user.save();
      } else {
        // Create new user
        const nameParts = googleUser.name.split(" ");
        const firstName = nameParts[0] || "";
        user = await User.create({
          email: googleUser.email,
          googleId: googleUser.id,
          provider: "google",
          firstName: firstName,
          lastName: nameParts.slice(1).join(" ") || "",
          isActive: true,
        });

        // Send welcome email for new Google OAuth signup
        await sendGoogleWelcomeEmail(googleUser.email, firstName);
      }
    }

    // Issue JWT token (same as existing login flow)
    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      phone: user.phone,
      addPhone: user.addPhone,
      address: user.address,
      city: user.city,
      region: typeof user.region === "string" ? { name: user.region, fee: 0 } : user.region,
    });

    // Set cookie (same as existing login flow)
    const cookie = serialize("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/`);
    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login?error=server_error`);
  }
}

async function sendGoogleWelcomeEmail(email, firstName) {
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
    .success-box {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px;
      margin: 30px 0;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .success-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    .success-text {
      font-size: 20px;
      font-weight: bold;
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
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🎉 Welcome to FIL Store!</h1>
      <p>Your account has been created successfully</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${firstName},
      </div>
      
      <div class="message">
        <p>Welcome to <strong>Fedan Investment Limited (FIL)</strong>! We're thrilled to have you join our family. 💚</p>
        
        <p>Your account has been successfully created using Google Sign-In. You can now start shopping right away!</p>
      </div>
      
      <div class="success-box">
        <div class="success-icon">✓</div>
        <div class="success-label">ACCOUNT STATUS</div>
        <div class="success-text">Active & Verified</div>
      </div>
      
      <div class="info-box">
        <p>💡 <strong>Tip:</strong> You can now use either your Google account or email/password to sign in to your account.</p>
      </div>
      
      <div class="message">
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

Welcome to Fedan Investment Limited (FIL)!

Your account has been successfully created using Google Sign-In. You can now start shopping right away!

Your account is active and verified. You can use either your Google account or email/password to sign in.

Thanks,
The FIL Team
Think Quality, Think FIL
`.trim();

  await sendEmail(
    email,
    "Welcome to FIL Store!",
    plainText,
    emailHtml
  );
}
