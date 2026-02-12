"use client";

import { useState } from "react";

export default function ProductTabs({
  description,
  features,
  boxContent,
  reviews,
}) {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Product Description", content: description },
    { id: "features", label: "Key Features", content: features },
    { id: "box", label: "What's in the Box", content: boxContent },
    { id: "reviews", label: "Reviews", content: reviews },
  ];

  return (
    <div className="mt-10 w-full">
      {/* Tabs header */}
      <div className="flex justify-center space-x-4 sm:space-x-10 mx-2 border-[#d9d9d9] border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`sm:text-xl py-2 sm:py-6 -mb-px font-oswald font-medium border-b-2 transition
              ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-[#b6b6b6] hover:text-black"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs content */}
      <div className="bg-[#fafafa] mt-4 p-6">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <div
                key={tab.id}
                className="animate-fadeIn"
              >
                {typeof tab.content === "string" ? (
                  <p className="text-[#1c1b1f]">{tab.content}</p>
                ) : (
                  tab.content
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
}
