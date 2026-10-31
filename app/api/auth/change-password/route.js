import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/mailer";
import { buildPasswordChangedEmail } from "@/lib/emails/passwordEmails";
import jwt from "jsonwebtoken";

// 🔹 Middleware to check user from JWT (cookie-based auth)
async function authenticate(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Not authenticated");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id; // user id
  } catch {
    throw new Error("Invalid or expired token");
  }
}

export async function PUT(req) {
  await connectDB();
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ message: "Missing fields" }), {
        status: 400,
      });
    }
    if (String(newPassword).length < 8) {
      return new Response(JSON.stringify({ message: "Your new password needs at least 8 characters" }), {
        status: 400,
      });
    }

    // 🔑 Authenticate user
    const userId = await authenticate(req);
    const user = await User.findById(userId);
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    if (!user.password) {
      return new Response(
        JSON.stringify({ message: "You sign in with Google. Use \"Forgot password\" to add a password." }),
        { status: 400 }
      );
    }

    // ❌ Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return new Response(
        JSON.stringify({ message: "Current password is incorrect" }),
        { status: 400 }
      );
    }

    // 🔒 Hash and update password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    user.passwordIsGenerated = false;
    await user.save();

    const { subject, html, text } = buildPasswordChangedEmail({ firstName: user.firstName });
    await sendEmail(user.email, subject, text, html);

    return new Response(
      JSON.stringify({ message: "Password changed successfully" }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    });
  }
}