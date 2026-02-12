// lib/auth.js
import jwt from "jsonwebtoken";
import axios from "axios";

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

// Register User
export const registerUser = async (formData) => {
  try {
    const response = await axios.post("/api/auth/register", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

// Verify Code
export const verifyCode = async ({ code, email }) => {
  try {
    const response = await axios.post("/api/auth/verify", { code, email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Verification failed");
  }
};
