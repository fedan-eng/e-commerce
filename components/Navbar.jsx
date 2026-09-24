"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu, X, ChevronDown, ChevronUp,
  ShoppingBag, HelpCircle, User,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import ProfileTooltip   from "./ProfileTooltip";
import ArrivalTooltip   from "./ArrivalTooltip";
import ProductTooltip   from "./ProductTooltip";
import NavSearchTooltip from "./NavSearchTooltip";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from "@/store/features/authSlice";
import { toggleCart }  from "@/store/features/cartUISlice";
import { useCartAnimationContext } from "@/context/CartAnimationContext";
import CartSidebar     from "@/components/cart/CartSidebar";
import CartBottomSheet from "@/components/cart/CartBottomSheet";

const MOBILE_CATEGORIES = [
  { name: "Power Bank",  key: "Power Bank"  },
  { name: "Wearables",   key: "Wearables"   },
  { name: "Chargers",    key: "Chargers"    },
  { name: "Lifestyle",   key: "Lifestyle"   },
  { name: "Extensions",  key: "Extensions"  },
];

export default function Navbar() {
  const router   = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();

  // Cart animation context — gives us the ref to put on the cart icon
  const { cartIconRef } = useCartAnimationContext();

  const cartItems  = useSelector((state) => state.cart.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const staticPaths    = ["/register", "/login", "/verify", "/reset-password"];
  const noNavigationMenu = staticPaths.includes(pathname);

  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    setMenuOpen(false);
    setProductOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      router.push("/login");
    } else {
      console.error("Logout failed:", result.payload);
    }
  };

  if (noNavigationMenu) return null;

  // ── Cart icon click handler ──────────────────────────────────────────────
  // Opens sidebar on desktop, bottom sheet on mobile.
  // Both components listen to the same Redux `cartUI.isOpen` flag
  // and show/hide themselves based on screen size via Tailwind's `hidden md:flex`.
  const handleCartClick = (e) => {
    e.preventDefault();
    dispatch(toggleCart());
  };

  return (
    <>
      <nav className="relative bg-white">
        {/* Top green accent stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-[#b8e8c8] via-[#7ed09a] to-[#b8e8c8]" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-5 nav:py-6">
            {/* LEFT: Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                width={64} height={30}
                alt="FIL"
                src="/fillogo.png"
                priority
                className="h-auto w-auto"
              />
            </Link>

            {/* CENTER: Desktop nav links */}
            <ul className="hidden nav:flex items-center gap-12 mx-auto text-sm">
              <ProductTooltip />
              <ArrivalTooltip />
              <li>
                <Link href="/contact" className="font-roboto text-[#1a1a1a] hover:text-filgreen transition-colors duration-200">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="font-roboto text-[#1a1a1a] hover:text-filgreen transition-colors duration-200">
                  Blog
                </Link>
              </li>
            </ul>

            {/* RIGHT: Desktop icons */}
            <ul className="hidden nav:flex items-center gap-7 ml-auto">
              <NavSearchTooltip />

              {/* ── Cart icon — attach cartIconRef here ── */}
              <li>
                <button
                  ref={cartIconRef}         // 👈 THE KEY REF — fly animation targets this
                  onClick={handleCartClick}
                  className="flex items-center text-[#1a1a1a] hover:text-filgreen transition-colors relative"
                  aria-label="Cart"
                >
                  <ShoppingBag size={20} strokeWidth={1.75} />
                  {hasMounted && totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      className="absolute -top-2 -right-2 flex justify-center items-center bg-[#1a1a1a] border-2 border-white rounded-full min-w-[18px] h-[18px] px-1 text-white text-[10px] font-bold leading-none"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </button>
              </li>

              <ProfileTooltip />
              <li>
                <Link href="/contact" className="flex items-center text-[#1a1a1a] hover:text-filgreen transition-colors" aria-label="Help">
                  <HelpCircle size={20} strokeWidth={1.75} />
                </Link>
              </li>
            </ul>

            {/* MOBILE: Right icons */}
            <div className="nav:hidden flex items-center gap-5 ml-auto">
              <NavSearchTooltip />

              {/* ── Mobile cart icon — same ref ── */}
              <button
                ref={cartIconRef}           // 👈 same ref — on mobile this is the target
                onClick={handleCartClick}
                className="flex items-center text-[#1a1a1a] hover:text-filgreen transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag size={20} strokeWidth={1.75} />
                {hasMounted && totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-2 -right-2 flex justify-center items-center bg-[#1a1a1a] border-2 border-white rounded-full min-w-[16px] h-[16px] px-1 text-white text-[9px] font-bold leading-none"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>

              <button
                className="text-[#1a1a1a] hover:text-filgreen transition-colors"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom dashed divider */}
        <div
          className="w-full h-px"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, #d1d1d1 0, #d1d1d1 4px, transparent 4px, transparent 10px)",
          }}
        />

        {/* ── MOBILE FULLSCREEN DRAWER ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.aside
              key="mobile-drawer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-0 z-50 nav:hidden bg-white overflow-y-auto"
            >
              <div className="h-1 w-full bg-gradient-to-r from-[#b8e8c8] via-[#7ed09a] to-[#b8e8c8]" />

              <div className="px-6 pt-6 pb-10">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-[#1a1a1a] hover:text-filgreen transition-colors mb-6"
                  aria-label="Close menu"
                >
                  <X size={26} strokeWidth={2} />
                </button>

                <div className="flex flex-col">
                  {/* PRODUCT accordion */}
                  <div>
                    <button
                      onClick={() => setProductOpen((o) => !o)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="font-medium text-[17px] text-[#1a1a1a]">Product</span>
                      {productOpen
                        ? <ChevronUp size={20} className="text-[#1a1a1a]" />
                        : <ChevronDown size={20} className="text-[#1a1a1a]" />
                      }
                    </button>

                    <AnimatePresence initial={false}>
                      {productOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <ul className="pb-2 space-y-4">
                            {MOBILE_CATEGORIES.map((cat) => (
                              <li key={cat.key}>
                                <Link
                                  href={`/products?categories=${encodeURIComponent(cat.key)}`}
                                  onClick={() => setMenuOpen(false)}
                                  className="block text-[15px] text-[#b5b5b5] hover:text-filgreen transition-colors"
                                >
                                  {cat.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link href="/products?sort=newest" onClick={() => setMenuOpen(false)} className="block py-4 font-medium text-[17px] text-[#1a1a1a] hover:text-filgreen transition-colors">New Arrivals</Link>
                  <Link href="/track"                onClick={() => setMenuOpen(false)} className="block py-4 font-medium text-[17px] text-[#1a1a1a] hover:text-filgreen transition-colors">Contact us</Link>
                  <Link href="/blog"                 onClick={() => setMenuOpen(false)} className="block py-4 font-medium text-[17px] text-[#1a1a1a] hover:text-filgreen transition-colors">Blog</Link>

                  {/* Cart link in mobile drawer — still works as a full-page link */}
                  <Link
                    href="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-4 font-medium text-[17px] text-[#1a1a1a] hover:text-filgreen transition-colors"
                  >
                    <span>Cart</span>
                    {totalItems > 0 && (
                      <span className="flex justify-center items-center bg-[#1a1a1a] text-white rounded-full min-w-[24px] h-[24px] px-2 text-[12px] font-bold">
                        {totalItems}
                      </span>
                    )}
                  </Link>

                  {isAuthenticated && (
                    <>
                      <Link href="/profile"                onClick={() => setMenuOpen(false)} className="block py-4 font-medium text-[17px] text-[#1a1a1a] hover:text-filgreen transition-colors">My Profile</Link>
                      <Link href="/profile?tab=My%20Orders" onClick={() => setMenuOpen(false)} className="block py-4 font-medium text-[17px] text-[#1a1a1a] hover:text-filgreen transition-colors">My Orders</Link>
                      <Link href="/profile?tab=Wishlist"   onClick={() => setMenuOpen(false)} className="block py-4 font-medium text-[17px] text-[#1a1a1a] hover:text-filgreen transition-colors">Wishlist</Link>
                    </>
                  )}
                </div>

                <div className="mt-8">
                  {!isAuthenticated ? (
                    <>
                      <p className="text-[15px] text-[#1a1a1a] mb-4">You are not a member?</p>
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#1a1a1a] hover:bg-black rounded-full text-white text-[15px] font-medium transition-colors"
                      >
                        <User size={16} strokeWidth={2} />
                        Sign in
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] text-[#1a1a1a] mb-4">
                        Signed in as{" "}
                        <span className="font-semibold">{user?.firstName || "User"}</span>
                      </p>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#1a1a1a] hover:bg-black rounded-full text-white text-[15px] font-medium transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </nav>

      {/*
        Cart panels live OUTSIDE the <nav> so they can cover the full viewport.
        CartSidebar  → hidden on mobile  (hidden md:flex  inside the component)
        CartBottomSheet → hidden on desktop (md:hidden inside the component)
        Both listen to the same Redux cartUI.isOpen flag.
      */}
      <CartSidebar />
      <CartBottomSheet />
    </>
  );
}