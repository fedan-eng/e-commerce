// app/AuthInitializer.jsx
"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "@/store/features/authSlice";

export default function AuthInitializer() {
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // ✅ Only fetch user if token cookie exists
    const hasToken = document.cookie.split('; ').find(row => row.startsWith('token='));
    
    if (hasToken) {
      dispatch(fetchUser());
    }
  }, [dispatch]);

  if (!mounted) return null;

  return null;
}