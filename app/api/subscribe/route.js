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

    // Send welcome email to user
    await sendEmail(
      email,
      "Welcome to FIL! Enjoy 10% OFF",
      `
Hey!

Thanks for signing up for our exclusive offers 🔥

Use promo code: WELCOME10
To enjoy: 10% OFF your first purchase 🎁

Shop now at FIL Store. We're excited to have you! 😊

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