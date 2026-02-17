import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
import AuthInitializer from "./AuthInitializer";

export const metadata = {
  title: "FIL Store",
  description:
    "At FIL, we take pride in offering quality products at unbeatable prices, making us the go-to destination for anyone who values quality.(Think quality, think FIL)",
  icons: {
    icon: "/fillogo.png",
    apple: "/fillogo.png",
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
          <Navbar />
          <div className="mx-auto w-full max-w-[1640px] overflow-x-hidden font-roboto">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
