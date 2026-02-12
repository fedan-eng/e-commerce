"use client";

import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

const defaultSteps = [
  { label: "Confirmed", icon: FiCheck },
  { label: "Processed", icon: FiCheck },
  { label: "Shipped", icon: FiCheck },
  { label: "Delivered", icon: FiCheck },
];

export default function OrderProgressBar({
  currentStatus,
  statusHistory = [],
  steps = defaultSteps,
}) {
  const currentIndex = steps.findIndex((step) => step.label === currentStatus);

  // Merge real dates from statusHistory
  let stepsWithDates = steps.map((step) => {
    const match = statusHistory.find((h) => h.status === step.label);
    return {
      ...step,
      date: match ? new Date(match.date).toLocaleString() : null,
    };
  });

  // Backfill missing dates up to the current status
  let lastKnownDate = null;
  stepsWithDates = stepsWithDates.map((step, index) => {
    if (step.date) {
      lastKnownDate = step.date; // update when real date exists
      return step;
    }
    if (index <= currentIndex && lastKnownDate) {
      // backfill with most recent known date
      return { ...step, date: lastKnownDate };
    }
    return step;
  });

  return (
    <div className="relative flex justify-between items-center mx-auto mt-8 w-full">
      {stepsWithDates.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= currentIndex;
        const isNextCompleted = index + 1 <= currentIndex;

        return (
          <div
            key={step.label}
            className="relative flex flex-col flex-1 items-center"
          >
            {/* Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: isCompleted ? 1 : 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white z-10
                ${isCompleted ? "bg-filgreen" : "bg-gray-300"}`}
            >
              <Icon className="text-[10px]" />
            </motion.div>

            {/* Label + Date */}
            <span className="mt-1 text-sm text-center uppercase">
              {step.label}
            </span>
            {step.date && (
              <span className="text-gray-500 text-xs">{step.date}</span>
            )}

            {/* Connector line */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: isNextCompleted ? "calc(100% - 2rem)" : "0%", // leave gap
                }}
                transition={{ duration: 0.5 }}
                className={`absolute rounded-md top-3 h-[2px]  ${
                  isNextCompleted ? "bg-filgreen" : "bg-filgreen"
                }`}
                style={{
                  left: "calc(50% + 1rem)", // start after circle
                  right: "calc(-50% + 1rem)", // end before next circle
                  zIndex: 1,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
