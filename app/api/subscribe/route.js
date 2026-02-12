import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Notify admin
    await sendEmail(
      process.env.EMAIL_USER,
      "New Marketing Subscription 📧",
      `${email} has subscribed to email marketing.`
    );

    // 2️⃣ Send welcome email to user
    await sendEmail(
      email,
      "Welcome to FIL! Enjoy 10% OFF",
      `
Hey!

Thanks for signing up for our exclusive offers 🔥

Use promo code: WELCOME10
To enjoy: 10% OFF your first purchase 🎁

Shop now at FIL Store. We’re excited to have you! 😊

— FIL Team
      `
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
