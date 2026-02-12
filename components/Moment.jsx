"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";

const Moment = () => {
  // Shared hover state
  const [hovered, setHovered] = useState(null);

  // List of all sections
  const sections = [
    {
      key: "fitness",
      src: "/fitness.png",
      title: "Fitness",
      desc: "Track your step all day",
      className: "top-[25.8vw] lg:top-[246px] left-4 w-[24vw] lg:w-[273px]",
    },
    {
      key: "work",
      src: "/work.png",
      title: "Work",
      desc: "Increase your productivity",
      className:
        " top-4 md:top-6 left-[26.6vw] lg:left-[280px] w-[34.3vw] lg:w-[340px]",
    },
    {
      key: "home",
      src: "/home.png",
      title: "Home",
      desc: "Relax and unwind",
      className:
        "top-[46.5vw] lg:top-[435px] left-[20.6vw] lg:left-[220px] w-[35vw] lg:w-[330px]",
    },
    {
      key: "flight",
      src: "/flight.png",
      title: "Flight",
      desc: "Stay connected on the go",
      className:
        "top-[25.2vw] lg:top-[240px] left-[54vw] lg:left-[556px] s:left-[54.5vw] w-[41vw] lg:w-[450px]",
    },
  ];

  return (
    <div>
      <Header
        header="Power For Every Moment"
        imageClassName="order-2"
        className="justify-end mt-12"
      />

      <div className="relative flex justify-center mx-auto lg:mr-10 w-full max-w-[1140px] h-[85vw] lg:h-[869px] overflow-hidden">
        {sections.map((section) => (
          <motion.div
            key={section.key}
            onHoverStart={() => setHovered(section.key)}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 7 }}
            className={`absolute ${section.className} border-[0.5vw] border-filgreen lg:border-[5px] rounded-full aspect-square overflow-hidden`}
          >
            <img
              src={section.src}
              alt={section.title}
              className="brightness-50 w-full h-full object-cover"
            />
            <motion.div
              animate={{
                scale: hovered === section.key ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 7 }}
              className="top-1/2 left-1/2 absolute w-[90%] sm:w-full -translate-1/2"
            >
              <h3 className="mb-2 font-oswald text-white md:text-[40px] text-base text-center">
                {section.title}
              </h3>
              <p className="text-[10px] text-white md:text-base text-center tracking-[0%]">
                {section.desc}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Moment;
