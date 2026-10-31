// app/api/auth/login-code/route.js — "Email me a sign-in code": signing in without a password.
// The code is checked by /api/auth/verify-code, which also signs the shopper in.
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { buildSignInCodeEmail } from "@/lib/emails/signInCodeEmail";
import { EMAIL_RE, startEmailSignup } from "@/lib/signup";
import { baseUrlFrom, codeRecentlySent, findUserByEmail, issueCode } from "@/lib/verification";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email: rawEmail } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 });
    }

    await connectDB();
    const user = await findUserByEmail(User, email);
    if (!user) {
      return NextResponse.json(
        { message: "We couldn't find an account with that email.", noAccount: true },
        { status: 404 }
      );
    }
    if (user.isActive === false) {
      return NextResponse.json({ message: "Your account has been suspended. Please contact support." }, { status: 403 });
    }

    // Never verified: finish signing up instead (same code, plus the verify link)
    if (!user.isVerified && !user.googleId) {
      const result = await startEmailSignup({ email, baseUrl: baseUrlFrom(req) });
      if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
      return NextResponse.json({ message: "We've emailed you a 6-digit code.", email: result.email });
    }

    if (codeRecentlySent(user)) {
      return NextResponse.json(
        { message: "We've just sent you a code. Please wait a moment before asking again." },
        { status: 429 }
      );
    }

    const code = issueCode(user);
    await user.save();
    const { subject, html, text } = buildSignInCodeEmail({ code });
    await sendEmail(user.email, subject, text, html);

    return NextResponse.json({ message: "We've emailed you a 6-digit code.", email: user.email });
  } catch (error) {
    console.error("Login code error:", error);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
