// app/api/auth/register/route.js — signup page. Email only: the account gets a generated
// password and a 6-digit code is emailed (lib/signup.js). Verifying signs them in and sends
// the WELCOME10 email (see /api/auth/verify-code). Also resends the code for unverified accounts.
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { subscribeContact } from "@/lib/brevo";
import { EMAIL_RE, startEmailSignup } from "@/lib/signup";
import { baseUrlFrom } from "@/lib/verification";

export async function POST(req) {
  try {
    const { email: rawEmail, newsletter, callback } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 });
    }

    if (newsletter === true) {
      try {
        await subscribeContact({ email, phone: null, smsOptIn: false });
      } catch (err) {
        console.error("Brevo subscribe failed:", err.message);
      }
    }

    await connectDB();
    const result = await startEmailSignup({ email, baseUrl: baseUrlFrom(req), callback });
    if (!result.ok) {
      return NextResponse.json({ message: result.message, hasAccount: result.hasAccount }, { status: result.status });
    }

    return NextResponse.json({ message: "We've emailed you a 6-digit code.", email: result.email });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
