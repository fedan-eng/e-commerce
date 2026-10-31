"use client";

import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { addToWishlist, removeFromWishlist } from "@/store/features/wishlistSlice";
import { CircleButton } from "./ui";

export default function WishlistToggle({ product }) {
  const dispatch = useDispatch();
  const saved = useSelector((s) => s.wishlist.items.some((item) => item._id === product._id));

  const toggle = () => {
    if (saved) {
      dispatch(removeFromWishlist(product._id));
      toast("Removed from wishlist");
    } else {
      dispatch(addToWishlist(product));
      toast.success("Added to wishlist");
    }
  };

  return (
    <CircleButton label={saved ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={saved} onClick={toggle}>
      <Heart size={17} className={saved ? "fill-red-500 text-red-500" : ""} />
    </CircleButton>
  );
}
