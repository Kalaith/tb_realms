import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
// Using Layout component with simplified navigation (merged Header and Sidebar)
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServerStatus from './components/common/ServerStatus';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import actual page components
import Home from './pages/Home'; // New Home page with market overview for all users
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import Watchlist from './pages/Watchlist';
import Leaderboard from './pages/Leaderboard';
import News from './pages/News';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';

// 404 Not Found page
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-full py-16">
    <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page Not Found</p>
    <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
      Go back to Dashboard
    </Link>
  </div>
);

function App() {
  // Get base path from environment variables
  const basename = import.meta.env.VITE_BASE_PATH?.replace(/\/$/, '') ?? '';
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NavigationProvider>
          <BrowserRouter basename={basename}>
            {/* Server status indicator */}
            <ServerStatus />

            <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Main App Layout */}
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<Home />} /> {/* Using new Home page as the landing page */}

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>            
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="market" element={<Market />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="news" element={<News />} /> 
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="watchlist" element={<Watchlist />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="achievements" element={<Achievements />} />
              </Route>
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Route>
            </Routes>
          </BrowserRouter>
        </NavigationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
