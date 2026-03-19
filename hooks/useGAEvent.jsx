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
    if (!preferences.analytics) return
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
    window.gtag('event', eventName, params)
  }

  const trackPageView = (url) => {
    if (!preferences.analytics) return
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, { page_path: url })
  }

  return { trackEvent, trackPageView }
}