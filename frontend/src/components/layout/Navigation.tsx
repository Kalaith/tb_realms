/**
 * Navigation Component
 * Main navigation bar for the application
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';

const Navigation: React.FC = () => {
  const { user } = useAuth();
  const { mainNavigation, appBranding } = useNavigation();

  // Show all navigation items since auth is no longer required
  const navItems = mainNavigation.filter(item =>
    item.showInHeader === undefined || item.showInHeader
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
        
        {/* Right section - shows user info */}
        <div className="flex items-center">
          {user && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Welcome, {user.username}
              </span>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                ${user.startingBalance.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
