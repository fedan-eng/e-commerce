export const dynamic = 'force-dynamic';

"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "@/store/features/authSlice";
import Loading from "@/components/Loading";

export default function AuthCallback() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get("callbackUrl");

        let redirectTo = "/products";
        if (callbackUrl) {
          try {
            redirectTo = decodeURIComponent(callbackUrl);
          } catch (e) {
            console.error("Failed to decode callbackUrl:", e);
          }
        }

        console.log("Auth callback: Fetching user and redirecting to:", redirectTo);

        await dispatch(fetchUser());

        console.log("Auth callback: User fetch completed");

        await new Promise(resolve => setTimeout(resolve, 100));

        window.location.href = redirectTo;
      }
    };

    handleCallback();
  }, [dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading />
    </div>
  );
}