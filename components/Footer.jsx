"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Accordion from "./Accordion";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

const sliderImages = ["/budgirl.png", "/budgirl.png", "/budgirl.png"];

const items = [
  {
    title: "PRODUCTS",
    content: (
      <ul className="space-y-4">
        <li><Link className="" href="/products?categories=Power+Bank">Power Bank</Link></li>
        <li><Link className="" href="/products?categories=Wearables">Wireless Earbuds</Link></li>
        <li><Link className="" href="/products?categories=Lifestyle">Rechargeable Fan</Link></li>
        <li><Link className="" href="/products?categories=Lifestyle">Lifestyle</Link></li>
        <li><Link className="" href="/products?categories=Extensions">Extension</Link></li>
      </ul>
    ),
  },
  {
    title: "LINKS",
    content: (
      <ul className="space-y-4">
        <li><Link className="" href="/products">Products</Link></li>
        <li><Link className="" href="/products?specials=isBestseller">Best Sellers</Link></li>
        <li><Link className="" href="/products?specials=isWhatsNew">What's New</Link></li>
        <li><Link className="" href="/products?specials=isTodaysDeal">Today's Deals</Link></li>
        <li><Link className="" href="/cart">Cart</Link></li>
      </ul>
    ),
  },
  {
    title: "OUR STORES",
    content: (
      <ul className="space-y-6">
        <li>
          <p className="mb-1 font-medium text-filgreen uppercase text-[10px]">
            Alaba Branch
          </p>
          <p className="leading-[180%]">
            20 Fedan St, Ojo, <br />
            Lagos 102113, Lagos
          </p>
          <a
            href="tel:07018900705"
            className="hover:text-filgreen transition-colors duration-200"
          >
            0701 890 0705
          </a>
        </li>

        <li>
          <p className="mb-1 font-medium text-filgreen uppercase text-[10px]">
            Ikeja Branch
          </p>
          <p className="leading-[180%]">
            3, Otigba Street, Ikeja, <br />
            Computer Village
          </p>
          <a
            href="tel:07025004757"
            className="hover:text-filgreen transition-colors duration-200"
          >
            0702 500 4757
          </a>
        </li>

        <li>
          <p className="mb-1 font-medium text-filgreen uppercase text-[10px]">
            Awka Branch
          </p>
          <p className="leading-[180%]">
            6359+Q79 Awka
          </p>
        </li>
      </ul>
    ),
  },
  {
    title: "CONTACT US",
    content: (
      <ul className="space-y-4">
        <li><Link target="_blank" className="" href="https://www.instagram.com/filstoreng?utm_source=ig_web_button_share_sheet&igsh=NTRkZHUxaXYzYnRz">Instagram</Link></li>
        <li><Link target="_blank" className="" href="https://www.facebook.com/filstoreng/">Facebook</Link></li>
        <li><Link target="_blank" className="" href="/">X</Link></li>
        <li><Link target="_blank" className="" href="https://www.tiktok.com/@filstoreng_">TikTok</Link></li>
      </ul>
    ),
  },
  {
    title: "HELP",
    content: (
      <ul className="space-y-4">
        <li><Link className="" href="/register">Sign in/Register</Link></li>
        <li><Link className="" href="/contact">Track Order</Link></li>
        <li><Link className="" href="/contact">Contact Us</Link></li>
        <li><Link className="" href="/policies">Terms and Condition</Link></li>
        <li><Link className="" href="/policies">Privacy Policy</Link></li>
        <li className="mt-[62px]">
          <p className="mb-8 font-medium text-white text-sm uppercase">WE ACCEPT</p>
          <div className="w-[88px] h-[32px]">
            <Image width={88} height={32} src="/paystack.png" alt="paystack" className="w-full h-full object-cover" />
          </div>
        </li>
      </ul>
    ),
  },
];

