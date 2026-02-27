import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import mailchimp from "@mailchimp/mailchimp_marketing";

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Add subscriber to Mailchimp
    try {
      await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID, {
        email_address: email,
        status: "subscribed",
        tags: ["website_signup"], // Optional: tag for tracking
      });
    } catch (mailchimpError) {
      // Handle if email already exists
      if (mailchimpError.status === 400 && mailchimpError.response?.body?.title === "Member Exists") {
        return NextResponse.json(
          { message: "You're already subscribed!" },
          { status: 400 }
        );
      }
      throw mailchimpError;
    }

    const newsletterEmailHtml = `
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
    }
    .message {
      font-size: 16px;
      color: #555;
      margin-bottom: 30px;
    }
    .promo-box {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 35px;
      margin: 30px 0;
      border-radius: 10px;
      text-align: center;
    }
    .promo-box h2 {
      margin: 0 0 10px 0;
      font-size: 26px;
    }
    .promo-label {
      font-size: 16px;
      opacity: 0.95;
      margin-bottom: 15px;
    }
    .promo-code {
      background-color: white;
      color: #1cc978;
      padding: 18px 35px;
      font-size: 32px;
      font-weight: bold;
      border-radius: 8px;
      display: inline-block;
      margin: 15px 0;
      letter-spacing: 4px;
      font-family: 'Courier New', monospace;
      border: 3px dashed #16a05f;
    }
    .discount-text {
      font-size: 48px;
      font-weight: bold;
      margin: 10px 0;
    }
    .benefits-box {
      background-color: #f8f9fa;
      border-left: 4px solid #1cc978;
      padding: 25px;
      margin: 30px 0;
      border-radius: 5px;
    }
    .benefits-box h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 20px;
    }
    .benefit-item {
      display: flex;
      align-items: start;
      margin: 15px 0;
      color: #555;
    }
    .benefit-icon {
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
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      text-decoration: none;
      font-size: 24px;
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
      <h1>You're In!</h1>
      <p>Welcome to Exclusive FIL Offers</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hey there! 👋
      </div>
      
      <div class="message">
        <p>Thanks for signing up for our exclusive offers! 🔥</p>
        
        <p>You're now part of the <strong>FIL family</strong> and you'll be the first to know about:</p>
      </div>
      
      <div class="benefits-box">
        <h3>📬 What You'll Get</h3>
        <div class="benefit-item">
          <div class="benefit-icon">🎁</div>
          <div>
            <strong>Exclusive Deals:</strong> Special discounts and offers just for subscribers
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">🆕</div>
          <div>
            <strong>New Arrivals:</strong> Be the first to see our latest products
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">⚡</div>
          <div>
            <strong>Flash Sales:</strong> Early access to limited-time promotions
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">💡</div>
          <div>
            <strong>Tips & Tricks:</strong> Tech tips and product care guides
          </div>
        </div>
      </div>
      
      <div class="promo-box">
        <h2>🎁 Here's Your Welcome Gift!</h2>
        <div class="promo-label">Use this code at checkout</div>
        <div class="promo-code">WELCOME10</div>
        <div class="discount-text">10% OFF</div>
        <p style="margin: 15px 0 0 0; font-size: 15px; opacity: 0.95;">
          On your first purchase • No minimum order
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
          Ready to explore? 🛍️
        </p>
        <a href="https://filstore.com.ng/products" class="cta-button">Start Shopping Now</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="color: #666; font-size: 15px; text-align: center; line-height: 1.8;">
        We're excited to have you with us! 😊<br>
        Stay tuned for amazing deals, new products, and more.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>The FIL Team</strong></p>
      <p style="margin: 0 0 20px 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
      
      <div class="social-links">
        <a href="https://facebook.com/filstore" style="color: #1877f2;">📘</a>
        <a href="https://instagram.com/filstore" style="color: #e4405f;">📷</a>
        <a href="https://twitter.com/filstore" style="color: #1da1f2;">🐦</a>
      </div>
      
      <p>Visit us at <a href="https://filstore.com.ng">filstore.com.ng</a></p>
      
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        You're receiving this because you subscribed to FIL Store newsletter.<br>
        <a href="https://filstore.com.ng/unsubscribe" style="color: #999;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const plainText = `
🎉 YOU'RE IN! WELCOME TO FIL EXCLUSIVE OFFERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hey there! 👋

Thanks for signing up for our exclusive offers! 🔥

You're now part of the FIL family and you'll be the first to know about:

📬 WHAT YOU'LL GET:
🎁 Exclusive Deals - Special discounts just for subscribers
🆕 New Arrivals - Be first to see latest products
⚡ Flash Sales - Early access to promotions
💡 Tips & Tricks - Tech tips and care guides

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎁 YOUR WELCOME GIFT!

Use promo code: WELCOME10
To enjoy: 10% OFF your first purchase
No minimum order required!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ready to explore? 🛍️
Shop now at: https://filstore.com.ng/products

We're excited to have you with us! 😊
Stay tuned for amazing deals, new products, and more.

— The FIL Team
Think Quality, Think FIL.

Visit: https://filstore.com.ng
    `.trim();

    // Send welcome email to user
    await sendEmail(
      email,
      "Welcome to FIL! Enjoy 10% OFF 🎉",
      plainText,
      newsletterEmailHtml
    );

    return NextResponse.json(
      { message: "Subscription successful — Check your inbox!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscription Error: ", error);
    return NextResponse.json(
      { message: "Something went wrong. Try again!" },
      { status: 500 }
    );
  }
}