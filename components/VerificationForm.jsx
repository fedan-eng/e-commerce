"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { verifyCodeAsync } from "@/store/features/registerSlice";
import Loading from "@/components/Loading";
import ImageSlider from "./ImageSlider";
import { FaArrowLeft } from "react-icons/fa";

const VerificationForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { email, isVerified, isLoading, error } = useSelector(
    (state) => state.register
  );

  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(verifyCodeAsync({ code, email })).then((res) => {
      if (!res.error) {
        router.push("/login");
      }
    });
  };

  // Redirect back to registration if no email in state
  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

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
            {" "}
            Verify Email
          </h2>
        </div>

        <p className="mb-6 text-[#3e3e3e] text-sm">
          Kindly enter your email address and password to sign in
        </p>

        <form onSubmit={handleSubmit}>
          <div className="my-4">
            <div className="mb-[10px]">
              <input
                type="email"
                value={email}
                disabled
                className="block bg-[#f7f7f7] p-3 border-black border-b outline-0 w-full placeholder-text-sm text-sm placeholder-[#3e3e3e]"
              />
            </div>
          </div>

          <div>
            <div>
              <input
                autoComplete="off"
                type="text"
                id="code"
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="block bg-[#f7f7f7] p-3 border-black border-b outline-0 w-full placeholder-text-sm text-sm placeholder-[#3e3e3e]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`flex text-sm justify-center text-white text-center mt-6 ${
              isLoading ? "" : "  w-full bg-black rounded-md py-3"
            } `}
          >
            {isLoading ? <Loading /> : "Verify"}
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </div>

      <div className="max-lg:hidden mt-[300px]">
        <img src="/head.svg" />
      </div>
    </div>
  );
};

export default VerificationForm;
