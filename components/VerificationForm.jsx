"use client";
import ImageSlider from "./ImageSlider";
import { FaArrowLeft } from "react-icons/fa";
import Image from "next/image";

const VerificationForm = () => {
  return (
    <div className="relative flex justify-between max-lg:justify-center items-center h-screen overflow-hidden b">
      <div className="max-lg:hidden flex justify-center bg-white">
        <ImageSlider />
      </div>

      <div className="flex flex-col justify-center bg-[#fafafa] lg:ml-3 px-4 md:px-10 py-4 sm:py-10 max-lg:rounded-md w-[90%] sm:w-[80%] md:w-[70%] lg:w-full lg:max-w-[448px] lg:min-h-screen">
        <div className="flex items-center gap-1 mb-6">
          <FaArrowLeft />
          <p className="font-medium text-sm">Cancel</p>{" "}
        </div>

        <div className="flex gap-6 mb-3">
          <h2 className="py-2 border-filgreen border-b-[2px] font-oswald font-medium text-filgreen text-xl sm:text-3xl">
            Check Your Email
          </h2>
        </div>

        <p className="mb-6 text-[#3e3e3e] text-sm">
          We've sent a verification link to your email. Click the link to verify your account and start shopping.
        </p>

        <div className="bg-[#f0f9ff] border-l-4 border-filgreen p-4 mb-6">
          <p className="text-sm text-[#3e3e3e]">
            <span className="font-semibold">💡 Tip:</span> The link expires in 24 hours. If you don't see it, check your spam folder.
          </p>
        </div>

        <p className="text-sm text-[#666]">
          Didn't receive the email? <a href="/register" className="text-filgreen underline">Register again</a>
        </p>
      </div>

      <div className="max-lg:hidden mt-[300px]">
        <Image src="/head.svg" alt="" width={145} height={125} />
      </div>
    </div>
  );
};

export default VerificationForm;
