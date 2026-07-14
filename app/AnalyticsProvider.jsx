'use client';

import dynamic from "next/dynamic";

// Dynamically import analytics components to reduce initial bundle size
// Using ssr: false to ensure they only run on the client
const TiktokPixel = dynamic(() => import("@/components/TiktokPixel"), { ssr: false });
const TiktokPageView = dynamic(() => import("@/components/TiktokPageView"), { ssr: false });
const MetaPixel = dynamic(() => import("@/components/MetaPixel"), { ssr: false });
const ClarityInit = dynamic(() => import("@/components/analytics/ClarityInit"), { ssr: false });
const Analytics = dynamic(() => import("@vercel/analytics/next").then(mod => ({ default: mod.Analytics })), { ssr: false });
const SpeedInsights = dynamic(() => import("@vercel/speed-insights/next").then(mod => ({ default: mod.SpeedInsights })), { ssr: false });
const CookieBanner = dynamic(() => import("@/components/CookieBanner"), { ssr: false });
const GoogleAnalytics = dynamic(() => import("@/components/GoogleAnalytics"), { ssr: false });

export default function AnalyticsProvider() {
  return (
    <>
      <TiktokPixel />
      <MetaPixel />
      <ClarityInit />
      <TiktokPageView />
      <Analytics />
      <SpeedInsights />
      <CookieBanner />
      <GoogleAnalytics />
    </>
  );
}