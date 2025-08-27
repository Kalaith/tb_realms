/**
 * Login Page
 * Route: /login
 */
import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Handle successful login
  const handleLoginSuccess = () => {
    navigate('/');
  };
  
  // Handle register button click
  const handleRegisterClick = () => {
    navigate('/register');
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Tradeborn Realms
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to manage your trading portfolio
          </p>
        </div>
        
        <LoginForm 
          onSuccess={handleLoginSuccess} 
          onRegisterClick={handleRegisterClick}
        />
      </div>
    </div>
  );
};

export default LoginPage;