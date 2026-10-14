// lib/siteUrl.js — the base URL for links in emails, so they open on the deployment
// that sent them. Vercel previews use their branch URL (stable across pushes);
// everything else uses NEXT_PUBLIC_BASE_URL, falling back to the live site.
export function siteUrl() {
  if (process.env.VERCEL_ENV === "preview") {
    const host = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
    if (host) return `https://${host}`;
  }
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://www.filstore.com.ng").replace(/\/$/, "");
}
