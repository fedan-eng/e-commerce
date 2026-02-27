// app/api/feedback/route.js
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

export async function POST(req) {
  try {
    const { rating: rawRating, comment } = await req.json();
    const rating = Number(rawRating);

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    // Create star display
    const starDisplay = "⭐".repeat(rating) + "☆".repeat(5 - rating);

    const feedbackEmailHtml = `
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
    }
    .rating-box {
      background-color: #f8f9fa;
      border-left: 4px solid #1cc978;
      padding: 25px;
      margin: 20px 0;
      border-radius: 5px;
      text-align: center;
    }
    .rating-stars {
      font-size: 36px;
      margin: 15px 0;
      letter-spacing: 5px;
    }
    .rating-number {
      font-size: 48px;
      font-weight: bold;
      color: #1cc978;
      margin: 10px 0;
    }
    .rating-text {
      font-size: 18px;
      color: #666;
      margin-top: 10px;
    }
    .comment-box {
      background-color: #fff;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 25px;
      margin: 30px 0;
    }
    .comment-box h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 18px;
    }
    .comment-text {
      color: #555;
      font-size: 15px;
      line-height: 1.8;
      font-style: italic;
      white-space: pre-wrap;
    }
    .no-comment {
      color: #999;
      font-style: italic;
    }
    .info-badge {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
      font-size: 14px;
      color: #555;
    }
    .timestamp {
      text-align: center;
      color: #999;
      font-size: 13px;
      margin-top: 30px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      color: #777;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>📝 New Customer Feedback</h1>
      <p>Anonymous Feedback Submission</p>
    </div>
    
    <div class="content">
      <div class="rating-box">
        <h2 style="margin: 0 0 10px 0; color: #333;">Customer Rating</h2>
        <div class="rating-stars">${starDisplay}</div>
        <div class="rating-number">${rating}<span style="font-size: 24px; color: #999;">/5</span></div>
        <div class="rating-text">
          ${rating === 5 ? '🎉 Excellent!' : 
            rating === 4 ? '👍 Very Good' : 
            rating === 3 ? '😊 Good' : 
            rating === 2 ? '😐 Fair' : 
            '😞 Needs Improvement'}
        </div>
      </div>
      
      ${comment ? `
      <div class="comment-box">
        <h3>💬 Customer Comment:</h3>
        <div class="comment-text">"${comment}"</div>
      </div>
      ` : `
      <div class="comment-box">
        <div class="no-comment">No comment provided</div>
      </div>
      `}
      
      <div class="info-badge">
        ℹ️ <strong>Note:</strong> This is an anonymous feedback submission. The customer did not provide contact information.
      </div>
      
      <div class="timestamp">
        Submitted on ${new Date().toLocaleString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0; color: #1cc978; font-weight: 600;">FIL Store Feedback System</p>
    </div>
  </div>
</body>
</html>
    `;

    const plainText = `
🛍️ NEW ANONYMOUS CUSTOMER FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ RATING: ${rating}/5 stars
${starDisplay}

${rating === 5 ? '🎉 Excellent!' : 
  rating === 4 ? '👍 Very Good' : 
  rating === 3 ? '😊 Good' : 
  rating === 2 ? '😐 Fair' : 
  '😞 Needs Improvement'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 CUSTOMER COMMENT:
${comment || "(No comment provided)"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Submitted: ${new Date().toLocaleString('en-US', { 
  weekday: 'long',
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

ℹ️ Note: This is an anonymous feedback submission.

FIL Store Feedback System
    `.trim();

    await sendEmail(
      process.env.ADMIN_EMAIL,
      `New Feedback: ${rating}⭐ - ${new Date().toLocaleDateString()}`,
      plainText,
      feedbackEmailHtml
    );

    return NextResponse.json({ message: "Feedback sent successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to send feedback" },
      { status: 500 }
    );
  }
}