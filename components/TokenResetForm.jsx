"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Loading from "@/components/Loading";
import Image from "next/image";
import ImageSlider from "./ImageSlider";
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowLeft } from "react-icons/fa";

export default function TokenResetForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState("");
  const [validating, setValidating] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // 🔒 Yup password schema
  const passwordSchema = Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Za-z]/, "Must contain a letter")
    .matches(/\d/, "Must contain a number")
    .matches(/[@$!%*?&.#]/, "Must contain a special character (@$!%*?&.#)")
    .required("Password is required");

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid reset link. Please request a new password reset.");
        setValidating(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await res.json();
        
        if (res.ok && data.valid) {
          setTokenValid(true);
          setEmail(data.email);
        } else {
          setError(data.message || "Invalid or expired reset link. Please request a new password reset.");
        }
      } catch (err) {
        setError("Failed to validate reset link. Please try again.");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: passwordSchema,
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], "Passwords must match")
        .required("Please confirm your password"),
    }),
    onSubmit: async (values) => {
      setError("");
      setMessage("");
      setLoading(true);
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            newPassword: values.newPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setMessage("Password reset successfully! Redirecting to login...");
        
        // Redirect to login after successful reset
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  if (!tokenValid && !error) {
    return (
      <div className="relative flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex justify-between max-lg:justify-center items-center h-screen overflow-hidden">
        <div className="max-lg:hidden flex justify-center bg-white">
          <ImageSlider />
        </div>

        <div className="flex flex-col justify-center bg-[#fafafa] lg:ml-3 px-4 md:px-10 py-4 sm:py-10 max-lg:rounded-md w-[90%] sm:w-[80%] md:w-[70%] lg:w-full lg:max-w-[448px] lg:min-h-screen">
          <div className="flex items-center gap-1 mb-6 cursor-pointer" onClick={() => router.push('/reset-password')}>
            <FaArrowLeft />
            <p className="font-medium text-sm">Back</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-md p-6 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Invalid Reset Link</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => router.push('/reset-password')}
              className="bg-black text-white px-4 py-2 rounded-md text-sm"
            >
              Request New Reset Link
            </button>
          </div>
        </div>

        <div className="max-lg:hidden mt-[240px]">
          <Image src="/head.svg" alt="" width={145} height={125} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex justify-between max-lg:justify-center items-center h-screen overflow-hidden">
      <div className="max-lg:hidden flex justify-center bg-white">
        <ImageSlider />
      </div>

      <div className="flex flex-col justify-center bg-[#fafafa] lg:ml-3 px-4 md:px-10 py-4 sm:py-10 max-lg:rounded-md w-[90%] sm:w-[80%] md:w-[70%] lg:w-full lg:max-w-[448px] lg:min-h-screen">
        <div className="flex items-center gap-1 mb-6 cursor-pointer" onClick={() => router.push('/login')}>
          <FaArrowLeft />
          <p className="font-medium text-sm">Cancel</p>
        </div>

        <div className="flex gap-6 mb-3">
          <h2 className="py-2 border-filgreen border-b-[2px] font-oswald font-medium text-filgreen text-xl sm:text-3xl">
            Reset Password
          </h2>
        </div>

        <p className="mb-6 text-[#3e3e3e] text-sm">
          Enter your new password below to reset your password
        </p>

        <form onSubmit={formik.handleSubmit}>
          <div className="mb-[10px]">
            <div className="flex justify-between bg-[#f7f7f7] border-b border-black">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                id="newPassword"
                placeholder="Enter new password"
                className="block p-3 outline-0 w-full placeholder-text-sm text-sm placeholder-[#3e3e3e]"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="right-2 relative focus:outline-none text-sm cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="mt-0.5 text-red-500 text-sm">
                {formik.errors.newPassword}
              </p>
            )}
          </div>

          <div className="mb-[10px]">
            <div className="flex justify-between bg-[#f7f7f7] border-b border-black">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm new password"
                className="block p-3 outline-0 w-full placeholder-text-sm text-sm placeholder-[#3e3e3e]"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="right-2 relative focus:outline-none text-sm cursor-pointer"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="mt-0.5 text-red-500 text-sm">
                {formik.errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            className={`flex text-sm justify-center text-white text-center mt-6 ${
              loading ? "" : "  w-full bg-black rounded-md py-3"
            } `}
            type="submit"
            disabled={loading}
          >
            {loading ? <Loading /> : "Reset Password"}
          </button>
        </form>

        <div className="flex justify-center mt-2">
          {error && <p style={{ color: "red" }}>{error}</p>}
          {message && <p style={{ color: "green" }}>{message}</p>}
        </div>
      </div>

      <div className="max-lg:hidden mt-[240px]">
        <Image src="/head.svg" alt="" width={145} height={125} />
      </div>
    </div>
  );
}