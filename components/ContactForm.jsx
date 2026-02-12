"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    question: "",
    reason: "",
    productName: "",
  });
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formPayload.append(key, value);
    });

    if (files.length > 0) {
      files.forEach((file) => {
        formPayload.append("files", file);
      });
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formPayload,
      });

      if (!res.ok) throw new Error("Something went wrong");

      const data = await res.json();
      setMessage(data.message || "Message sent successfully!");
      setFormData({
        name: "",
        email: "",
        question: "",
        reason: "",
        productName: "",
      });
      setFiles([]);
    } catch (err) {
      setMessage("Failed to send message.");
    }
  };

  return (
    <div>
      <h1 className="bg-white pt-12 pb-4 font-oswald font-medium text-xl sm:text-3xl">
        CONTACT US
      </h1>

      <div className="bg-[#f6f6f6] pt-6 rounded-md">
        <form
          onSubmit={handleSubmit}
          className="mx-auto mb-24 nav:mb-[255px] px-2 pb-[44px] w-full max-w-[804px]"
        >
          {/* Name & Email */}
          <div className="xxs:flex gap-2 md:gap-6 mb-3 w-full">
            <div className="max-xxs:mb-3 w-full">
              <label
                className="text-sm"
                htmlFor="name"
              >
                <span className="text-red-600">*</span> Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="block bg-white mt-2 px-3 py-2 rounded-md outline-0 w-full text-sm"
                required
              />
            </div>

            <div className="max-xxs:mb-3 w-full">
              <label
                className="text-sm"
                htmlFor="email"
              >
                <span className="text-red-600">*</span> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block bg-white mt-2 px-3 py-2 rounded-md outline-0 w-full text-sm"
                required
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-3">
            <label
              className="text-sm"
              htmlFor="question"
            >
              <span className="text-red-600">*</span> Question
            </label>
            <input
              name="question"
              id="question"
              value={formData.question}
              onChange={handleChange}
              className="block bg-white mt-2 px-3 py-2 rounded-md outline-0 w-full text-sm"
              required
            />
          </div>

          {/* Reason & Product Name */}
          <div className="xxs:flex gap-2 md:gap-6 mb-3 w-full">
            <div className="max-xxs:mb-3 w-full">
              <label
                className="text-sm"
                htmlFor="reason"
              >
                <span className="text-red-600">*</span> Reason
              </label>
              <input
                id="reason"
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="block bg-white mt-2 px-3 py-2 rounded-md outline-0 w-full text-sm"
              />
            </div>

            <div className="max-xxs:mb-3 w-full">
              <label
                className="text-sm"
                htmlFor="productName"
              >
                <span className="text-red-600">*</span> Product Name
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="block bg-white mt-2 px-3 py-2 rounded-md outline-0 w-full text-sm"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6 md:mb-12">
            <label
              className="text-sm"
              htmlFor="file"
            >
              <span className="text-red-600">*</span> Files
            </label>

            <label
              htmlFor="file"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex flex-col justify-center items-center bg-white border border-[#b7b7b7] border-dashed rounded-md outline-0 w-full text-sm text-center cursor-pointer"
            >
              {files.length === 0 ? (
                <>
                  <img
                    src="/cloud.svg"
                    alt="Upload"
                    className="pt-6 pb-4"
                  />
                  <p className="pb-[10px] font-medium text-xs">
                    .PDF, .JPG, .JPEG, .PNG
                  </p>
                  <p className="pb-[10px]">
                    Drag and drop files here or{" "}
                    <span className="pb-[10px] text-[#034da2] underline">
                      click here to select files
                    </span>
                  </p>
                  <p className="pb-4 text-[#929292] text-xs">
                    Maximum size (5MB)
                  </p>
                </>
              ) : (
                <div className="px-2 py-4 w-full">
                  {files.map((file, idx) => (
                    <p
                      key={idx}
                      className="text-gray-700 text-xs truncate"
                    >
                      {file.name}
                    </p>
                  ))}
                </div>
              )}

              <input
                id="file"
                type="file"
                name="files"
                accept=".pdf, .jpg, .jpeg, .png"
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-center gap-4 py-4 border-[#d9d9d9] border-t">
            <button className="px-6 py-3 border border-[#d9d9d9] rounded-md font-roboto font-medium text-dark text-sm">
              Back to Home Page
            </button>
            <button
              type="submit"
              className="bg-filgreen px-6 py-3 rounded-md font-roboto font-medium text-dark text-sm"
            >
              Submit
            </button>
          </div>

          {message && <p className="mt-2">{message}</p>}
        </form>
      </div>
    </div>
  );
}
