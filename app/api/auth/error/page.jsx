"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthError() {
  const router = useRouter();
  const error = router.query?.error;

  useEffect(() => {
    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const getErrorMessage = (error) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration. Please check your environment variables.";
      case "AccessDenied":
        return "You denied access to sign in. Please try again and accept the permissions.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      default:
        return "An error occurred during authentication. Please try again.";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700 mb-6">{getErrorMessage(error)}</p>
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Return to Login
        </button>
        <p className="text-sm text-gray-500 mt-4 text-center">
          You will be redirected automatically in 3 seconds...
        </p>
      </div>
    </div>
  );
}
