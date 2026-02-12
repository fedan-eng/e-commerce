import { serialize } from "cookie";

export async function POST() {
  return new Response(JSON.stringify({ message: "Logged out" }), {
    status: 200,
    headers: {
      "Set-Cookie": serialize("token", "", {
        httpOnly: true,
        path: "/",
        expires: new Date(0),
      }),
    },
  });
}
