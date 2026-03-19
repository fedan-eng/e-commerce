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
  const [localPrefs, setLocalPrefs] = useState({
    analytics: false,
    marketing: false,
    functional: false,
  })
  const [toast, setToast] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    if (modalOpen) {
      setLocalPrefs({
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        functional: preferences.functional,
      })
    }
  }, [modalOpen, preferences])

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

  if (!mounted) return null
  if (status !== 'pending') return null

  return (
    <>
      {/* ── Banner ── */}
      <div className="fixed bottom-6 right-6 z-[9999] w-[340px] rounded-2xl overflow-hidden bg-white border border-[#1cc978]/30 shadow-lg shadow-[#1cc978]/10">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-[#1cc978]">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <CookieSVG />
          </div>
          <div>
            <p className="text-white text-[13px] font-medium leading-none">We use cookies</p>
            <span className="text-white/75 text-[11px]">Filstore · filstore.com.ng</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pt-3.5 pb-1.5">
          <p className="text-[12.5px] text-gray-500 leading-relaxed">
            We use cookies to improve your shopping experience, personalise content, and analyse
            traffic.{' '}
            <a href="/cookie-policy" className="text-[#1cc978] font-medium hover:underline">
              Learn more
            </a>
          </p>
        </div>

        {/* Actions */}
        <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-2.5 rounded-lg text-[12.5px] font-medium bg-[#1cc978] text-white hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Accept all
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 py-2.5 rounded-lg text-[12.5px] font-medium bg-gray-100 text-gray-600 border border-black/[0.08] hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
              Decline
            </button>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-2.5 rounded-lg text-[12.5px] font-medium text-[#1cc978] border border-[#1cc978]/40 bg-transparent hover:bg-[#1cc978]/5 active:scale-[0.98] transition-all"
          >
            Customize preferences
          </button>
        </div>
      </div>

      {/* ── Preferences Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-black/[0.08] w-[320px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-black/[0.08]">
              <h3 className="text-[14px] font-medium text-gray-900">Cookie preferences</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Pref items */}
            <div className="px-4">
              {PREF_ITEMS.map((item, i) => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between py-3 ${
                    i < PREF_ITEMS.length - 1 ? 'border-b border-black/[0.06]' : ''
                  }`}
                >
                  <div>
                    <p className="text-[12.5px] font-medium text-gray-900">{item.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                  <Toggle
                    on={item.locked ? true : localPrefs[item.key]}
                    locked={item.locked}
                    onChange={() => !item.locked && togglePref(item.key)}
                  />
                </div>
              ))}
            </div>

            {/* Modal footer */}
            <div className="flex gap-2 px-4 pt-2.5 pb-4">
              <button
                onClick={handleSavePrefs}
                className="flex-1 py-2.5 rounded-lg text-[12px] font-medium bg-gray-100 text-gray-600 border border-black/[0.08] hover:bg-gray-200 active:scale-[0.98] transition-all"
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
          className={`fixed bottom-6 right-6 z-[10001] bg-white border-l-[3px] border-l-[#1cc978] border border-[#1cc978]/30 rounded-xl px-4 py-3 min-w-[220px] shadow-md transition-all duration-300 ${
            toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="text-[13px] font-medium text-gray-900">{toast.msg}</p>
          <p className="text-[12px] text-gray-400 mt-0.5">{toast.sub}</p>
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
        on ? 'bg-[#1cc978]' : 'bg-gray-200'
      } ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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