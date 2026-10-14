"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function ImageLightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest"
      >
        <X size={20} />
      </button>
      <div className="relative h-[85vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <Image src={src} alt={alt} fill quality={90} sizes="100vw" className="object-contain" />
      </div>
    </div>
  );
}
