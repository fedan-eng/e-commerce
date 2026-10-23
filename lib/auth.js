// lib/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// sign token
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// verify token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// For admin API routes: returns a 401/403 response to send back, or null when the caller is an admin
export function requireAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return Response.json({ message: "Unauthorized" }, { status: 401 });
  if (verifyToken(token)?.role !== "admin") return Response.json({ message: "Forbidden" }, { status: 403 });
  return null;
}
