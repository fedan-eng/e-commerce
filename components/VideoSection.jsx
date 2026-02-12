"use client";
import Link from "next/link";
import InfiniteCarousel from "@/components/InfiniteCarousel";
import Header from "@/components/Header";

const VideoSection = () => {
  return (
    <div className="mt">
      <div className="flex justify-end sm:justify-between">
        <Header
          header="FIL Fans Have Spoken"
          imageClassName="order-2"
          className="justify-end order-2 mt-12"
        />

        <Link
          target="_blank"
          href="https://www.instagram.com/filstoreng?utm_source=ig_web_button_share_sheet&igsh=NTRkZHUxaXYzYnRz"
          className="max-sm:hidden self-end mb-8 ml-4 md:ml-10 lg:ml-20 text-[#007c42] text-sm underline"
        >
          Find Us On Instagram
        </Link>
      </div>

      <InfiniteCarousel />
    </div>
  );
};

export default VideoSection;
