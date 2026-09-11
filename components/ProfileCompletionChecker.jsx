// components/ProfileCompletionChecker.jsx
"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import CheckoutModal from "@/components/CheckoutModal";

export default function ProfileCompletionChecker() {
  const { user, isAuthenticated, needsProfileCompletion } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check localStorage to see if we've already prompted this user
    const profilePromptShown = localStorage.getItem('profilePromptShown');
    
    if (isAuthenticated && needsProfileCompletion && !profilePromptShown) {
      // Small delay to ensure smooth UX
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, needsProfileCompletion]);

  const handleModalClose = () => {
    setShowModal(false);
    // Mark that we've shown the prompt to avoid annoying the user
    localStorage.setItem('profilePromptShown', 'true');
  };

  const handleProfileComplete = () => {
    setShowModal(false);
    // Clear the flag since they've completed it
    localStorage.removeItem('profilePromptShown');
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