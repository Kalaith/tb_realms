import React from "react";

/**
 * Card component - A flexible container component with consistent styling
 * Used throughout the application for content grouping
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  noPadding = false,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md dark:bg-gray-800 ${!noPadding ? "p-6" : ""} ${className}`}
    >
      {title && (
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default Card;
