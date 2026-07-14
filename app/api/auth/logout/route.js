import { serialize } from "cookie";

export async function POST() {
  const clearToken = serialize("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  const clearNextAuth = serialize("next-auth.session-token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  // Also clear the secure version (used in production)
  const clearNextAuthSecure = serialize("__Secure-next-auth.session-token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
    secure: true,
  });

  return new Response(JSON.stringify({ message: "Logged out" }), {
    status: 200,
    headers: {
      "Set-Cookie": [clearToken, clearNextAuth, clearNextAuthSecure].join(", "),
    },
  });
}