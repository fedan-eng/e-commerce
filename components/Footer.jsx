"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Accordion from "./Accordion";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { usePathname } from "next/navigation";


const sliderImages = ["/budgirl.png", "/budgirl.png", "/budgirl.png"];

const items = [
  {
    title: "PRODUCTS",
    content: (
      <ul className="space-y-4">
        <li>
          <Link
            className=""
            href="/products?categories=Power+Bank"
          >
            Power Bank
          </Link>
        </li>

        <li>
          <Link
            className=""
            href="/products?categories=Wearables"
          >
            Wireless Earbuds
          </Link>
        </li>

        <li>
          <Link
            className=""
            href="/products?categories=Lifestyle"
          >
            Rechargeable Fan
          </Link>
        </li>
        <li>
          <Link
            className=""
            href="/products?categories=Lifestyle"
          >
            Lifestyle
          </Link>
        </li>
        <li>
          <Link
            className=""
            href="/products?categories=Extensions"
          >
            Extension
          </Link>
        </li>
      </ul>
    ),
  },
  {
    title: "LINKS",
    content: (
      <ul className="space-y-4">
        <li>
          <Link
            className=""
            href="/products"
          >
            Products
          </Link>
        </li>

        <li>
          <Link
            className=""
            href="/products?specials=isBestseller"
          >
            Best Sellers
          </Link>
        </li>
        <li>
          <Link
            className=""
            href="/products?specials=isWhatsNew"
          >
            What's New
          </Link>
        </li>
        <li>
          <Link
            className=""
            href="/products?specials=isTodaysDeal"
          >
            Today's Deals
          </Link>
        </li>
        <li>
          <Link
            className=""
            href="/cart"
          >
            Cart
          </Link>
        </li>
      </ul>
    ),
  },
  {
    title: "CONTACT US",
    content: (
      <ul className="space-y-4">
        <li>
          <Link
            target="_blank"
            className=""
            href="https://www.instagram.com/filstoreng?utm_source=ig_web_button_share_sheet&igsh=NTRkZHUxaXYzYnRz"
          >
            Instagram
          </Link>
        </li>
        <li>
          <Link
            target="_blank"
            className=""
            href="/"
          >
            Facebook
          </Link>
        </li>
        <li>
          <Link
            target="_blank"
            className=""
            href="/"
          >
            X
          </Link>
        </li>
        <li>
          <Link
            target="_blank"
            className=""
            href="/"
          >
            TikTok
          </Link>
        </li>
      </ul>
    ),
  },
  {
    title: "HELP",
    content: (
      <ul className="space-y-4">
        <li>
          <Link
            className=""
            href="/register"
          >
            Sign in/Register
          </Link>
        </li>
        <li>
          <Link
            className=""
            href="/contact"
          >
            Track Order
          </Link>
        </li>
        <li>
          <Link
            className=""
            href="/contact"
          >
            Contact Us
          </Link>
        </li>
        <li>
          <Link
            className=""
            href="/"
          >
            Terms and Condition
          </Link>
        </li>
        <li>
          <Link
            className=""
            href="/"
          >
            Privacy Policy
          </Link>
        </li>

        <li className="mt-[62px]">
          <p className="mb-8 font-medium text-white text-sm uppercase">
            WE ACCEPT
          </p>
          <div className="w-[88px] h-[32px]">
            <Image
              width={88}
              height={32}
              src="/paystack.png"
              alt="paystack"
              className="w-full h-full object-cover"
            />
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

  // Overlay & Tag state
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isTagVisible, setIsTagVisible] = useState(true);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideIntervalRef = useRef(null);
  const autoOpenTimerRef = useRef(null);

  // Auto open overlay after 5s on homepage
  useEffect(() => {
    if (pathname === "/") {
      autoOpenTimerRef.current = setTimeout(
        () => setIsOverlayOpen(true),
        10000
      );
    }
    return () => {
      if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
    };
  }, [pathname]);

  // Auto change slides every 3 seconds _only_ while overlay is open
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

  // Close overlay on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIsOverlayOpen(false);
    };
    if (isOverlayOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOverlayOpen]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
    // restart autoplay interval so user has time to view the selected slide
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
      setIsOverlayOpen(false);
    } catch (error) {
      alert("Failed to subscribe. Try again!");
    } finally {
      setLoading(false);
    }
  };

  if (noNavigationMenu) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      {isOverlayOpen && (
        <div className="z-[1000] fixed inset-0 flex justify-center items-center">
          {/* Background overlay */}
          <div
            className="absolute inset-0 bg-black opacity-70"
            onClick={() => setIsOverlayOpen(false)}
          />

          {/* Popup content */}
          <div className="z-10 relative flex bg-white mx-2 p-2 rounded-md w-full max-w-[745px] h-[409px] overflow-hidden">
            {/* Overlay X (only closes overlay) */}
            <button
              aria-label="Close discount popup"
              onClick={() => setIsOverlayOpen(false)}
              className="top-6 right-6 absolute flex justify-center items-center rounded-full w-6 h-6 cursor-pointer"
            >
              ✕
            </button>

            {/* Left: Image Slider */}
            <div className="max-sm:hidden relative flex flex-col justify-center items-center bg-gray-100 min-w-[290px]">
              <div className="relative p-2 rounded-md w-full h-full overflow-hidden">
                <Image
                  src={sliderImages[currentSlide]}
                  alt={`slide-${currentSlide}`}
                  fill
                  className="object-center object-cover"
                />
              </div>

              {/* Dots */}
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

            {/* Right: Discount text */}
            <div className="flex flex-col justify-center p-6 w-full">
              <h2 className="mb-2 font-oswald font-medium text-[32px]">
                First Order? Grab 10% OFF! 🎁
              </h2>
              <p className="mb-6 text-[#3e3e3e] text-sm">
                Join today and enjoy exclusive offers delivered straight to your
                inbox! Use promo code{" "}
                <span className="font-medium">WELCOME10</span> to get
                <span className="font-medium"> 10% off</span> your first order.
              </p>

              <div className="w-full">
                <input
                  type="email"
                  name="emaii"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email Address"
                  className="bg-[#f7f7f7] p-3 rounded-md outline-0 w-full placeholder-text-[#3e3e3e] text-sm"
                />

                <div className="mb-6">
                  <p className="text-[10px]">
                    {" "}
                    By entering your email, you consent to receiving weekly
                    promotions and exclusive FIL emails. You can unsubscribe any
                    at any time.{" "}
                  </p>

                  <p className="mt-2 text-[10px]">
                    <span className="font-medium text-filgreen underline">
                      {" "}
                      Terms & conditions{" "}
                    </span>{" "}
                    or{" "}
                    <span className="font-medium text-filgreen underline">
                      Privacy policy
                    </span>
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

      <footer className="bg-black pt-9">
        {/* DISCOUNT TAG (fixed on side). Clicking the tag opens overlay. The small X hides the tag until refresh. */}
        {(pathname === "/" && isTagVisible) && (
        
          <div
            onClick={() => setIsOverlayOpen(true)}
            className="top-[220px] opacity-50 hover:opacity-100 -left-[35px] z-40 fixed -rotate-90 cursor-pointer"
            role="button"
            aria-label="Open discount popup"
          >
            <div className="relative bg-black px-6 py-4 rounded-bl-md rounded-br-md font-medium text-white text-xs">
              Get 10% OFF
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTagVisible(false);
                }}
                aria-label="Close discount tag"
                className="-right-3 -bottom-3 absolute flex justify-center items-center bg-white border border-[#d9d9d9] rounded-full w-[29px] h-[29px] text-black rotate-180 cursor-pointer"
              >
                <Image
                  width={6}
                  height={6}
                  src="/close.png"
                  alt="close"
                />
              </button>
            </div>
          </div>
        )}

        {/* TOP AND WHATSAPP */}
        <div className="right-4 md:right-[34px] bottom-[105px] z-50 fixed">
          <Link
            target="_blank"
            href="https://wa.me/2347018900705 "
            className="flex justify-center items-center bg-white border border-[#d9d9d9] rounded-full w-[40px] sm:w-[50px] h-[40px] sm:h-[50px]"
          >
            <Image
              width={26.67}
              height={26.67}
              src="/whatsapp.png"
              alt="whatsapp"
            />
          </Link>
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex justify-center items-center bg-black opacity-70 mt-4 border border-[#d9d9d9] rounded-full w-[40px] sm:w-[50px] h-[40px] sm:h-[50px] cursor-pointer poin"
          >
            <Image
              width={13.33}
              height={13.33}
              src="/upward.png"
              alt="upward"
              className="opacity-100"
            />
          </div>
        </div>

        {/* Footer content */}
        <div className="md:flex justify-around">
          <div className="max-md:mb-[30px] px-4">
            <div className="mb-4">
              <Image
                src="/fillogo-white.webp"
                alt="Fil Store Logo"
                width={77}
                height={33}
              />
            </div>
            <p className="w-[95%] sm:w-[60%] md:w-[182px] text-white text-xs text-justify leading-[150%]">
              At FIL, we take pride in offering quality products at unbeatable
              prices, making us the go-to destination for anyone who values
              quality
            </p>
          </div>

          {items.map((item, index) => (
            <div
              className="max-md:hidden"
              key={index}
            >
              <h2 className="mb-8 font-medium text-white text-sm uppercase">
                {item.title}
              </h2>
              <div className="text-white text-xs"> {item.content} </div>
            </div>
          ))}

          <div className="md:hidden mx-4">
            <Accordion
              items={items}
              className="border-[#3e3e3e] border-b"
              headerClassName={(isOpen) =>
                `text-xs  border-t border-[#3e3e3e] font-medium  uppercase py-4 text-white ${
                  isOpen ? "border-b " : ""
                }  `
              }
              contentClassName=" text-white text-xs px-3 py-4 "
              icon={({ isOpen }) => (isOpen ? <FaMinus /> : <FaPlus />)}
              iconClassName="text-white  font-bold"
            />
          </div>
        </div>

        <div className="mx-[14px] md:mx-[60px] mt-10 pt-4 pb-6 border-white border-t">
          <p className="font-medium text-white text-xs text-center leading-[150%]">
            2025 Copyright - FIL E-Commerce
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
