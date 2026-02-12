"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import OrderSheet from "@/components/OrderSheet";
import Wishlist from "@/components/Wishlist";

import { MdOutlineManageAccounts } from "react-icons/md";
import { GoShieldLock } from "react-icons/go";
import { AiOutlineShop } from "react-icons/ai";
import { CiHeart } from "react-icons/ci";
import { IoIosArrowForward } from "react-icons/io";

const links = [
  { name: "General Information", icon: <MdOutlineManageAccounts size={24} /> },
  { name: "Change Password", icon: <GoShieldLock size={24} /> },
  { name: "My Orders", icon: <AiOutlineShop size={24} /> },
  { name: "Wishlist", icon: <CiHeart size={24} /> },
];

// Small child component that uses useSearchParams
function ProfileContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "General Information";

  const [activeLink, setActiveLink] = useState(tab);

  useEffect(() => {
    setActiveLink(tab);
  }, [tab]);

  const renderContent = () => {
    switch (activeLink) {
      case "General Information":
        return <ProfileForm />;
      case "Change Password":
        return <ChangePasswordForm />;
      case "My Orders":
        return <OrderSheet />;
      case "Wishlist":
        return <Wishlist />;
      default:
        return <ProfileForm />;
    }
  };

  return (
    <div className="mx-auto mt-4 w-full max-w-[1140px]">
      <h3 className="md:hidden mb-3 font-oswald font-medium text-4xl text-center">
        My Profile
      </h3>
      <div className="flex justify-center gap-2 side:gap-4 mx-2">
        <div>
          <h3 className="max-md:hidden mb-[18px] font-oswald font-medium text-4xl">
            My Profile
          </h3>
          <div className="max-md:hidden bg-[#fafafa] p-1 xxs:p-2 sm:p-4 rounded-md w-fit md:w-[230px] lg:w-[273px] :">
            {links.map((link) => (
              <div
                key={link.name}
                className={`flex cursor-pointer items-center gap-2 py-2 rounded-md transition-colors ${
                  activeLink === link.name
                    ? "text-filgreen"
                    : "hover:text-filgreen"
                }`}
                onClick={() => setActiveLink(link.name)}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <span>{link.icon}</span>
                    <span className="max-md:hidden text-sm">{link.name}</span>
                  </div>
                  <span className="max-md:hidden">
                    <IoIosArrowForward />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The content rendering area */}
        <div className="flex-1">
          {renderContent()}

          <div className="hidden bottom-4 left-1/2 z-50 max-md:fixed max-md:flex justify-center items-center gap-4 bg-[#bebcbc] shadow-lg p-2 py-4 rounded-md w-fit -translate-x-1/2 transform">
            {links.map((link) => (
              <div
                key={link.name}
                className={`cursor-pointer flex items-center gap-2 rounded-md transition-colors ${
                  activeLink === link.name
                    ? "text-filgreen"
                    : "hover:text-filgreen"
                }`}
                onClick={() => setActiveLink(link.name)}
              >
                <span>{link.icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
