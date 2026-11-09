'use client'

import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCookieConsent } from '../context/CookieConsentContext'

const DISMISSED_KEY = 'filstore_cookie_banner_dismissed'
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000 // "×" hides the banner for a week (the visitor stays on basic)

export const cookieBtn = {
  primary: 'h-11 rounded-full bg-forest px-5 text-sm font-semibold text-white transition-colors hover:bg-black',
  outline: 'h-11 rounded-full border-2 border-forest px-5 text-sm font-semibold text-forest transition-colors hover:bg-sage',
}

export default function CookieBanner() {
  const { status, chooseBasic, chooseAll, mounted } = useCookieConsent()

  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [hiddenForPath, setHiddenForPath] = useState(false)

  // Respect a recent "×" (expires after a week)
  useEffect(() => {
    try {
      const dismissedAt = parseInt(localStorage.getItem(DISMISSED_KEY) || '', 10)
      if (!dismissedAt) return
      if (Date.now() - dismissedAt > DISMISS_FOR_MS) localStorage.removeItem(DISMISSED_KEY)
      else setBannerDismissed(true)
    } catch {}
  }, [])

  // The policy page has its own choice buttons
  useEffect(() => {
    if (window.location.pathname === '/cookie-policy') setHiddenForPath(true)
  }, [])

  if (!mounted || status !== 'pending' || bannerDismissed || hiddenForPath) return null

  // Confirmations go through the site-wide toaster: this banner unmounts as soon as
  // a choice is made, so anything it rendered itself would vanish immediately.
  const handleAll = () => {
    chooseAll()
    toast.success('All cookies allowed')
  }

  const handleBasic = () => {
    chooseBasic()
    toast('Basic cookies only')
  }

  const handleDismiss = () => {
    setBannerDismissed(true)
    try {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    } catch {}
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-3 left-3 right-3 z-[9999] rounded-[24px] bg-white p-5 font-roboto shadow-[0_12px_48px_rgba(0,67,40,0.18)] ring-1 ring-line sm:bottom-6 sm:left-auto sm:right-6 sm:w-[380px]"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint text-forest">
          <Cookie size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-forest">We use cookies</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            <b className="font-semibold text-forest">Basic</b> keeps the store working and shows us how it&apos;s used.{' '}
            <b className="font-semibold text-forest">All</b> also lets us show you relevant FIL ads on Facebook, Instagram and TikTok.{' '}
            <a href="/cookie-policy" className="font-semibold text-forest underline underline-offset-2">
              Learn more
            </a>
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss for now"
          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-sage hover:text-forest"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={handleAll} className={`flex-1 ${cookieBtn.primary}`}>
          Allow all
        </button>
        <button type="button" onClick={handleBasic} className={`flex-1 ${cookieBtn.outline}`}>
          Basic only
        </button>
      </div>
    </div>
  )
}
