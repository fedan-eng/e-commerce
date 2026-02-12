"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";

const faces = [
  { img: "/sad.png", label: "Sad", value: "1" },
  { img: "/meh.png", label: "Neutral", value: "3" },
  { img: "/happy.png", label: "Happy", value: "5" },
];

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);

  const [comment, setComment] = useState("");
  const [commentBox, setCommentBox] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });



  const wordCount =
    comment.trim() === "" ? 0 : comment.trim().split(/\s+/).length;

  const handleChange = (e) => {
    const input = e.target.value;
    const words = input.trim().split(/\s+/);

    if (words.length <= 100) {
      setComment(input);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setMessage({ text: "Please select a reaction.", type: "error" });
      return;
    }

    try {
      await axios.post("/api/feedback", { rating, comment });
      setMessage({
        text: "Thank you for your anonymous feedback!",
        type: "success",
      });
      setRating(0);
      setComment("");
      setCommentBox(false);
      
    } catch (err) {
      console.error(err);
      setMessage({
        text: "Failed to send feedback. Try again.",
        type: "error",
      });
    }
  };

  return (
    <div>
      {commentBox && (
        <div className="relative bg-white shadow-2xl px-6 rounded-lg w-full max-w-[460px]">
          <div className="flex justify-between pt-4 pb-3 border-[#d9d9d9] border-b">
            <h1 className="mt-4 font-oswald text-dark text-xl">
              Share your experience
            </h1>
            <p
              onClick={() => setCommentBox(false)}
              className="top-5 right-6 absolute cursor-pointer"
            >
              X
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className=""
          >
            <h3 className="my-3 text-[#767676] text-xs">
              How was your interaction with our website and order process?
            </h3>

            <div className="flex gap-3">
              {faces.map((face) => (
                <button
                  key={face.value}
                  type="button"
                  onClick={() => setRating(face.value)}
                  className={` border-[#d9d9d9] hover:bg-[#cbeac2] rounded-md items-center p-4 border transition ${
                    rating === face.value ? " bg-[#cbeac2] scale-110" : ""
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
                className={`text-sm ${
                  message.type === "error" ? "text-red-600" : "text-green-600"
                }`}
              >
                {message.text}
              </p>
            )}

            <div className="mt-4">
              <label
                className="font-medium text-xs"
                htmlFor="comment"
              >
                Got suggestions? Let's hear from you.
              </label>

              <textarea
                id="comment"
                value={comment}
                onChange={handleChange}
                placeholder="Type here..."
                className="block bg-[#f6f6f6] mt-3 p-3 rounded-md outline-0 w-full h-[87px] text-xs placeholder-filgrey"
              />
              <p className="text-[#767676] text-xs"> {wordCount}/100 chars </p>
            </div>

            <div className="flex justify-end items-center gap-2 xxs:gap-3 mt-6 py-4 border-[#d9d9d9] border-t">
              <button
                onClick={() => setCommentBox(false)}
                className="px-2 sm:px-6 py-3 border border-[#d9d9d9] rounded-md font-roboto font-medium text-dark text-xs sm:text-sm whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-filgreen px-2 sm:px-6 py-3 rounded-md font-roboto font-medium text-dark text-xs sm:text-sm whitespace-nowrap cursor-pointer"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
