"use client";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import ImageSlider from "./ImageSlider";
import Link from "next/link";
import Loading from "./Loading";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { fetchUser } from "@/store/features/authSlice";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleHint, setShowGoogleHint] = useState(false);

  const passwordRef = useRef(null);

 const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setShowGoogleHint(false);
  setLoading(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      await dispatch(fetchUser());
      const callbackUrl = searchParams.get("callbackUrl");
      router.push(callbackUrl || "/products");
    } else {
      if (data.provider === "google") {
        setShowGoogleHint(true); // trigger the UI hint below
        setError(""); // clear generic error — we show a custom block instead
      } else {
        setError(data.message || "Invalid email or password");
      }
    }
  } catch (err) {
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus(); // Move focus to password input
    }
  };

  return (
    <div className="relative flex justify-between max-lg:justify-center items-center h-screen overflow-hidden">
      <div className="max-lg:hidden flex justify-center bg-white">
        <ImageSlider />
      </div>

      <div className="flex flex-col justify-center min-h-screen">
        <h2 className="hidden max-lg:block font-oswald font-semibold sm:text-[110px] text-4xl xxs:text-6xl whitespace-nowrap">
          {" "}
          Think Quality
        </h2>
        <div className="bg-[#fafafa] lg:ml-3 px-4 md:px-10 py-4 sm:py-10 max-lg:rounded-md">
          <div
            onClick={() => router.back()}
            className="flex items-center gap-1 mb-6 cursor-pointer"
          >
            <FaArrowLeft />
            <p className="font-medium text-sm">Cancel</p>{" "}
          </div>

          <div className="flex gap-6 mb-3">
            <Link
              href="/login"
              className="py-2 border-filgreen border-b-[2px] font-oswald font-medium text-filgreen text-xl sm:text-3xl"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="py-2 font-oswald font-medium text-[#b7b7b7] text-xl sm:text-3xl"
            >
              {" "}
              Join Us
            </Link>
          </div>

          <p className="mb-6 text-[#3e3e3e] text-sm">
            Kindly enter your email address and password to log in
          </p>

          <form onSubmit={handleLogin}>
            <div className="mb-[10px]">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                name="email"
                type="email"
                id="email"
                placeholder="Email Address"
                className="block bg-[#f7f7f7] p-3 border-black border-b outline-0 w-full placeholder-text-sm text-sm placeholder-[#3e3e3e]"
              />
            </div>

            <div>
              <div className="flex justify-between bg-[#f7f7f7] border-black border-b">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  ref={passwordRef}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="block p-3 outline-0 w-full text-sm placeholder-[#3e3e3e]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="right-2 relative focus:outline-none text-sm cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Link
                className="hover:text-gren text-xs hover:underline"
                href="/reset-password"
              >
                Forgot password
              </Link>
            </div>

            {error && (
  <div className="mt-2 font-medium text-red-500 text-sm text-center">
    {error}
  </div>
)}

            {showGoogleHint && (
  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 text-center">
    This account was created with Google.{" "}
    <button
      type="button"
      onClick={() => setShowGoogleHint(false)}
      className="underline"
    >
      Use Google Sign-In below
    </button>{" "}
    or{" "}
    <Link href="/reset-password" className="underline font-medium">
      set a password
    </Link>
    .
  </div>
)}

            <div className="">
              <button
                type="submit"
                className="flex text-sm justify-center text-white text-center mt-6 w-full bg-black rounded-md py-3 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? <Loading /> : "Login"}
              </button>
            </div>
          </form>

<div className="mt-4 flex items-center gap-4">
  <div className="flex-1 h-px bg-gray-300"></div>
  <span className="text-xs text-gray-500">or</span>
  <div className="flex-1 h-px bg-gray-300"></div>
</div>

<Link
  href="/api/auth/google"
  className={`flex items-center justify-center gap-2 mt-4 w-full border rounded-md py-3 text-sm font-medium transition-colors ${
    showGoogleHint
      ? "bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-300" 
      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"      
  }`}
>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
             {showGoogleHint ? "Continue with Google →" : "Sign in with Google"}
          </Link>
          <div className="mt-4">
            <p className="text-[#b7b7b7] text-xs">
              By clicking Sign In you are agreeing to our{" "}
              <Link
                className="font-medium text-black underline"
                href="/policies"
              >
                Privacy Policy and Terms and Conditions.
              </Link>{" "}
            </p>
          </div>
        </div>
        <h2 className="hidden max-lg:block font-oswald font-semibold sm:text-[110px] text-4xl xxs:text-6xl text-right whitespace-nowrap">
          {" "}
          Think Fil
        </h2>
      </div>

      <div className="max-lg:hidden mt-[240px]">
        <img src="/head.svg" />
      </div>
    </div>
  );
}
