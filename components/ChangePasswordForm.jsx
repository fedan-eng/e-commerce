"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/components/Loading";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Current password is required"),
      newPassword: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        const res = await axios.put("/api/auth/change-password", values);
        alert(res.data.message);
        resetForm();
        router.push("/profile");
      } catch (error) {
        alert(error.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="mx-auto w-full max-w-[1140px]">
      

      <div className="flex justify-center gap-4">
        <div className="order-1 mb-10 px-2 sm:px-6 pb-4 sm:pb-20 border border-[#e3e3e3] rounded-md w-full max-w-[851px]">
          <h2 className="mb-4 py-4 border-[#e3e3e3] border-b font-oswald text-2xl">
            Change Password
          </h2>

          <form>
            <div className="md:flex gap-4 md:mb-4 w-full">
              {/* Old Password */}
              <div className="max-xxs:mb-3 max-md:mb-3 w-full">
                <label
                  htmlFor="currentPassword"
                  className="text-sm"
                >
                  <span className="text-red-600">*</span> Old Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="currentPassword"
                  id="currentPassword"
                  value={formik.values.currentPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                />

                {formik.touched.currentPassword &&
                formik.errors.currentPassword ? (
                  <p className="mt-1 text-red-500 text-xs">
                    {formik.errors.currentPassword}
                  </p>
                ) : null}
              </div>

              {/* New Password */}
              <div className="max-xxs:mb-3 max-md:mb-3 w-full">
                <label
                  htmlFor="newPassword"
                  className="text-sm"
                >
                  <span className="text-red-600">*</span> New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  id="newPassword"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
                />
                {formik.touched.newPassword && formik.errors.newPassword ? (
                  <p className="mt-1 text-red-500 text-xs">
                    {formik.errors.newPassword}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-4 w-full md:w-1/2">
              <label
                className="text-sm"
                htmlFor="confirmPassword"
              >
                <span className="text-red-600">*</span> Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
              />
              {formik.touched.confirmPassword &&
              formik.errors.confirmPassword ? (
                <p className="mt-1 text-red-500 text-xs">
                  {formik.errors.confirmPassword}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2 cursor-pointer">
              <input
                className="w-4 h-4"
                id="show"
                onClick={() => setShowPassword(!showPassword)}
                type="checkbox"
              />
              <label
                htmlFor="show"
                className="text-sm"
              >
                Show Password
              </label>
            </div>
          </form>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="flex items-center gap-2 mb-10">
          <button
            type="button"
            onClick={handleGoBack}
            className="px-2 sm:px-6 py-3 border border-[#d9d9d9] rounded-md font-medium text-[#007c42] text-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={formik.handleSubmit}
            className="bg-filgreen px-2 sm:px-6 py-3 rounded-md font-medium text-sm"
            disabled={loading}
          >
            {loading ? <Loading /> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
