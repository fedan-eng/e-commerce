import React from "react";
import Image from "next/image";
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
    <Image
      src="/budgirl.png"
      alt=""
      width={546}
      height={385}
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Gym */}
  <div className="w-full max-w-[348px] h-[300px]">
    <Image
      src="/gym.jpg"
      alt=""
      width={348}
      height={300}
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Girl */}
  <div className="w-full max-w-[546px] h-[385px]">
    <Image
      src="/girl.png"
      alt=""
      width={546}
      height={385}
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Buds */}
  <div className="w-full max-w-[348px] h-[300px]">
    <Image
      src="/buds.jpg"
      alt=""
      width={348}
      height={300}
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Workstation */}
  <div className="w-full max-w-[546px] h-[385px]">
    <Image
      src="/workstation.png"
      alt=""
      width={546}
      height={385}
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Casebuds */}
  <div className="w-full max-w-[348px] h-[300px]">
    <Image
      src="/casebuds.png"
      alt=""
      width={348}
      height={300}
      className="rounded-md w-full h-full object-cover"
    />
  </div>
</div>
        <div className="flex flex-col gap-4 vertical-slide">
  {/* Budgirl */}
  <div className="w-full max-w-[546px] h-[385px]">
    <Image
      src="/budgirl.png"
      alt=""
      width={546}
      height={385}
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Gym */}
  <div className="w-full max-w-[348px] h-[300px]">
    <Image
      src="/gym.jpg"
      alt=""
      width={348}
      height={300}
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Girl */}
  <div className="w-full max-w-[546px] h-[385px]">
    <Image
      src="/girl.png"
      alt=""
      width={546}
      height={385}
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Buds */}
  <div className="w-full max-w-[348px] h-[300px]">
    <Image
      src="/buds.jpg"
      alt=""
      width={348}
      height={300}
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Workstation */}
  <div className="w-full max-w-[546px] h-[385px]">
    <Image
      src="/workstation.png"
      alt=""
      width={546}
      height={385}
      className="rounded-md w-full h-full object-cover"
    />
  </div>

  {/* Casebuds */}
  <div className="w-full max-w-[348px] h-[300px]">
    <Image
      src="/casebuds.png"
      alt=""
      width={348}
      height={300}
      className="rounded-md w-full h-full object-cover"
    />
  </div>
</div>

      
      </div>
    </div>
  );
};

export default ImageSlider;
