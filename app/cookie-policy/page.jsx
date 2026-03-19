// app/cookie-policy/page.jsx

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
        badgeColor: 'green',
        content:
          'These cookies are essential for Filstore to function. They enable core features like your shopping cart, account login, and secure checkout. Without these cookies, the services you have asked for cannot be provided. You cannot opt out of these cookies.',
        examples: ['Session ID (keeps you logged in)', 'Cart token (preserves your cart items)', 'CSRF token (protects against security attacks)'],
      },
      {
        title: 'Analytics cookies',
        badge: 'Optional',
        badgeColor: 'blue',
        content:
          'These cookies help us understand how visitors interact with Filstore. We use Google Analytics to collect anonymous data about pages visited, time spent on site, and how users navigate. This helps us identify what is working well and what needs improvement.',
        examples: ['_ga (Google Analytics visitor ID, expires 2 years)', '_ga_XXXXXX (Google Analytics session, expires 2 years)'],
      },
      {
        title: 'Marketing cookies',
        badge: 'Optional',
        badgeColor: 'amber',
        content:
          'These cookies track your activity across websites so that we can show you relevant ads on platforms like Facebook, Instagram, and Google. They are set by third-party advertising networks with our permission. If you decline, you may still see ads, but they will not be personalised to your interests.',
        examples: ['_fbp (Meta/Facebook Pixel, expires 3 months)', 'IDE (Google Ads, expires 1 year)'],
      },
      {
        title: 'Functional cookies',
        badge: 'Optional',
        badgeColor: 'purple',
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

const badgeStyles = {
  green: 'bg-[#1cc978]/15 text-[#1cc978]',
  blue: 'bg-blue-500/10 text-blue-400',
  amber: 'bg-amber-500/10 text-amber-400',
  purple: 'bg-purple-500/10 text-purple-400',
}

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] text-white">
      {/* Hero */}
      <div className="border-b border-white/[0.07] bg-[#111]">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="inline-flex items-center gap-2 bg-[#1cc978]/10 border border-[#1cc978]/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1cc978]" />
            <span className="text-[#1cc978] text-[11px] font-medium tracking-wide uppercase">
              Legal
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-white mb-3 leading-tight">
            Cookie Policy
          </h1>
          <p className="text-white/45 text-[15px] leading-relaxed max-w-xl">
            This policy explains how Filstore uses cookies and similar technologies when you visit{' '}
            <span className="text-white/70">filstore.com.ng</span>. Please read it alongside our
            Privacy Policy.
          </p>
          <p className="text-white/30 text-[13px] mt-5">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Quick nav */}
        <div className="bg-[#1a1a1a] border border-white/[0.07] rounded-xl p-5 mb-12">
          <p className="text-[12px] font-medium text-white/40 uppercase tracking-wider mb-3">
            Contents
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-[13px] text-white/50 hover:text-[#1cc978] transition-colors py-0.5"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-14">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-[18px] font-medium text-white mb-4 pb-3 border-b border-white/[0.07]">
                {section.title}
              </h2>

              {/* Regular content */}
              {section.content && (
                <div className="text-[14.5px] text-white/55 leading-[1.85] whitespace-pre-line">
                  {section.content}
                </div>
              )}

              {/* Subsections (cookie types) */}
              {section.subsections && (
                <div className="space-y-4">
                  {section.subsections.map((sub) => (
                    <div
                      key={sub.title}
                      className="bg-[#1a1a1a] border border-white/[0.07] rounded-xl p-5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-[14px] font-medium text-white">{sub.title}</h3>
                        <span
                          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                            badgeStyles[sub.badgeColor]
                          }`}
                        >
                          {sub.badge}
                        </span>
                      </div>
                      <p className="text-[13.5px] text-white/50 leading-relaxed mb-3">
                        {sub.content}
                      </p>
                      <div className="border-t border-white/[0.06] pt-3">
                        <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2">
                          Examples
                        </p>
                        <ul className="space-y-1">
                          {sub.examples.map((ex) => (
                            <li
                              key={ex}
                              className="flex items-start gap-2 text-[13px] text-white/40"
                            >
                              <span className="text-[#1cc978] mt-0.5 shrink-0">›</span>
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
        <div className="mt-16 bg-[#1a1a1a] border border-white/[0.07] rounded-2xl p-7 text-center">
          <div className="w-10 h-10 rounded-full bg-[#1cc978]/10 flex items-center justify-center mx-auto mb-4">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" fill="rgba(28,201,120,0.2)" />
              <circle cx="5.5" cy="6" r="1.2" fill="#1cc978" />
              <circle cx="9.5" cy="5" r="0.9" fill="#1cc978" />
              <circle cx="10.5" cy="9" r="1.1" fill="#1cc978" />
              <circle cx="6" cy="10.5" r="0.8" fill="#1cc978" />
              <circle cx="8.5" cy="12" r="0.7" fill="#1cc978" />
            </svg>
          </div>
          <h3 className="text-[15px] font-medium text-white mb-1.5">
            Want to update your cookie choices?
          </h3>
          <p className="text-[13px] text-white/40 mb-5 max-w-sm mx-auto">
  Go back to the homepage and use the cookie banner to update your preferences.
</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[#1cc978] text-white text-[13px] font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Filstore
          </a>
        </div>
      </div>
    </main>
  )
}