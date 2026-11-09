'use client'

import Script from 'next/script'
import { IS_PREVIEW } from '@/lib/analytics/env'

// No GA on preview deployments
const GA_ID = IS_PREVIEW ? null : process.env.NEXT_PUBLIC_GA_ID

// Analytics is part of the "basic" cookie choice, so GA runs for every visitor
// (context/CookieConsentContext.jsx)
export default function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  )
}