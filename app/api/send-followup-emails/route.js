import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { sendEmail } from "@/lib/mailer";

export const config = {
  schedule: "* 10 * * *", // runs every day at 10 AM UTC
};

export async function GET() {
  await connectDB();

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    //const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const orders = await Order.find({
      createdAt: { $lte: sevenDaysAgo },
      followUpSent: false,
    });

    // const orders = await Order.find({
    //   createdAt: { $lte: fiveMinutesAgo },
    //   followUpSent: false,
    // });

    for (const order of orders) {
      const productNames = order.items.map((i) => i.name).join(", ");
      
      const followUpEmailHtml = `
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
    .emoji-large {
      font-size: 50px;
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
      color: #555;
      margin-bottom: 30px;
    }
    .product-box {
      background-color: #f8f9fa;
      border-left: 4px solid #1cc978;
      padding: 20px;
      margin: 25px 0;
      border-radius: 5px;
    }
    .product-box h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 18px;
    }
    .product-name {
      color: #1cc978;
      font-weight: 600;
      font-size: 16px;
    }
    .rating-section {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 30px;
      margin: 30px 0;
      border-radius: 10px;
      text-align: center;
    }
    .rating-section h2 {
      margin: 0 0 15px 0;
      font-size: 24px;
    }
    .star-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin: 20px 0;
    }
    .star-button {
      font-size: 32px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .cta-button {
      display: inline-block;
      background-color: white;
      color: #1cc978;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 30px;
      margin: 15px 0;
      font-weight: 600;
      font-size: 16px;
      border: 3px solid rgba(255,255,255,0.3);
    }
    .support-box {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 20px;
      margin: 30px 0;
      border-radius: 5px;
    }
    .support-box h3 {
      margin: 0 0 15px 0;
      color: #1565c0;
      font-size: 18px;
    }
    .support-item {
      display: flex;
      align-items: center;
      margin: 10px 0;
      color: #555;
    }
    .support-icon {
      font-size: 20px;
      margin-right: 10px;
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
      <div class="emoji-large">💙</div>
      <h1>How's Everything Going?</h1>
      <p>We'd love to hear from you</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${order.firstName},
      </div>
      
      <div class="message">
        <p>We hope your new purchase is already making life a little easier for you! 🎉</p>
        
        <div class="product-box">
          <h3>📦 Your Order:</h3>
          <div class="product-name">${productNames}</div>
        </div>
        
        <p>At FIL, we see every product as more than just an accessory — it's a way to keep you connected, productive, and empowered to do more with your day. Your trust means the world to us, and we're honored you chose to make us part of your journey. 💙</p>
      </div>
      
      <div class="rating-section">
        <h2>⭐ Share Your Experience</h2>
        <p style="margin: 0 0 20px 0; font-size: 16px; opacity: 0.95;">
          Your feedback helps us serve you and our entire FIL family better
        </p>
        <div class="star-buttons">
          <span class="star-button">⭐</span>
          <span class="star-button">⭐</span>
          <span class="star-button">⭐</span>
          <span class="star-button">⭐</span>
          <span class="star-button">⭐</span>
        </div>
        <a href="https://filstore.com.ng/products" class="cta-button">Rate Your Product</a>
        <p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">
          Takes less than a minute!
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 16px; color: #555; line-height: 1.8;">
          We'd love to hear how your experience has been so far. Your voice not only helps us improve — it helps us care better for every member of our FIL family.
        </p>
      </div>
      
      <div class="support-box">
        <h3>💬 We're Here For You</h3>
        <p style="margin: 0 0 15px 0; color: #555;">
          Our support doesn't end after delivery. We're here whenever you need us:
        </p>
        <div class="support-item">
          <span class="support-icon">📧</span>
          <span>Email us at support@filstore.com.ng</span>
        </div>
        <div class="support-item">
          <span class="support-icon">📱</span>
          <span>Call our support team</span>
        </div>
        <div class="support-item">
          <span class="support-icon">💡</span>
          <span>Get quick tips and guidance</span>
        </div>
        <p style="margin: 15px 0 0 0; color: #555; font-size: 14px;">
          Whether it's for guidance, quick tips, or just to listen — we're only a message away.
        </p>
      </div>
      
      <div class="divider"></div>
      
      <p style="text-align: center; color: #666; font-size: 15px; line-height: 1.8;">
        Thank you once again for choosing FIL. We look forward to growing with you. 🌱
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>With Gratitude,</strong></p>
      <p style="margin: 0 0 5px 0; font-size: 16px; color: #333;"><strong>The FIL Team</strong></p>
      <p style="margin: 0 0 20px 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
      <p>Visit us at <a href="https://filstore.com.ng">filstore.com.ng</a></p>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        Need help? Contact us at support@filstore.com.ng
      </p>
    </div>
  </div>
</body>
</html>
      `;

      const plainText = `
Hi ${order.firstName},

We hope your new ${productNames} is already making life a little easier for you. 🎉

📦 YOUR ORDER: ${productNames}

At FIL, we see every product as more than just an accessory — it's a way to keep you connected, productive, and empowered to do more with your day. Your trust means the world to us, and we're honored you chose to make us part of your journey. 💙

⭐ SHARE YOUR EXPERIENCE
We'd love to hear how your experience has been so far. Your voice not only helps us improve — it helps us care better for every member of our FIL family.

You can rate your product directly by visiting:
https://filstore.com.ng/products

💬 WE'RE HERE FOR YOU
Our support doesn't end after delivery. We're here whenever you need us:
- Email: support@filstore.com.ng
- Call our support team
- Get quick tips and guidance

Whether it's for guidance, quick tips, or just to listen — we're only a message away.

Thank you once again for choosing FIL. We look forward to growing with you. 🌱

With gratitude,
The FIL Team
Think Quality, Think FIL.

Visit: https://filstore.com.ng
      `.trim();

      await sendEmail(
        order.email,
        "How's your FIL Store order? 💙",
        plainText,
        followUpEmailHtml
      );

      order.followUpSent = true;
      await order.save();
    }

    return new Response(
      JSON.stringify({ message: `Sent ${orders.length} follow-up emails.` }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error("Follow-up email error:", err);
    return new Response(
      JSON.stringify({
        message: "Error sending follow-up emails",
        error: err.message,
      }),
      { status: 500 }
    );
  }
}