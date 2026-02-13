import React from "react";

/**
 * LoadingSpinner component - Displays a loading indicator
 * Used for consistent loading UI throughout the application
 */
const LoadingSpinner: React.FC = () => (
  <div
    className="flex flex-col items-center justify-center p-4"
    role="status"
    aria-live="polite"
  >
    <svg
      className="w-10 h-10 mb-3 animate-spin text-blue-600 dark:text-blue-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span className="text-gray-700 dark:text-gray-300">Loading...</span>
  </div>
);

export default LoadingSpinner;
