"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, updateUser } from "@/store/features/authSlice";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import RegionSelect from "./RegionSelect";

export default function ProfileForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  const [countryList, setCountryList] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    addPhone: "",
    address: "",
    country: "",
    region: { name: "", fee: 0 },
    city: "",
  });

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        address: user.address || "",
        addPhone: user.addPhone || "",
        country: user.country || "",
        city: user.city || "",
        region: user.region || { name: "", fee: 0 },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (formData.phone && !/^\d{7,15}$/.test(formData.phone)) {
      alert("Please enter a valid phone number (7–15 digits).");
      return;
    }

    await dispatch(updateUser(formData));
    dispatch(fetchUser());
    setIsEditing(false);
    //router.push("/products");
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading)
    return (
      <div className="">
        <Loading />
      </div>
    );
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="mx-auto w-full max-w-[1140px]">
      <div className="flex justify-end">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={handleGoBack}
            className="px-2 sm:px-6 py-3 border border-[#d9d9d9] rounded-md font-medium text-[#007c42] text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-filgreen px-2 sm:px-6 py-3 rounded-md font-medium text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <div className="order-1 mb-10 px-2 sm:px-6 pb-4 sm:pb-20 border border-[#e3e3e3] rounded-md w-full max-w-[851px]">
          <h2 className="mb-4 py-4 border-[#e3e3e3] border-b font-oswald text-2xl">
            General Information
          </h2>

          {/* FIRST AND LAST NAME */}
          <div className="md:flex gap-4 md:mb-4 w-full">
            {/* First Name */}
            <div className="max-xxs:mb-3 max-md:mb-3 w-full">
              <label
                className="text-sm"
                htmlFor="firstName"
              >
                <span className="text-red-600">*</span> First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isEditing}
                placeholder="First Name"
                className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
              />
            </div>

            {/* Last Name */}
            <div className="max-xxs:mb-3 max-md:mb-3 w-full">
              <label
                className="text-sm"
                htmlFor="lastName"
              >
                <span className="text-red-600">*</span> Last Name
              </label>
              <input
                type="lastName"
                name="lastName"
                id="lastName"
                disabled={isEditing}
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
              />
            </div>
          </div>

          {/* PHONE AND ADDITIONAL PHONE */}
          <div className="md:flex gap-4 md:mb-4 w-full">
            <div className="max-md:mb-3 w-full">
              <label
                className="text-sm"
                htmlFor="phone"
              >
                <span className="text-red-600">*</span> Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({ ...prev, phone: onlyNums }));
                }}
                disabled={isEditing}
                placeholder="Phone Number"
                className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
              />
            </div>

            {/* Add. Phone Number */}
            <div className="max-md:mb-3 w-full">
              <label
                className="text-sm"
                htmlFor="addPhone"
              >
                <span className="text-red-600">*</span> Add. Phone Number
              </label>

              <input
                type="tel"
                id="addPhone"
                name="addPhone"
                value={formData.addPhone}
                onChange={handleChange}
                disabled={isEditing}
                placeholder="Add. Phone Number"
                className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-4 w-full">
            <label
              className="text-sm"
              htmlFor="address"
            >
              <span className="text-red-600">*</span> Delivery Address
            </label>

            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleChange}
              disabled={isEditing}
              placeholder="Delivery Address"
              className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
            />
          </div>

          {/* CITY AND REGION */}
          <div className="md:flex gap-4 md:mb-4 w-full">
            {/* Region */}

            <div className="max-md:mb-3 w-full">
              <label
                className="text-sm"
                htmlFor="region"
              >
                <span className="text-red-600">*</span> Region
              </label>

              <RegionSelect
                value={formData.region}
                onChange={(region) =>
                  setFormData((prev) => ({ ...prev, region }))
                }
                disabled={isEditing}
              />
            </div>

            {/* City */}
            <div className="w-full">
              <label
                className="text-sm"
                htmlFor="city"
              >
                <span className="text-red-600">*</span> City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={isEditing}
                placeholder="City"
                className="block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
