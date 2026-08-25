import { serialize } from "cookie";
export const dynamic = "force-dynamic";

export async function POST() {
  return new Response(JSON.stringify({ message: "Logged out" }), {
    status: 200,
    headers: {
      "Set-Cookie": serialize("token", "", {
        httpOnly: true,
        path: "/",
        expires: new Date(0),
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      }),
    },
  });
}
