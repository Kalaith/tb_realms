import React from 'react';

/**
 * EmptyState component - Displays a consistent empty state message
 * Used when lists or collections have no data to display
 */
interface EmptyStateProps {
  message: string;
  className?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, className = '', icon }) => {
  return (
    <div
      className={`p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}
    >
      {icon && <div className="mb-3">{icon}</div>}
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
