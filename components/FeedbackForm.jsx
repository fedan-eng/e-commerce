"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { MessageSquare, X } from "lucide-react";

const faces = [
  { img: "/sad.png", label: "Sad", value: "1" },
  { img: "/meh.png", label: "Okay", value: "3" },
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
          className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rotate-180 rounded-r-2xl bg-forest px-3 py-4 font-roboto text-xs font-semibold text-white shadow-lg transition-colors [writing-mode:vertical-rl] hover:bg-black"
          aria-label="Share your experience"
        >
          Share your experience
        </button>
      )}

      {/* Bottom sheet on mobile · centred window on desktop, like checkout */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center font-roboto sm:items-center sm:p-4">
          <div className="animate-fade-in absolute inset-0 bg-black/45" onClick={closeSheet} />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="animate-slide-up sm:animate-fade-in relative max-h-[90vh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:max-w-[480px] sm:rounded-[28px]"
          >
            <div className="flex justify-center pb-1 pt-3 sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-line" />
            </div>

            <div className="flex items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-4 sm:px-7 sm:pt-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint text-forest">
                  <MessageSquare size={18} />
                </span>
                <div>
                  <h2 id="feedback-title" className="text-[22px] font-bold leading-tight tracking-tight text-forest">
                    Share your experience
                  </h2>
                  <p className="mt-1 text-sm text-muted">Anonymous, and it takes 10 seconds.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage text-forest transition-colors hover:bg-mint"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-6 sm:px-7">
              <p className="text-sm font-semibold text-forest">How was shopping with us today?</p>

              <div className="mt-3 grid grid-cols-3 gap-3" role="radiogroup" aria-label="Your rating">
                {faces.map((face) => (
                  <button
                    key={face.value}
                    type="button"
                    role="radio"
                    aria-checked={rating === face.value}
                    onClick={() => {
                      setRating(face.value);
                      setMessage({ text: "", type: "" });
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 transition-colors ${
                      rating === face.value ? "border-forest bg-mint/50" : "border-line hover:border-[#b9cbc2] hover:bg-sage"
                    }`}
                  >
                    <Image src={face.img} alt="" width={32} height={32} />
                    <span className="text-[13px] font-medium text-forest">{face.label}</span>
                  </button>
                ))}
              </div>

              <label className="mt-5 block text-sm font-semibold text-forest" htmlFor="comment">
                Got suggestions? <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={handleChange}
                placeholder="Tell us what we could do better…"
                rows={3}
                className="mt-1.5 block w-full resize-none rounded-2xl border border-transparent bg-sage p-4 text-[15px] text-forest outline-none placeholder:text-muted/70 focus:border-forest focus:bg-white"
              />
              <p className="mt-1 text-right text-xs text-muted">{wordCount}/100 words</p>

              {message.text && (
                <p role="status" className={`mt-2 text-sm font-medium ${message.type === "error" ? "text-red-500" : "text-[#0b9a52]"}`}>
                  {message.text}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeSheet}
                  className="flex h-[52px] items-center justify-center rounded-full border-2 border-forest px-6 text-[15px] font-semibold text-forest transition-colors hover:bg-sage"
                >
                  Not now
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-[52px] flex-1 items-center justify-center rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Send feedback"}
                </button>
              </div>
            </form>
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