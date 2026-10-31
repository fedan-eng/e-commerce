"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { countOf } from "../../productUtils";

// Loads a product's approved reviews and handles posting + helpful votes.
export default function useProductReviews(productId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`/api/products/${productId}/comments`, { withCredentials: true });
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) load();
  }, [productId, load]);

  // type: "like" | "dislike". Optimistic, then reconciled with the server's counts.
  const vote = useCallback(
    async (reviewId, type) => {
      const liking = type === "like";
      setReviews((prev) =>
        prev.map((r) => {
          if (r._id !== reviewId) return r;
          const wasOn = liking ? r.isLiked : r.isDisliked;
          const wasOther = liking ? r.isDisliked : r.isLiked;
          const likes = countOf(r.likes) + (liking ? (wasOn ? -1 : 1) : wasOther ? -1 : 0);
          const dislikes = countOf(r.dislikes) + (liking ? (wasOther ? -1 : 0) : wasOn ? -1 : 1);
          return { ...r, likes, dislikes, isLiked: liking && !wasOn, isDisliked: !liking && !wasOn };
        })
      );

      try {
        const res = await axios.post(`/api/products/${productId}/comments/${reviewId}/${type}`, {}, { withCredentials: true });
        const { likes, dislikes, isLiked, isDisliked } = res.data;
        setReviews((prev) => prev.map((r) => (r._id === reviewId ? { ...r, likes, dislikes, isLiked, isDisliked } : r)));
      } catch (err) {
        console.error(`Review ${type} failed:`, err);
        load();
      }
    },
    [productId, load]
  );

  // Throws with the server's message so the form can show it
  const submit = useCallback(
    async ({ text, rating }) => {
      try {
        await axios.post(`/api/products/${productId}/comments`, { text, rating }, { withCredentials: true });
      } catch (err) {
        throw new Error(err.response?.data?.error || "Couldn't post your review. Please log in and try again.");
      }
    },
    [productId]
  );

  return { reviews, loading, vote, submit };
}
