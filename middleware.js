// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { CATEGORIES } from "@/lib/categories";

const AUTH_ROUTES = ["/login", "/register"];
const HOME_FOR_ROLE = { admin: "/admin_console", creator: "/creator" };

// Prevent Vercel edge from caching any middleware response
const noCache = (response) => {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
};

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

// ── Old /products list page (taken down) ────────────────────────────────────
// Old links like /products?categories=Wearables are still in Google; a permanent
// redirect to the category page makes Google swap them for the new URL.
const normalize = (s) => (s || "").toLowerCase().replace(/[^a-z]/g, "");
const LEGACY_CATEGORY_SLUGS = Object.fromEntries(
  Object.values(CATEGORIES).flatMap((c) => [
    [normalize(c.dbCategory), c.slug],
    [normalize(c.title), c.slug],
    [normalize(c.slug), c.slug],
  ])
);
// Old footer labels and categories that were folded into others
Object.assign(LEGACY_CATEGORY_SLUGS, {
  cables: "chargers",
  charging: "chargers",
  audio: "wearables",
  earbuds: "wearables",
  sockets: "extensions",
  fans: "lifestyle",
});

function legacyProductsRedirect(req) {
  const raw = req.nextUrl.searchParams.get("categories") || req.nextUrl.searchParams.get("category");
  const slug = LEGACY_CATEGORY_SLUGS[normalize(raw?.split(",")[0])];
  return NextResponse.redirect(new URL(slug ? `/products/${slug}` : "/", req.url), 308);
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  if (pathname === "/products") return legacyProductsRedirect(req);

  // ── /logout: clear cookie and redirect to login ──────────────────────────
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    return noCache(response);
  }

  // ── /login and /register: redirect away if already authenticated ─────────
  if (AUTH_ROUTES.includes(pathname)) {
    const payload = await getPayload(token);
    if (payload) {
      const destination = HOME_FOR_ROLE[payload.role] || "/";
      return noCache(NextResponse.redirect(new URL(destination, req.url)));
    }
    return noCache(NextResponse.next());
  }

  // ── /admin_console: require admin role ───────────────────────────────────
  if (pathname.startsWith("/admin_console")) {
    const payload = await getPayload(token);
    if (!payload) return noCache(NextResponse.redirect(new URL("/login", req.url)));
    if (payload.role !== "admin") return noCache(NextResponse.redirect(new URL("/", req.url)));
    return noCache(NextResponse.next());
  }

  // ── /creator: sign-in only; the page's API checks the role against the database,
  // since a role switched on or off in the admin console isn't in an older token yet
  if (pathname.startsWith("/creator")) {
    if (await getPayload(token)) return noCache(NextResponse.next());
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return noCache(NextResponse.redirect(login));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/products", "/admin_console/:path*", "/creator/:path*", "/creator", "/logout"],
};