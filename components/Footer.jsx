"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Twitter, Facebook, Instagram } from "lucide-react";

const sliderImages = ["/budgirl.png", "/budgirl.png", "/budgirl.png"];

const Footer = () => {
  const pathname = usePathname();

  const staticPaths = ["/register", "/login", "/verify", "/reset-password"];
  const noNavigationMenu = staticPaths.includes(pathname);

  // Pages where cart FAB should not be visible
  const noCartFabPaths = ["/cart", "/checkout", "/admin_console"];
  const shouldHideCartFab = noCartFabPaths.some((path) => pathname.startsWith(path));

  // ✅ Size Constants for Cart FAB
  const CART_SIZE = 110;
  const CART_MARGIN = 24;

  // ✅ State & Refs
  const [isOverlayOpen, setIsOverlayOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("fil_promo_seen");
  });
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Cart FAB State
  const [cartPos, setCartPos] = useState({ x: 0, y: 180 });
  const [cartIsDragging, setCartIsDragging] = useState(false);
  const [cartPressed, setCartPressed] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartRef = useRef(null);
  const cartDragState = useRef({
    startMouseX: 0, startMouseY: 0,
    startElemX: 0, startElemY: 180,
    dragged: false,
  });

  const slideIntervalRef = useRef(null);
  const autoOpenTimerRef = useRef(null);

  // Get Cart items
  const cartItems = useSelector((state) => state.cart?.items || []);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ✅ Initial Mount & Resize Handling
  useEffect(() => {
    setHasMounted(true);
    const initialX = window.innerWidth - CART_SIZE - CART_MARGIN;
    setCartPos({ x: initialX, y: 180 });
    cartDragState.current.startElemX = initialX;

    const handleResize = () => {
      setCartPos((prev) => {
        const maxX = window.innerWidth - CART_SIZE - CART_MARGIN;
        const maxY = window.innerHeight - CART_SIZE - 60;
        return {
          x: Math.min(Math.max(prev.x, CART_MARGIN), maxX),
          y: Math.min(Math.max(prev.y, 60), maxY),
        };
      });
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Check for mobile menu to hide FAB
  useEffect(() => {
    const checkMenuOpen = () => setIsMobileMenuOpen(document.body.style.overflow === "hidden");
    checkMenuOpen();
    const interval = setInterval(checkMenuOpen, 100);
    return () => clearInterval(interval);
  }, []);

  // ✅ Promo Overlay Logic
  useEffect(() => {
    if (pathname === "/" && !localStorage.getItem("fil_promo_seen")) {
      autoOpenTimerRef.current = setTimeout(() => setIsOverlayOpen(true), 120000);
    }
    return () => clearTimeout(autoOpenTimerRef.current);
  }, [pathname]);

  useEffect(() => {
    if (!isOverlayOpen) {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
      return;
    }
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(slideIntervalRef.current);
  }, [isOverlayOpen]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setIsOverlayOpen(false);
    if (isOverlayOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOverlayOpen]);

  if (noNavigationMenu) return null;

  // ✅ Cart Drag Logic
  const clampCartY = (y) => {
    const maxY = window.innerHeight - CART_SIZE - 60;
    return Math.min(Math.max(y, 60), maxY);
  };

  const doCartSnap = (currentX, currentY) => {
    const centerX = currentX + CART_SIZE / 2;
    const nearLeft = centerX < window.innerWidth / 2;
    setCartPos({
      x: nearLeft ? CART_MARGIN : window.innerWidth - CART_SIZE - CART_MARGIN,
      y: clampCartY(currentY),
    });
  };

  const onCartPointerDown = (e) => {
    e.preventDefault();
    cartDragState.current = {
      startMouseX: e.clientX, startMouseY: e.clientY,
      startElemX: cartPos.x, startElemY: cartPos.y,
      dragged: false,
    };
    setCartIsDragging(true);
    setCartPressed(true);
    cartRef.current?.setPointerCapture(e.pointerId);
  };

  const onCartPointerMove = (e) => {
    if (!cartIsDragging) return;
    const dx = e.clientX - cartDragState.current.startMouseX;
    const dy = e.clientY - cartDragState.current.startMouseY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) cartDragState.current.dragged = true;
    setCartPos({
      x: cartDragState.current.startElemX + dx,
      y: clampCartY(cartDragState.current.startElemY + dy),
    });
  };

  const onCartPointerUp = () => {
    if (!cartIsDragging) return;
    setCartIsDragging(false);
    setCartPressed(false);
    if (!cartDragState.current.dragged) window.location.href = "/cart";
    doCartSnap(cartPos.x, cartPos.y);
  };

  // ✅ Subscriber Handlers
  const handleSubscribe = async () => {
    if (!email.trim()) return alert("Enter a valid email");
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      alert(data.message);
      setEmail("");
      closeOverlay();
    } catch (error) {
      alert("Failed to subscribe. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const closeOverlay = () => {
    localStorage.setItem("fil_promo_seen", "true");
    setIsOverlayOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arial+Rounded+MT+Bold&display=swap');
        .checkout-fab {
          position: relative; width: 110px; height: 110px; border-radius: 50%;
          background: radial-gradient(circle at 38% 35%, #a8e04a 0%, #7dc520 40%, #5a9a10 100%);
          box-shadow: 0 6px 18px rgba(80, 140, 10, 0.55), inset 0 2px 6px rgba(255,255,255,0.35), inset 0 -4px 8px rgba(0,0,0,0.18);
          border: none; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 2px; padding: 0; overflow: hidden; transition: transform 0.1s ease, box-shadow 0.1s ease;
          -webkit-tap-highlight-color: transparent; outline: none;
        }
        .checkout-fab:active, .checkout-fab.pressed {
          transform: scale(0.93);
          box-shadow: 0 3px 10px rgba(80, 140, 10, 0.45), inset 0 2px 6px rgba(255,255,255,0.25), inset 0 -2px 5px rgba(0,0,0,0.22);
        }
        .checkout-fab::before {
          content: ''; position: absolute; top: 8px; left: 20px; width: 68px; height: 32px; border-radius: 50%;
          background: radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.0) 80%);
          pointer-events: none; z-index: 2;
        }
        .flash {
          position: absolute; top: -60%; left: -60%; width: 60px; height: 220%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%);
          transform: rotate(30deg) translateX(-100%); pointer-events: none; z-index: 3;
          animation: diagonal-flash 10s ease-in-out infinite;
        }
        @keyframes diagonal-flash {
          0% { transform: rotate(30deg) translateX(-100%); opacity: 0; }
          2% { opacity: 1; }
          6% { transform: rotate(30deg) translateX(320%); opacity: 0; }
          100% { transform: rotate(30deg) translateX(320%); opacity: 0; }
        }
        .checkout-badge {
          position: absolute; top: 2px; right: 2px; width: 26px; height: 26px; border-radius: 50%;
          background: #1a1a1a; color: #fff; font-size: 12px; font-weight: 700; font-family: Arial, sans-serif;
          display: flex; align-items: center; justify-content: center; z-index: 10; border: 2px solid #fff; line-height: 1; pointer-events: none;
        }
        .cart-icon-container { position: relative; z-index: 4; }
        .checkout-label {
          font-family: Arial, Helvetica, sans-serif; font-weight: 800; font-size: 11.5px; color: #fff; text-align: center;
          line-height: 1.25; text-shadow: 0 1px 2px rgba(0,0,0,0.25); letter-spacing: 0.01em; position: relative; z-index: 4; margin-top: 1px;
        }
      `}</style>

      {/* ✅ DISCOUNT OVERLAY POPUP */}
      {isOverlayOpen && (
        <div className="z-[1000] fixed inset-0 flex justify-center items-center">
          <div className="absolute inset-0 bg-black opacity-70" onClick={closeOverlay} />
          <div className="z-10 relative flex bg-white mx-2 p-2 rounded-md w-full max-w-[745px] h-[409px] overflow-hidden">
            <button onClick={closeOverlay} className="top-6 right-6 absolute flex justify-center items-center rounded-full w-6 h-6 cursor-pointer">✕</button>
            <div className="max-sm:hidden relative flex flex-col justify-center items-center bg-gray-100 min-w-[290px]">
              <div className="relative p-2 rounded-md w-full h-full overflow-hidden">
                <Image src={sliderImages[currentSlide]} alt={`slide-${currentSlide}`} fill className="object-center object-cover" />
              </div>
              <div className="bottom-2 left-1/2 absolute flex gap-2 mt-4 -translate-x-1/2">
                {sliderImages.map((_, index) => (
                  <button key={index} onClick={() => setCurrentSlide(index)} className={`transition-all duration-200 focus:outline-none ${index === currentSlide ? "bg-[#00E575] w-5 h-1 rounded-md" : "bg-[#fafafa] w-[10px] h-1 rounded-md"}`} />
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center p-6 w-full">
              <h2 className="mb-2 font-oswald font-medium text-[32px]">First Order? Grab 10% OFF! 🎁</h2>
              <p className="mb-6 text-[#3e3e3e] text-sm">Join today and enjoy exclusive offers delivered straight to your inbox! Use promo code <span className="font-medium">WELCOME10</span> to get <span className="font-medium"> 10% off</span> your first order.</p>
              <div className="w-full">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your Email Address" className="bg-[#f7f7f7] p-3 rounded-md outline-0 w-full placeholder-text-[#3e3e3e] text-sm" />
                <div className="mb-6 mt-2">
                  <p className="text-[10px]">By entering your email, you consent to receiving weekly promotions and exclusive FIL emails. You can unsubscribe at any time.</p>
                </div>
                <button onClick={handleSubscribe} disabled={loading} className="block bg-[#00E575] text-[#0A321B] px-[18px] py-3 rounded-md w-full font-bold text-sm hover:bg-[#0A321B] hover:text-white transition-colors">{loading ? "Submitting..." : "GET 10% OFF"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ DRAGGABLE CART FAB */}
      {hasMounted && !isMobileMenuOpen && !shouldHideCartFab && (
        <div ref={cartRef} onPointerDown={onCartPointerDown} onPointerMove={onCartPointerMove} onPointerUp={onCartPointerUp} onPointerLeave={() => setCartPressed(false)} style={{ position: "fixed", left: cartPos.x, top: cartPos.y, zIndex: 999, touchAction: "none", userSelect: "none", width: CART_SIZE, height: CART_SIZE }}>
          {totalItems > 0 && <span className="checkout-badge">{totalItems > 99 ? "99+" : totalItems}</span>}
          <button className={`checkout-fab${cartPressed ? " pressed" : ""}`} style={{ width: "100%", height: "100%" }}>
            <div className="flash" />
            <div className="cart-icon-container">
              <svg width="34" height="30" viewBox="0 0 34 30" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2H2" /><path d="M4 2l2.5 13h17l2.5-10H8" /><circle cx="10" cy="27" r="2.2" fill="white" /><circle cx="21" cy="27" r="2.2" fill="white" /></svg>
            </div>
            <span className="checkout-label">Check Out<br />Now!</span>
          </button>
        </div>
      )}

      {/* ✅ NEW REDESIGNED PIXEL-PERFECT FOOTER */}
      <footer className="bg-[#082C17] pt-16 pb-8 md:pt-20 text-white relative">
        
        {/* Floating Action Buttons (WhatsApp & Scroll to Top) */}
        <div className="right-4 md:right-[34px] bottom-[105px] z-50 fixed flex flex-col gap-4">
          <Link target="_blank" href="https://wa.me/2347018900705" className="flex justify-center items-center bg-white border border-[#d9d9d9] rounded-full w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] hover:scale-105 transition-transform shadow-md">
            <Image width={28} height={28} src="/whatsapp.png" alt="WhatsApp" />
          </Link>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex justify-center items-center bg-black/70 border border-white/20 rounded-full w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] hover:bg-black transition-colors shadow-md">
            <Image width={16} height={16} src="/upward.png" alt="Scroll Up" className="brightness-200" />
          </button>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
            
            {/* Col 1: Brand & Socials */}
            <div className="flex flex-col gap-5 max-w-sm">
              <Image src="/fillogo-white.webp" alt="Fil Store Logo" width={65} height={28} className="brightness-200 contrast-100" />
              <p className="text-white/80 text-[14px] leading-relaxed">
                Everyday tech for real Nigerian days.<br />
                Power banks, audio, chargers, cables, sockets and fans.
              </p>
              <div className="flex items-center gap-5 mt-2">
                <Link href="#" className="text-white hover:text-[#00E575] transition-colors"><Twitter size={20} strokeWidth={2} /></Link>
                <Link href="#" className="text-white hover:text-[#00E575] transition-colors"><Facebook size={20} strokeWidth={2} /></Link>
                <Link href="#" className="text-white hover:text-[#00E575] transition-colors"><Instagram size={20} strokeWidth={2} /></Link>
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
                <li><Link href="/products?categories=Extensions" className="text-white/70 hover:text-white text-[14px] transition-colors">Sockets</Link></li>
              </ul>
            </div>

            {/* Col 3: Help */}
            <div>
              <h3 className="font-semibold text-white text-[15px] mb-5">Help</h3>
              <ul className="flex flex-col gap-3.5">
                <li><Link href="/contact" className="text-white/70 hover:text-white text-[14px] transition-colors">Track your order</Link></li>
                <li><Link href="/policies" className="text-white/70 hover:text-white text-[14px] transition-colors">Delivery and payment</Link></li>
                <li><Link href="/policies" className="text-white/70 hover:text-white text-[14px] transition-colors">Returns and warranty</Link></li>
                <li><Link href="/faq" className="text-white/70 hover:text-white text-[14px] transition-colors">FAQs</Link></li>
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