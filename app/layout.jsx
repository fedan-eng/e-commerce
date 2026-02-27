import "../styles/globals.css";
import { Providers } from "./providers";
import ConditionalShell from "@/components/ConditionalShell";
import AuthInitializer from "./AuthInitializer";
import { Suspense } from "react";

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
    <html lang="en">
      <body>
        <Providers>
          <AuthInitializer />
             <Suspense fallback={<div>Loading...</div>}>
            <ConditionalShell>{children}</ConditionalShell>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
