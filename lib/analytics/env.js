// lib/analytics/env.js — GA tracking is off on Vercel preview deployments so test
// traffic and test orders never reach the live property. Vercel exposes
// NEXT_PUBLIC_VERCEL_ENV to the browser and VERCEL_ENV on the server.
export const IS_PREVIEW =
  (process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV) === "preview";
