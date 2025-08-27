/**
 * Register Form Component
 * Provides user interface for creating a new account
 */
import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterRequest } from '../../entities/Auth';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onLoginClick }) => {
  // Access auth context
  const { register, isLoading, error, clearError } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<RegisterRequest & { confirmPassword: string }>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  /**
   * Handle input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    // Clear any validation errors when user starts typing
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
    // Clear API errors when user makes changes
    clearError();
    // Update form data
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  /**
   * Validate form before submission
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    
    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Create request payload (excluding confirmPassword)
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Error is handled in AuthContext
      console.error('Registration error:', err);
    }
  };
  
  return (
    <div className="w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-700 dark:text-white">Create Account</h2>
      
      {/* API Error Message */}
      {error && (
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
            Email *
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className={`w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
            required
          />
          {validationErrors.email && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
          )}
        </div>
        
        {/* Username Field */}
        <div className="mb-4">
          <label 
            htmlFor="username" 
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username *
          </label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="dragongamer123"
            className={`w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              validationErrors.username ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
            required
          />
          {validationErrors.username && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.username}</p>
          )}
        </div>
        
        {/* Name Fields (side by side) */}
        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
          {/* First Name */}
          <div>
            <label 
              htmlFor="firstName" 
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              disabled={isLoading}
            />
          </div>
          
          {/* Last Name */}
          <div>
            <label 
              htmlFor="lastName" 
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              disabled={isLoading}
            />
          </div>
        </div>
        
        {/* Password Field */}
        <div className="mb-4">
          <label 
            htmlFor="password" 
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password *
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              validationErrors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
            required
          />
          {validationErrors.password && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
          )}
        </div>
        
        {/* Confirm Password Field */}
        <div className="mb-6">
          <label 
            htmlFor="confirmPassword" 
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
            required
          />
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.confirmPassword}</p>
          )}
        </div>
        
        {/* Register Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      
      {/* Login Link */}
      {onLoginClick && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button 
              onClick={onLoginClick}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              type="button"
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;