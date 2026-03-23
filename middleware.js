// middleware.js (place in your project root)
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Helper: verify token and return payload, or null if invalid
  const getPayload = async () => {
    if (!token) return null;
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      return payload;
    } catch {
      return null;
    }
  };

  // Redirect logged-in users away from /login and /register
  if (AUTH_ROUTES.includes(pathname)) {
    const payload = await getPayload();
    if (payload) {
      const destination = payload.role === "admin" ? "/admin" : "/";
      return NextResponse.redirect(new URL(destination, req.url));
    }
    return NextResponse.next();
  }

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    const payload = await getPayload();

    if (!payload) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};