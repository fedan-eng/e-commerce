import { serialize } from "cookie";
export const dynamic = "force-dynamic";

export async function POST() {
  return new Response(JSON.stringify({ message: "Logged out" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": serialize("token", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,          // ✅ for modern browsers
        expires: new Date(0), // ✅ for older browsers
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      }),
    },
  });
}