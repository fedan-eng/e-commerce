"use client";

import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import axios from "axios";

export default function Rating({
  productId,
  className = "",
  readOnly = false,
}) {
  const [hovered, setHovered] = useState(0);
  const [average, setAverage] = useState(0);
  const [userHasRated, setUserHasRated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch rating info
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await axios.get(`/api/products/${productId}/rate`);
        setAverage(res.data.averageRating ?? 0);
        setUserHasRated(res.data.userHasRated);
      } catch (err) {
        console.error("Error fetching rating:", err);
      }
    };
    fetchRating();
  }, [productId]);

  // Submit rating
  const handleRate = async (value) => {
    if (loading || userHasRated || readOnly) return;
    try {
      setLoading(true);
      const res = await axios.post(`/api/products/${productId}/rate`, {
        value,
      });
      setAverage(Number(res.data.averageRating) || 0);
      setUserHasRated(true);
    } catch (err) {
      console.error(err);
      alert("You must be logged in to rate.");
    } finally {
      setLoading(false);
    }
  };

  // Render stars
  const renderStar = (index) => {
    const clickable = !readOnly && !userHasRated;
    const isFilled = hovered >= index || (!hovered && average >= index);

    return (
      <FaStar
        key={index}
        className={`${isFilled ? "text-yellow-500" : "text-gray-300"} ${
          clickable ? "cursor-pointer hover:text-yellow-400" : ""
        }`}
        onMouseEnter={clickable ? () => setHovered(index) : undefined}
        onMouseLeave={clickable ? () => setHovered(0) : undefined}
        onClick={clickable ? () => handleRate(index) : undefined}
      />
    );
  };

  return (
    <div className={`${className}`}>
      <div className="flex justify-center items-center space-x-1">
        {[1, 2, 3, 4, 5].map((i) => renderStar(i))}
      </div>

      {!readOnly && userHasRated && (
        <span className="ml-2 text-green-600 text-xs">
          You’ve rated this product
        </span>
      )}
    </div>
  );
}
