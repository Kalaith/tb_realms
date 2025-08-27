/**
 * Navigation Component
 * Main navigation bar for the application
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import UserMenu from '../auth/UserMenu';

const Navigation: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { mainNavigation, appBranding } = useNavigation();

  // Filter navigation items to show in the header
  // Since showInHeader might be missing in the API response but we already know
  // the backend filtered for showInHeader=true, we can assume all items should be shown
  const navItems = mainNavigation.filter(item => 
    (item.showInHeader === undefined || item.showInHeader) && 
    (!item.requiresAuth || isAuthenticated)
  );
  
  return (
    <nav className="fixed top-0 left-0 z-30 w-full bg-white border-b shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="container flex items-center justify-between h-16 px-6 mx-auto">
        {/* App name in top left corner */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {appBranding.name}
            </span>
          </Link>
        </div>
        
        {/* Middle section - shows dynamic Market links */}
        <div className="hidden md:flex items-center space-x-4">
          {navItems.map(item => (
            <Link 
              key={item.path}
              to={item.path}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        {/* Right section - shows UserMenu or login button */}
        <div className="flex items-center">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
