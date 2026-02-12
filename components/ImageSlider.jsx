import React from "react";
import "../styles/textslider.css";

const ImageSlider = () => {
  return (
    <div className="relative pr-24 pl-28 h-screen overflow-hidden">
      <div>
        <h2 className="top-1/2 left-[64px] absolute font-oswald font-semibold text-[110px] whitespace-nowrap -rotate-90 -translate-x-1/2 -translate-y-1/2">
          {" "}
          Think Quality
        </h2>
      </div>

      <div>
        <h2 className="top-1/2 -right-[140px] absolute font-oswald font-semibold text-[110px] whitespace-nowrap -rotate-90 -translate-y-1/2">
          {" "}
          Think FIL
        </h2>
      </div> 

      <div className = "flex flex-col gap-4">
        <div className="flex flex-col gap-4 vertical-slide">
  {/* Budgirl */}
  <div className="w-full max-w-[546px] h-[385px]">
    <img
      src="/budgirl.png"
      alt=""
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Gym */}
  <div className="w-full max-w-[348px] h-[300px]">
    <img
      src="/gym.jpg"
      alt=""
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Girl */}
  <div className="w-full max-w-[546px] h-[385px]">
    <img
      src="/girl.png"
      alt=""
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Buds */}
  <div className="w-full max-w-[348px] h-[300px]">
    <img
      src="/buds.jpg"
      alt=""
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Workstation */}
  <div className="w-full max-w-[546px] h-[385px]">
    <img
      src="/workstation.png"
      alt=""
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Casebuds */}
  <div className="w-full max-w-[348px] h-[300px]">
    <img
      src="/casebuds.png"
      alt=""
      className="rounded-md w-full h-full object-cover"
    />
  </div>
</div>
        <div className="flex flex-col gap-4 vertical-slide">
  {/* Budgirl */}
  <div className="w-full max-w-[546px] h-[385px]">
    <img
      src="/budgirl.png"
      alt=""
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Gym */}
  <div className="w-full max-w-[348px] h-[300px]">
    <img
      src="/gym.jpg"
      alt=""
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Girl */}
  <div className="w-full max-w-[546px] h-[385px]">
    <img
      src="/girl.png"
      alt=""
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Buds */}
  <div className="w-full max-w-[348px] h-[300px]">
    <img
      src="/buds.jpg"
      alt=""
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Workstation */}
  <div className="w-full max-w-[546px] h-[385px]">
    <img
      src="/workstation.png"
      alt=""
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Casebuds */}
  <div className="w-full max-w-[348px] h-[300px]">
    <img
      src="/casebuds.png"
      alt=""
      className="rounded-md w-full h-full object-cover"
    />
  </div>
</div>

      
      </div>
    </div>
  );
};

export default ImageSlider;
