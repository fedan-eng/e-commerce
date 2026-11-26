// components/ConditionalShell.jsx
"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// import PromoPopup from "@/components/PromoPopup"; // welcome 10% off popup, off for now
import BlackFridayPopup from "@/components/BlackFridayPopup";
import { isBlackFridayLive } from "@/lib/blackFriday";
import MinimumLoader from "@/components/MinimumLoader";

export default function ConditionalShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin_console");

  // The admin console brings its own full-width shell; the store's wrapper
  // (overflow-x-hidden) would also stop its sticky sidebar and top bar working.
  if (isAdmin) return children;

  return (
    <>
      <Navbar />
       {/* overflow-x-clip, not -hidden: "hidden" makes this a scroll box of its own, and a section
           still sliding in near the bottom then gave the page a second scrollbar */}
       <div className="mx-auto w-full max-w-[1640px] overflow-x-clip font-roboto">
      {children}
       </div>
      <Footer />
      {/* The flash deals popup while Black Friday runs. The welcome 10% off popup is off for now;
          to bring it back: {isBlackFridayLive() ? <BlackFridayPopup /> : <PromoPopup />} */}
      {isBlackFridayLive() && <BlackFridayPopup />}
      <MinimumLoader />
    </>
  );
}