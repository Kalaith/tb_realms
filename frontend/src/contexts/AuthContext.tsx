/**
 * Auth Context
 * Web Hatchery handles authentication; this app reads shared auth state.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
  id: string | number;
  username?: string | null;
  email?: string | null;
  roles?: string[];
}

/**
 * User context state and methods
 */
interface UserContextType {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Methods
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Derived authentication status (always true if user exists)
  const isAuthenticated = !!user;

  /**
   * Load user from shared auth storage on mount
   */
  useEffect(() => {
    const initUser = () => {
      try {
        const storedAuth = localStorage.getItem('auth-storage');
        if (!storedAuth) {
          setUser(null);
          return;
        }
        const parsed = JSON.parse(storedAuth) as {
          state?: { user?: AuthUser | null };
        };
        setUser(parsed.state?.user ?? null);
      } catch (err) {
        console.error('User initialization error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, []);

  /**
   * Logout (handled by Web Hatchery)
   */
  const logout = (): void => {
    // No-op: Web Hatchery manages auth state.
  };

  // Create context value
  const contextValue: UserContextType = {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
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