const Footer = () => {
  const pathname = usePathname();

  const staticPaths = ["/register", "/login", "/verify", "/reset-password"];
  const noNavigationMenu = staticPaths.includes(pathname);

  // ✅ Size Constants
  const CART_SIZE = 110; 
  const CART_MARGIN = 24;

  const ELEM_WIDTH = 120;
  const ELEM_HEIGHT = 48;
  const SNAP_PEEK = 35;

  // ✅ All hooks
  const [isOverlayOpen, setIsOverlayOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("fil_promo_seen");
  });
  const [isTagVisible, setIsTagVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [pos, setPos] = useState({ x: -35, y: 220 });
  const [side, setSide] = useState("left");
  const [isDragging, setIsDragging] = useState(false);
  const [snapped, setSnapped] = useState(true);

  const [cartPos, setCartPos] = useState({ x: 0, y: 180 });
  const [cartSide, setCartSide] = useState("right");
  const [cartIsDragging, setCartIsDragging] = useState(false);
  const [cartSnapped, setCartSnapped] = useState(true);
  const [cartPressed, setCartPressed] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const cartRef = useRef(null);
  const cartDragState = useRef({
    startMouseX: 0,
    startMouseY: 0,
    startElemX: 0,
    startElemY: 180,
    dragged: false,
  });

  const cartItems = useSelector((state) => state.cart.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const slideIntervalRef = useRef(null);
  const autoOpenTimerRef = useRef(null);
  const elementRef = useRef(null);
  const dragState = useRef({
    startMouseX: 0,
    startMouseY: 0,
    startElemX: -35,
    startElemY: 220,
    dragged: false,
  });

  useEffect(() => {
    setHasMounted(true);
    const initialX = window.innerWidth - CART_SIZE - CART_MARGIN;
    setCartPos({ x: initialX, y: 180 });
    cartDragState.current.startElemX = initialX;
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    const checkMenuOpen = () => {
      setIsMobileMenuOpen(document.body.style.overflow === "hidden");
    };
    checkMenuOpen();
    const interval = setInterval(checkMenuOpen, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pathname === "/" && !localStorage.getItem("fil_promo_seen")) {
      autoOpenTimerRef.current = setTimeout(() => setIsOverlayOpen(true), 120000);
    }
    return () => {
      if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isOverlayOpen) {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
        slideIntervalRef.current = null;
      }
      return;
    }
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
        slideIntervalRef.current = null;
      }
    };
  }, [isOverlayOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIsOverlayOpen(false);
    };
    if (isOverlayOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOverlayOpen]);

  if (noNavigationMenu) return null;

  const clampY = (y) => {
    const maxY = window.innerHeight - ELEM_HEIGHT - 60;
    return Math.min(Math.max(y, 60), maxY);
  };

  const doSnap = (currentX, currentY) => {
    const centerX = currentX + ELEM_WIDTH / 2;
    const nearLeft = centerX < window.innerWidth / 2;
    setSide(nearLeft ? "left" : "right");
    setSnapped(true);
    setPos({
      x: nearLeft ? -SNAP_PEEK : window.innerWidth - ELEM_WIDTH + SNAP_PEEK,
      y: clampY(currentY),
    });
  };

  const onPointerDown = (e) => {
    if (e.target.closest("button")) return;
    e.preventDefault();
    dragState.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startElemX: pos.x,
      startElemY: pos.y,
      dragged: false,
    };
    setIsDragging(true);
    setSnapped(false);
    elementRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragState.current.startMouseX;
    const dy = e.clientY - dragState.current.startMouseY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragState.current.dragged = true;
    setPos({
      x: dragState.current.startElemX + dx,
      y: clampY(dragState.current.startElemY + dy),
    });
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!dragState.current.dragged) {
      setIsOverlayOpen(true);
    }
    doSnap(pos.x, pos.y);
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      }, 3000);
    }
  };

  const handleSubscribe = async () => {
    if (!email.trim()) {
      alert("Enter a valid email");
      return;
    }
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
      localStorage.setItem("fil_promo_seen", "true");
      setIsOverlayOpen(false);
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

  const rotation = side === "left" ? "-90deg" : "90deg";

  const clampCartY = (y) => {
    const maxY = window.innerHeight - CART_SIZE - 60;
    return Math.min(Math.max(y, 60), maxY);
  };

  const doCartSnap = (currentX, currentY) => {
    const centerX = currentX + CART_SIZE / 2;
    const nearLeft = centerX < window.innerWidth / 2;
    setCartSide(nearLeft ? "left" : "right");
    setCartSnapped(true);
    setCartPos({
      x: nearLeft ? CART_MARGIN : window.innerWidth - CART_SIZE - CART_MARGIN,
      y: clampCartY(currentY),
    });
  };

  const onCartPointerDown = (e) => {
    e.preventDefault();
    cartDragState.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startElemX: cartPos.x,
      startElemY: cartPos.y,
      dragged: false,
    };
    setCartIsDragging(true);
    setCartPressed(true);
    setCartSnapped(false);
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
    if (!cartDragState.current.dragged) {
      window.location.href = "/cart";
    }
    doCartSnap(cartPos.x, cartPos.y);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arial+Rounded+MT+Bold&display=swap');

        .checkout-fab {
          position: relative;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: radial-gradient(circle at 38% 35%, #a8e04a 0%, #7dc520 40%, #5a9a10 100%);
          box-shadow:
            0 6px 18px rgba(80, 140, 10, 0.55),
            inset 0 2px 6px rgba(255,255,255,0.35),
            inset 0 -4px 8px rgba(0,0,0,0.18);
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 0;
          overflow: hidden;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }

        .checkout-fab:active,
        .checkout-fab.pressed {
          transform: scale(0.93);
          box-shadow:
            0 3px 10px rgba(80, 140, 10, 0.45),
            inset 0 2px 6px rgba(255,255,255,0.25),
            inset 0 -2px 5px rgba(0,0,0,0.22);
        }

        /* Glossy top highlight */
        .checkout-fab::before {
          content: '';
          position: absolute;
          top: 8px;
          left: 20px;
          width: 68px;
          height: 32px;
          border-radius: 50%;
          background: radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.0) 80%);
          pointer-events: none;
          z-index: 2;
        }

        /* Diagonal flash sweep */
        .flash {
          position: absolute;
          top: -60%;
          left: -60%;
          width: 60px;
          height: 220%;
          background: linear-gradient(
            to right,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.55) 50%,
            rgba(255,255,255,0) 100%
          );
          transform: rotate(30deg) translateX(-100%);
          pointer-events: none;
          z-index: 3;
          animation: diagonal-flash 10s ease-in-out infinite;
        }

        @keyframes diagonal-flash {
          0%   { transform: rotate(30deg) translateX(-100%); opacity: 0; }
          2%   { opacity: 1; }
          6%   { transform: rotate(30deg) translateX(320%); opacity: 0; }
          100% { transform: rotate(30deg) translateX(320%); opacity: 0; }
        }

        /* Badge - placed cleanly inside circular path to prevent overflow clip */
        .checkout-badge {
  position: absolute;
  top: 2px;        /* relative to the wrapper div now */
  right: 2px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #1a1a1a;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  font-family: Arial, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;     /* above the button */
  border: 2px solid #fff;
  line-height: 1;
  pointer-events: none;
}

        /* Cart icon wrapper */
        .cart-icon-container {
          position: relative;
          z-index: 4;
        }

        /* Label styling */
        .checkout-label {
          font-family: Arial, Helvetica, sans-serif;
          font-weight: 800;
          font-size: 11.5px;
          color: #fff;
          text-align: center;
          line-height: 1.25;
          text-shadow: 0 1px 2px rgba(0,0,0,0.25);
          letter-spacing: 0.01em;
          position: relative;
          z-index: 4;
          margin-top: 1px;
        }
      `}</style>

      {/* Discount popup overlay */}
      {isOverlayOpen && (
        <div className="z-[1000] fixed inset-0 flex justify-center items-center">
          <div
            className="absolute inset-0 bg-black opacity-70"
            onClick={closeOverlay}
          />
          <div className="z-10 relative flex bg-white mx-2 p-2 rounded-md w-full max-w-[745px] h-[409px] overflow-hidden">
            <button
              aria-label="Close discount popup"
              onClick={closeOverlay}
              className="top-6 right-6 absolute flex justify-center items-center rounded-full w-6 h-6 cursor-pointer"
            >
              ✕
            </button>

            <div className="max-sm:hidden relative flex flex-col justify-center items-center bg-gray-100 min-w-[290px]">
              <div className="relative p-2 rounded-md w-full h-full overflow-hidden">
                <Image
                  src={sliderImages[currentSlide]}
                  alt={`slide-${currentSlide}`}
                  fill
                  className="object-center object-cover"
                />
              </div>
              <div
                className="bottom-2 left-1/2 absolute flex gap-2 mt-4 -translate-x-1/2"
                role="tablist"
                aria-label="slider dots"
              >
                {sliderImages.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => handleDotClick(index)}
                    className={`transition-all duration-200 focus:outline-none ${
                      index === currentSlide
                        ? "bg-filgreen w-5 h-1 rounded-md"
                        : "bg-[#fafafa] w-[10px] h-1 rounded-md"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 w-full">
              <h2 className="mb-2 font-oswald font-medium text-[32px]">
                First Order? Grab 10% OFF! 🎁
              </h2>
              <p className="mb-6 text-[#3e3e3e] text-sm">
                Join today and enjoy exclusive offers delivered straight to your inbox! Use promo code{" "}
                <span className="font-medium">WELCOME10</span> to get
                <span className="font-medium"> 10% off</span> your first order.
              </p>
              <div className="w-full">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email Address"
                  className="bg-[#f7f7f7] p-3 rounded-md outline-0 w-full placeholder-text-[#3e3e3e] text-sm"
                />
                <div className="mb-6">
                  <p className="text-[10px]">
                    By entering your email, you consent to receiving weekly promotions and exclusive FIL emails. You can unsubscribe at any time.
                  </p>
                  <p className="mt-2 text-[10px]">
                    <span className="font-medium text-filgreen underline">Terms & conditions</span>{" "}
                    or{" "}
                    <span className="font-medium text-filgreen underline">Privacy policy</span>
                  </p>
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="block bg-filgreen px-[18px] py-3 rounded-md w-full font-roboto font-medium text-sm"
                >
                  {loading ? "Submitting..." : "GET 10% OFF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Premium Glossy Draggable "Check Out Now!" Cart FAB with hidden overflow containment */}
      
          {hasMounted && !isMobileMenuOpen && (
  <div
    ref={cartRef}
    onPointerDown={onCartPointerDown}
    onPointerMove={onCartPointerMove}
    onPointerUp={onCartPointerUp}
    onPointerLeave={() => setCartPressed(false)}
    style={{
      position: "fixed",
      left: cartPos.x,
      top: cartPos.y,
      zIndex: 999,
      touchAction: "none",
      userSelect: "none",
      width: CART_SIZE,
      height: CART_SIZE,
    }}
  >
    {/* Badge OUTSIDE the button so overflow:hidden doesn't clip it */}
    {totalItems > 0 && (
      <span className="checkout-badge">
        {totalItems > 99 ? "99+" : totalItems}
      </span>
    )}

    <button
      className={`checkout-fab${cartPressed ? " pressed" : ""}`}
      style={{ width: "100%", height: "100%" }}
      aria-label={`Cart, ${totalItems} items`}
    >
      <div className="flash" />
      <div className="cart-icon-container">
      <svg
              width="34"
              height="30"
              viewBox="0 0 34 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 2H2"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M4 2l2.5 13h17l2.5-10H8"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="10" cy="27" r="2.2" fill="white" />
              <circle cx="21" cy="27" r="2.2" fill="white" />
            </svg>
      </div>
      <span className="checkout-label">
        Check Out<br />Now!
      </span>
    </button>
  </div>
)}

      <footer className="bg-black pt-9">
        {/* WhatsApp & scroll-to-top */}
        <div className="right-4 md:right-[34px] bottom-[105px] z-50 fixed">
          <Link
            target="_blank"
            href="https://wa.me/2347018900705"
            className="flex justify-center items-center bg-white border border-[#d9d9d9] rounded-full w-[40px] sm:w-[50px] h-[40px] sm:h-[50px]"
          >
            <Image width={26.67} height={26.67} src="/whatsapp.png" alt="whatsapp" />
          </Link>
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex justify-center items-center bg-black opacity-70 mt-4 border border-[#d9d9d9] rounded-full w-[40px] sm:w-[50px] h-[40px] sm:h-[50px] cursor-pointer"
          >
            <Image width={13.33} height={13.33} src="/upward.png" alt="upward" className="opacity-100" />
          </div>
        </div>

        {/* Footer content */}
        <div className="md:flex justify-around">
          <div className="max-md:mb-[30px] px-4">
            <div className="mb-4">
              <Image src="/fillogo-white.webp" alt="Fil Store Logo" width={77} height={33} />
            </div>
            <p className="w-[95%] sm:w-[60%] md:w-[182px] text-white text-xs text-justify leading-[150%]">
              At FIL, we take pride in offering quality products at unbeatable prices, making us the go-to destination for anyone who values quality
            </p>
          </div>

          {items.map((item, index) => (
            <div className="max-md:hidden" key={index}>
              <h2 className="mb-8 font-medium text-white text-sm uppercase">{item.title}</h2>
              <div className="text-white text-xs">{item.content}</div>
            </div>
          ))}

          <div className="md:hidden mx-4">
            <Accordion
              items={items}
              className="border-[#3e3e3e] border-b"
              headerClassName={(isOpen) =>
                `text-xs border-t border-[#3e3e3e] font-medium uppercase py-4 text-white ${isOpen ? "border-b" : ""}`
              }
              contentClassName="text-white text-xs px-3 py-4"
              icon={({ isOpen }) => (isOpen ? <FaMinus /> : <FaPlus />)}
              iconClassName="text-white font-bold"
            />
          </div>
        </div>

        <div className="mx-[14px] md:mx-[60px] mt-10 pt-4 pb-6 border-white border-t">
          <p className="font-medium text-white text-xs text-center leading-[150%]">
            2026 Copyright - FIL E-Commerce
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;