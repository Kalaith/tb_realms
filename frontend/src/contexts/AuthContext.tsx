/**
 * User Context
 * Manages user state with local storage (no authentication required)
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Simple user interface for local storage
interface LocalUser {
  id: string;
  username: string;
  email: string;
  startingBalance: number;
  createdAt: string;
}

/**
 * User context state and methods
 */
interface UserContextType {
  // State
  user: LocalUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Methods
  createUser: (username: string, email: string) => void;
  logout: () => void;
}

// Create context with default undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider props
interface UserProviderProps {
  children: ReactNode;
}

/**
 * User Context Provider component
 */
export const AuthProvider: React.FC<UserProviderProps> = ({ children }) => {
  // User state
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Derived authentication status (always true if user exists)
  const isAuthenticated = !!user;

  /**
   * Load user from localStorage on mount
   */
  useEffect(() => {
    const initUser = () => {
      try {
        // Check if there's a user in localStorage
        const storedUser = localStorage.getItem('tb_realms_user');

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } else {
          // Create a default user if none exists
          createDefaultUser();
        }
      } catch (err) {
        console.error('User initialization error:', err);
        // Create a default user on error
        createDefaultUser();
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, []);

  /**
   * Create a default user
   */
  const createDefaultUser = () => {
    const defaultUser: LocalUser = {
      id: 'user_' + Date.now(),
      username: 'Player' + Math.floor(Math.random() * 1000),
      email: 'player@example.com',
      startingBalance: 10000,
      createdAt: new Date().toISOString()
    };

    setUser(defaultUser);
    localStorage.setItem('tb_realms_user', JSON.stringify(defaultUser));
  };

  /**
   * Create a new user
   */
  const createUser = (username: string, email: string): void => {
    const newUser: LocalUser = {
      id: 'user_' + Date.now(),
      username,
      email,
      startingBalance: 10000,
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
    localStorage.setItem('tb_realms_user', JSON.stringify(newUser));
  };

  /**
   * Logout (clear user)
   */
  const logout = (): void => {
    localStorage.removeItem('tb_realms_user');
    setUser(null);
    // Create a new default user
    createDefaultUser();
  };

  // Create context value
  const contextValue: UserContextType = {
    user,
    isAuthenticated,
    isLoading,
    createUser,
    logout
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Custom hook for accessing user context
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): UserContextType => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};