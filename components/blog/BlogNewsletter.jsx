// components/blog/BlogNewsletter.jsx
'use client'

import { useState } from 'react'

export default function BlogNewsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | success | error

  async function handleSubmit() {
    if (!email || !email.includes('@')) return
    
    // Open Substack subscribe page with email pre-filled
    const url = `https://filstore.substack.com/subscribe?email=${encodeURIComponent(email)}` 
    window.open(url, '_blank')
    setStatus('success')
    setEmail('')
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-950 px-6 md:px-12 py-10 md:py-12">
      {/* Warm radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 75% 50%, rgba(217, 119, 6, 0.25), transparent 55%)',
        }}
      />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left */}
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <p className="text-zinc-300 text-xs font-semibold uppercase tracking-widest">
              Stay Plugged In
            </p>
          </div>
          <h3 className="text-white text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            Plug Into More Gist
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            One email a week — new gadget drops, honest reviews, and the occasional store gist. No spam, we promise.
          </p>
        </div>

        {/* Right */}
        <div className="w-full md:w-auto md:min-w-[460px]">
          {status === 'success' ? (
            <p className="text-green-400 font-medium text-sm text-center">
              ✅ You&apos;re in! Watch your inbox.
            </p>
          ) : (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1.5 pl-5 backdrop-blur-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="you@email.com"
                className="bg-transparent text-white text-sm placeholder:text-zinc-500 outline-none flex-1 min-w-0"
              />
              <button
                onClick={handleSubmit}
                className="bg-green-500 hover:bg-green-400 text-black text-sm font-semibold px-6 py-2.5 rounded-full transition-all shrink-0"
              >
                Plug In
              </button>
            </div>
          )}

          <p className="text-zinc-500 text-xs mt-3 text-center">
            Unsubscribe anytime · we no dey disturb
          </p>
        </div>
      </div>
    </div>
  )
}