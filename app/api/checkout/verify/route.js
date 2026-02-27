// app/api/checkout/verify/route.js
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyPayment } from "@/lib/paystack";
import { verifyToken } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { reference } = body;

    if (!reference) {
      return new Response(JSON.stringify({ message: "Missing reference" }), {
        status: 400,
      });
    }

    // ✅ Get token from cookies (for logged-in users)
    const cookie = req.cookies.get("token")?.value;

    let user = null;
    if (cookie) {
      try {
        user = verifyToken(cookie);
      } catch (err) {
        console.error("Token verification error:", err);
      }
    }

    // ✅ Step 1: Verify payment with Paystack
    const paymentData = await verifyPayment(reference);

    if (paymentData.status !== "success") {
      return new Response(
        JSON.stringify({ message: "Payment not successful" }),
        { status: 400 }
      );
    }

    // ✅ Step 2: Extract metadata safely
    const {
      cartItems = [],
      region,
      addPhone,
      firstName,
      deliveryType,
      city,
      address,
      phone,
      email,
      discount = 0,
    } = paymentData.metadata || {};

    // ✅ Recompute safe totals
    const safeSubTotal =
      cartItems.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ) || 0;

    const safeDiscount = Number(discount) || 0;

    let safeDeliveryFee = 0;
    if (deliveryType === "Free") {
      safeDeliveryFee = 0;
    } else if (deliveryType === "Express") {
      safeDeliveryFee = (Number(region?.fee) || 0) * 2;
    } else {
      safeDeliveryFee = Number(region?.fee) || 0;
    }

    const safeTotal = safeSubTotal - safeDiscount + safeDeliveryFee;

    // ✅ Step 3: Save order to DB
    const order = await Order.create({
      userId: user?.id || null,
      email,
      address,
      region: {
        name: region?.name || region,
        fee: safeDeliveryFee,
      },
      city,
      deliveryType,
      phone,
      addPhone,
      firstName,
      items: cartItems,
      subTotal: safeSubTotal,
      discount: safeDiscount,
      deliveryFee: safeDeliveryFee,
      total: safeTotal,
      status: "Confirmed",
      statusHistory: [
        {
          status: "Confirmed",
          date: new Date(),
        },
      ],
    });

    // ✅ Step 4: Send confirmation emails
    const itemList = cartItems
      .map((item) => `- ${item.name} × ${item.quantity} — ₦${item.price}`)
      .join("\n");

    const emailText = `
Hi ${firstName},

Thank you for choosing **Fedan Investment Limited (FIL)** — we’re so glad to have you as part of our family!

Your order is confirmed ✅ and our team is already preparing it with care. You’ll receive a shipping update as soon as it’s on the way.

At FIL, we believe every product is more than just an accessory — we see it as an opportunity to empower you and make your daily life smoother, easier, and more connected.

We can’t wait for you to experience the difference. If you ever have questions or need support, our team is always just a message away, because to us, you’re not just a customer — you’re family. 💙

👉 While you wait for your order, feel free to explore tips, updates, and new arrivals on our https://filstore.com.ng

Thank you once again for trusting FIL. We’re honored to be part of your journey!


------------------------------
🧾 **Order Details**
------------------------------

• **Order ID:** ${order._id}
• **Status:** ${order.status}
• **Address:** ${address}
• **Region:** ${region?.name || region}
• **City:** ${city}
• **Email:** ${email}
• **Phone:** ${phone}
• **Add. Phone:** ${addPhone || "N/A"}
• **Name:** ${firstName}

💰 **Summary**
• **Subtotal:** ₦${safeSubTotal}
• **Delivery Fee:** ₦${safeDeliveryFee}
• **Discount:** ₦${safeDiscount}
• **Total:** ₦${safeTotal}
• **Delivery Type:** ${deliveryType}

📦 **Items**
${itemList}


With gratitude,  
**The FIL Team**  
*Think Quality, Think FIL.*
`.trim();

    const adminEmail = process.env.ADMIN_EMAIL;

    await Promise.all([
      sendEmail(email, "Your Order Confirmation - Fil Store", emailText),
      sendEmail(adminEmail, `New Order from ${email}`, emailText),
    ]);

    return new Response(JSON.stringify({ message: "Order saved", order }), {
      status: 200,
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return new Response(
      JSON.stringify({ message: "Server error", error: error.message }),
      { status: 500 }
    );
  }
}
