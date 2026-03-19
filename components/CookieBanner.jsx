'use client'

import { useState, useEffect } from 'react'
import { useCookieConsent } from '../context/CookieConsentContext'

const PREF_ITEMS = [
  {
    key: 'necessary',
    label: 'Strictly necessary',
    sub: 'Required for the site to work',
    locked: true,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    sub: 'Help us understand usage',
    locked: false,
  },
  {
    key: 'marketing',
    label: 'Marketing',
    sub: 'Personalised ads & offers',
    locked: false,
  },
  {
    key: 'functional',
    label: 'Functional',
    sub: 'Remember your preferences',
    locked: false,
  },
]

export default function CookieBanner() {
  const { status, preferences, acceptAll, declineAll, savePreferences, mounted } =
    useCookieConsent()

  const [modalOpen, setModalOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [hiddenForPath, setHiddenForPath] = useState(false)
  const [localPrefs, setLocalPrefs] = useState({
    analytics: false,
    marketing: false,
    functional: false,
  })
  const [toast, setToast] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    if (window.location.pathname === '/cookie-policy') {
      setHiddenForPath(true)
    }
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

  if (!mounted) return null
  if (status !== 'pending') return null
  if (bannerDismissed) return null
  if (hiddenForPath) return null

  const showToast = (msg, sub) => {
    setToast({ msg, sub })
    setToastVisible(true)
    setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => setToast(null), 300)
    }, 3000)
  }

  const handleAcceptAll = () => {
    acceptAll()
    showToast('Cookies accepted', 'Thanks for enabling a better experience')
  }

  const handleDecline = () => {
    declineAll()
    showToast('Cookies declined', 'Only essential cookies will be used')
  }

  const handleCancel = () => setBannerDismissed(true)

  const handleSavePrefs = () => {
    savePreferences(localPrefs)
    setModalOpen(false)
    showToast('Preferences saved', 'Your cookie choices have been applied')
  }

  const handleAcceptAllFromModal = () => {
    acceptAll()
    setModalOpen(false)
    showToast('All cookies accepted', 'Thanks for enabling a better experience')
  }

  const togglePref = (key) =>
    setLocalPrefs((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <>
      {/* ── Banner ──
          Mobile:  pinned to bottom, full width with mx-3 breathing room, smaller text/padding
          Desktop: fixed bottom-right, 340px wide
      */}
      <div className="
        fixed z-[9999] rounded-2xl overflow-hidden
        bg-[#111111] border border-white/10 shadow-2xl shadow-black/50

        bottom-3 left-3 right-3
        sm:bottom-6 sm:left-auto sm:right-6 sm:w-[340px]
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3.5 bg-[#1cc978]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/15 flex items-center justify-center shrink-0">
              <CookieSVG />
            </div>
            <div>
              <p className="text-white text-[12px] sm:text-[13px] font-medium leading-none">
                We use cookies
              </p>
              <span className="text-white/75 text-[10px] sm:text-[11px]">
                Filstore · filstore.com.ng
              </span>
            </div>
          </div>

          {/* Cancel button */}
          <button
            onClick={handleCancel}
            aria-label="Dismiss banner"
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/15 flex items-center justify-center text-white/80 hover:bg-black/30 hover:text-white active:scale-95 transition-all text-sm leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-3 pt-2.5 pb-1 sm:px-4 sm:pt-3.5 sm:pb-1.5">
          <p className="text-[11.5px] sm:text-[12.5px] text-white/45 leading-relaxed">
            We use cookies to improve your shopping experience, personalise content, and analyse
            traffic.{' '}
            <a href="/cookie-policy" className="text-[#1cc978] font-medium hover:underline">
              Learn more
            </a>
          </p>
        </div>

        {/* Actions */}
        <div className="px-3 pt-2 pb-3 sm:px-4 sm:pt-3 sm:pb-4 flex flex-col gap-1.5 sm:gap-2">
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-2 sm:py-2.5 rounded-lg text-[12px] sm:text-[12.5px] font-medium bg-[#1cc978] text-white hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Accept all
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 py-2 sm:py-2.5 rounded-lg text-[12px] sm:text-[12.5px] font-medium text-white/60 border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all"
            >
              Decline
            </button>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-2 sm:py-2.5 rounded-lg text-[12px] sm:text-[12.5px] font-medium text-[#1cc978] border border-[#1cc978]/30 bg-transparent hover:bg-[#1cc978]/8 active:scale-[0.98] transition-all"
          >
            Customize preferences
          </button>
        </div>
      </div>

      {/* ── Preferences Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="
              bg-[#1a1a1a] border border-white/10 shadow-2xl
              w-full rounded-t-2xl sm:rounded-2xl sm:w-[320px]
              overflow-hidden
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* drag handle on mobile */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-8 h-1 rounded-full bg-white/20" />
            </div>

            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5 border-b border-white/[0.07]">
              <h3 className="text-[13px] sm:text-[14px] font-medium text-white">
                Cookie preferences
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/35 hover:text-white/70 text-xl leading-none px-1 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="px-4">
              {PREF_ITEMS.map((item, i) => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between py-3 ${
                    i < PREF_ITEMS.length - 1 ? 'border-b border-white/[0.06]' : ''
                  }`}
                >
                  <div>
                    <p className="text-[12px] sm:text-[12.5px] font-medium text-white/80">
                      {item.label}
                    </p>
                    <p className="text-[10.5px] sm:text-[11px] text-white/35 mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                  <Toggle
                    on={item.locked ? true : localPrefs[item.key]}
                    locked={item.locked}
                    onChange={() => !item.locked && togglePref(item.key)}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 px-4 pt-2.5 pb-5 sm:pb-4">
              <button
                onClick={handleSavePrefs}
                className="flex-1 py-2.5 rounded-lg text-[12px] font-medium text-white/60 border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                Save selection
              </button>
              <button
                onClick={handleAcceptAllFromModal}
                className="flex-1 py-2.5 rounded-lg text-[12px] font-medium bg-[#1cc978] text-white hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`
            fixed z-[10001] bg-[#1a1a1a] border-l-[3px] border-l-[#1cc978]
            border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3
            shadow-xl transition-all duration-300
            bottom-20 left-3 right-3
            sm:bottom-6 sm:left-auto sm:right-6 sm:min-w-[220px] sm:w-auto
            ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          `}
        >
          <p className="text-[12.5px] sm:text-[13px] font-medium text-white">{toast.msg}</p>
          <p className="text-[11.5px] sm:text-[12px] text-white/40 mt-0.5">{toast.sub}</p>
        </div>
      )}
    </>
  )
}

function Toggle({ on, locked, onChange }) {
  return (
    <button
      onClick={onChange}
      disabled={locked}
      className={`relative w-9 h-5 rounded-full shrink-0 ml-3 transition-colors duration-200 ${
        on ? 'bg-[#1cc978]' : 'bg-white/15'
      } ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ${
          on ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function CookieSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="rgba(255,255,255,0.9)" />
      <circle cx="5.5" cy="6" r="1.2" fill="#1cc978" />
      <circle cx="9.5" cy="5" r="0.9" fill="#1cc978" />
      <circle cx="10.5" cy="9" r="1.1" fill="#1cc978" />
      <circle cx="6" cy="10.5" r="0.8" fill="#1cc978" />
      <circle cx="8.5" cy="12" r="0.7" fill="#1cc978" />
    </svg>
  )
}