"use client";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import LogoutButton from "@/components/LogoutButton";
import { useState } from "react";

const profileLinks = [
  {
    name: "Profile",
    link: "/profile",
  },
  {
    name: "Orders",
    link: "/profile?tab=My%20Orders",
  },
  {
    name: "Wishlist",
    link: "/profile?tab=Wishlist",
  },
  {
    name: "Track Orders",
    link: "/contact",
  },
];

const ProfileTooltip = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      className="relative flex justify-center items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(false)}
    >
      <div className="font-extrabold hover:text-mustard text-2xl">
        <Image
          alt="profile"
          width={28}
          height={28}
          src="/profile.svg"
        />
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="top-full left-1/2 z-50 absolute bg-white shadow-xl mt-3 py-2 border border-gray-200 rounded-md w-[178px] -translate-x-1/2"
          >
            {isAuthenticated ? (
              <div className="">
                <p className="py-2 pl-3 border-[#E5E5E5] border-b text-black text-sm">
                  Hello, {user?.firstName || "User"}
                </p>

                {profileLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.link}
                    className="block py-2 pl-3 text-black hover:text-filgreen text-sm hover:underline"
                  >
                    {link.name}
                  </Link>
                ))}

                {user.role === "admin" && ( <Link href="/admin" className="block py-2 pl-3 text-black hover:text-filgreen text-sm hover:underline">
                  Admin Dashboard
                </Link>)}

                <div className="block">
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="text-sm">
                <p className="block py-2 pl-3 text-black hover:text-mustard text-sm hover:underline">
                  Welcome! 👋
                </p>
                <Link
                  href="/login"
                  className="block py-2 pl-3 text-black hover:text-mustard text-sm hover:underline"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block py-2 pl-3 text-black hover:text-mustard text-sm hover:underline"
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
