// app/cookie-policy/page.jsx

import Link from 'next/link'
import CookieChoice from '@/components/CookieChoice'

export const metadata = {
  title: 'Cookie Policy | Filstore',
  description:
    'Learn how Filstore uses cookies and similar technologies on filstore.com.ng.',
}

const LAST_UPDATED = 'November 2026'

const sections = [
  {
    id: 'what-are-cookies',
    title: '1. What are cookies?',
    content: `Cookies are small text files that are placed on your device (phone, tablet, or computer) when you visit a website. They are widely used to make websites work properly, improve performance, and provide information to website owners.

When you visit Filstore, cookies may be stored in your browser. Each cookie contains a small amount of data, typically an anonymous unique identifier, that allows us or third-party services to recognise your browser the next time you visit.`,
  },
  {
    id: 'your-choice',
    title: '2. Your choice: Basic or All',
    content: `When you first visit Filstore, a banner asks you to choose between two options:

• Basic: the cookies Filstore needs to work, plus analytics that show us how the store is used. Basic is always on, and it is what applies until you make a choice.
• All: everything in Basic, plus marketing cookies from Meta (Facebook and Instagram) and TikTok, so we can measure our ads and show you relevant FIL ads on those platforms.

Choosing Basic does not stop you seeing ads. They just will not be based on your visits to Filstore. You can change your choice at any time at the bottom of this page.`,
  },
  {
    id: 'types',
    title: '3. What each option includes',
    subsections: [
      {
        title: 'Strictly necessary',
        badge: 'Basic and All',
        locked: true,
        content:
          'These cookies keep Filstore working: your shopping cart, your account login and secure checkout. Without them, the services you ask for cannot be provided.',
        examples: [
          'token (keeps you signed in)',
          'visitor_cart (keeps a guest cart while you sign in)',
          'fil_ref (the creator code from a link you opened, so its discount applies at checkout, expires 30 days)',
          'filstore_cookie_consent (remembers your Basic or All choice)',
        ],
      },
      {
        title: 'Analytics',
        badge: 'Basic and All',
        locked: true,
        content:
          'These help us understand how visitors use Filstore: which pages are visited, how long people stay and where they get stuck, so we can improve the store. The information is used in aggregate, and IP addresses are anonymised in Google Analytics. We do not sell it.',
        examples: [
          '_ga, _ga_* (Google Analytics visitor and session IDs, expire 2 years)',
          '_clck, _clsk (Microsoft Clarity, which shows how pages are used, expire up to 1 year)',
          'Vercel Analytics and Speed Insights (page speed and visits, no cookies)',
          'fil_vid (random ID that counts each visit from a creator link once a day)',
        ],
      },
      {
        title: 'Marketing',
        badge: 'All only',
        content:
          'These are set by Meta and TikTok when you choose All. They tell us which ads bring people to Filstore and help those platforms show you relevant FIL ads. They are never set if you choose Basic.',
        examples: [
          '_fbp (Meta Pixel for Facebook and Instagram, expires 3 months)',
          '_ttp (TikTok Pixel, expires up to 13 months)',
        ],
      },
    ],
  },
  {
    id: 'third-party',
    title: '4. Third-party services',
    content: `Some cookies on Filstore are set by services we use:

• Google Analytics: website traffic analysis (Basic)
• Microsoft Clarity: how pages are used, such as clicks and scrolling (Basic)
• Vercel Analytics: page speed and visits (Basic)
• Meta Pixel: Facebook and Instagram advertising (All only)
• TikTok Pixel: TikTok advertising (All only)

These services have their own privacy and cookie policies, which we encourage you to review. We do not control the cookies they place on your device.`,
  },
  {
    id: 'managing',
    title: '5. Changing your choice',
    content: `You can switch between Basic and All at any time with the buttons at the bottom of this page. If you switch from All to Basic, the page reloads so the marketing cookies stop straight away.

You can also delete cookies through your browser settings:

• Google Chrome: Settings → Privacy and security → Cookies and other site data
• Safari: Settings → Privacy → Manage Website Data
• Firefox: Settings → Privacy & Security → Cookies and Site Data
• Microsoft Edge: Settings → Cookies and site permissions

Please note that blocking all cookies in your browser will stop your shopping cart and account login from working.`,
  },
  {
    id: 'local-storage',
    title: '6. localStorage and similar technologies',
    content: `In addition to cookies, Filstore uses your browser's localStorage to keep some information on your device:

• Your Basic or All choice, so we do not show the banner on every visit
• Your cart and wishlist, so they are still there when you come back
• Recently viewed products, so you can quickly find items you looked at
• Delivery details you entered at checkout, so you do not have to type them again

Unlike cookies, localStorage data is not sent to our servers with each request. It stays on your device until you clear your browser data.`,
  },
  {
    id: 'retention',
    title: '7. How long do cookies last?',
    content: `Different cookies have different lifetimes:

• Session cookies: deleted when you close your browser
• Persistent cookies: remain for a set period (for example, the Google Analytics _ga cookie lasts 2 years)
• Third-party cookies: governed by the third party's own retention policy

We do not keep cookies longer than necessary for their stated purpose.`,
  },
  {
    id: 'ndpa',
    title: '8. Nigerian data protection law',
    content: `Filstore is operated by Fedan Investment Limited, a company based in Nigeria. We are committed to complying with the Nigeria Data Protection Act 2023 and the Nigeria Data Protection Regulation (NDPR).

We ask for your consent before setting marketing cookies, and you can withdraw it at any time by switching to Basic. Analytics cookies are part of Basic because we rely on them to keep the store working well. They are used only to improve Filstore and are never sold.

For questions about how we handle your personal data more broadly, please refer to our Privacy Policy.`,
  },
  {
    id: 'changes',
    title: '9. Changes to this policy',
    content: `We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or the services we use. When we make significant changes, we will update the "Last updated" date at the top of this page.

We encourage you to review this policy periodically. Continued use of Filstore after changes are posted constitutes your acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '10. Contact us',
    content: `If you have any questions about how Filstore uses cookies, please contact us:

Fedan Investment Limited
Email: filsmteam@gmail.com
Website: filstore.com.ng
Lagos, Nigeria`,
  },
]

// Paragraphs are separated by blank lines; lines starting with "•" become a list
function Prose({ text }) {
  return text.split('\n\n').map((block, i) => {
    const lines = block.split('\n')
    const items = lines.filter((l) => l.startsWith('• '))
    if (!items.length) {
      return (
        <p key={i} className="whitespace-pre-line">
          {block}
        </p>
      )
    }
    const intro = lines.filter((l) => !l.startsWith('• ')).join('\n')
    return (
      <div key={i}>
        {intro && <p className="mb-2 whitespace-pre-line">{intro}</p>}
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
              {item.slice(2)}
            </li>
          ))}
        </ul>
      </div>
    )
  })
}

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-8 font-roboto sm:px-6 md:pt-12">
      {/* Header */}
      <span className="inline-block rounded-full bg-mint px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest">
        Legal
      </span>
      <h1 className="mt-4 text-[24px] font-bold tracking-tight text-forest sm:text-[30px] md:text-[40px]">Cookie policy</h1>
      <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-muted">
        How Filstore uses cookies and similar technologies when you visit filstore.com.ng. Please read it alongside
        our{' '}
        <Link href="/policies#privacy" className="font-semibold text-forest underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
      <p className="mt-3 text-[13px] text-muted/80">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        {/* Contents */}
        <nav aria-label="Contents" className="rounded-[24px] bg-sage p-5 lg:sticky lg:top-24">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Contents</p>
          <ol className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-full px-3 py-1.5 text-sm text-forest transition-colors hover:bg-white"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article>
          <div className="divide-y divide-line border-y border-line">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 py-8">
                <h2 className="text-xl font-bold tracking-tight text-forest md:text-2xl">{section.title}</h2>

                {section.content && (
                  <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted">
                    <Prose text={section.content} />
                  </div>
                )}

                {/* Cookie categories */}
                {section.subsections && (
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {section.subsections.map((sub) => (
                      <div key={sub.title} className="flex flex-col rounded-[24px] bg-sage p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-forest">{sub.title}</h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              sub.locked ? 'bg-forest text-white' : 'bg-mint text-forest'
                            }`}
                          >
                            {sub.badge}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{sub.content}</p>
                        <div className="mt-4 border-t border-line pt-3">
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                            Examples
                          </p>
                          <ul className="space-y-1">
                            {sub.examples.map((ex) => (
                              <li key={ex} className="flex gap-2.5 text-[13px] text-forest">
                                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                                {ex}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Change your choice */}
          <div id="change-choice" className="mt-10 scroll-mt-24 rounded-[24px] bg-sage p-6 md:p-8">
            <p className="text-lg font-bold text-forest">Change your cookie choice</p>
            <p className="mb-4 mt-1 text-sm text-muted">
              Basic keeps the store working and shows us how it&apos;s used. All also allows the Meta and TikTok ad pixels.
            </p>
            <CookieChoice />
          </div>
        </article>
      </div>
    </main>
  )
}
