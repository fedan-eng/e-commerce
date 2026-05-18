'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { useCookieConsent } from '../context/CookieConsentContext'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function GoogleAnalytics() {
  const { preferences, status, mounted } = useCookieConsent()

  const shouldLoad = mounted && status !== 'pending' && preferences.analytics && GA_ID

  console.log('[GA DEBUG] GoogleAnalytics component rendering:', {
    mounted,
    status,
    preferences: preferences ? { ...preferences } : null,
    GA_ID: !!GA_ID,
    shouldLoad
  })

  // If user later withdraws analytics consent, disable GA for this session
  useEffect(() => {
    console.log('[GA DEBUG] useEffect running for GA disable check:', {
      mounted,
      GA_ID: !!GA_ID,
      preferences: preferences ? { ...preferences } : null
    })
    if (!mounted || !GA_ID) return
    if (!preferences.analytics) {
      console.log('[GA DEBUG] Disabling GA for this session (analytics consent withdrawn)')
      window[`ga-disable-${GA_ID}`] = true
    } else {
      console.log('[GA DEBUG] Analytics consent given, ensuring GA is enabled')
      window[`ga-disable-${GA_ID}`] = false
    }
  }, [preferences.analytics, mounted])

  if (!shouldLoad) {
    console.log('[GA DEBUG] GA not loading - shouldLoad is false')
    return null
  }

  console.log('[GA DEBUG] Loading Google Analytics with ID:', GA_ID)
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
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