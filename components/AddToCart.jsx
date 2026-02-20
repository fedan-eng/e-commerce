"use client";

import { useDispatch } from "react-redux";
import { addToCart } from "@/store/features/cartSlice";
import { useState } from "react";

const AddToCartButton = ({ product, className = "", selectedColor = null }) => {
  const dispatch = useDispatch();
  const [notification, setNotification] = useState("");
  const [notificationColor, setNotificationColor] = useState("");

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: selectedColor?.images?.[0] || product.image,
        quantity: 1,
        ...(selectedColor ? { color: selectedColor.name } : {}), // only include color if selected
      })
    );

    showNotification("Added to cart", "bg-green-600");
  };

  const showNotification = (message, color) => {
    setNotification(message);
    setNotificationColor(color);
    setTimeout(() => setNotification(""), 2000); // disappears after 2s
  };

  return (
    <>
      {/* FIXED TOP NOTIFICATION */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 text-white py-2 px-5 rounded-lg shadow-lg z-[9999] transition-opacity duration-300 ${notificationColor}`}
        >
          {notification}
        </div>
      )}

      <button
        onClick={handleAddToCart}
        className={`cursor-pointer ${className}`}
      >
        Add to Cart
      </button>
    </>
  );
};

export default AddToCartButton;
