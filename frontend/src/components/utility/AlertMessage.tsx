import React from 'react';

/**
 * AlertMessage component - Displays various types of alert messages with consistent styling
 * Used for showing errors, success messages, warnings, and info notifications
 */
type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertMessageProps {
  type: AlertType;
  message: string | React.ReactNode;
  className?: string;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, message, className = '' }) => {
  // Base classes for all alert types
  const baseClasses = "p-4 rounded-lg border";
  
  // Type-specific classes
  const typeClasses = {
    error: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800",
    success: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800",
    info: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
  };
  
  // Role and live region attributes for accessibility
  const accessibilityAttrs = {
    error: { role: "alert", "aria-live": "assertive" as const },
    success: { role: "status", "aria-live": "polite" as const },
    warning: { role: "status", "aria-live": "polite" as const },
    info: { role: "status", "aria-live": "polite" as const }
  };
  
  return (
    <div 
      className={`${baseClasses} ${typeClasses[type]} ${className}`}
      {...accessibilityAttrs[type]}
    >
      {message}
    </div>
  );
};

export default AlertMessage;