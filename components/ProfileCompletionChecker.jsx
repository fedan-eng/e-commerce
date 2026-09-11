// components/ProfileCompletionChecker.jsx
"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import CheckoutModal from "@/components/CheckoutModal";

export default function ProfileCompletionChecker() {
  const { user, isAuthenticated, needsProfileCompletion } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check sessionStorage for temporary dismissal and localStorage for permanent completion
    const profilePromptDismissed = sessionStorage.getItem('profilePromptDismissed');
    const profilePromptCompleted = localStorage.getItem('profilePromptCompleted');
    
    if (isAuthenticated && needsProfileCompletion && !profilePromptDismissed && !profilePromptCompleted) {
      // Small delay to ensure smooth UX
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, needsProfileCompletion]);

  const handleModalClose = () => {
    setShowModal(false);
    // Use sessionStorage for temporary dismissal (clears when session ends)
    sessionStorage.setItem('profilePromptDismissed', 'true');
  };

  const handleProfileComplete = () => {
    setShowModal(false);
    // Clear temporary dismissal and set permanent completion flag
    sessionStorage.removeItem('profilePromptDismissed');
    localStorage.setItem('profilePromptCompleted', 'true');
  };

  if (!showModal) return null;

  return (
    <CheckoutModal 
      onClose={handleModalClose} 
      isNewGoogleUser={true}
      onProfileComplete={handleProfileComplete}
    />
  );
}