"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "@/components/Loading";
import ImageSlider from "@/components/ImageSlider"; 
import { FaArrowLeft } from "react-icons/fa";
import Image from "next/image";

const VerifyEmailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const callback = searchParams.get("callback");

      if (!token) {
        setStatus("error");
        setMessage("No verification token found in URL.");
        return;
      }

      try {
        const apiUrl = callback 
          ? `/api/auth/verify-email?token=${token}&callback=${encodeURIComponent(callback)}`
          : `/api/auth/verify-email?token=${token}`;
        
        const response = await fetch(apiUrl);
        
        if (response.redirected) {
          // The API handles redirects, so we follow it using router.push
          const redirectUrl = new URL(response.url);
          const pathname = redirectUrl.pathname + redirectUrl.search;
          router.push(pathname);
          return;
        }

        setStatus("error");
        setMessage("Verification failed. Please try again.");
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="relative flex justify-between max-lg:justify-center items-center h-screen overflow-hidden b">
      <div className="max-lg:hidden flex justify-center bg-white">
        <ImageSlider />
      </div>

      <div className="flex flex-col justify-center bg-[#fafafa] lg:ml-3 px-4 md:px-10 py-4 sm:py-10 max-lg:rounded-md w-[90%] sm:w-[80%] md:w-[70%] lg:w-full lg:max-w-[448px] lg:min-h-screen">
        <div className="flex items-center gap-1 mb-6">
          <FaArrowLeft onClick={() => router.push("/login")} className="cursor-pointer" />
          <p className="font-medium text-sm cursor-pointer" onClick={() => router.push("/login")}>Back to Login</p>
        </div>

        <div className="flex gap-6 mb-3">
          <h2 className="py-2 border-filgreen border-b-[2px] font-oswald font-medium text-filgreen text-xl sm:text-3xl">
            Verifying Email
          </h2>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loading />
            <p className="mt-4 text-sm text-[#666]">Verifying your email...</p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-sm text-red-700">{message}</p>
          </div>
        )}
      </div>

      <div className="max-lg:hidden mt-[300px]">
        <Image src="/head.svg" alt="" width={145} height={125} />
      </div>
    </div>
  );
};

export default VerifyEmailContent;
