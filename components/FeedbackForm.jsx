"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { MessageSquare } from "lucide-react";

const faces = [
  { img: "/sad.png", label: "Sad", value: "1" },
  { img: "/meh.png", label: "Neutral", value: "3" },
  { img: "/happy.png", label: "Happy", value: "5" },
];

export default function FeedbackForm({ autoOpen = false }) {
  const [isOpen, setIsOpen] = useState(() => {
    if (autoOpen) {
      // Check if user already submitted or dismissed feedback for this session
      return !localStorage.getItem("fil_feedback_dismissed");
    }
    return false;
  });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  const wordCount =
    comment.trim() === "" ? 0 : comment.trim().split(/\s+/).length;

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const input = e.target.value;
    const words = input.trim().split(/\s+/);
    if (words.length <= 100) {
      setComment(input);
    }
  };

  const closeSheet = () => {
    setIsOpen(false);
    localStorage.setItem("fil_feedback_dismissed", "true");
    // reset message after closing so it doesn't flash on reopen
    setTimeout(() => setMessage({ text: "", type: "" }), 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setMessage({ text: "Please select a reaction.", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await axios.post("/api/feedback", { rating, comment });
      setMessage({
        text: "Thank you for your anonymous feedback!",
        type: "success",
      });
      setRating(0);
      setComment("");
      localStorage.setItem("fil_feedback_dismissed", "true");
      // Auto-close after showing success message
      setTimeout(() => closeSheet(), 1500);
    } catch (err) {
      console.error(err);
      setMessage({
        text: "Failed to send feedback. Try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger button — floating on the right edge (only show when not auto-opening) */}
      {!autoOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-filgreen text-white px-3 py-4 rounded-l-lg text-xs font-medium shadow-lg hover:bg-green-700 transition-colors [writing-mode:vertical-rl] rotate-180"
          aria-label="Share your experience"
        >
          Share Your Experience
        </button>
      )}

      {/* Bottom sheet on mobile · Centered modal on desktop */}
      {isOpen && (
        <div className="z-[1000] fixed inset-0 flex justify-center items-end sm:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 animate-fade-in"
            onClick={closeSheet}
          />

          {/* Sheet / Modal */}
          <div className="relative bg-white shadow-2xl rounded-t-2xl sm:rounded-lg w-full sm:max-w-[460px] max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
            {/* Drag handle (mobile only) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-6">
              {/* Header */}
              <div className="flex justify-between pt-4 pb-3 border-[#d9d9d9] border-b">
                <h1 className="mt-4 font-oswald text-dark text-xl">
                  Share your experience
                </h1>
                <button
                  onClick={closeSheet}
                  className="top-5 right-6 absolute cursor-pointer p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Close"
                >
                  X
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <h3 className="my-3 text-[#767676] text-xs">
                  How was your interaction with our website and order process?
                </h3>

                <div className="flex gap-3">
                  {faces.map((face) => (
                    <button
                      key={face.value}
                      type="button"
                      onClick={() => setRating(face.value)}
                      className={`border-[#d9d9d9] hover:bg-[#cbeac2] rounded-md items-center p-4 border transition ${
                        rating === face.value ? "bg-[#cbeac2] scale-110" : ""
                      }`}
                    >
                      <Image
                        src={face.img}
                        alt={face.label}
                        width={32}
                        height={32}
                        className="cursor-pointer"
                      />
                    </button>
                  ))}
                </div>

                {message.text && (
                  <p
                    className={`text-sm mt-3 ${
                      message.type === "error"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {message.text}
                  </p>
                )}

                <div className="mt-4">
                  <label className="font-medium text-xs" htmlFor="comment">
                    Got suggestions? Let's hear from you.
                  </label>

                  <textarea
                    id="comment"
                    value={comment}
                    onChange={handleChange}
                    placeholder="Type here..."
                    className="block bg-[#f6f6f6] mt-3 p-3 rounded-md outline-0 w-full h-[87px] text-xs placeholder-filgrey"
                  />
                  <p className="text-[#767676] text-xs">{wordCount}/100 chars</p>
                </div>

                <div className="flex justify-end items-center gap-2 xxs:gap-3 mt-6 py-4 border-[#d9d9d9] border-t">
                  <button
                    type="button"
                    onClick={closeSheet}
                    className="px-2 sm:px-6 py-3 border border-[#d9d9d9] rounded-md font-roboto font-medium text-dark text-xs sm:text-sm whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-filgreen px-2 sm:px-6 py-3 rounded-md font-roboto font-medium text-dark text-xs sm:text-sm whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}