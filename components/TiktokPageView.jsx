"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TiktokPageView = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.page();
    }
  }, [pathname]);

  return null;
};

export default TiktokPageView;