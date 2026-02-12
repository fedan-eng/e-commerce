"use client";

import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/features/wishlistSlice";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useState } from "react";

export default function WishlistButton({
  product,
  className = "",
  text,
  textClassName = "",
  addedText = "Remove from Wishlist",
  defaultText = "Save to Wishlist",
}) {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);

  const isInWishlist = wishlist.some((item) => item._id === product._id);

  const [notification, setNotification] = useState("");
  const [notificationColor, setNotificationColor] = useState("");

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      showNotification("Removed from wishlist", "bg-red-600");
    } else {
      dispatch(addToWishlist(product));
      showNotification("Added to wishlist", "bg-green-600");
    }
  };

  const showNotification = (message, color) => {
    setNotification(message);
    setNotificationColor(color);
    setTimeout(() => setNotification(""), 2000);
  };

  return (
    <>
      {/* FIXED TOP NOTIFICATION */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 text-white py-3 px-5 rounded-lg shadow-lg z-[9999] transition-opacity duration-300 ${notificationColor}`}
        >
          {notification}
        </div>
      )}

      <button
        onClick={toggleWishlist}
        className={`p-1 cursor-pointer transition ${className}`}
      >
        {text ? (
          <span
            className={`${textClassName} ${
              isInWishlist
                ? "text-filgreen hover:text-red-500"
                : "text-gray-500 hover:text-filgreen"
            }`}
          >
            {isInWishlist ? addedText : defaultText}
          </span>
        ) : isInWishlist ? (
          <FaHeart
            size={18}
            className="text-red-500"
          />
        ) : (
          <FaRegHeart
            size={18}
            className="text-gray-500 hover:text-red-500"
          />
        )}
      </button>
    </>
  );
}
