#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const TEST_EMAIL = 'excellenceay33@gmail.com';

// Email Templates
const templates = {
  otp: {
    subject: "Verify your email - FIL Store (TEST)",
    firstName: "Test User",
    code: "123456",
  },
  welcome: {
    subject: "Welcome to FIL Store 🎉 (TEST)",
    firstName: "Test User",
  },
  reset: {
    subject: "Password Reset Request - FIL Store (TEST)",
    firstName: "Test User",
    resetCode: "654321",
  },
  resetSuccess: {
    subject: "Password Reset Successful - FIL Store (TEST)",
    firstName: "Test User",
  },
  followup: {
    subject: "How's your FIL Store order? 💙 (TEST)",
    firstName: "Test User",
    productNames: "Premium Power Bank, Wireless Earbuds",
  },
};

// OTP/Verification Email Template
const getOtpEmail = (data) => {
  const html = `
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
        Hi ${data.firstName},
      </div>
      
      <div class="message">
        <p>Welcome to <strong>Fedan Investment Limited (FIL)</strong>! We're excited to have you join our family. 💚</p>
        
        <p>To complete your signup and start shopping, please verify your email address using the code below:</p>
      </div>
      
      <div class="code-box">
        <div class="code-label">YOUR VERIFICATION CODE</div>
        <div class="verification-code">${data.code}</div>
        <div class="expiry-note">⏰ This code expires in 10 minutes</div>
      </div>
      
      <div class="info-box">
        <p>💡 <strong>Tip:</strong> Copy and paste the code above into the verification page to complete your registration.</p>
      </div>
      
      <div class="message">
        <p>If you didn't create an account with FIL Store, you can safely ignore this email.</p>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>The FIL Team</strong></p>
      <p style="margin: 0 0 20px 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
      <p>Visit us at <a href="https://filstore.com.ng">filstore.com.ng</a></p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Hi ${data.firstName},

Welcome to Fedan Investment Limited (FIL)! To complete your signup, please verify your email address.

Your verification code is: ${data.code}

This code will expire in 10 minutes.

If you did not create an account with FIL, please ignore this message.

Thanks,
The FIL Team
Think Quality, Think FIL
`.trim();

  return { html, text };
};

// Welcome Email Template
const getWelcomeEmail = (data) => {
  const html = `
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
      color: #333;
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
      color: #333;
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
        Hi ${data.firstName},
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
        Need help? Contact us at support@filstore.com.ng
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Hi ${data.firstName},

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

Need help? Contact us at support@filstore.com.ng
`.trim();

  return { html, text };
};

// Password Reset Email Template
const getResetEmail = (data) => {
  const html = `
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
      <p>Hi ${data.firstName || 'there'},</p>
      
      <p>We received a request to reset your password for your FIL Store account.</p>
      
      <p>Use the code below to reset your password:</p>
      
      <div class="code-box">
        <div class="code">${data.resetCode}</div>
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
</html>`;

  const text = `
Hi ${data.firstName || 'there'},

We received a request to reset your password for your FIL Store account.

Your password reset code is: ${data.resetCode}

This code expires in 10 minutes.

If you didn't request this password reset, please ignore this email.

The FIL Team
Think Quality, Think FIL.
  `.trim();

  return { html, text };
};

// Password Reset Success Email Template
const getResetSuccessEmail = (data) => {
  const html = `
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
      <p>Hi ${data.firstName || 'there'},</p>
      
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
</html>`;

  const text = `
Hi ${data.firstName || 'there'},

Your password has been successfully reset.

You can now log in to your FIL Store account using your new password.

If you didn't make this change, please contact our support team immediately.

The FIL Team
Think Quality, Think FIL.
  `.trim();

  return { html, text };
};

// Follow-up Email Template
const getFollowupEmail = (data) => {
  const html = `
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
      color: #333;
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
      color: #333;
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
        Hi ${data.firstName},
      </div>
      
      <div class="message">
        <p>We hope your new purchase is already making life a little easier for you! 🎉</p>
        
        <div class="product-box">
          <h3>📦 Your Order:</h3>
          <div class="product-name">${data.productNames}</div>
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
        <p style="font-size: 16px; color: #333; line-height: 1.8;">
          We'd love to hear how your experience has been so far. Your voice not only helps us improve — it helps us care better for every member of our FIL family.
        </p>
      </div>
      
      <div class="support-box">
        <h3>💬 We're Here For You</h3>
        <p style="margin: 0 0 15px 0; color: #333;">
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
        <p style="margin: 15px 0 0 0; color: #333; font-size: 14px;">
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
</html>`;

  const text = `
Hi ${data.firstName},

We hope your new ${data.productNames} is already making life a little easier for you. 🎉

📦 YOUR ORDER: ${data.productNames}

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

  return { html, text };
};

// Get email content based on type
const getEmailContent = (type) => {
  switch (type) {
    case 'otp':
      return getOtpEmail(templates.otp);
    case 'welcome':
      return getWelcomeEmail(templates.welcome);
    case 'reset':
      return getResetEmail(templates.reset);
    case 'reset-success':
      return getResetSuccessEmail(templates.resetSuccess);
    case 'followup':
      return getFollowupEmail(templates.followup);
    default:
      return null;
  }
};

// Send email function
const sendEmail = async (to, subject, text, html) => {
  try {
    console.log(`📧 Sending email to: ${to}`);
    
    const mailOptions = {
      from: `"FIL Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email failed:`, error.message);
    throw error;
  }
};

// Main function
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node test-emails.js [option]');
    console.log('');
    console.log('Options:');
    console.log('  --otp          Test OTP/Verification email');
    console.log('  --welcome      Test Welcome email');
    console.log('  --reset        Test Password Reset email');
    console.log('  --reset-success Test Password Reset Success email');
    console.log('  --followup     Test Follow-up email');
    console.log('  --all          Test all emails');
    console.log('');
    console.log(`Email will be sent to: ${TEST_EMAIL}`);
    process.exit(1);
  }
  
  const option = args[0].replace('--', '');
  
  if (option === 'all') {
    console.log('🚀 Sending all test emails...\n');
    for (const type of Object.keys(templates)) {
      const content = getEmailContent(type);
      if (content) {
        const template = templates[type];
        await sendEmail(TEST_EMAIL, template.subject, content.text, content.html);
        console.log('');
      }
    }
    console.log('✅ All test emails sent successfully!');
  } else {
    const content = getEmailContent(option);
    if (!content) {
      console.error(`❌ Unknown option: ${option}`);
      console.log('Run without arguments to see available options.');
      process.exit(1);
    }
    
    const template = templates[option];
    await sendEmail(TEST_EMAIL, template.subject, content.text, content.html);
    console.log('✅ Test email sent successfully!');
  }
};

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
