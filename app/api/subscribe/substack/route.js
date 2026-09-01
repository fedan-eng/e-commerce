// app/api/subscribe/substack/route.js
import { NextResponse } from 'next/server'

const SUBSTACK_SUBDOMAIN = 'filstore'

export async function POST(req) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://${SUBSTACK_SUBDOMAIN}.substack.com/api/v1/free`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_url: 'https://filstore.com.ng',
          first_referrer: '',
          current_url: 'https://filstore.com.ng/blog',
          current_referrer: '',
          referral_code: '',
          source: 'embed',
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('[Subscribe/Substack] Error:', err)
      return NextResponse.json({ error: 'Subscription failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Subscribe/Substack] Network error:', err.message)
    return NextResponse.json({ error: 'Network error' }, { status: 500 })
  }
}
