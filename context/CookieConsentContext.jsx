'use client'

// Two cookie choices, set from the cookie banner (components/CookieBanner.jsx):
//   basic: what the site needs to work, plus analytics (Google Analytics, Microsoft Clarity,
//          Vercel Analytics). These run for every visitor, so traffic numbers are complete.
//   all:   basic, plus the Meta and TikTok ad pixels.
// Until a visitor chooses, they get basic. The policy is at /cookie-policy.
import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'filstore_cookie_consent'

const preferencesFor = (status) => ({
  necessary: true,
  analytics: true,
  marketing: status === 'all',
})

// Earlier versions saved accepted / declined / customized with per-category switches
function choiceFrom(saved) {
  if (saved?.status === 'all' || saved?.status === 'basic') return saved.status
  if (saved?.status === 'accepted') return 'all'
  if (saved?.status === 'customized') return saved.preferences?.marketing ? 'all' : 'basic'
  if (saved?.status === 'declined') return 'basic'
  return 'pending'
}

const CookieConsentContext = createContext(null)

export function CookieConsentProvider({ children }) {
  const [status, setStatus] = useState('pending')
  const [mounted, setMounted] = useState(false)

  const persist = (choice) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: choice, preferences: preferencesFor(choice) }))
    } catch {}
    setStatus(choice)
  }

  useEffect(() => {
    let saved = null
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    } catch {}
    const choice = choiceFrom(saved)
    if (choice !== 'pending' && choice !== saved.status) persist(choice) // rewrite old saves in the new shape
    else setStatus(choice)
    setMounted(true)
  }, [])

  // Turning the ad pixels off needs a reload: they can't be unloaded from a running page
  const choose = (choice) => {
    const pixelsWereOn = status === 'all'
    persist(choice)
    if (pixelsWereOn && choice !== 'all') window.location.reload()
  }

  const resetConsent = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setStatus('pending')
  }

  return (
    <CookieConsentContext.Provider
      value={{
        status,
        preferences: preferencesFor(status),
        chooseBasic: () => choose('basic'),
        chooseAll: () => choose('all'),
        resetConsent,
        mounted,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useCookieConsent must be used inside CookieConsentProvider')
  return ctx
}
