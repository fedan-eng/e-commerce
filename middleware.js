// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_ROUTES = ["/login", "/register"];

const getPayload = async (token) => {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
};

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // ── /logout: clear cookie and redirect to login ──────────────────────────
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // ✅ must match how cookie was originally set
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    return response;
  }

  // ── /login and /register: redirect away if already authenticated ─────────
  if (AUTH_ROUTES.includes(pathname)) {
    const payload = await getPayload(token);
    if (payload) {
      const destination = payload.role === "admin" ? "/admin_console" : "/products";
      return NextResponse.redirect(new URL(destination, req.url));
    }
    return NextResponse.next();
  }

  // ── /admin_console: require admin role ───────────────────────────────────
  if (pathname.startsWith("/admin_console")) {
    const payload = await getPayload(token);
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));
    if (payload.role !== "admin") return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin_console/:path*", "/login", "/register", "/logout"],
};