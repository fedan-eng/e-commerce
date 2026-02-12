import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateCode } from "@/lib/utils";
import { sendEmail } from "@/lib/mailer";

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }

  const resetCode = generateCode();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  user.resetPasswordCode = resetCode;
  user.resetPasswordExpiry = expiry;
  await user.save();

  await sendEmail(
    email,
    "Password Reset Request",
    `Your password reset code is: ${resetCode}. It expires in 10 minutes.`
  );

  return new Response(JSON.stringify({ message: "Reset code sent" }), {
    status: 200,
  });
}

export async function PUT(req) {
  await connectDB();
  const { email, resetCode, newPassword } = await req.json();

  if (!email || !resetCode || !newPassword) {
    return new Response(JSON.stringify({ message: "Missing fields" }), {
      status: 400,
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }

  if (
    user.resetPasswordCode !== resetCode ||
    new Date() > user.resetPasswordExpiry
  ) {
    return new Response(
      JSON.stringify({ message: "Invalid or expired reset code" }),
      { status: 400 }
    );
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordCode = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  await sendEmail(
    email,
    "Password Reset Successful",
    "Your password has been successfully reset."
  );

  return new Response(JSON.stringify({ message: "Password reset successfully" }), {
    status: 200,
  });
}
