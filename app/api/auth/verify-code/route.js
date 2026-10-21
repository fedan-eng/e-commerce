// app/api/auth/verify-code/route.js — verifies an email with the 6-digit code, signs the
// shopper in and sends the WELCOME10 email.
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { checkVerificationCode, completeVerification, findUserByEmail, sessionCookie } from "@/lib/verification";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email: rawEmail, code } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (!email || !/^\d{6}$/.test(String(code || "").trim())) {
      return NextResponse.json({ message: "Please enter the 6-digit code from your email." }, { status: 400 });
    }

    await connectDB();
    const user = await findUserByEmail(User, email);
    if (!user) {
      return NextResponse.json({ message: "Please request a new code." }, { status: 400 });
    }
    if (user.isVerified) {
      return NextResponse.json({ message: "Your email is already verified. Please sign in." }, { status: 409 });
    }
    if (user.isActive === false) {
      return NextResponse.json({ message: "Your account has been suspended. Please contact support." }, { status: 403 });
    }

    const error = checkVerificationCode(user, code);
    if (error) {
      await user.save(); // keep the attempt count
      return NextResponse.json({ message: error }, { status: 400 });
    }

    await completeVerification(user);

    const res = NextResponse.json({ message: "Email verified" });
    res.headers.set("Set-Cookie", sessionCookie(user));
    return res;
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
