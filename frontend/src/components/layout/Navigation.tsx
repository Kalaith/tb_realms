/**
 * Navigation Component
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';

const Navigation: React.FC = () => {
  const { user, continueAsGuest, requestLogin, getLinkAccountUrl, logout, loginUrl } = useAuth();
  const { mainNavigation, appBranding } = useNavigation();

  const navItems = mainNavigation.filter(
    item => item.showInHeader === undefined || item.showInHeader
  );

  return (
    <nav className="fixed top-0 left-0 z-30 w-full bg-white border-b shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="container flex items-center justify-between h-16 px-6 mx-auto gap-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {appBranding.name}
            </span>
          </Link>
        </div>

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

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex flex-col items-end text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {user.is_guest ? 'Guest session' : 'Signed in'}
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {user.display_name || user.username || user.email}
                </span>
              </div>
              {user.is_guest ? (
                <a
                  href={getLinkAccountUrl()}
                  className="rounded-md border border-blue-500 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-gray-700"
                >
                  Link Account
                </a>
              ) : null}
              <button
                onClick={logout}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {user.is_guest ? 'Exit Guest' : 'Account'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  void continueAsGuest();
                }}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Guest
              </button>
              <a
                href={loginUrl}
                onClick={requestLogin}
                className="rounded-md border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-gray-700"
              >
                Sign In
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
