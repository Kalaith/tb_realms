/**
 * Login Form Component
 * Provides user interface for authentication
 */
import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginRequest } from '../../entities/Auth';
import authApi from '../../api/authApi';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onRegisterClick }) => {
  // Access auth context
  const { login, isLoading, error, clearError } = useAuth();
  
  // Form state
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  
  // Server connection state
  const [serverConnected, setServerConnected] = useState<boolean | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  
  /**
   * Check server connection on component mount
   */
  useEffect(() => {
    const checkConnection = async () => {
      setIsCheckingConnection(true);
      try {
        const isConnected = await authApi.checkServerConnectivity();
        setServerConnected(isConnected);
      } catch (err) {
        setServerConnected(false);
      } finally {
        setIsCheckingConnection(false);
      }
    };
    
    checkConnection();
  }, []);
  
  /**
   * Handle input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    // Clear any validation errors when user starts typing
    setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    // Clear API errors when user makes changes
    clearError();
    // Update credentials
    setCredentials(prev => ({ ...prev, [name]: value }));
  };
  
  /**
   * Validate form before submission
   */
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    
    // Email validation
    if (!credentials.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Invalid email address';
    }
    
    // Password validation
    if (!credentials.password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Retry server connection check
   */
  const retryConnection = async (): Promise<void> => {
    setIsCheckingConnection(true);
    try {
      const isConnected = await authApi.checkServerConnectivity();
      setServerConnected(isConnected);
    } catch (err) {
      setServerConnected(false);
    } finally {
      setIsCheckingConnection(false);
    }
  };
  
  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check connection before attempting login
    if (serverConnected === false) {
      const isNowConnected = await authApi.checkServerConnectivity();
      setServerConnected(isNowConnected);
      if (!isNowConnected) {
        return; // Don't attempt login if there's no connection
      }
    }
    
    try {
      await login(credentials);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Error is handled in AuthContext
      console.error('Login error:', err);
      
      // Check if this was a connection error and update state
      if (err && typeof err === 'object' && 'code' in err && err.code === 'CONNECTION_ERROR') {
        setServerConnected(false);
      }
    }
  };
  
  // Show connection error if we know the server is not available
  const connectionError = serverConnected === false ? (
    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300" role="alert">
      <div className="font-medium">Connection Error</div>
      <p>Unable to connect to the authentication server. Please check your network connection or try again later.</p>
      <button 
        onClick={retryConnection}
        className="mt-2 px-3 py-1 text-xs font-medium bg-red-700 text-white rounded hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
        disabled={isCheckingConnection}
      >
        {isCheckingConnection ? 'Checking...' : 'Retry Connection'}
      </button>
    </div>
  ) : null;
  
  return (
    <div className="w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-700 dark:text-white">Login</h2>
      
      {/* Connection status error */}
      {connectionError}
      
      {/* API Error Message */}
      {error && serverConnected !== false && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <div className="mb-4">
          <label 
            htmlFor="email" 
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className={`w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading || isCheckingConnection || serverConnected === false}
            required
          />
          {validationErrors.email && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
          )}
        </div>
        
        {/* Password Field */}
        <div className="mb-6">
          <label 
            htmlFor="password" 
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              validationErrors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading || isCheckingConnection || serverConnected === false}
            required
          />
          {validationErrors.password && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
          )}
        </div>
        
        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading || isCheckingConnection || serverConnected === false}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      {/* Register Link */}
      {onRegisterClick && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button 
              onClick={onRegisterClick}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              type="button"
            >
              Create account
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;