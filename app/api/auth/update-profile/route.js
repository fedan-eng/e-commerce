import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";

export async function PUT(req) {
  await connectDB();

  const cookies = req.headers.get("cookie");
  const { token } = parse(cookies || "");
  if (!token)
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });

  const userData = verifyToken(token);
  const { id } = userData;

  const updates = await req.json();

  const user = await User.findByIdAndUpdate(id, updates, { new: true }).select(
    "-password"
  );
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }

  return Response.json({ user });
}
