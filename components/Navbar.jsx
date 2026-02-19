"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ProfileTooltip from "./ProfileTooltip";
import ArrivalTooltip from "./ArrivalTooltip";
import ProductTooltip from "./ProductTooltip";
import NavSearchTooltip from "./NavSearchTooltip";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Accordion from "@/components/Accordion";
import { GoChevronDown } from "react-icons/go";
import { GoChevronUp } from "react-icons/go";

const homeLinks = [
  {
    link: "PRODUCTS",
    ref: "/",
  },

  {
    link: "BULK ORDERS",
    ref: "/track",
  },
];

export default function Navbar() {
  const menuRef = useRef(null);

  const cartItems = useSelector((state) => state.cart.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const { isAuthenticated } = useSelector((state) => state.auth);

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuData, setMobileMenuData] = useState([]);

  const pathname = usePathname();
  const staticPaths = ["/register", "/login", "/verify", "/reset-password"];
  const noNavigationMenu = staticPaths.includes(pathname);

  const [hasMounted, setHasMounted] = useState(false);

  const CATEGORIES = [
    { key: "Power Bank", title: "Power Bank" },
    { key: "Wearables", title: "Wearables" },
    { key: "Chargers", title: "Chargers" },
    { key: "Lifestyle", title: "Lifestyle" },
    { key: "Extensions", title: "Extensions" },
  ];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    async function loadCategories() {
      const result = [];

      for (const category of CATEGORIES) {
        try {
          const res = await fetch(
            `/api/products?categories=${encodeURIComponent(
              category.key
            )}&limit=4`
          );
          const data = await res.json();

          result.push({
            title: category.title,
            products: data.products || [],
          });
        } catch (error) {
          result.push({
            title: category.title,
            products: [],
          });
        }
      }

      setMobileMenuData(result);
    }

    loadCategories();
  }, []);

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleOutside);
    }

    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  if (noNavigationMenu) {
    return null;
  }

  return (
    <nav className="relative bg-dark">
      <div className="bg-lightgreen py-4 text-black text-xs text-center">
        All deliveries in Lagos are free on Thursday but express deliveries are
        priced
      </div>
      <div className="bg-dark w-full transition-all duration-300">
        <div className="px-3 lg:px-12 nav:px-5 py-4">
          {/* LOGO */}

          <div className="flex items-center">
            <div className="flex gap-4">
              <button
                className="nav:hidden text-white hover:text-mustard"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>

              <Link href="/">
                <Image
                  className=" "
                  width={60}
                  height={26}
                  alt="Fil"
                  src="/fillogo-white.webp"
                />
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="flex items-center ml-auto">
              <ul className="hidden nav:flex space-x-4 lg:space-x-15 mr-4 lg:mr-13 text-sm">
                <ProductTooltip />

                <ArrivalTooltip />

                <li>
                  <Link
                    href="/"
                    className="px-2 font-roboto text-white hover:text-mustard text-sm"
                  >
                    BULK ORDER
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right Icons */}
            <ul className="hidden nav:flex md:items-center space-x-2 lg:space-x-5">
              <NavSearchTooltip />
              <ProfileTooltip isAuthenticated={isAuthenticated} />

              <li>
                <Link href="/contact">
                  <Image
                    alt="help"
                    width={28}
                    height={28}
                    src="/help.svg"
                  />
                </Link>
              </li>

              <li>
                <Link
                  href="/cart"
                  className="relative flex items-center gap-2"
                >
                  <Image
                    src="/cart.svg"
                    alt=""
                    width={28}
                    height={28}
                    className="hover:text-mustard text-2xl"
                  />
                  {hasMounted && totalItems > 0 && (
                    <div className="flex justify-center items-center bg-filgreen rounded w-5 h-5 text-white text-xs">
                      {totalItems}
                    </div>
                  )}
                </Link>
              </li>
            </ul>

            {/* Mobile Menu Button */}
            <div className="nav:hidden flex items-center space-x-2">
              <NavSearchTooltip />
              <ProfileTooltip isAuthenticated={isAuthenticated} />

              <Link href="/contact">
                <Image
                  alt="help"
                  width={28}
                  height={28}
                  src="/help.svg"
                />
              </Link>

              <Link
                href="/cart"
                className="relative flex items-center gap-2"
              >
                <Image
                  src="/cart.svg"
                  alt=""
                  width={28}
                  height={28}
                  className="hover:text-mustard text-2xl"
                />
                {hasMounted && totalItems > 0 && (
                  <div className="flex justify-center items-center bg-filgreen rounded w-5 h-5 text-white text-xs">
                    {totalItems}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              ref={menuRef}
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="nav:hidden z-50 relative bg-white p-4"
            >
              <Accordion
                items={mobileMenuData.map((cat) => ({
                  title: cat.title,
                  content: (
                    <div>
                      <div className="gap-3 grid grid-cols-2">
                        {cat.products.length > 0 ? (
                          cat.products.map((item) => (
                            <Link
                              href={`/products/${item._id ?? item.id}`}
                              onClick={() => setMenuOpen(false)}
                              key={item._id}
                            >
                              <div className="flex justify-center items-center">
                                <img
                                  src={item.image ?? "/placeholder.png"}
                                  alt={item.name}
                                  className="w-[150px] h-[150px] object-contain"
                                />
                              </div>

                              <p className="mt-4 font-oswald font-medium text-sm text-center line-clamp-1">
                                {item.name}
                              </p>
                            </Link>
                          ))
                        ) : (
                          <p className="col-span-2 py-3 text-gray-500 text-center">
                            No products available
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/products?categories=${cat.title}`}
                        onClick={() => setMenuOpen(false)}
                        className="block mt-4 py-2 sm:py-3 border border-[#d9d9d9] rounded-md text-[#007c42] text-xs sm:text-sm text-center"
                      >
                        All {cat.title} →
                      </Link>
                    </div>
                  ),
                }))}
                className="mx-auto"
                headerClassName="text-xs sm:text-sm bg-white py-4 px-1 sm:px-4"
                contentClassName="text-sm mx-1 sm:mx-4 px-1 sm:px-4 rounded-md bg-[#f5f5f5] py-4"
                icon={({ isOpen }) =>
                  isOpen ? <GoChevronUp /> : <GoChevronDown />
                }
                iconClassName="text-black text-lg font-bold"
              />

              <div className="mt-2 border-black border-t">
                <p className="mt-6 mb-3 text-sm"> You're not a member? </p>

                <Link href="/register" className="py-2 sm:py-3 border border-[#d9d9d9] rounded-md text-[#007c42] text-xs sm:text-sm text-center">
                  Sign in/Join Us
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
