import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserMenu: React.FC = () => {
  const { user, logout, getLinkAccountUrl } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`;

  if (!user) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <span className="hidden mr-2 text-sm text-gray-700 dark:text-gray-300 md:block">
          {user.display_name || user.username}
        </span>
        <div className="w-8 h-8 overflow-hidden border-2 border-gray-200 rounded-full dark:border-gray-700">
          <img src={defaultAvatar} alt="User avatar" className="object-cover w-full h-full" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 w-56 py-1 mt-2 bg-white rounded-md shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="px-4 py-2 text-xs text-gray-500 border-b dark:text-gray-400 dark:border-gray-700">
            <p>{user.is_guest ? 'Guest session' : 'Signed in as'}</p>
            <p className="font-semibold">{user.email || user.display_name || user.username}</p>
          </div>

          {user.is_guest ? (
            <a
              href={getLinkAccountUrl()}
              className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 dark:text-blue-300 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Link Account
            </a>
          ) : (
            <>
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Your Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Settings
              </Link>
            </>
          )}

          <div className="border-t dark:border-gray-700"></div>

          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {user.is_guest ? 'Exit Guest' : 'Account'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
