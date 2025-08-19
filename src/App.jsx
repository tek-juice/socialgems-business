// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import MainLayout from './components/layouts/MainLayout';
import Dashboard from './pages/Dashboad';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import { TopInfluencers } from './components/TopInfluencers';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/Campaign/AddCampaign';
import WalletsPage from './pages/Wallet';
import CampaignDetailsPage from './pages/Campaign/CampaignDetails/CampaignDetails';
import SettingsPage from './pages/settings';
import Groups from './pages/Groups';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, 
      gcTime: 10 * 60 * 1000, 
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), 
    },
    mutations: {
      retry: 1, 
      retryDelay: 1000,
    },
  },
});

// Payment Route Component - redirects to wallet with same query params
function PaymentRoute() {
  const [searchParams] = new URLSearchParams(window.location.search);
  
  // Construct the wallet URL with all query parameters
  const walletUrl = `/wallet${window.location.search}`;
  
  return <Navigate to={walletUrl} replace />;
}

function ProtectedRoute({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const jwt = localStorage.getItem('jwt');
      const email = localStorage.getItem('email');
      
      const isAuthenticated = loggedIn && jwt && email;
      
      setIsLoggedIn(isAuthenticated);
      setLoading(false);
    };
    checkAuthStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AuthRoute({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const jwt = localStorage.getItem('jwt');
      const email = localStorage.getItem('email');
      
      const isAuthenticated = loggedIn && jwt && email;
      
      setIsLoggedIn(isAuthenticated);
      setLoading(false);
    };
    checkAuthStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isLoggedIn ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route 
              path="/login" 
              element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              } 
            />
            
            <Route 
              path="/signup" 
              element={
                <AuthRoute>
                  <Signup />
                </AuthRoute>
              } 
            />

            {/* Payment redirect route - redirects to wallet with same params */}
            <Route 
              path="/payment" 
              element={
                <ProtectedRoute>
                  <PaymentRoute />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <MainLayout userType="client" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="wallet" element={<WalletsPage />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="groups" element={<Groups />} />
              <Route path="campaigns/:id" element={<CampaignDetailsPage />} />
              <Route path="campaigns/create" element={<CreateCampaign />} />
              <Route path="profile" element={<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"><h1 className="text-2xl font-bold text-gray-800">Profile Page</h1></div>} />
              <Route path="verification" element={<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"><h1 className="text-2xl font-bold text-gray-800">Verification Page</h1></div>} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
          
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            duration={4000}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;