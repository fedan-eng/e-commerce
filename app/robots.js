// app/robots.js → /robots.txt
import { SITE_URL, PRIVATE_PATHS } from "@/lib/seo";

export default function robots() {
  return {
    // One rule for everyone, AI answer engines included (GPTBot, PerplexityBot, ClaudeBot…)
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
