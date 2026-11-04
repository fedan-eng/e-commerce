"use client";

// Full-screen, swipe-through view of the WhatsApp review screenshots. Loaded on demand from
// WhatsAppReviews.jsx. Tap the right side of a screenshot for the next one, the left for the previous.
import { motion } from "framer-motion";
import { EndSlide, SLIDE_CLASS, TRACK_CLASS, useSwipeViewer, ViewerArrows, ViewerTopBar } from "./swipeViewer";

export default function ReviewsViewer({ chats, startIndex, onClose }) {
  const { trackRef, slideRef, active, goTo, close } = useSwipeViewer({
    count: chats.length,
    startIndex,
    onClose,
  });

  const onTap = (e, i) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    goTo(e.clientX - left < width / 3 ? i - 1 : i + 1);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Customer reviews"
      className="fixed inset-0 z-[9999] h-[100dvh] bg-[#0B141A] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div ref={trackRef} className={TRACK_CLASS}>
        {chats.map((chat, i) => (
          <div key={chat.id} ref={slideRef(i)} data-index={i} onClick={(e) => onTap(e, i)} className={SLIDE_CLASS}>
            <img
              src={chat.src}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-3xl"
            />
            <img
              src={chat.src}
              alt="WhatsApp chat with a FIL customer"
              loading={Math.abs(i - active) <= 1 ? "eager" : "lazy"}
              className="relative max-h-full w-full max-w-[calc(100dvh*9/16)] object-contain px-3 pt-24 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-0"
            />
          </div>
        ))}

        <EndSlide count={chats.length} slideRef={slideRef} />
      </div>

      <ViewerTopBar count={chats.length} active={active} onClose={close} />
      <ViewerArrows count={chats.length} active={active} goTo={goTo} />
    </motion.div>
  );
}
