'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'filstore_cookie_consent'

const defaultPreferences = {
  necessary: true,
  analytics: true,
  marketing: false,
  functional: false,
}

const CookieConsentContext = createContext(null)

export function CookieConsentProvider({ children }) {
  const [status, setStatus] = useState('pending')
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      setStatus(parsed.status)
      setPreferences(parsed.preferences)
    }
    setMounted(true)
  }, [])

  const persist = (newStatus, newPrefs) => {
    const payload = { status: newStatus, preferences: newPrefs }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    setStatus(newStatus)
    setPreferences(newPrefs)
  }

  const acceptAll = () =>
    persist('accepted', { necessary: true, analytics: true, marketing: true, functional: true })

  const declineAll = () => persist('declined', defaultPreferences)

  const savePreferences = (prefs) => persist('customized', { necessary: true, ...prefs })

  const resetConsent = () => {
    localStorage.removeItem(STORAGE_KEY)
    setStatus('pending')
    setPreferences(defaultPreferences)
  }

  return (
    <CookieConsentContext.Provider
      value={{ status, preferences, acceptAll, declineAll, savePreferences, resetConsent, mounted }}
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