// components/ProfileCompletionChecker.jsx — prompts signed-in users with an incomplete
// profile (usually new Google sign-ins) to add their delivery details.
"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProfileCompletionModal from "@/components/checkout/ProfileCompletionModal";

export const DISMISSED_KEY = "profilePromptDismissed"; // sessionStorage: "not now"
export const COMPLETED_KEY = "profilePromptCompleted"; // localStorage: done for good

export function markProfilePromptCompleted() {
  sessionStorage.removeItem(DISMISSED_KEY);
  localStorage.setItem(COMPLETED_KEY, "true");
}

export default function ProfileCompletionChecker() {
  const { isAuthenticated, needsProfileCompletion } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    const completed = localStorage.getItem(COMPLETED_KEY);
    if (!isAuthenticated || !needsProfileCompletion || dismissed || completed) return;

    const timer = setTimeout(() => setShowModal(true), 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, needsProfileCompletion]);

  if (!showModal) return null;

  return (
    <ProfileCompletionModal
      onClose={() => {
        setShowModal(false);
        sessionStorage.setItem(DISMISSED_KEY, "true");
      }}
      onComplete={() => {
        setShowModal(false);
        markProfilePromptCompleted();
      }}
    />
  );
}
