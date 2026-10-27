import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateCode } from "@/lib/utils";
import { sendEmail } from "@/lib/mailer";
import { buildPasswordResetEmail, buildPasswordChangedEmail } from "@/lib/emails/passwordEmails";
import { signToken, verifyToken } from "@/lib/auth";

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resetCode = generateCode();
  const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);
  
  const resetToken = signToken({ email });
  const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.resetPasswordCode = resetCode;
  user.resetPasswordExpiry = codeExpiry;
  user.resetPasswordToken = resetToken;
  user.resetPasswordTokenExpiry = tokenExpiry;
  await user.save();

  const origin = req.headers.get("origin") || req.headers.get("host") || "https://filstore.com.ng";
  const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;
  const resetLink = `${baseUrl}/reset-password/token?token=${resetToken}`;

  const { subject, html, text } = buildPasswordResetEmail({ firstName: user.firstName, code: resetCode, link: resetLink });
  await sendEmail(email, subject, text, html);

  return new Response(JSON.stringify({ message: "Reset code sent" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({ message: "Missing token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return new Response(JSON.stringify({ message: "Invalid or expired token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (user.resetPasswordToken !== token || new Date() > user.resetPasswordTokenExpiry) {
    return new Response(JSON.stringify({ message: "Invalid or expired token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ valid: true, email: user.email }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PATCH(req) {
  await connectDB();
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return new Response(JSON.stringify({ message: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return new Response(JSON.stringify({ message: "Invalid or expired token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (user.resetPasswordToken !== token || new Date() > user.resetPasswordTokenExpiry) {
    return new Response(
      JSON.stringify({ message: "Invalid or expired reset token" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  user.password = hashedPassword;
  user.passwordIsGenerated = false;
  user.resetPasswordCode = undefined;
  user.resetPasswordExpiry = undefined;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiry = undefined;

  await user.save();

  const { subject, html, text } = buildPasswordChangedEmail({ firstName: user.firstName, reset: true });
  await sendEmail(user.email, subject, text, html);

  return new Response(
    JSON.stringify({ message: "Password reset successfully" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function PUT(req) {
  await connectDB();
  const { email, resetCode, newPassword } = await req.json();

  if (!email || !resetCode || !newPassword) {
    return new Response(JSON.stringify({ message: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check if resetCode matches either the numeric code or the token
  const isCodeValid = user.resetPasswordCode === resetCode && new Date() <= user.resetPasswordExpiry;
  const isTokenValid = user.resetPasswordToken === resetCode && new Date() <= user.resetPasswordTokenExpiry;

  if (!isCodeValid && !isTokenValid) {
    return new Response(
      JSON.stringify({ message: "Invalid or expired reset code/token" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  user.password = hashedPassword;
  user.passwordIsGenerated = false;
  user.resetPasswordCode = undefined;
  user.resetPasswordExpiry = undefined;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiry = undefined;

  await user.save();

  const { subject, html, text } = buildPasswordChangedEmail({ firstName: user.firstName, reset: true });
  await sendEmail(user.email, subject, text, html);

  return new Response(
    JSON.stringify({ message: "Password reset successfully" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}