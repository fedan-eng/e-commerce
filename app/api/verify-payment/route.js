import axios from "axios";
import {sendEmail} from "@/lib/mailer";

export async function POST(req) {
  try {
    const {reference, provider} = await req.json();

    if (!reference || !provider) {
      return Response.json(
        {message: "Missing reference or provider"},
        {status: 400},
      );
    }

    let verificationData;
    let orderData;

    if (provider === "paystack") {
      const res = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );

      const paystackData = res.data.data;

      verificationData = {
        verified: paystackData.status === "success",
        provider: "paystack",
        amount: paystackData.amount / 100,
        reference: paystackData.reference,
      };

      orderData = {
        firstName: paystackData.metadata.firstName,
        lastName: paystackData.metadata.lastName || "",
        email: paystackData.metadata.email,
        phone: paystackData.metadata.phone,
        addPhone: paystackData.metadata.addPhone,
        region: paystackData.metadata.region,
        city: paystackData.metadata.city,
        deliveryType: paystackData.metadata.deliveryType,
        address: paystackData.metadata.address,
        cartItems: paystackData.metadata.cartItems,
        subTotal: paystackData.metadata.subTotal,
        discount: paystackData.metadata.discount,
        deliveryFee: paystackData.metadata.deliveryFee,
        total: paystackData.metadata.total,
        paymentMethod: "paystack",
        paymentReference: reference,
        paymentStatus: "paid",
      };
    } else if (provider === "flutterwave") {
      console.log("🔍 Verifying Flutterwave transaction ID:", reference);

      const res = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${reference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        },
      );

      console.log(
        "📦 Flutterwave Full API Response:",
        JSON.stringify(res.data, null, 2),
      );

      if (res.data.status !== "success") {
        console.error("❌ Flutterwave API error:", res.data);
        return Response.json(
          {
            verified: false,
            message: res.data.message || "Transaction verification failed",
            provider: "flutterwave",
          },
          {status: 400},
        );
      }

      const flutterwaveData = res.data.data;

      const isVerified =
        flutterwaveData.status === "successful" &&
        flutterwaveData.currency === "NGN" &&
        flutterwaveData.amount >= flutterwaveData.charged_amount;

      console.log("✅ Verification checks:", {
        transactionStatus: flutterwaveData.status,
        currency: flutterwaveData.currency,
        amount: flutterwaveData.amount,
        isVerified,
      });

      verificationData = {
        verified: isVerified,
        provider: "flutterwave",
        amount: flutterwaveData.amount,
        reference: flutterwaveData.tx_ref,
        transactionId: flutterwaveData.id,
      };

      if (
        !flutterwaveData.meta ||
        Object.keys(flutterwaveData.meta).length === 0
      ) {
        console.error("❌ No meta data found in Flutterwave response");
        return Response.json(
          {
            verified: false,
            message: "Order metadata missing. Please contact support.",
            provider: "flutterwave",
            debug: {
              hasCustomer: !!flutterwaveData.customer,
              status: flutterwaveData.status,
            },
          },
          {status: 400},
        );
      }

      let parsedCartItems = [];
      let parsedRegion = {};

      console.log("📋 Raw Meta Data:", flutterwaveData.meta);

      try {
        if (flutterwaveData.meta.cartItems) {
          if (typeof flutterwaveData.meta.cartItems === "string") {
            parsedCartItems = JSON.parse(flutterwaveData.meta.cartItems);
          } else if (Array.isArray(flutterwaveData.meta.cartItems)) {
            parsedCartItems = flutterwaveData.meta.cartItems;
          }
        }

        if (flutterwaveData.meta.region) {
          if (typeof flutterwaveData.meta.region === "string") {
            parsedRegion = JSON.parse(flutterwaveData.meta.region);
          } else if (typeof flutterwaveData.meta.region === "object") {
            parsedRegion = flutterwaveData.meta.region;
          }
        }
      } catch (e) {
        console.error("❌ Error parsing meta data:", e);
      }

      console.log("✅ Parsed Data:", {
        cartItemsCount: parsedCartItems.length,
        region: parsedRegion,
      });

      orderData = {
        firstName:
          flutterwaveData.meta.firstName ||
          flutterwaveData.customer?.name?.split(" ")[0] ||
          "",
        lastName:
          flutterwaveData.meta.lastName ||
          flutterwaveData.customer?.name?.split(" ").slice(1).join(" ") ||
          "",
        email:
          flutterwaveData.meta.email || flutterwaveData.customer?.email || "",
        phone:
          flutterwaveData.meta.phone ||
          flutterwaveData.customer?.phone_number ||
          "",
        addPhone: flutterwaveData.meta.addPhone || "",
        region: parsedRegion,
        city: flutterwaveData.meta.city || "",
        deliveryType: flutterwaveData.meta.deliveryType || "Regular",
        address: flutterwaveData.meta.address || "",
        cartItems: parsedCartItems,
        subTotal: Number(flutterwaveData.meta.subTotal) || 0,
        discount: Number(flutterwaveData.meta.discount) || 0,
        deliveryFee: Number(flutterwaveData.meta.deliveryFee) || 0,
        total: Number(flutterwaveData.amount) || 0,
        paymentMethod: "flutterwave",
        paymentReference: flutterwaveData.tx_ref || reference,
        paymentStatus: "paid",
      };

      console.log("📦 Final Order Data:", {
        ...orderData,
        cartItems: `${orderData.cartItems.length} items`,
      });
    } else {
      return Response.json(
        {message: "Invalid payment provider"},
        {status: 400},
      );
    }

    if (verificationData.verified) {
      console.log("✅ Payment verified successfully:", {
        provider: verificationData.provider,
        reference: verificationData.reference,
        amount: verificationData.amount,
      });

     // Inside the if (verificationData.verified) block, replace the email code with:

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
    .order-box {
      background-color: #f8f9fa;
      border-left: 4px solid #1cc978;
      padding: 20px;
      margin: 30px 0;
      border-radius: 5px;
    }
    .order-box h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
      color: #333;
    }
    .order-detail {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .order-detail:last-child {
      border-bottom: none;
    }
    .order-detail-label {
      font-weight: 600;
      color: #555;
    }
    .order-detail-value {
      color: #333;
      text-align: right;
    }
    .items-table {
      width: 100%;
      margin: 20px 0;
      border-collapse: collapse;
    }
    .items-table th {
      background-color: #1cc978;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .summary-box {
      background-color: #fff;
      border: 2px solid #1cc978;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 15px;
    }
    .summary-total {
      border-top: 2px solid #1cc978;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: #1cc978;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #1cc978 0%, #16a05f 100%);
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 30px;
      margin: 20px 0;
      font-weight: 600;
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
    .success-badge {
      background-color: #1cc978;
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      display: inline-block;
      font-weight: 600;
      margin: 10px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header {
        padding: 30px 20px;
      }
      .order-detail {
        flex-direction: column;
      }
      .order-detail-value {
        text-align: left;
        margin-top: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🎉 Order Confirmed!</h1>
      <p>Thank you for choosing FIL Store</p>
      <div class="success-badge">✓ Payment Successful</div>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${orderData.firstName},
      </div>
      
      <div class="message">
        <p>Thank you for choosing <strong>Fedan Investment Limited (FIL)</strong> — we're so glad to have you as part of our family! 💙</p>
        
        <p>Your order is confirmed ✅ and our team is already preparing it with care. You'll receive a shipping update as soon as it's on the way.</p>
        
        <p>At FIL, we believe every product is more than just an accessory — we see it as an opportunity to empower you and make your daily life smoother, easier, and more connected.</p>
        
        <p>We can't wait for you to experience the difference. If you ever have questions or need support, our team is always just a message away, because to us, you're not just a customer — you're family.</p>
      </div>
      
      <div style="text-align: center;">
        <a href="https://filstore.com.ng/products" class="cta-button">Explore More Products</a>
      </div>
      
      <div class="order-box">
        <h2>📦 Order Details</h2>
        <div class="order-detail">
          <span class="order-detail-label">Status:</span>
          <span class="order-detail-value"><strong style="color: #1cc978;">Confirmed</strong></span>
        </div>
        <div class="order-detail">
          <span class="order-detail-label">Name:</span>
          <span class="order-detail-value">${orderData.firstName}</span>
        </div>
        <div class="order-detail">
          <span class="order-detail-label">Email:</span>
          <span class="order-detail-value">${orderData.email}</span>
        </div>
        <div class="order-detail">
          <span class="order-detail-label">Phone:</span>
          <span class="order-detail-value">${orderData.phone}</span>
        </div>
        ${orderData.addPhone ? `
        <div class="order-detail">
          <span class="order-detail-label">Additional Phone:</span>
          <span class="order-detail-value">${orderData.addPhone}</span>
        </div>
        ` : ''}
        <div class="order-detail">
          <span class="order-detail-label">Delivery Address:</span>
          <span class="order-detail-value">${orderData.address}</span>
        </div>
        <div class="order-detail">
          <span class="order-detail-label">City:</span>
          <span class="order-detail-value">${orderData.city}</span>
        </div>
        <div class="order-detail">
          <span class="order-detail-label">Region:</span>
          <span class="order-detail-value">${orderData.region?.name || orderData.region}</span>
        </div>
        <div class="order-detail">
          <span class="order-detail-label">Delivery Type:</span>
          <span class="order-detail-value">${orderData.deliveryType}</span>
        </div>
        <div class="order-detail">
          <span class="order-detail-label">Payment Method:</span>
          <span class="order-detail-value" style="text-transform: capitalize;">${orderData.paymentMethod}</span>
        </div>
      </div>
      
      <h2 style="margin-top: 40px; color: #333;">🛍️ Your Items</h2>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${orderData.cartItems.map(item => `
            <tr>
              <td>${item.name}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">₦${Number(item.price).toLocaleString()}</td>
              <td style="text-align: right;">₦${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary-box">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>₦${Number(orderData.subTotal).toLocaleString()}</span>
        </div>
        <div class="summary-row">
          <span>Delivery Fee:</span>
          <span>₦${Number(orderData.deliveryFee).toLocaleString()}</span>
        </div>
        ${orderData.discount > 0 ? `
        <div class="summary-row" style="color: #1cc978;">
          <span>Discount:</span>
          <span>-₦${Number(orderData.discount).toLocaleString()}</span>
        </div>
        ` : ''}
        <div class="summary-row summary-total">
          <span>Total Amount:</span>
          <span>₦${Number(orderData.total).toLocaleString()}</span>
        </div>
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

const itemList = orderData.cartItems
  .map((item) => `- ${item.name} × ${item.quantity} — ₦${item.price}`)
  .join("\n");

const plainText = `
Hi ${orderData.firstName},

Thank you for choosing Fedan Investment Limited (FIL) — we're so glad to have you as part of our family!

Your order is confirmed and our team is already preparing it with care.

Order Details:
- Status: Confirmed
- Name: ${orderData.firstName}
- Email: ${orderData.email}
- Phone: ${orderData.phone}
- Address: ${orderData.address}
- City: ${orderData.city}
- Region: ${orderData.region?.name || orderData.region}

Items:
${itemList}

Summary:
- Subtotal: ₦${orderData.subTotal}
- Delivery Fee: ₦${orderData.deliveryFee}
- Discount: ₦${orderData.discount}
- Total: ₦${orderData.total}

With gratitude,
The FIL Team
Think Quality, Think FIL.
Visit: https://filstore.com.ng
`.trim();

const adminEmail = process.env.ADMIN_EMAIL;

console.log("📧 Attempting to send emails...");
console.log("Customer email:", orderData.email);
console.log("Admin email:", adminEmail);

try {
  await Promise.all([
    sendEmail(
      orderData.email, 
      "Your Order Confirmation - FIL Store", 
      plainText,
      emailHtml
    ),
    sendEmail(
      adminEmail, 
      `New Order from ${orderData.email}`, 
      plainText,
      emailHtml
    ),
  ]);
  console.log("✅ Emails sent successfully");
} catch (emailError) {
  console.error("❌ Email sending failed:", emailError);
}
      // END OF EMAIL FUNCTIONALITY

      return Response.json({
        verified: true,
        message: "Payment verified successfully",
        provider: verificationData.provider,
        orderData: orderData,
      });
    } else {
      console.error("❌ Payment verification failed:", verificationData);

      return Response.json(
        {
          verified: false,
          message: "Payment verification failed",
          provider: verificationData.provider,
        },
        {status: 400},
      );
    }
  } catch (error) {
    console.error("❌ Verification Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });

    return Response.json(
      {
        message: "Verification failed",
        error: error.message,
        details: error.response?.data,
      },
      {status: 500},
    );
  }
}
