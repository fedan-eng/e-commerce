import React from "react";

const Header = ({ imageClassName, header, className }) => {
  return (
    <div className={`flex gap-2 items-center ${className} `}>
      <div className={imageClassName}>
        <img
          src="/head.svg"
          alt=""
          className="w-[93px] md:w-[145px] h-[80px] md:h-[125px]"
        />
      </div>

      <h2 className="font-oswald font-medium text-2xl md:text-4xl capitalize">
        {" "}
        {header}{" "}
      </h2>
    </div>
  );
};

export default Header;
