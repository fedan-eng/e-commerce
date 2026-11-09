'use client'

// Change-your-choice buttons on the cookie policy page
import toast from 'react-hot-toast'
import { useCookieConsent } from '../context/CookieConsentContext'
import { cookieBtn } from './CookieBanner'

export default function CookieChoice() {
  const { status, chooseBasic, chooseAll, mounted } = useCookieConsent()

  const current = !mounted ? '' : status === 'all' ? 'All cookies' : status === 'basic' ? 'Basic only' : 'Basic (you haven’t chosen yet)'

  return (
    <div className="flex flex-col items-start gap-3">
      {current && (
        <p className="text-sm text-muted">
          Your current choice: <b className="font-semibold text-forest">{current}</b>
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { chooseAll(); toast.success('All cookies allowed') }}
          disabled={status === 'all'}
          className={`${cookieBtn.primary} disabled:cursor-default disabled:opacity-50`}
        >
          Allow all
        </button>
        <button
          type="button"
          onClick={() => { chooseBasic(); toast('Basic cookies only') }}
          disabled={status === 'basic'}
          className={`${cookieBtn.outline} disabled:cursor-default disabled:opacity-50`}
        >
          Basic only
        </button>
      </div>
    </div>
  )
}
