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

  const welcomeEmailHtml = `
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
      padding: 50px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
    }
    .header p {
      margin: 15px 0 0 0;
      font-size: 18px;
      opacity: 0.95;
    }
    .celebration {
      font-size: 60px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.8;
    }
    .greeting {
      font-size: 20px;
      color: #333;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .message {
      font-size: 16px;
      color: #fff;
      margin-bottom: 30px;
    }
    .promo-box {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 30px;
      margin: 30px 0;
      border-radius: 10px;
      text-align: center;
    }
    .promo-box h2 {
      margin: 0 0 15px 0;
      font-size: 24px;
    }
    .promo-code {
      background-color: white;
      color: #1cc978;
      padding: 15px 30px;
      font-size: 28px;
      font-weight: bold;
      border-radius: 8px;
      display: inline-block;
      margin: 15px 0;
      letter-spacing: 3px;
      font-family: 'Courier New', monospace;
      border: 3px dashed #16a05f;
    }
    .promo-details {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 10px;
    }
    .features-box {
      background-color: #f8f9fa;
      border-left: 4px solid #1cc978;
      padding: 25px;
      margin: 30px 0;
      border-radius: 5px;
    }
    .features-box h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 20px;
    }
    .feature-item {
      display: flex;
      align-items: start;
      margin: 15px 0;
      color: #fff;
    }
    .feature-icon {
      font-size: 24px;
      margin-right: 15px;
      flex-shrink: 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 18px 50px;
      text-decoration: none;
      border-radius: 30px;
      margin: 20px 0;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
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
    .divider {
      height: 2px;
      background: linear-gradient(to right, transparent, #1cc978, transparent);
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="celebration">🎉</div>
      <h1>Welcome to FIL Store!</h1>
      <p>We're thrilled to have you join our family</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${firstName},
      </div>
      
      <div class="message">
        <p>We're so excited to welcome you to the <strong>Fedan Investment Limited (FIL)</strong> community! 🎉</p>
        
        <p>At FIL, we don't just make accessories – we believe in empowering people by giving them the tools they need to stay connected, productive, and unstoppable. Every product we create is built with care, empathy, and a drive to make your everyday life a little easier.</p>
      </div>
      
      <div class="promo-box">
        <h2>🎁 Your Welcome Gift</h2>
        <p style="margin: 0 0 10px 0; font-size: 18px;">Enjoy <strong>10% OFF</strong> your first order!</p>
        <div class="promo-code">WELCOME10</div>
        <div class="promo-details">
          Valid for the next 14 days • Use at checkout
        </div>
      </div>
      
      <div class="features-box">
        <h3>🌟 What Makes FIL Special?</h3>
        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <div>
            <strong>Quality Products:</strong> From power banks that keep you charged on the go, to accessories designed to fit seamlessly into your lifestyle.
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">💚</div>
          <div>
            <strong>Customer First:</strong> We're not just here to sell to you—we're here to grow with you. Your satisfaction is our priority.
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🛡️</div>
          <div>
            <strong>Built with Care:</strong> Every product is created with empathy and a commitment to making your life easier and more connected.
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://filstore.com.ng/products" class="cta-button">Start Shopping Now</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="color: #666; font-size: 15px; text-align: center;">
        We're not just a store—we're a community. Welcome aboard, and thank you for trusting FIL. We're honored to be part of your journey! 💙
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>The FIL Team</strong></p>
      <p style="margin: 0 0 20px 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
      <p>Visit us at <a href="https://filstore.com.ng">filstore.com.ng</a></p>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        Need help? Contact us at filfilecommerce@gmail.com
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const plainText = `
Hi ${firstName},

We're so excited to welcome you to the Fedan Investment Limited (FIL) community! 🎉

At FIL, we don't just make accessories – we believe in empowering people by giving them the tools they need to stay connected, productive, and unstoppable. Every product we create is built with care, empathy, and a drive to make your everyday life a little easier.

🎁 YOUR WELCOME GIFT
Enjoy 10% off your first order.
Use code: WELCOME10 at checkout
Valid for the next 14 days

WHAT MAKES FIL SPECIAL?
⚡ Quality Products - From power banks that keep you charged on the go, to accessories designed to fit seamlessly into your lifestyle.
💚 Customer First - We're not just here to sell to you—we're here to grow with you.
🛡️ Built with Care - Every product is created with empathy and commitment.

Start shopping now: https://filstore.com.ng/products

Welcome aboard—we're thrilled to have you with us!

Warm regards,
The FIL Team
Think Quality, Think FIL.

Need help? Contact us at filfilecommerce@gmail.com
  `.trim();

  await sendEmail(
    email,
    "Welcome to FIL Store! 🎉",
    plainText,
    welcomeEmailHtml
  );
}