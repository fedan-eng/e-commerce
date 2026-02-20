"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ImageSlider from "./ImageSlider";
import Link from "next/link";
import Loading from "./Loading";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/products");
      } else {
        setError(data.message || "Invalid email or password");
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

            <div className="">
              <button
                type="submit"
                className={`flex text-sm justify-center text-white text-center mt-6 ${
                  loading ? "" : "  w-full bg-black rounded-md py-3"
                } `}
                disabled={loading}
              >
                {loading ? <Loading /> : "Login"}
              </button>
            </div>
          </form>
          <div className="mt-4">
            <p className="text-[#b7b7b7] text-xs">
              By clicking Sign In you are agreeing to our{" "}
              <Link
                className="font-medium text-black underline"
                href="/"
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
