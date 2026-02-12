import React from "react";
import "../styles/textslider.css";

const sliderText = [
  {
    title: "Free Shipping",
    text: "Fast and reliable delivery",
  },
  {
    title: "7 Days Return",
    text: "Consumer protection program",
  },
  {
    title: "24/7 Support",
    text: "If you have any questions",
  },
  {
    title: "Best Quality",
    text: "Many years on the market",
  },
  {
    title: " 10% Off",
    text: "Discount on your first order",
  },
];

const TextSlider = ({className}) => {
  return (
    <div className={className}>
      <div className="relative flex reviews">
        <div className="flex reviews-slide">
          {sliderText.map((slide, index) => {
            return (
              <div
                key={index}
                className="flex flex-col my-8 px-12 border-[#d9d9d9] border-l"
              >
                <p className="mb-2 font-medium text-[#007c42] text-sm">
                  {slide.title}
                </p>

                <p className="font-normal text-xs text-nowrap">{slide.text}</p>
              </div>
            );
          })}
        </div>
        <div className="flex reviews-slide">
          {sliderText.map((slide, index) => {
            return (
              <div
                key={index}
                className="flex flex-col my-8 px-12 border-[#d9d9d9] border-l"
              >
                <p className="mb-2 font-medium text-[#007c42] text-sm">
                  {slide.title}
                </p>

                <p className="font-normal text-xs text-nowrap">{slide.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TextSlider;
