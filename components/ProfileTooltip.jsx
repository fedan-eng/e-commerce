"use client";
// components/ProfileTooltip.jsx — "Sign in" / "Hi, Name" dropdown in the desktop navbar
import Link from "next/link";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, Heart, Truck, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { useHoverMenu } from "@/hooks/useHoverMenu";

const profileLinks = [
  { name: "My profile", link: "/profile", icon: User },
  { name: "My orders", link: "/profile?tab=My%20Orders", icon: Package },
  { name: "Wishlist", link: "/profile?tab=Wishlist", icon: Heart },
  { name: "Track an order", link: "/contact#track", icon: Truck },
];

const ROW = "flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] font-medium text-[#0A321B] transition-colors hover:bg-[#F3F7F2]";

const ProfileTooltip = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { open, bind } = useHoverMenu();
  const firstName = user?.firstName || "there";
  const initial = (user?.firstName?.[0] || "U").toUpperCase();

  return (
    <li className="relative flex items-center" {...bind}>
      <Link
        href={isAuthenticated ? "/profile" : "/login"}
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex items-center gap-1.5 text-[#1a1a1a] transition-colors hover:text-filgreen ${open ? "text-filgreen" : ""}`}
      >
        {isAuthenticated ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F5EC] text-[11px] font-bold text-[#0A321B]">
            {initial}
          </span>
        ) : (
          <User size={18} strokeWidth={1.75} />
        )}
        <span className="text-sm font-medium">
          {isAuthenticated ? `Hi, ${firstName}` : "Sign in"}
        </span>
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            // pt-3 = invisible bridge so hover isn't lost between trigger and card
            className="absolute right-0 top-full z-[60] pt-3"
          >
            <div className="w-[280px] rounded-[22px] border border-[#E3EDE6] bg-white p-2 shadow-[0_24px_48px_-16px_rgba(10,50,27,0.22)]">
              {isAuthenticated ? (
                <>
                  <div className="mb-1 flex items-center gap-3 rounded-[16px] bg-[#F3F7F2] p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#004328] text-[15px] font-bold text-white">
                      {initial}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-bold text-[#0A321B]">
                        {user?.firstName} {user?.lastName}
                      </span>
                      {user?.email && (
                        <span className="block truncate text-[12px] text-[#5B6B61]">{user.email}</span>
                      )}
                    </span>
                  </div>

                  {profileLinks.map(({ name, link, icon: Icon }) => (
                    <Link key={link + name} href={link} className={ROW}>
                      <Icon size={16} className="text-[#1FA34A]" />
                      {name}
                    </Link>
                  ))}
                  {user?.role === "admin" && (
                    <Link href="/admin_console" className={ROW}>
                      <LayoutDashboard size={16} className="text-[#1FA34A]" />
                      Admin dashboard
                    </Link>
                  )}

                  <div className="my-1 h-px bg-[#E3EDE6]" />
                  <LogoutButton className={`${ROW} text-[#C0392B] hover:bg-[#FDECEA]`}>
                    <LogOut size={16} />
                    Log out
                  </LogoutButton>
                </>
              ) : (
                <div className="p-3">
                  <p className="text-[15px] font-bold text-[#0A321B]">Welcome to FIL</p>
                  <p className="mt-1 text-[12.5px] leading-snug text-[#5B6B61]">
                    Sign in to track orders, save favourites and check out faster.
                  </p>
                  <Link
                    href="/login"
                    className="mt-4 flex w-full items-center justify-center rounded-full bg-[#004328] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-black"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="mt-2 flex w-full items-center justify-center rounded-full border border-[#D6E2DA] py-2.5 text-[13px] font-semibold text-[#0A321B] transition-colors hover:border-[#0A321B]"
                  >
                    Create an account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export default ProfileTooltip;
