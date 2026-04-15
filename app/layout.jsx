import "../styles/globals.css";
import { Providers } from "./providers";
import ConditionalShell from "@/components/ConditionalShell";
import AuthInitializer from "./AuthInitializer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import CookieBanner from "@/components/CookieBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";


export const metadata = {
  title: "FIL Store",
  description:
    "At FIL, we take pride in offering quality products at unbeatable prices, making us the go-to destination for anyone who values quality.(Think quality, think FIL)",
  icons: {
    icon: "/fillogo.ico",
    apple: "/fillogo.ico",
  },
  verification: {
    google: "F4YtRJObu3UIQ0aKa9qg3vBcTduL3MxF5mlHoxLyr94",
  },
  other: {
    preconnect: [
      { href: "https://fonts.googleapis.com", rel: "preconnect" },
      { href: "https://fonts.gstatic.com", rel: "preconnect", crossOrigin: "anonymous" },
    ],
  },
  links: [
    {
      href: "https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
      rel: "stylesheet",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
<TiktokPixel />
        <ErrorBoundary>
          <CookieConsentProvider>
            <Providers>
              <AuthInitializer />
              <Analytics />
              <SpeedInsights />
              <ConditionalShell>{children}</ConditionalShell>
              <CookieBanner />
              <GoogleAnalytics />
            </Providers>
          </CookieConsentProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}