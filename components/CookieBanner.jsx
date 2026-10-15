'use client'

import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCookieConsent } from '../context/CookieConsentContext'

const DISMISSED_KEY = 'filstore_cookie_banner_dismissed'
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000 // "×" hides the banner for a week

const PREF_ITEMS = [
  { key: 'necessary', label: 'Strictly necessary', sub: 'Required for the site to work', locked: true },
  { key: 'analytics', label: 'Analytics', sub: 'Help us understand how the site is used', locked: false },
  { key: 'marketing', label: 'Marketing', sub: 'Personalised ads and offers', locked: false },
  { key: 'functional', label: 'Functional', sub: 'Remember your preferences', locked: false },
]

const btn = {
  primary: 'h-11 rounded-full bg-forest px-5 text-sm font-semibold text-white transition-colors hover:bg-black',
  outline: 'h-11 rounded-full border-2 border-forest px-5 text-sm font-semibold text-forest transition-colors hover:bg-sage',
  ghost: 'h-11 rounded-full px-5 text-sm font-semibold text-forest underline-offset-4 hover:underline',
}

export default function CookieBanner() {
  const { status, preferences, acceptAll, declineAll, savePreferences, mounted } = useCookieConsent()

  const [modalOpen, setModalOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [hiddenForPath, setHiddenForPath] = useState(false)
  const [localPrefs, setLocalPrefs] = useState({ analytics: false, marketing: false, functional: false })

  // Respect a recent "×" (expires after a week)
  useEffect(() => {
    const dismissedAt = parseInt(localStorage.getItem(DISMISSED_KEY) || '', 10)
    if (!dismissedAt) return
    if (Date.now() - dismissedAt > DISMISS_FOR_MS) localStorage.removeItem(DISMISSED_KEY)
    else setBannerDismissed(true)
  }, [])

  useEffect(() => {
    if (window.location.pathname === '/cookie-policy') setHiddenForPath(true)
  }, [])

  useEffect(() => {
    if (modalOpen) {
      setLocalPrefs({
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        functional: preferences.functional,
      })
    }
  }, [modalOpen, preferences])

  if (!mounted || status !== 'pending' || bannerDismissed || hiddenForPath) return null

  // Confirmations go through the site-wide toaster: this banner unmounts as soon as
  // consent is given, so anything it rendered itself would vanish immediately.
  const handleAcceptAll = () => {
    acceptAll()
    setModalOpen(false)
    toast.success('Cookies accepted')
  }

  const handleDecline = () => {
    declineAll()
    toast('Only essential cookies will be used')
  }

  const handleDismiss = () => {
    setBannerDismissed(true)
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
  }

  const handleSavePrefs = () => {
    savePreferences(localPrefs)
    setModalOpen(false)
    toast.success('Cookie preferences saved')
  }

  const togglePref = (key) => setLocalPrefs((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <>
      {/* ── Banner: full width at the bottom on mobile, a card bottom-right on desktop ── */}
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
              They improve your shopping experience, personalise content and help us understand traffic.{' '}
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
          <button type="button" onClick={handleAcceptAll} className={`flex-1 ${btn.primary}`}>
            Accept all
          </button>
          <button type="button" onClick={handleDecline} className={`flex-1 ${btn.outline}`}>
            Decline
          </button>
        </div>
        <button type="button" onClick={() => setModalOpen(true)} className={`mt-1 w-full ${btn.ghost}`}>
          Customise preferences
        </button>
      </div>

      {/* ── Preferences: bottom sheet on mobile, centred card on desktop ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/45 sm:items-center sm:p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-prefs-title"
            className="w-full rounded-t-[28px] bg-white p-6 font-roboto shadow-2xl sm:max-w-[420px] sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 id="cookie-prefs-title" className="text-xl font-bold text-forest">
                Cookie preferences
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-forest transition-colors hover:bg-mint"
              >
                <X size={18} />
              </button>
            </div>

            <ul className="mt-4 divide-y divide-line">
              {PREF_ITEMS.map((item) => {
                const on = item.locked || localPrefs[item.key]
                return (
                  <li key={item.key} className="flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <p id={`cookie-${item.key}`} className="text-[15px] font-semibold text-forest">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-[13px] text-muted">{item.sub}</p>
                    </div>
                    <Toggle on={on} locked={item.locked} labelledBy={`cookie-${item.key}`} onChange={() => togglePref(item.key)} />
                  </li>
                )
              })}
            </ul>

            <div className="mt-4 flex gap-2">
              <button type="button" onClick={handleSavePrefs} className={`flex-1 ${btn.outline}`}>
                Save selection
              </button>
              <button type="button" onClick={handleAcceptAll} className={`flex-1 ${btn.primary}`}>
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Toggle({ on, locked, labelledBy, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-labelledby={labelledBy}
      onClick={locked ? undefined : onChange}
      disabled={locked}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
        on ? 'bg-forest' : 'bg-star-empty'
      } ${locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
