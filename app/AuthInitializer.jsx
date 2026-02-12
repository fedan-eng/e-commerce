// app/AuthInitializer.jsx
"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "@/store/features/authSlice";

export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return null; // This component doesn't render anything
}
