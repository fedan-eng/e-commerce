"use client";

import { useState, useMemo, useEffect } from "react";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import Accordion from "@/components/Accordion";

const renderStars = (count = 5) =>
  Array.from({length: 5}, (_, i) => (
    <Star
      key={i}
      className={`w-3.5 h-3.5 ${
        i < count ? "text-orange-400 fill-orange-400" : "text-gray-300"
      }`}
    />
  ));

function ProductReviews({ product, user, id }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 5;

  // Fetch comments
  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/products/${id}/comments`)
      .then((res) =>
        setComments(
          res.data.filter((c) => !c.status || c.status === "approved"),
        ),
      )
      .catch((err) => console.error("Error fetching comments:", err));
  }, [id]);

  // Pagination & Filtering
  const filteredComments = useMemo(() => {
    const base =
      selectedRatings.length === 0
        ? [...comments]
        : comments.filter((c) => selectedRatings.includes(c.rating ?? 5));
    return base.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [comments, selectedRatings]);

  const totalPages = Math.ceil(filteredComments.length / limit);

  const paginatedComments = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredComments.slice(start, start + limit);
  }, [filteredComments, page]);

  const handleRatingFilter = (rating) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
    setPage(1);
  };

  const clearRatingFilters = () => {
    setSelectedRatings([]);
    setPage(1);
  };

  // Accordion Items
  const accordionItems = useMemo(
    () => [
      {
        title: `Rating${selectedRatings.length > 0 ? ` (${selectedRatings.length})` : ""}`,
        content: (
          <div>
            {selectedRatings.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedRatings.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-filgreen text-white text-xs rounded-full"
                  >
                    {r}★
                    <button
                      onClick={() => handleRatingFilter(r)}
                      className="hover:text-gray-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearRatingFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}
            {[5, 4, 3, 2, 1].map((star) => {
              const count = comments.filter(
                (c) => (c.rating ?? 5) === star,
              ).length;
              return (
                <label
                  key={star}
                  className="flex items-center gap-2 py-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-1"
                >
                  <input
                    type="checkbox"
                    checked={selectedRatings.includes(star)}
                    onChange={() => handleRatingFilter(star)}
                    className="sr-only"
                  />
                  <span
                    className={`flex justify-center items-center border rounded w-4 h-4 transition-colors shrink-0 ${
                      selectedRatings.includes(star)
                        ? "bg-black border-black"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedRatings.includes(star) && (
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1 flex items-center justify-between">
                    <span>
                      {star} Star{star > 1 ? "s" : ""}
                    </span>
                    <span className="text-gray-400">({count})</span>
                  </div>
                </label>
              );
            })}
          </div>
        ),
      },
    ],
    [selectedRatings, comments],
  );

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      setSubmitting(true);
      await axios.post(`/api/products/${id}/comments`, {
        text: commentText,
        rating: commentRating,
      }, { withCredentials: true });
      setCommentText("");
      setCommentRating(5);
      setCommentSubmitted(true);
      setTimeout(() => setCommentSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "Failed to post comment. Please log in.";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) return alert("Please log in to like reviews");

    setComments((prev) =>
      prev.map((c) => {
        if (c._id !== commentId) return c;
        const currentLikes = typeof c.likes === "number" ? c.likes : c.likes?.length ?? 0;
        const alreadyLiked = c.isLiked;
        return {
          ...c,
          likes: alreadyLiked ? currentLikes - 1 : currentLikes + 1,
          dislikes: typeof c.dislikes === "number" ? c.dislikes : c.dislikes?.length ?? 0,
          isLiked: !alreadyLiked,
          isDisliked: false,
        };
      })
    );

    try {
      const res = await axios.post(
        `/api/products/${id}/comments/${commentId}/like`,
        {},
        { withCredentials: true }
      );
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                likes: res.data.likes,
                dislikes: res.data.dislikes,
                isLiked: res.data.isLiked,
                isDisliked: res.data.isDisliked,
              }
            : c
        )
      );
    } catch (err) {
      console.error(err);
      try {
        const res = await axios.get(`/api/products/${id}/comments`, { withCredentials: true });
        setComments(
          res.data.filter((c) => !c.status || c.status === "approved")
        );
      } catch (fetchErr) {
        console.error("Error refetching comments:", fetchErr);
      }
    }
  };

  const handleDislike = async (commentId) => {
    if (!user) return alert("Please log in to dislike reviews");

    setComments((prev) =>
      prev.map((c) => {
        if (c._id !== commentId) return c;
        const currentDislikes = typeof c.dislikes === "number" ? c.dislikes : c.dislikes?.length ?? 0;
        const alreadyDisliked = c.isDisliked;
        return {
          ...c,
          likes: typeof c.likes === "number" ? c.likes : c.likes?.length ?? 0,
          dislikes: alreadyDisliked ? currentDislikes - 1 : currentDislikes + 1,
          isLiked: false,
          isDisliked: !alreadyDisliked,
        };
      })
    );

    try {
      const res = await axios.post(
        `/api/products/${id}/comments/${commentId}/dislike`,
        {},
        { withCredentials: true }
      );
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                likes: res.data.likes,
                dislikes: res.data.dislikes,
                isLiked: res.data.isLiked,
                isDisliked: res.data.isDisliked,
              }
            : c
        )
      );
    } catch (err) {
      console.error(err);
      try {
        const res = await axios.get(`/api/products/${id}/comments`, { withCredentials: true });
        setComments(
          res.data.filter((c) => !c.status || c.status === "approved")
        );
      } catch (fetchErr) {
        console.error("Error refetching comments:", fetchErr);
      }
    }
  };

  return (
    <>
      {/* ── Review Submitted Toast ── */}
      <div
        className="fixed bottom-6 left-1/2 z-[9999] pointer-events-none transition-all duration-400"
        style={{
          transform: commentSubmitted
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(16px)",
          opacity: commentSubmitted ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-3.5 shadow-2xl min-w-[300px]">
          <div className="w-8 h-8 rounded-full bg-[#6ae8a015] border border-[#6ae8a033] flex items-center justify-center shrink-0 text-sm">
            ✓
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#e8e8e8]">
              Review submitted!
            </p>
            <p className="text-[11px] text-[#6ae8a0] mt-0.5">
              Your review is pending approval and will appear shortly.
            </p>
          </div>
        </div>
      </div>

      <div id="reviews-section" className="max-w-4xl mx-auto my-20 px-4">
        <h2 className="font-oswald font-medium text-2xl md:text-3xl mb-6">
          Product Reviews
        </h2>

        {/* Top: Rating Summary */}
        <div className="border-dashed border-2 p-5 md:p-10 rounded-md border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Score */}
            <div className="flex flex-row items-center gap-1 shrink-0 min-w-[80px]">
              <div className="relative w-16 h-16">
                <svg className="absolute inset-0 w-16 h-16 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#f3f4f6"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#FB923C"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - product.averageRating / 5)}`}
                    className="transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-500">
                    {product.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className='flex flex-col gap-2' >
                <div className="flex  items-center gap-0.5">
                {renderStars(Math.round(product.averageRating))}
              </div>
              <p className="text-xs text-gray-500 text-center">
                from {product.ratingsCount} reviews
              </p>
              </div>
            </div>

            {/* Bars */}
            <div className="w-full md:flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  product.ratings?.filter((r) => r.value === star).length || 0;
                const percentage =
                  product.ratingsCount > 0
                    ? (count / product.ratingsCount) * 100
                    : 0;
                return (
                  <div key={star} className="flex items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-0.5 w-14 md:w-12 shrink-0">
                      <span className="text-xs text-gray-600">{star}.0</span>
                      <svg
                        className="w-3 h-3 text-orange-400 fill-orange-400 flex-shrink-0"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 h-3 bg-gray-100 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-sm transition-all duration-500"
                        style={{width: `${percentage}%`}}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 md:w-8 text-right shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom: Filter + Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Filter */}
          <div className="hidden lg:block border-2 border-dashed max-h-fit border-gray-200 md:p-5 rounded-md lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Reviews Filter
            </h3>
            <Accordion
              items={accordionItems}
              defaultOpenIndex={0}
              headerClassName="text-sm py-1.5 px-3 rounded hover:bg-gray-50 cursor-pointer"
              contentClassName="pl-2"
            />
          </div>

          {/* Review List */}
          <div className="lg:col-span-9">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Review Lists
            </h3>

            {/* Add Review Form */}
            {user ? (
              <div className="mb-8 pb-8 border-b border-gray-100">
                <form onSubmit={handleSubmitComment} className="space-y-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => {
                      const words = e.target.value.trim().split(/\s+/);
                      if (words.length <= 100) setCommentText(e.target.value);
                    }}
                    rows={3}
                    placeholder="Write your review here..."
                    className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-filgreen rounded-lg text-sm transition-all resize-none"
                    required
                  />
                  
                  {/* Star Rating Selection */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCommentRating(star)}
                          className="transition-colors hover:scale-110"
                          title={`${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= commentRating
                                ? "text-orange-400 fill-orange-400"
                                : "text-gray-300 hover:text-orange-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {commentRating} star{commentRating > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {commentText.trim() === ""
                        ? 0
                        : commentText.trim().split(/\s+/).length}
                      /100 words
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-filgreen text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-filgreen-dark transition-colors disabled:opacity-60"
                    >
                      {submitting ? "Posting..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="mb-8">
                <a
                  href="/login"
                  className="text-filgreen text-sm hover:underline"
                >
                  Log in
                </a>{" "}
                to leave a review.
              </div>
            )}

            {/* Reviews */}
            {paginatedComments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No reviews yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {paginatedComments.map((comment, index) => (
                  <div key={index} className="py-5 first:pt-0">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-2">
                      {renderStars(
                        comment.rating ?? 5
                      )}
                    </div>

                    {/* Text */}
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {comment.title || comment.text}
                    </p>

                    {/* Date */}
                    <p className="text-xs text-gray-400 mb-3">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {/* User */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                          {comment.user?.avatar ? (
                            <Image
                              src={comment.user.avatar}
                              alt=""
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="text-xs font-semibold text-gray-600">
                              {typeof comment.user === "object"
                                ? comment.user?.firstName
                                    ?.charAt(0)
                                    .toUpperCase()
                                : "U"}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">
                          {typeof comment.user === "object"
                            ? comment.user?.firstName ||
                              comment.user?.name ||
                              "User"
                            : "User"}
                        </span>
                      </div>

                      {/* Like / Dislike */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleLike(comment._id)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            comment.isLiked
                              ? "text-filgreen"
                              : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          <ThumbsUp
                            className={`w-4 h-4 ${comment.isLiked ? "fill-current" : ""}`}
                          />
                          <span>{typeof comment.likes === 'number' ? comment.likes : comment.likes?.length ?? 0}</span>
                        </button>
                        <button
                          onClick={() => handleDislike(comment._id)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            comment.isDisliked
                              ? "text-red-500"
                              : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          <ThumbsDown
                            className={`w-4 h-4 ${comment.isDisliked ? "fill-current" : ""}`}
                          />
                          <span>{typeof comment.dislikes === 'number' ? comment.dislikes : comment.dislikes?.length ?? 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 text-gray-500 text-sm"
                >
                  ‹
                </button>
                {Array.from({length: totalPages}, (_, i) => i + 1)
                  .slice(0, 5)
                  .map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-8 h-8 flex items-center justify-center rounded border text-sm font-medium transition-colors ${
                        page === n
                          ? "bg-filgreen border-filgreen text-white"
                          : "border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400 text-sm px-1">...</span>
                    <button
                      onClick={() => setPage(totalPages)}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 text-gray-500 text-sm"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductReviews;