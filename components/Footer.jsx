"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import { SOCIALS } from "@/lib/socials";

const SOCIAL_ICONS = { TikTok: FaTiktok, Instagram: FaInstagram, Facebook: FaFacebookF };
import FloatingActions from "@/components/FloatingActions";

const Footer = () => {
  const pathname = usePathname();

  const staticPaths = ["/register", "/login", "/verify-email", "/reset-password", "/reset-password/token"];
  const noNavigationMenu = staticPaths.includes(pathname);

  if (noNavigationMenu) return null;

  return (
    <>
      {/* ✅ NEW REDESIGNED PIXEL-PERFECT FOOTER */}
      <footer className="bg-[#082C17] pt-16 pb-8 md:pt-20 text-white relative">
        
        {/* Floating Action Buttons (WhatsApp & back to top) */}
        <FloatingActions />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
            
            {/* Col 1: Brand & Socials */}
            <div className="flex flex-col gap-5 max-w-sm">
              <Image src="/fillogo-white.webp" alt="Fil Store Logo" width={65} height={28} className="brightness-200 contrast-100" />
              <p className="text-white/80 text-[14px] leading-relaxed">
                Everyday tech for real Nigerian days.<br />
                {/* Extensions hidden — no stock. Was: "Power banks, audio, chargers, cables, sockets and fans." */}
                Power banks, audio, chargers, cables and fans.
              </p>
              <div className="flex items-center gap-5 mt-2">
                {SOCIALS.map(({ name, url }) => {
                  const Icon = SOCIAL_ICONS[name];
                  return (
                    <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`FIL on ${name}`}
                      className="text-white hover:text-[#00E575] transition-colors">
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Col 2: Shop */}
            <div>
              <h3 className="font-semibold text-white text-[15px] mb-5">Shop</h3>
              <ul className="flex flex-col gap-3.5">
                <li><Link href="/products?categories=Power+Bank" className="text-white/70 hover:text-white text-[14px] transition-colors">Power banks</Link></li>
                <li><Link href="/products?categories=Wearables" className="text-white/70 hover:text-white text-[14px] transition-colors">Audio</Link></li>
                <li><Link href="/products?categories=Chargers" className="text-white/70 hover:text-white text-[14px] transition-colors">Charging</Link></li>
                <li><Link href="/products?categories=Cables" className="text-white/70 hover:text-white text-[14px] transition-colors">Cables</Link></li>
                <li><Link href="/products?categories=Lifestyle" className="text-white/70 hover:text-white text-[14px] transition-colors">Fans</Link></li>
                {/* Extensions hidden — no stock
                <li><Link href="/products?categories=Extensions" className="text-white/70 hover:text-white text-[14px] transition-colors">Sockets</Link></li>
                */}
              </ul>
            </div>

            {/* Col 3: Help */}
            <div>
              <h3 className="font-semibold text-white text-[15px] mb-5">Help</h3>
              <ul className="flex flex-col gap-3.5">
                <li><Link href="/contact#track" className="text-white/70 hover:text-white text-[14px] transition-colors">Track your order</Link></li>
                <li><Link href="/policies" className="text-white/70 hover:text-white text-[14px] transition-colors">Delivery and payment</Link></li>
                <li><Link href="/policies" className="text-white/70 hover:text-white text-[14px] transition-colors">Returns and warranty</Link></li>
                <li><Link href="/blog" className="text-white/70 hover:text-white text-[14px] transition-colors">Blog</Link></li>
                <li><Link href="https://wa.me/2347018900705" className="text-white/70 hover:text-white text-[14px] transition-colors">WhatsApp support</Link></li>
              </ul>
            </div>

            {/* Col 4: Visit Us */}
            <div>
              <h3 className="font-semibold text-white text-[15px] mb-5">Visit us</h3>
              <ul className="flex flex-col gap-6">
                <li>
                  <p className="font-semibold text-white text-[14px] mb-1">Ikeja</p>
                  <p className="text-white/70 text-[13px] leading-snug mb-0.5">3 Otigba St, Computer Village</p>
                  <a href="tel:07025004757" className="text-white/70 text-[13px] hover:text-[#00E575] transition-colors">0702 500 4757</a>
                </li>
                <li>
                  <p className="font-semibold text-white text-[14px] mb-1">Alaba</p>
                  <p className="text-white/70 text-[13px] leading-snug mb-0.5">20 Fedan St, Ojo, Lagos</p>
                  <a href="tel:07018900705" className="text-white/70 text-[13px] hover:text-[#00E575] transition-colors">0701 890 0705</a>
                </li>
                <li>
                  <p className="font-semibold text-white text-[14px] mb-1">Awka</p>
                  <p className="text-white/70 text-[13px] leading-snug">Awka, Anambra</p>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Row */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-[13px]">
              © 2026 FIL E-Commerce
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-[13px]">Secure payments by</span>
                <div className="bg-white rounded-sm px-2 py-1 flex items-center justify-center">
                  <Image src="/paystack.png" alt="Paystack" width={100} height={60} className="h-3 w-auto object-contain" />
                </div>
              </div>
              <Link href="/policies" className="text-white/60 hover:text-white text-[13px] transition-colors">Terms</Link>
              <Link href="/policies" className="text-white/60 hover:text-white text-[13px] transition-colors">Privacy</Link>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;