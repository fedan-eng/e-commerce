// components/blog/BlogNewsletter.jsx
'use client'

import { useState } from 'react'

export default function BlogNewsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  async function handleSubmit() {
    if (!email || !email.includes('@')) return
    setStatus('loading')

    try {
      // Wire to your actual newsletter endpoint / Substack subscribe URL
      // e.g. await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) })
      await new Promise((r) => setTimeout(r, 1000)) // demo delay
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="rounded-2xl bg-zinc-900 px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
      {/* Left */}
      <div className="max-w-sm">
        <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-2">
          Stay Plugged In
        </p>
        <h3 className="text-white text-2xl font-bold mb-2">Plug Into More Gist</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          One email a week — new gadget drops, honest reviews, charging tips, and the occasional store gist. No spam, we promise.
        </p>
      </div>

      {/* Right */}
      <div className="w-full md:w-auto">
        {status === 'success' ? (
          <p className="text-green-400 font-medium text-sm">
            ✅ You&apos;re in! Watch your inbox.
          </p>
        ) : (
          <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full p-1 pl-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="you@example.com"
              className="bg-transparent text-white text-sm placeholder:text-zinc-500 outline-none flex-1 min-w-0 w-48"
            />
            <button
              onClick={handleSubmit}
              disabled={status === 'loading'}
              className="bg-green-500 hover:bg-green-400 disabled:opacity-60 text-black text-sm font-semibold px-5 py-2 rounded-full transition-all shrink-0"
            >
              {status === 'loading' ? '...' : 'Plug In'}
            </button>
          </div>
        )}
        {status === 'error' && (
          <p className="text-red-400 text-xs mt-2">Something went wrong. Try again.</p>
        )}
        <p className="text-zinc-500 text-[11px] mt-2 text-center md:text-left">
          Unsubscribe anytime — we no dey disturb.
        </p>
      </div>
    </div>
  )
}