import "../styles/globals.css";
import { Providers } from "./providers";
import ConditionalShell from "@/components/ConditionalShell";
import AuthInitializer from "./AuthInitializer";
import ProfileCompletionChecker from "@/components/ProfileCompletionChecker";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Oswald, Poppins, Roboto } from "next/font/google";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import AnalyticsProvider from "./AnalyticsProvider";
import CartAnimationProvider from "@/context/CartAnimationProvider";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto",
  display: "swap",
  preload: true,
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${poppins.variable} ${roboto.variable}`}
      suppressHydrationWarning
    >
      <head>
      </head>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <CookieConsentProvider>
            <Providers>
              <CartAnimationProvider>
                <AuthInitializer />
                <ProfileCompletionChecker />
                <ConditionalShell>{children}</ConditionalShell>
                {/* Load analytics after main content */}
                <AnalyticsProvider />
              </CartAnimationProvider>
            </Providers>
          </CookieConsentProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}