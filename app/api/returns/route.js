import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      productCondition,
      returnQuantity,
      reasonForReturn,
      bankName,
      accountNumber,
      accountName,
      amount,
      address,
      region,
      city,
      phone,
      orderId,
      productName,
      productPrice,
    } = body;

    // Validate input
    if (
      !productCondition ||
      !returnQuantity ||
      !reasonForReturn ||
      !bankName ||
      !accountNumber ||
      !accountName
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const returnEmailHtml = `
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
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
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
    .alert-badge {
      background-color: #ffc107;
      color: #333;
      padding: 8px 20px;
      border-radius: 20px;
      display: inline-block;
      font-weight: 600;
      margin: 10px 0;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
    }
    .section {
      background-color: #f8f9fa;
      border-left: 4px solid #ff6b6b;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .section h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #333;
      display: flex;
      align-items: center;
    }
    .section-icon {
      font-size: 24px;
      margin-right: 10px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #555;
    }
    .detail-value {
      color: #333;
      text-align: right;
      max-width: 60%;
      word-wrap: break-word;
    }
    .reason-box {
      background-color: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .reason-box h3 {
      margin: 0 0 10px 0;
      color: #856404;
      font-size: 16px;
    }
    .reason-text {
      color: #856404;
      font-style: italic;
      line-height: 1.6;
    }
    .refund-highlight {
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 25px;
      margin: 30px 0;
      border-radius: 10px;
    }
    .refund-highlight h2 {
      margin: 0 0 15px 0;
      font-size: 20px;
    }
    .refund-amount {
      font-size: 36px;
      font-weight: bold;
      margin: 15px 0;
    }
    .timestamp {
      text-align: center;
      color: #999;
      font-size: 13px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
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
      .detail-row {
        flex-direction: column;
      }
      .detail-value {
        text-align: left;
        margin-top: 5px;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🔄 Return Request Initiated</h1>
      <p>New Return Request Received</p>
      <div class="alert-badge">⚠️ Action Required</div>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
        A customer has initiated a return request. Please review the details below and process accordingly.
      </p>
      
      <div class="section">
        <h2><span class="section-icon">📦</span> Order Information</h2>
        <div class="detail-row">
          <span class="detail-label">Order ID:</span>
          <span class="detail-value"><strong>${orderId}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Product Name:</span>
          <span class="detail-value">${productName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Product Price:</span>
          <span class="detail-value">₦${Number(productPrice).toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Return Quantity:</span>
          <span class="detail-value">${returnQuantity}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Product Condition:</span>
          <span class="detail-value">${productCondition}</span>
        </div>
      </div>
      
      <div class="reason-box">
        <h3>📝 Reason for Return</h3>
        <div class="reason-text">"${reasonForReturn}"</div>
      </div>
      
      <div class="section">
        <h2><span class="section-icon">👤</span> Customer Details</h2>
        <div class="detail-row">
          <span class="detail-label">Phone:</span>
          <span class="detail-value">${phone}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Address:</span>
          <span class="detail-value">${address}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">City:</span>
          <span class="detail-value">${city}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Region:</span>
          <span class="detail-value">${region}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount Paid:</span>
          <span class="detail-value"><strong>₦${Number(amount).toLocaleString()}</strong></span>
        </div>
      </div>
      
      <div class="refund-highlight">
        <h2>💰 Refund Details</h2>
        <div class="detail-row" style="border-color: rgba(255,255,255,0.3); color: white;">
          <span class="detail-label">Bank Name:</span>
          <span class="detail-value">${bankName}</span>
        </div>
        <div class="detail-row" style="border-color: rgba(255,255,255,0.3); color: white;">
          <span class="detail-label">Account Number:</span>
          <span class="detail-value"><strong>${accountNumber}</strong></span>
        </div>
        <div class="detail-row" style="border-color: rgba(255,255,255,0.3); color: white;">
          <span class="detail-label">Account Name:</span>
          <span class="detail-value">${accountName}</span>
        </div>
        <div class="refund-amount">₦${Number(amount).toLocaleString()}</div>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Expected Refund Amount</p>
      </div>
      
      <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <strong>⏰ Next Steps:</strong>
        <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
          <li>Review the return request details</li>
          <li>Contact the customer if needed</li>
          <li>Arrange product pickup/return</li>
          <li>Process refund once product is received and verified</li>
        </ul>
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
      <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>FIL Store Admin</strong></p>
      <p style="margin: 0 0 20px 0; font-style: italic; color: #1cc978;">Think Quality, Think FIL.</p>
      <p>Manage orders at <a href="https://filstore.com.ng/admin">Admin Dashboard</a></p>
    </div>
  </div>
</body>
</html>
    `;

    const plainText = `
🔄 NEW RETURN REQUEST INITIATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 ORDER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: ${orderId}
Product: ${productName}
Price: ₦${Number(productPrice).toLocaleString()}
Return Quantity: ${returnQuantity}
Condition: ${productCondition}

📝 REASON FOR RETURN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"${reasonForReturn}"

👤 CUSTOMER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phone: ${phone}
Address: ${address}
City: ${city}
Region: ${region}
Amount Paid: ₦${Number(amount).toLocaleString()}

💰 REFUND DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bank: ${bankName}
Account Number: ${accountNumber}
Account Name: ${accountName}
Refund Amount: ₦${Number(amount).toLocaleString()}

⏰ NEXT STEPS:
- Review the return request details
- Contact the customer if needed
- Arrange product pickup/return
- Process refund once product is received and verified

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted: ${new Date().toLocaleString('en-US', { 
  weekday: 'long',
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

FIL Store Admin
Think Quality, Think FIL.
    `.trim();

    await sendEmail(
      process.env.ADMIN_EMAIL,
      `🔄 Return Request - Order #${orderId}`,
      plainText,
      returnEmailHtml
    );

    return NextResponse.json({ message: "Return request sent successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error sending return request" },
      { status: 500 }
    );
  }
}