/**
 * Register Page
 * Route: /register
 */
import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Handle successful registration
  const handleRegisterSuccess = () => {
    navigate('/');
  };
  
  // Handle login button click
  const handleLoginClick = () => {
    navigate('/login');
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Tradeborn Realms
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create an account to start trading
          </p>
        </div>
        
        <RegisterForm 
          onSuccess={handleRegisterSuccess} 
          onLoginClick={handleLoginClick}
        />
      </div>
    </div>
  );
};

export default RegisterPage;