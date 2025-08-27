/**
 * NavLink Component
 * A consistent navigation link component for use in Header and Sidebar
 */
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  /** Path to navigate to */
  to: string;
  /** Link display content */
  children: ReactNode;
  /** Optional icon to display before text */
  icon?: string | ReactNode;
  /** Visual style variant: 'header' or 'sidebar' */
  variant?: 'header' | 'sidebar';
  /** Function to call when link is clicked */
  onClick?: () => void;
  /** Accessibility attributes */
  ariaLabel?: string;
}

const NavLink: React.FC<NavLinkProps> = ({
  to,
  children,
  icon,
  variant = 'sidebar',
  onClick,
  ariaLabel,
}) => {
  const location = useLocation();
  
  // Check if link is for the active/current route
  const isActive = (() => {
    if (to === '/' && location.pathname === '/') {
      return true;
    }
    return to !== '/' && location.pathname.startsWith(to);
  })();
  
  // Styles based on variant and active state
  const getClassName = () => {
    const baseStyles = 'transition-colors duration-150';
    const activeStyles = isActive 
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
      : '';
    
    if (variant === 'header') {
      return `${baseStyles} px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${activeStyles}`;
    }
    
    return `${baseStyles} flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${activeStyles}`;
  };
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={getClassName()}
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel}
    >
      {icon && variant === 'sidebar' && (
        <span className="mr-3">{icon}</span>
      )}
      {children}
    </Link>
  );
};

export default NavLink;