"use client";
import { motion } from "framer-motion";
import { FiCheck, FiX } from "react-icons/fi";

const defaultSteps = [
  { label: "Confirmed",  icon: FiCheck },
  { label: "Processing", icon: FiCheck },
  { label: "Shipped",    icon: FiCheck },
  { label: "In Transit", icon: FiCheck },
  { label: "Delivered",  icon: FiCheck },
];

// Statuses that sit outside the normal linear flow
const CANCELLED_STATUSES = ["Cancelled", "cancelled"];

// Map any casing variant → canonical label used in defaultSteps
const NORMALISE = {
  confirmed:  "Confirmed",
  processing: "Processing",
  shipped:    "Shipped",
  intransit:  "In Transit",
  "in-transit": "In Transit", // Legacy support for old data
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

export default function OrderProgressBar({
  currentStatus,
  statusHistory = [],
  steps = defaultSteps,
}) {
  const normalisedStatus = NORMALISE[currentStatus?.toLowerCase()] || currentStatus;
  const isCancelled = CANCELLED_STATUSES.includes(currentStatus);

  const currentIndex = isCancelled
    ? -1 // nothing highlighted
    : steps.findIndex((s) => s.label === normalisedStatus);

  // Merge real dates from statusHistory
  let stepsWithDates = steps.map((step) => {
    const match = statusHistory.find(
      (h) => NORMALISE[h.status?.toLowerCase()] === step.label
    );
    return {
      ...step,
      date: match ? new Date(match.date).toLocaleString() : null,
    };
  });

  // Backfill missing dates up to current step
  let lastKnownDate = null;
  stepsWithDates = stepsWithDates.map((step, index) => {
    if (step.date) {
      lastKnownDate = step.date;
      return step;
    }
    if (index <= currentIndex && lastKnownDate) {
      return { ...step, date: lastKnownDate };
    }
    return step;
  });

  // ── Cancelled banner ────────────────────────────────────────────────────────
  if (isCancelled) {
    const cancelledEntry = statusHistory.find(
      (h) => h.status?.toLowerCase() === "cancelled"
    );
    return (
      <div className="mt-8">
        {/* Greyed-out steps */}
        <div className="relative flex justify-between items-start mx-auto w-full opacity-30 pointer-events-none select-none">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="relative flex flex-col flex-1 items-center">
                <div className="flex justify-center items-center bg-line rounded-full w-6 h-6 text-white">
                  <Icon className="text-[10px]" />
                </div>
                <span className="mt-1.5 text-[11px] sm:text-xs tracking-wide text-center uppercase text-muted">{step.label}</span>
                {index < steps.length - 1 && (
                  <div
                    className="absolute top-3 bg-line rounded-full h-[3px]"
                    style={{ left: "calc(50% + 1rem)", right: "calc(-50% + 1rem)", zIndex: 1 }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Cancelled pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 bg-red-50 mt-6 px-4 py-3 rounded-2xl w-fit"
        >
          <div className="flex justify-center items-center bg-red-500 rounded-full w-6 h-6 text-white flex-shrink-0">
            <FiX className="text-xs" />
          </div>
          <div>
            <p className="font-semibold text-red-600 text-sm">
              Order cancelled
            </p>
            {cancelledEntry && (
              <p className="text-red-500/80 text-xs mt-0.5">
                {new Date(cancelledEntry.date).toLocaleString()}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Normal progress bar ─────────────────────────────────────────────────────
  return (
    <div className="relative flex justify-between items-start mx-auto mt-8 w-full">
      {stepsWithDates.map((step, index) => {
        const Icon = step.icon;
        const isCompleted     = index <= currentIndex;
        const isNextCompleted = index + 1 <= currentIndex;

        return (
          <div key={step.label} className="relative flex flex-col flex-1 items-center">
            {/* Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: isCompleted ? 1 : 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white z-10
                ${isCompleted ? "bg-forest" : "bg-line"}`}
            >
              <Icon className="text-[10px]" />
            </motion.div>

            {/* Label */}
            <span className={`mt-1.5 text-[11px] sm:text-xs tracking-wide text-center uppercase ${isCompleted ? "text-forest font-semibold" : "text-muted"}`}>
              {step.label}
            </span>

            {/* Date */}
            {step.date && (
              <span className="text-muted text-[11px] text-center mt-0.5">{step.date}</span>
            )}

            {/* Connector line */}
            {index < steps.length - 1 && (
              <>
                {/* Grey base line */}
                <div
                  className="absolute top-3 bg-line rounded-full h-[3px]"
                  style={{ left: "calc(50% + 1rem)", right: "calc(-50% + 1rem)", zIndex: 0 }}
                />
                {/* Green animated fill */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isNextCompleted ? "calc(100% - 2rem)" : "0%" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="absolute top-3 bg-forest rounded-full h-[3px]"
                  style={{ left: "calc(50% + 1rem)", zIndex: 1 }}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}