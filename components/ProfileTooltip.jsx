"use client";
import Link from "next/link";
import {useSelector} from "react-redux";
import {motion, AnimatePresence} from "framer-motion";
import {User} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import {useState} from "react";

const profileLinks = [
  {name: "Profile", link: "/profile"},
  {name: "Orders", link: "/profile?tab=My%20Orders"},
  {name: "Wishlist", link: "/profile?tab=Wishlist"},
  {name: "Track Orders", link: "/contact"},
];

const ProfileTooltip = () => {
  const {isAuthenticated, user} = useSelector((state) => state.auth);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      className="relative flex justify-center items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={isAuthenticated ? "/profile" : "/login"}
        className="flex items-center gap-1.5 text-[#1a1a1a] hover:text-filgreen transition-colors"
      >
        <User size={18} strokeWidth={1.75} />
        <span className="font-roboto text-sm">
          {isAuthenticated ? `Hi, ${user?.firstName || user?.email?.split('@')[0] || "User"}` : "Sign in"}
        </span>
      </Link>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{opacity: 0, y: -5}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -5}}
            transition={{duration: 0.2}}
            className="top-full right-0 z-50 absolute bg-white shadow-xl mt-3 py-2 border border-gray-200 rounded-md w-[200px]"
          >
            {/* Invisible bridge to keep hover */}
            <div className="absolute -top-3 left-0 w-full h-3" />

            {isAuthenticated ? (
              <div>
                <p className="py-2 px-4 border-[#E5E5E5] border-b text-[#1a1a1a] text-sm font-medium">
                  Hello, {user?.firstName || user?.email?.split('@')[0] || "User"}
                </p>
                {profileLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.link}
                    className="block py-2 px-4 text-[#1a1a1a] hover:bg-gray-50 hover:text-filgreen text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block py-2 px-4 text-[#1a1a1a] hover:bg-gray-50 hover:text-filgreen text-sm transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="block border-t border-[#E5E5E5] mt-1">
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="text-sm">
                <p className="py-2 px-4 border-b border-[#E5E5E5] text-[#1a1a1a] font-medium">
                  Welcome! 👋
                </p>
                <Link
                  href="/login"
                  className="block py-2 px-4 text-[#1a1a1a] hover:bg-gray-50 hover:text-filgreen transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block py-2 px-4 text-[#1a1a1a] hover:bg-gray-50 hover:text-filgreen transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export default ProfileTooltip;