'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { useCookieConsent } from '../context/CookieConsentContext'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function GoogleAnalytics() {
  const { preferences, status, mounted } = useCookieConsent()

  const shouldLoad = mounted && status !== 'pending' && preferences.analytics && GA_ID

  useEffect(() => {
    if (!mounted || !GA_ID || typeof window === 'undefined') return
    window[`ga-disable-${GA_ID}`] = !preferences.analytics
  }, [preferences.analytics, mounted])

  if (!shouldLoad) return null

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