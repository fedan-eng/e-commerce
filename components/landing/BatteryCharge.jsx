"use client";
// components/landing/BatteryCharge.jsx — the "Stay on." battery: charges from empty to full when
// it scrolls into view, then the label fades in and a light runs along the charge every so often.
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/motion/Reveal";

export default function BatteryCharge() {
  const still = useReducedMotion();
  const ref = useRef(null);
  const full = useInView(ref, { once: true, amount: 0.6 }) || still;

  return (
    <div ref={ref} className="mb-6 flex w-full items-center md:mb-8" aria-hidden="true">
      {/* Outlined shell */}
      <div className="h-[44px] flex-1 rounded-full border-[3px] border-[#0A321B] p-[4px] sm:h-[50px] md:h-[56px] md:border-[4px] md:p-[5px]">
        {/* Charge bar */}
        <motion.div
          className="relative flex h-full items-center justify-end overflow-hidden rounded-full bg-[#0A321B] pr-4 sm:pr-5"
          initial={{ width: still ? "100%" : "6%" }}
          animate={{ width: full ? "100%" : "6%" }}
          transition={{ duration: 1.8, ease: EASE }}
        >
          {!still && (
            <motion.span
              className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-[#00E575]/35 to-transparent"
              animate={full ? { x: ["-100%", "500%"] } : {}}
              transition={{ duration: 1.6, delay: 2, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
            />
          )}
          <motion.span
            className="relative whitespace-nowrap text-[12px] font-bold tracking-wide text-[#00E575] sm:text-[13px] md:text-[14px]"
            initial={{ opacity: still ? 1 : 0 }}
            animate={{ opacity: full ? 1 : 0 }}
            transition={{ delay: still ? 0 : 1.4, duration: 0.5 }}
          >
            Stay on 100% always
          </motion.span>
        </motion.div>
      </div>

      {/* Terminal nub: lights up once it's full */}
      <motion.div
        className="ml-[3px] h-[16px] w-[6px] rounded-r-full bg-[#0A321B] sm:h-[18px] md:h-[22px] md:w-[8px]"
        animate={full && !still ? { opacity: [1, 0.4, 1] } : {}}
        transition={{ delay: 1.8, duration: 1.2, repeat: 2 }}
      />
    </div>
  );
}
