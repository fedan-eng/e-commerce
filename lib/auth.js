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
