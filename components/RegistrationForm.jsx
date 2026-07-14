"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { registerUserAsync, setEmail } from "@/store/features/registerSlice";
import Loading from "@/components/Loading";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import ImageSlider from "./ImageSlider";
import { FaArrowLeft } from "react-icons/fa";

const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { isRegistered, isLoading, error } = useSelector(
    (state) => state.register
  );

  const formik = useFormik({ 
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),

      password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters")
        .matches(/[A-Z]/, "Must contain an uppercase letter")
        .matches(/[a-z]/, "Must contain a lowercase letter")
        .matches(/\d/, "Must contain a number")
        .matches(/[@$!%*?&.#]/, "Must contain a special character (@$!%*?&.#)"),

      confirmPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords must match"),
    }),
    onSubmit: async (values) => {
      const { email, firstName, password } = values;
      const res = await dispatch(
        registerUserAsync({ email, firstName, password })
      );
      if (!res.error) {
        dispatch(setEmail(email));
      }
    },
  });

  // Navigate after registration
  useEffect(() => {
    if (isRegistered) {
      router.push("/verify");
    }
  }, [isRegistered, router]);

  return (
    <div className="relative flex justify-between max-lg:justify-center items-center h-screen overflow-hidden b">
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
              className="py-2 font-oswald font-medium text-[#b7b7b7] text-xl sm:text-3xl"
            >
              {" "}
              Sign In
            </Link>

            <Link
              href="/register"
              className="py-2 border-filgreen border-b-[2px] font-oswald font-medium text-filgreen text-xl sm:text-3xl"
            >
              {" "}
              Join Us
            </Link>
          </div>
          <p className="mb-6 text-[#3e3e3e] text-sm">
            Kindly enter your details and become a member
          </p>
          <form onSubmit={formik.handleSubmit}>
            {/* FIRST AND LAST NAME*/}
            <div className="flex gap-4 mb-[10px] w-full">
              <div className="w-full">
                <div className=" ">
                  <input
                    type="firstName"
                    name="firstName"
                    id="firstName"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.firstName}
                    required
                    placeholder="First Name"
                    className="bg-[#f7f7f7] p-3 border-black border-b outline-0 w-full placeholder-text-sm text-sm placeholder-[#3e3e3e]"
                  />
                </div>
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="text-red-500 text-sm">
                    {formik.errors.firstName}
                  </p>
                )}
              </div>

              <div className="w-full">
                <div className="">
                  <input
                    type="lastName"
                    name="lastName"
                    id="lastName"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.lastName}
                    required
                    placeholder="Last Name"
                    className="bg-[#f7f7f7] p-3 border-black border-b outline-0 w-full placeholder-text-sm text-sm placeholder-[#3e3e3e]"
                  />
                </div>
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="text-red-500 text-sm">
                    {formik.errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <div className="mb-[10px]">
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  required
                  placeholder="Email Address"
                  className="block bg-[#f7f7f7] p-3 border-black border-b outline-0 w-full placeholder-text-sm text-sm placeholder-[#3e3e3e]"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm">{formik.errors.email}</p>
              )}
            </div>

            {/* password */}
            <div className="mb-[10px]">
              <div className="flex justify-between bg-[#f7f7f7] border-black border-b">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  required
                  placeholder="Password"
                  className="block p-3 outline-0 w-full text-sm placeholder-[#3e3e3e]"
                />
                <button
                  type="button"
                  className="right-2 relative focus:outline-none text-sm cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm">{formik.errors.password}</p>
              )}
            </div>

            {/* confirm password */}
            <div>
              <div className="flex justify-between bg-[#f7f7f7] border-black border-b">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  required
                  placeholder="Comfirm your password"
                  className="block p-3 outline-0 w-full text-sm placeholder-[#3e3e3e]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="right-2 relative focus:outline-none text-sm cursor-pointer"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex text-sm justify-center text-white text-center mt-6 w-full bg-black rounded-md py-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loading /> : "Register"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <Link
            href="/api/auth/google"
            className="flex items-center justify-center gap-2 mt-4 w-full bg-white border border-gray-300 rounded-md py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
            Sign up with Google
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

      <div className="max-lg:hidden mt-[340px]">
        <img src="/head.svg" />
      </div>
    </div>
  );
};

export default RegistrationForm;
