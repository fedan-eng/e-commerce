'use client'

import { useCookieConsent } from '../context/CookieConsentContext'

/**
 * useGAEvent — safely fires GA events only when analytics consent is given.
 *
 * Usage:
 *   const { trackEvent } = useGAEvent()
 *   trackEvent('add_to_cart', { item_id: 'FS-001', value: 5000, currency: 'NGN' })
 */
export function useGAEvent() {
  const { preferences } = useCookieConsent()

  const trackEvent = (eventName, params = {}) => {
    console.log('[GA DEBUG] Attempting to track event:', eventName, params)
    if (!preferences.analytics) {
      console.log('[GA DEBUG] Analytics consent not given, skipping event:', eventName)
      return
    }
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      console.log('[GA DEBUG] Window or gtag not available, skipping event:', eventName)
      return
    }
    console.log('[GA DEBUG] Firing GA event:', eventName, params)
    window.gtag('event', eventName, params)
  }

  const trackPageView = (url) => {
    console.log('[GA DEBUG] Attempting to track page view:', url)
    if (!preferences.analytics) {
      console.log('[GA DEBUG] Analytics consent not given, skipping page view:', url)
      return
    }
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      console.log('[GA DEBUG] Window or gtag not available, skipping page view:', url)
      return
    }
    console.log('[GA DEBUG] Firing GA page view:', url)
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, { page_path: url })
  }

  return { trackEvent, trackPageView }
}