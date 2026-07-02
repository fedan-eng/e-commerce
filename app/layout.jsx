import "../styles/globals.css";
import { Providers } from "./providers";
import ConditionalShell from "@/components/ConditionalShell";
import AuthInitializer from "./AuthInitializer";
import ErrorBoundary from "@/components/ErrorBoundary";
import TiktokPixel from "@/components/TiktokPixel";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import CookieBanner from "@/components/CookieBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Oswald, Poppins, Roboto } from "next/font/google";
import TiktokPageView from "@/components/TiktokPageView";
import MetaPixel from "@/components/MetaPixel";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

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
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${poppins.variable} ${roboto.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <TiktokPixel />
        <MetaPixel />
        <TiktokPageView /> 
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