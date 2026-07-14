// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

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

  // ✅ Handle logout: clear cookie and redirect to login
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  if (AUTH_ROUTES.includes(pathname)) {
    const payload = await getPayload();
    if (payload) {
      const destination = payload.role === "admin" ? "/admin" : "/products";
      return NextResponse.redirect(new URL(destination, req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const payload = await getPayload();
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));
    if (payload.role !== "admin") return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/logout"], // ✅ added /logout
};