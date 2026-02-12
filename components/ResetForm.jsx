"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Loading from "@/components/Loading";
import ImageSlider from "./ImageSlider";
import { FaArrowLeft } from "react-icons/fa";

export default function ResetForm() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔒 Yup password schema
  const passwordSchema = Yup.string()
    .min(6, "Password must be at least 8 characters")
    .matches(/[A-Za-z]/, "Must contain a letter")
    .matches(/\d/, "Must contain a number")
    .matches(/[@$!%*?&.#]/, "Must contain a special character (@$!%*?&.#)")
    .required("Password is required");

  // 🔹 Step 1: Request Reset Code
  const formikStep1 = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: async (values) => {
      setError("");
      setMessage("");
      setLoading(true);
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setMessage(data.message);
        setStep(2);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  // 🔹 Step 2: Submit New Password
  const formikStep2 = useFormik({
    initialValues: {
      resetCode: "",
      newPassword: "",
    },
    validationSchema: Yup.object({
      resetCode: Yup.string().required("Reset code is required"),
      newPassword: passwordSchema,
    }),
    onSubmit: async (values) => {
      setError("");
      setMessage("");
      setLoading(true);
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formikStep1.values.email,
            resetCode: values.resetCode,
            newPassword: values.newPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setMessage(data.message);
        setStep(1);
        formikStep1.resetForm();
        formikStep2.resetForm();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="relative flex justify-between max-lg:justify-center items-center h-screen overflow-hidden">
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
            Sign In
          </h2>

          <h2 className="py-2 font-oswald font-medium text-[#b7b7b7] text-xl sm:text-3xl">
            {" "}
            Join Us
          </h2>
        </div>

        <p className="mb-6 text-[#3e3e3e] text-sm">
          Kindly enter your email address and password to sign in
        </p>

        {step === 1 && (
          <form onSubmit={formikStep1.handleSubmit}>
            <div className="mb-[10px]">
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                className="block bg-[#f7f7f7] p-3 border-b border-black outline-0 w-full placeholder-text-sm text-sm placeholder-[#3e3e3e]"
                value={formikStep1.values.email}
                onChange={formikStep1.handleChange}
                onBlur={formikStep1.handleBlur}
              />
            </div>
            {formikStep1.touched.email && formikStep1.errors.email && (
              <p className="mt-1 text-red-500 text-sm">
                {formikStep1.errors.email}
              </p>
            )}
            <button
              className={`flex text-sm justify-center text-white text-center mt-6 ${
                loading ? "" : "  w-full bg-black rounded-md py-3"
              } `}
              type="submit"
              disabled={loading}
            >
              {loading ? <Loading /> : "Send Reset Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={formikStep2.handleSubmit}>
            <div className="mb-[10px]">
              <input
                type="text"
                name="resetCode"
                id="resetCode"
                placeholder="Enter reset code"
                className="block bg-[#f7f7f7] p-3 border-b border-black outline-0 w-full placeholder-text-sm text-sm placeholder-[#3e3e3e]"
                value={formikStep2.values.resetCode}
                onChange={formikStep2.handleChange}
                onBlur={formikStep2.handleBlur}
              />

              {formikStep2.touched.resetCode &&
                formikStep2.errors.resetCode && (
                  <p className="mt-0.5 text-red-500 text-sm">
                    {formikStep2.errors.resetCode}
                  </p>
                )}
            </div>

            <div className="mb-[10px]">
              <div className="flex justify-between bg-[#f7f7f7] border-b border-black">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  id="newPassword"
                  placeholder="Enter new password"
                  className="block p-3 outline-0 w-full placeholder-text-sm text-sm placeholder-[#3e3e3e]"
                  value={formikStep2.values.newPassword}
                  onChange={formikStep2.handleChange}
                  onBlur={formikStep2.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="right-2 relative focus:outline-none text-sm cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {formikStep2.touched.newPassword &&
                formikStep2.errors.newPassword && (
                  <p className="mt-0.5 text-red-500 text-sm">
                    {formikStep2.errors.newPassword}
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
        )}

        <div className="flex justify-center mt-2">
          {error && <p style={{ color: "red" }}>{error}</p>}
          {message && <p style={{ color: "green" }}>{message}</p>}
        </div>
      </div>

      <div
        className={`max-lg:hidden ${step == 1 ? "mt-[220px]" : "mt-[270px]"} `}
      >
        <img src="/head.svg" />
      </div>
    </div>
  );
}
