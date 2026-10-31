"use client";
// components/FloatingActions.jsx — WhatsApp + back-to-top buttons (bottom right of every page)
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { WHATSAPP_URL } from "@/lib/categories";

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  // Back-to-top only once the visitor has scrolled a bit
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-[105px] right-4 z-50 flex flex-col items-end gap-3 md:right-[34px]">
      <AnimatePresence>
        {showTop && (
          <motion.button
            key="top"
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#004328] text-white shadow-[0_10px_24px_-8px_rgba(0,67,40,0.6)] transition-colors hover:bg-[#0A321B] sm:h-12 sm:w-12"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group flex h-11 items-center overflow-hidden rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_-8px_rgba(37,211,102,0.7)] transition-all duration-300 sm:h-12"
      >
        {/* Label slides out on hover (desktop) */}
        <span className="max-w-0 whitespace-nowrap pl-0 text-[13px] font-semibold opacity-0 transition-all duration-300 group-hover:max-w-[140px] group-hover:pl-4 group-hover:opacity-100">
          Chat with us
        </span>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center sm:h-12 sm:w-12">
          <FaWhatsapp size={24} />
        </span>
      </a>
    </div>
  );
}
