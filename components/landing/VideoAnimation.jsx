"use client";

import React, { useState } from 'react';

const tabs = [
  { 
    id: 'thunder', 
    label: 'Thunder 20K', 
    // Bright green dot for active state
    dotColor: 'bg-[#10B981]' 
  },
  { 
    id: 'magflex', 
    label: 'MagFlex 10K', 
    // Yellow dot
    dotColor: 'bg-[#FBBF24]' 
  },
  { 
    id: 'pods', 
    label: 'Pods Pro', 
    // Light purple dot
    dotColor: 'bg-[#C084FC]' 
  },
];

const VideoAnimation = () => {
  const [activeTab, setActiveTab] = useState('thunder');

  return (
    <section className="w-full bg-white py-12 md:py-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-[32px] sm:text-[40px] leading-tight font-bold text-[#0A321B] tracking-tight">
              See it up Close.
            </h2>
            <p className="text-gray-500 mt-2 text-[15px] sm:text-base">
              Real products on real video, so you know exactly what you're getting.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="inline-flex items-center gap-1 bg-[#F4F5F4] rounded-full p-1.5 self-start md:self-end">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-[13px] sm:text-[14px] font-semibold rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-[#0F472B] text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                >
                  {/* Indicator Dot */}
                  <span 
                    className={`w-2 h-2 rounded-full flex-shrink-0 transition-opacity duration-300 ${tab.dotColor} ${
                      !isActive && tab.id === 'thunder' ? 'opacity-40' : 'opacity-100'
                    }`} 
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Player Placeholder Area */}
        {/* Aspect ratio changes from closer to square on mobile to wide rectangle on desktop */}
        <div className="w-full bg-[#C8F3D8] rounded-[32px] md:rounded-[40px] aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.2/1] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
          
          {/* Dashed Content Box */}
          <div className=" border border-dashed border-[#0F472B]/30 rounded-xl px-8 py-3.5 z-10 flex items-center justify-center backdrop-blur-sm bg-white/90">
            <span className="text-[12px] sm:text-[13px] font-semibold text-[#0F472B]">
              Video of Products
            </span>
          </div>
          
        </div>
        
      </div>
    </section>
  );
};

export default VideoAnimation;