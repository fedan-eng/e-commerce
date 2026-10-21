// app/api/subscribe/route.js — promo popup sign-up. Adds the email to the newsletter and starts
// the email-only signup (lib/signup.js): account with a generated password + a 6-digit code.
// Verifying signs them in and sends the WELCOME10 email (see /api/auth/verify-code).
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { subscribeContact } from "@/lib/brevo";
import { EMAIL_RE, startEmailSignup } from "@/lib/signup";
import { baseUrlFrom } from "@/lib/verification";

export async function POST(req) {
  try {
    const { email: rawEmail, phone: rawPhone, smsOptIn } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Optional phone in E.164 form (e.g. +2348137678990), sent by the promo popup
    const phone =
      typeof rawPhone === "string" && /^\+\d{8,16}$/.test(rawPhone) ? rawPhone : null;

    // Newsletter list in Brevo. Not fatal: the account is what unlocks the code.
    try {
      await subscribeContact({ email, phone, smsOptIn: smsOptIn === true });
    } catch (err) {
      console.error("Brevo subscribe failed:", err.message);
    }

    await connectDB();
    const result = await startEmailSignup({ email, phone, baseUrl: baseUrlFrom(req) });
    if (!result.ok) {
      const message = result.hasAccount
        ? "You already have a FIL account. Sign in and use WELCOME10 at checkout."
        : result.message;
      return NextResponse.json({ message, hasAccount: result.hasAccount }, { status: result.status });
    }

    return NextResponse.json({ message: "We've emailed you a 6-digit code.", email: result.email });
  } catch (error) {
    console.error("Subscription Error: ", error);
    return NextResponse.json(
      { message: "Something went wrong. Try again!" },
      { status: 500 }
    );
  }
}
