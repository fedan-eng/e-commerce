import React from "react";
import Image from "next/image";

const Header = ({ imageClassName, header, className }) => {
  return (
    <div className={`flex gap-2 items-center ${className} `}>
      <div className={imageClassName}>
        <Image
          src="/head.svg"
          alt=""
          width={145}
          height={125}
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
