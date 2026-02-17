"use client";

import React, { useState, useRef, useEffect } from "react";
import TextSlider from "./TextSlider";
import { motion } from "framer-motion";
import Link from "next/link";

const About = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredOne, setIsHoveredOne] = useState(false);
  const [isHoveredTwo, setIsHoveredTwo] = useState(false);
  const [isHoveredThree, setIsHoveredThree] = useState(false);

  // 1. Create a ref for the scroll container
  const scrollContainerRef = useRef(null);

  // 2. Use useEffect to set the initial scroll position
  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      // Get the width of the scrollable content
      const scrollWidth = scrollContainer.scrollWidth;
      // Get the width of the visible container
      const containerWidth = scrollContainer.clientWidth;
      // Calculate the scroll position to center the content
      const centerPosition = (scrollWidth - containerWidth) / 2;
      // Set the scrollLeft property
      scrollContainer.scrollLeft = centerPosition;
    }
  }, []); // The empty dependency array ensures this runs only once after the initial render

  return (
    <div className="">
      <TextSlider />
{/*
      <div
        className="overflow-scroll whitespace-nowrap no-scrollbar"
        ref={scrollContainerRef} // 3. Attach the ref to the scroll container
      >
        <div className="flex justify-center mx-auto px-20 w-[1136px]">
          <div className="gap-4 grid grid-cols-[279px_minmax(300px,574px)_279px] grid-rows-[210px_210px] min-w-[1136px] h-[500px]">
            //First Column 
            <div className="row-span-2 shadow-custom rounded-md overflow-hidden">
              <motion.img
                initial={{ scale: 1 }}
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  transition: isHovered
                    ? { type: "spring", stiffness: 300, damping: 10 }
                    : { duration: 0.3, ease: "easeOut" },
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                src="/c89.png"
                alt="C8"
                className="bg-transparent rounded-md w-full h-full object-cover"
              />
            </div>

            // Middle Column (spanning two rows)
            <div className="row-span-2 shadow-2xl border border-[#e7e7e7] rounded-md overflow-hidden">
              <motion.img
                initial={{ scale: 1 }}
                animate={{
                  scale: isHoveredOne ? 1.1 : 1,
                  transition: isHoveredOne
                    ? { type: "spring", stiffness: 300, damping: 10 }
                    : { duration: 0.3, ease: "easeOut" },
                }}
                onMouseEnter={() => setIsHoveredOne(true)}
                onMouseLeave={() => setIsHoveredOne(false)}
                src="/all.png"
                alt="All"
                className="rounded-md w-full h-full object-cover object-top"
              />
            </div>

            <div className="shadow-custom rounded-md overflow-hidden">
              <motion.img
                initial={{ scale: 1 }}
                animate={{
                  scale: isHoveredThree ? 1.1 : 1,
                  transition: isHoveredThree
                    ? { type: "spring", stiffness: 300, damping: 10 }
                    : { duration: 0.3, ease: "easeOut" },
                }}
                onMouseEnter={() => setIsHoveredThree(true)}
                onMouseLeave={() => setIsHoveredThree(false)}
                src="/flexdur.png"
                alt="Flex Duration"
                className="rounded-md w-full h-full object-cover object-top"
              />
            </div>

            <div className="shadow-custom rounded-md overflow-hidden">
              <motion.img
                initial={{ scale: 1 }}
                animate={{
                  scale: isHoveredTwo ? 1.1 : 1,
                  transition: isHoveredTwo
                    ? { type: "spring", stiffness: 300, damping: 10 }
                    : { duration: 0.3, ease: "easeOut" },
                }}
                onMouseEnter={() => setIsHoveredTwo(true)}
                onMouseLeave={() => setIsHoveredTwo(false)}
                src="/quick.png"
                alt="Quick"
                className="rounded-md w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>

      */}

      <div className="mx-auto h-fit px-4">
        <h2 className="font-oswald font-medium text-[32px] s:text-5xl text-center capitalize">
          power bank wey no dey carry belle,{" "}
          <span className="text-filgreen">na here e dey</span>
        </h2>

        {/* <p className="mt-4 mb-5 xs:mb-10 font-normal text-dark text-sm text-center capitalize">
          Lorem ipsum dolor sit amet consectetur. Nibh pellentesque ornare nisi
          iaculis consectetur
        </p> */}

        <div className="flex my-10 justify-center">
          <Link
            href="/products"
            className="uppercase buttons"
          >
            {" "}
            shop now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
