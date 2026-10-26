// app/cookie-policy/page.jsx

import Link from 'next/link'

export const metadata = {
  title: 'Cookie Policy | Filstore',
  description:
    'Learn how Filstore uses cookies and similar technologies on filstore.com.ng.',
}

const LAST_UPDATED = 'March 2026'

const sections = [
  {
    id: 'what-are-cookies',
    title: '1. What are cookies?',
    content: `Cookies are small text files that are placed on your device (phone, tablet, or computer) when you visit a website. They are widely used to make websites work properly, improve performance, and provide information to website owners.

When you visit Filstore, cookies may be stored in your browser. Each cookie contains a small amount of data — typically an anonymous unique identifier — that allows us or third-party services to recognise your browser the next time you visit.`,
  },
  {
    id: 'why-we-use',
    title: '2. Why we use cookies',
    content: `We use cookies at Filstore to:

• Keep your shopping cart intact as you browse different pages
• Remember that you are logged in to your account
• Understand how visitors use our store so we can improve it
• Measure the effectiveness of our marketing campaigns
• Personalise your shopping experience based on your preferences
• Ensure the security of your account and transactions`,
  },
  {
    id: 'types',
    title: '3. Types of cookies we use',
    subsections: [
      {
        title: 'Strictly necessary cookies',
        badge: 'Always active',
        locked: true,
        content:
          'These cookies are essential for Filstore to function. They enable core features like your shopping cart, account login, and secure checkout. Without these cookies, the services you have asked for cannot be provided. You cannot opt out of these cookies.',
        examples: ['Session ID (keeps you logged in)', 'Cart token (preserves your cart items)', 'CSRF token (protects against security attacks)'],
      },
      {
        title: 'Analytics cookies',
        badge: 'Optional',
        content:
          'These cookies help us understand how visitors interact with Filstore. We use Google Analytics to collect anonymous data about pages visited, time spent on site, and how users navigate. This helps us identify what is working well and what needs improvement.',
        examples: ['_ga (Google Analytics visitor ID, expires 2 years)', '_ga_XXXXXX (Google Analytics session, expires 2 years)'],
      },
      {
        title: 'Marketing cookies',
        badge: 'Optional',
        content:
          'These cookies track your activity across websites so that we can show you relevant ads on platforms like Facebook, Instagram, and Google. They are set by third-party advertising networks with our permission. If you decline, you may still see ads, but they will not be personalised to your interests.',
        examples: ['_fbp (Meta/Facebook Pixel, expires 3 months)', 'IDE (Google Ads, expires 1 year)'],
      },
      {
        title: 'Functional cookies',
        badge: 'Optional',
        content:
          'These cookies allow Filstore to remember choices you make, such as your delivery region or preferred language, to provide a more personalised experience. Declining these will not prevent you from using the site, but some features may not work as smoothly.',
        examples: ['region_pref (remembered delivery location)', 'recently_viewed (products you recently looked at)'],
      },
    ],
  },
  {
    id: 'third-party',
    title: '4. Third-party cookies',
    content: `Some cookies on Filstore are set by third-party services we use. These include:

• Google Analytics — website traffic analysis (analytics.google.com)
• Google Ads — advertising and conversion tracking (ads.google.com)
• Meta Pixel — Facebook and Instagram advertising (facebook.com)
• Vercel Analytics — performance and speed monitoring (vercel.com)

These third parties have their own privacy and cookie policies, which we encourage you to review. We do not control the cookies these services place on your device.`,
  },
  {
    id: 'managing',
    title: '5. Managing your cookie preferences',
    content: `You are always in control of your cookies on Filstore.

When you first visit our site, a cookie consent banner will appear asking for your preferences. You can choose to accept all cookies, decline non-essential cookies, or customise exactly which categories you allow.

You can update your preferences at any time by clearing your browser's local storage for filstore.com.ng and revisiting the site — the banner will reappear.

You can also manage or delete cookies directly through your browser settings. Here's how for popular browsers:

• Google Chrome: Settings → Privacy and security → Cookies and other site data
• Safari: Settings → Privacy → Manage Website Data
• Firefox: Settings → Privacy & Security → Cookies and Site Data
• Microsoft Edge: Settings → Cookies and site permissions

Please note that disabling all cookies may affect your ability to use certain features of Filstore, including your shopping cart and account login.`,
  },
  {
    id: 'local-storage',
    title: '6. localStorage and similar technologies',
    content: `In addition to cookies, Filstore uses browser localStorage to store certain information on your device. This includes:

• Your cookie consent decision (so we do not show the banner on every visit)
• Recently viewed products (so you can quickly find items you browsed)
• Cart items for guest users (so your cart persists between sessions)

Unlike cookies, localStorage data is not automatically sent to our servers with each request. It stays on your device until you clear your browser data or it is explicitly removed.`,
  },
  {
    id: 'retention',
    title: '7. How long do cookies last?',
    content: `Different cookies have different lifetimes:

• Session cookies — deleted when you close your browser
• Persistent cookies — remain for a set period (e.g. Google Analytics _ga cookie lasts 2 years)
• Third-party cookies — governed by the third party's own retention policy

We do not keep cookies longer than necessary for their stated purpose.`,
  },
  {
    id: 'ndpr',
    title: '8. Compliance with Nigerian law (NDPR)',
    content: `Filstore is operated by Fedan Investment Limited, a company based in Nigeria. We are committed to complying with the Nigeria Data Protection Regulation (NDPR) issued by the National Information Technology Development Agency (NITDA).

Under the NDPR, we are required to obtain your informed consent before placing non-essential cookies on your device. Our cookie consent banner fulfils this requirement. You have the right to withdraw your consent at any time.

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

          {/* Footer CTA */}
          <div className="mt-10 flex flex-col items-start gap-4 rounded-[24px] bg-sage p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
            <div>
              <p className="text-lg font-bold text-forest">Want to update your cookie choices?</p>
              <p className="mt-1 text-sm text-muted">
                Go back to the homepage and use the cookie banner to update your preferences.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex h-11 shrink-0 items-center rounded-full bg-forest px-5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Back to Filstore
            </Link>
          </div>
        </article>
      </div>
    </main>
  )
}
