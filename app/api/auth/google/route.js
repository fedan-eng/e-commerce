import { NextResponse } from "next/server";

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "Google Client ID not configured" }, { status: 500 });
  }

  // Grab callbackUrl from the login page query param
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const scope = "openid profile email";

  // Encode callbackUrl into state so it survives the Google round-trip
  const state = Buffer.from(JSON.stringify({
    nonce: Math.random().toString(36).substring(2, 15),
    callbackUrl,
  })).toString("base64url");

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${encodeURIComponent(state)}`;

  return NextResponse.redirect(authUrl);
}