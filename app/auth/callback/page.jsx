"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { fetchUser } from "@/store/features/authSlice";
import Loading from "@/components/Loading";

export const dynamic = 'force-dynamic';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      // Get the redirect URL from query params
      const callbackUrl = searchParams.get("callbackUrl");
      
      // Decode the URL if it exists, otherwise default to products
      let redirectTo = "/products";
      if (callbackUrl) {
        try {
          redirectTo = decodeURIComponent(callbackUrl);
        } catch (e) {
          console.error("Failed to decode callbackUrl:", e);
        }
      }
      
      console.log("Auth callback: Fetching user and redirecting to:", redirectTo);
      
      // Fetch user after NextAuth session is established
      const result = await dispatch(fetchUser());
      
      console.log("Auth callback: User fetch result:", result);
      
      // Small delay to ensure Redux state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to intended destination
      router.push(redirectTo);
    };

    handleCallback();
  }, [dispatch, router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading />
    </div>
  );
}
