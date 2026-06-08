"use client";
import {useState, useRef, useEffect} from "react";
import Link from "next/link";
import {Menu, X, ChevronDown, ChevronUp} from "lucide-react";
import Image from "next/image";
import {usePathname, useRouter} from "next/navigation";
import ProfileTooltip from "./ProfileTooltip";
import ArrivalTooltip from "./ArrivalTooltip";
import ProductTooltip from "./ProductTooltip";
import NavSearchTooltip from "./NavSearchTooltip";
import {useSelector, useDispatch} from "react-redux";
import {motion, AnimatePresence} from "framer-motion";
import {logoutUser} from "@/store/features/authSlice";

const MOBILE_CATEGORIES = [
  {name: "Power Bank", key: "Power Bank"},
  {name: "Wearables", key: "Wearables"},
  {name: "Chargers", key: "Chargers"},
  {name: "Lifestyle", key: "Lifestyle"},
  {name: "Extensions", key: "Extensions"},
];

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const menuRef = useRef(null);

  const cartItems = useSelector((state) => state.cart.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const {isAuthenticated, user} = useSelector((state) => state.auth);

  const [menuOpen, setMenuOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const staticPaths = ["/register", "/login", "/verify", "/reset-password"];
  const noNavigationMenu = staticPaths.includes(pathname);

  useEffect(() => setHasMounted(true), []);

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
    setProductOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      setMenuOpen(false);
      router.push("/");
    } else {
      console.error("Logout failed:", result.payload);
    }
  };

  if (noNavigationMenu) return null;

  return (
    <nav className="relative bg-white">
      {/* Top green accent stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#b8e8c8] via-[#7ed09a] to-[#b8e8c8]" />

      <div className="w-full">
        <div className="px-4 lg:px-12 nav:px-8 py-4">
          <div className="flex items-center">
            {/* LEFT: Hamburger (mobile) + Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center">
                <Image
                  width={56}
                  height={26}
                  alt="FIL"
                  src="/fillogo.png"
                  priority
                />
              </Link>
            </div>

            {/* CENTER: Desktop nav links */}
            <ul className="hidden nav:flex items-center gap-10 mx-auto text-sm">
              <ProductTooltip />
              <ArrivalTooltip />
              <li>
                <Link
                  href="/track"
                  className="font-roboto text-[#1a1a1a] hover:text-filgreen transition-colors duration-200 relative group"
                >
                  Bulk Order
                  <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-filgreen group-hover:w-full transition-all duration-300" />
                </Link>
              </li>
            </ul>

            {/* RIGHT: Desktop icons */}
            <ul className="hidden nav:flex items-center gap-6 ml-auto">
              <NavSearchTooltip />
              <ProfileTooltip
                isAuthenticated={isAuthenticated}
                userName={user?.firstName}
              />
              <li>
                <Link
                  href="/contact"
                  className="flex items-center text-[#1a1a1a] hover:text-filgreen transition-colors"
                  aria-label="Help"
                >
                  <Image
                    alt="help"
                    width={22}
                    height={22}
                    src="/help.svg"
                    className="opacity-80 hover:opacity-100"
                  />
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="relative flex items-center hover:text-filgreen transition-colors"
                  aria-label="Cart"
                >
                  <Image
                    src="/cart.svg"
                    alt="cart"
                    width={24}
                    height={24}
                    className="opacity-80 hover:opacity-100"
                  />
                  {hasMounted && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex justify-center items-center bg-[#1a1a1a] rounded-full w-[18px] h-[18px] text-white text-[10px] font-semibold">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </li>
            </ul>

            {/* MOBILE: Right icons */}
            <div className="nav:hidden flex items-center gap-5 ml-auto">
              <NavSearchTooltip />
              <Link
                href="/cart"
                className="relative flex items-center"
                aria-label="Cart"
              >
                <Image
                  src="/cart.svg"
                  alt="cart"
                  width={24}
                  height={24}
                  className="opacity-80"
                />
                {hasMounted && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex justify-center items-center bg-[#1a1a1a] rounded-full w-[18px] h-[18px] text-white text-[10px] font-semibold">
                    {totalItems}
                  </span>
                )}
              </Link>
              <button
                className="text-[#1a1a1a] hover:text-filgreen transition-colors"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={26} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom dashed divider */}
        <div className="border-b border-dashed border-[#d9d9d9]" />
      </div>

      {/* ───── MOBILE DRAWER ───── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.25}}
              className="fixed inset-0 bg-black/40 z-40 nav:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              ref={menuRef}
              key="mobile-drawer"
              initial={{x: "-100%"}}
              animate={{x: 0}}
              exit={{x: "-100%"}}
              transition={{duration: 0.3, ease: [0.32, 0.72, 0, 1]}}
              className="fixed top-0 left-0 z-50 nav:hidden w-[82%] max-w-[340px] h-full bg-white shadow-2xl flex flex-col"
            >
              {/* Green top accent */}
              <div className="h-1 w-full bg-gradient-to-r from-[#b8e8c8] via-[#7ed09a] to-[#b8e8c8]" />

              {/* Header: Close button */}
              <div className="px-5 pt-5 pb-2">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-[#1a1a1a] hover:text-filgreen transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} strokeWidth={2} />
                </button>
              </div>

              {/* Nav items */}
              <div className="flex-1 px-5 py-3 overflow-y-auto">
                {/* PRODUCT (accordion) */}
                <div className="border-b border-[#ececec]">
                  <button
                    onClick={() => setProductOpen((o) => !o)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="font-semibold text-[15px] text-[#1a1a1a]">
                      Product
                    </span>
                    {productOpen ? (
                      <ChevronUp size={18} className="text-[#1a1a1a]" />
                    ) : (
                      <ChevronDown size={18} className="text-[#1a1a1a]" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {productOpen && (
                      <motion.div
                        initial={{height: 0, opacity: 0}}
                        animate={{height: "auto", opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        transition={{duration: 0.25, ease: "easeInOut"}}
                        className="overflow-hidden"
                      >
                        <ul className="pb-3 pl-1 space-y-3">
                          {MOBILE_CATEGORIES.map((cat) => (
                            <li key={cat.key}>
                              <Link
                                href={`/products?categories=${encodeURIComponent(
                                  cat.key,
                                )}`}
                                onClick={() => setMenuOpen(false)}
                                className="block text-[14px] text-[#9a9a9a] hover:text-filgreen transition-colors"
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

                {/* NEW ARRIVALS */}
                <div className="border-b border-[#ececec]">
                  <Link
                    href="/products?sort=newest"
                    onClick={() => setMenuOpen(false)}
                    className="block py-4 font-semibold text-[15px] text-[#1a1a1a] hover:text-filgreen transition-colors"
                  >
                    New Arrivals
                  </Link>
                </div>

                {/* BULK ORDER */}
                <div className="border-b border-[#ececec]">
                  <Link
                    href="/track"
                    onClick={() => setMenuOpen(false)}
                    className="block py-4 font-semibold text-[15px] text-[#1a1a1a] hover:text-filgreen transition-colors"
                  >
                    Bulk Order
                  </Link>
                </div>

                {/* Authenticated extras */}
                {isAuthenticated && (
                  <>
                    <div className="border-b border-[#ececec]">
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="block py-4 font-semibold text-[15px] text-[#1a1a1a] hover:text-filgreen transition-colors"
                      >
                        My Profile
                      </Link>
                    </div>
                    <div className="border-b border-[#ececec]">
                      <Link
                        href="/profile?tab=My%20Orders"
                        onClick={() => setMenuOpen(false)}
                        className="block py-4 font-semibold text-[15px] text-[#1a1a1a] hover:text-filgreen transition-colors"
                      >
                        My Orders
                      </Link>
                    </div>
                    <div className="border-b border-[#ececec]">
                      <Link
                        href="/profile?tab=Wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="block py-4 font-semibold text-[15px] text-[#1a1a1a] hover:text-filgreen transition-colors"
                      >
                        Wishlist
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom CTA */}
              <div className="px-5 pt-4 pb-6 border-t border-[#ececec]">
                {!isAuthenticated ? (
                  <>
                    <p className="text-[13px] text-[#1a1a1a] mb-3">
                      You are not a member?
                    </p>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1a1a1a] hover:bg-black rounded-full text-white text-[14px] font-medium transition-colors"
                    >
                      <Image
                        src="/profile.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="invert"
                      />
                      Sign in
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-[13px] text-[#1a1a1a] mb-3">
                      Signed in as{" "}
                      <span className="font-semibold">
                        {user?.firstName || "User"}
                      </span>
                    </p>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1a1a1a] hover:bg-black rounded-full text-white text-[14px] font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}