// lib/seo.js — the canonical address for search engines (canonical tags, sitemap,
// structured data). The live site serves the bare domain; www redirects to it, so
// pointing anything at www tells Google the page lives somewhere it doesn't.
export const SITE_URL = "https://filstore.com.ng";

// Our hero product, linked from the footer and homepage so Google treats it as a key page
export const MAGFLEX_PATH = "/products/691b18d96ab12366ceef60dc";

// Pages kept out of search: accounts, checkout and admin
export const PRIVATE_PATHS = [
  "/admin_console",
  "/api/",
  "/cart",
  "/checkout",
  "/creator",
  "/login",
  "/register",
  "/profile",
  "/reset-password",
  "/verify-email",
  "/review/",
  "/track",
];

// <script type="application/ld+json"> body; escapes "<" so data can't close the tag
export function jsonLdHtml(data) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
