/**
 * Authentication Context
 * Manages authentication state throughout the application
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authApi from '../api/authApi';
import { AuthUser, LoginRequest, RegisterRequest } from '../entities/Auth';

/**
 * Auth context state and methods
 */
interface AuthContextType {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create context with default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Context Provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Derived authentication status
  const isAuthenticated = !!user;

  /**
   * Attempt to restore user session from token on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
          // Fetch current user data if token exists
          const userData = await authApi.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // Clear invalid token
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        console.error('Authentication initialization error:', err);
      } finally {
        // Mark loading as complete regardless of outcome
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);  /**
   * Login with credentials
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await authApi.login(credentials);
      setUser(userData);
      
      // Dispatch a custom event for successful login
      // This allows other components to respond to login success
      const loginEvent = new CustomEvent('auth:login-success');
      window.dispatchEvent(loginEvent);
    } catch (err) {
      const errorMessage = err instanceof Error ? 
        err.message : 
        'Login failed. Please check your credentials.';
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (userData: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newUser = await authApi.register(userData);
      setUser(newUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? 
        err.message : 
        'Registration failed. Please try again.';
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout current user
   */
  const logout = (): void => {
    authApi.logout();
    setUser(null);
  };

  /**
   * Clear any authentication errors
   */
  const clearError = (): void => {
    setError(null);
  };

  // Create context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for accessing auth context
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};