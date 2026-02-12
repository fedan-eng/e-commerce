"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export const ImageCarousel = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0.6, 1], [1, 3]);
  const opacity = useTransform(scrollYProgress, [0.5, 1], [1, 0]);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };

    handleResize(); // Run once on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={targetRef}
      className="gap-2 grid grid-cols-2 sm:grid-cols-4 bg-gray-100 mx-auto mt-80 max-md:mt-4 lg:mt-72 p-2 lg:w-[1000px] no-scrollbar"
    >
      <motion.div
        style={isLargeScreen ? { opacity } : {}}
        className="max-sm:order-2 bg-white shadow-lg p-4"
      >
        <h3 className="font-semibold text-blue-500">FAST / FREE DELIVERY</h3>
        <p>Free shipping in 3-7 days on all orders.</p>
      </motion.div>

      {/* SCALE THIS ONE */}
      <motion.div
        style={isLargeScreen ? { scale } : {}}
        className="z-20 col-span-2 row-span-2 bg-filgreen shadow-lg p-4 text-center"
      >
        <h1 className="font-bold text-blue-600 text-4xl">ANKER</h1>
        <h2 className="font-semibold text-xl">The World's</h2>
        <h2 className="font-bold text-3xl">NO.1</h2>
        <p>Mobile Charging Brand</p>
      </motion.div>

      <motion.div
        style={isLargeScreen ? { opacity } : {}}
        className="bg-white shadow-lg p-4"
      >
        <h3 className="font-semibold text-blue-500">HASSLE-FREE WARRANTY</h3>
        <p>Comprehensive warranty protection on all purchases.</p>
      </motion.div>

      <motion.div
        style={isLargeScreen ? { opacity } : {}}
        className="bg-white shadow-lg p-4"
      >
        <h3 className="font-semibold text-blue-500">ANKERCREDITS REWARDS</h3>
        <p>Buy more, save more, and earn more.</p>
      </motion.div>

      <motion.div
        style={isLargeScreen ? { opacity } : {}}
        className="bg-white shadow-lg p-4"
      >
        <h3 className="font-semibold text-blue-500">PAY WITH EASE</h3>
        <p>Pay immediately or in installments with Affirm.</p>
      </motion.div>

      <motion.div
        style={isLargeScreen ? { opacity } : {}}
        className="bg-white shadow-lg p-4"
      >
        <h3 className="font-semibold text-blue-500">PAY WITH EASE</h3>
        <p>Pay immediately or in installments with Affirm.</p>
      </motion.div>

      <motion.div
        style={isLargeScreen ? { opacity } : {}}
        className="bg-white shadow-lg p-4"
      >
        <h3 className="font-semibold text-blue-500">PAY WITH EASE</h3>
        <p>Pay immediately or in installments with Affirm.</p>
      </motion.div>
    </div>
  );
};
