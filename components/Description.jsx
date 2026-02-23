import React, { useEffect, useState } from "react";
import { homeImages } from "../constants/homeCarousel";
import { easeInOut, motion } from "framer-motion";

const Description = ({ activeImage, clickNext, clickPrev }) => {
  const [showContent, setShowContent] = useState(true);

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5, // Initial 1s delay
      },
    },
    fadeOut: {
      opacity: 0,
      transition: { duration: 1 },
    },
  };

  const paragraphVariants = {
    hidden: {
      opacity: 0,
      x: 50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.4, // Initial 1s delay
        easeInOut,
      },
    },
    fadeOut: {
      opacity: 0,
      transition: { duration: 2 },
    },
  };

  const headerVariants = {
    hidden: {
      opacity: 0,
      x: 50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.4, // Initial 1s delay
        easeInOut,
      },
    },
    fadeOut: {
      opacity: 0,
      transition: { duration: 3 },
    },
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      x: 50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 1.2, // Initial 1s delay
        easeInOut,
      },
    },
    fadeOut: {
      opacity: 0,
      transition: { duration: 2 },
    },
  };

  useEffect(() => {
    setShowContent(true); // Reset to show content on slide change
    const fadeOutTimer = setTimeout(() => {
      setShowContent(false);
    }, 9000); // Fade out after 9 seconds

    return () => clearTimeout(fadeOutTimer);
  }, [activeImage]);

  return (
    <div>
      {homeImages.map((item, idx) => (
        <div
          key={idx}
          className={`${
            idx === activeImage
              ? "home block w-full h-full text-left"
              : "hidden"
          }`}
        >
          <motion.div
            key={activeImage}
            variants={containerVariants}
            initial="hidden"
            animate={showContent ? "visible" : "fadeOut"}
            className={`top-1/2 absolute mx-4 md:mx-8 lg:mx-[53px] ${item.id === 1 ? "text-purple-500" : "text-stone-700"} -translate-y-1/2`}
          >
            <motion.h3
              variants={paragraphVariants}
              initial="hidden"
              animate="visible"
              className={`  font-oswald w-[60%] font-bold text-4xl sm:text-6xl lg:text-[100px] ${item.titleStyle}`}
            >
              {item.title}
            </motion.h3>

            <motion.p
              variants={headerVariants}
              initial="hidden"
              animate="visible"
              className={` font-roboto w-[60%] uppercase font-bold sm:text-2xl text-base max-sm:px-2 max-w-[453px] xl:w-full max-s:px-4 leading-[140%] mt-4 mb-10 ${item.descStyle}`}
            >
              {item.desc}
            </motion.p>

            <motion.a
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              href={item.link}
              className="buttons"
            >
              Shop Now
            </motion.a>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default Description;
