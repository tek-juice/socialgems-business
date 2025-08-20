// src/App.jsx
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useLocation } from 'react-router-dom';
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

// Tab Manager Class
class TabManager {
  constructor() {
    this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.channel = null;
    this.isChannelOpen = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    try {
      this.channel = new BroadcastChannel('social_gems_tabs');
      this.isChannelOpen = true;
      this.channel.addEventListener('message', this.handleMessage.bind(this));
      
      this.channel.addEventListener('messageerror', () => {
        this.isChannelOpen = false;
      });
    } catch (error) {
      console.warn('BroadcastChannel not supported, using localStorage fallback');
      this.isChannelOpen = false;
    }
    
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    window.addEventListener('beforeunload', this.cleanup.bind(this));
    
    this.heartbeatInterval = setInterval(() => {
      this.updateHeartbeat();
    }, 5000);
  }

  updateHeartbeat() {
    const existingTabs = this.getOpenTabs();
    const updatedTabs = existingTabs.map(tab => 
      tab.tabId === this.tabId 
        ? { ...tab, lastSeen: Date.now() }
        : tab
    );
    
    try {
      localStorage.setItem('social_gems_open_tabs', JSON.stringify(updatedTabs));
    } catch (error) {
      // Handle localStorage errors silently
    }
  }

  postMessage(message) {
    if (this.channel && this.isChannelOpen) {
      try {
        this.channel.postMessage(message);
      } catch (error) {
        console.warn('Failed to post message to channel:', error);
        this.isChannelOpen = false;
      }
    }
  }

  registerTab(path) {
    const existingTabs = this.getOpenTabs();
    const duplicateTab = existingTabs.find(tab => tab.path === path && tab.tabId !== this.tabId);
    
    if (duplicateTab) {
      return this.handleDuplicateTab(duplicateTab, path);
    }
    
    const tabInfo = {
      tabId: this.tabId,
      path,
      timestamp: Date.now(),
      lastSeen: Date.now(),
      url: window.location.href
    };
    
    const allTabs = [...existingTabs.filter(tab => tab.tabId !== this.tabId), tabInfo];
    
    try {
      localStorage.setItem('social_gems_open_tabs', JSON.stringify(allTabs));
    } catch (error) {
      // Handle localStorage errors silently
    }
    
    return { isDuplicate: false, action: 'continue' };
  }

  getOpenTabs() {
    try {
      const tabs = localStorage.getItem('social_gems_open_tabs');
      if (!tabs) return [];
      
      const parsedTabs = JSON.parse(tabs);
      const now = Date.now();
      
      const activeTabs = parsedTabs.filter(tab => 
        now - (tab.lastSeen || tab.timestamp) < 30000
      );
      
      if (activeTabs.length !== parsedTabs.length) {
        localStorage.setItem('social_gems_open_tabs', JSON.stringify(activeTabs));
      }
      
      return activeTabs;
    } catch (error) {
      return [];
    }
  }

  handleDuplicateTab(existingTab, currentPath) {
    this.postMessage({
      type: 'FOCUS_REQUEST',
      targetTabId: existingTab.tabId,
      newTabId: this.tabId,
      path: currentPath
    });

    return {
      isDuplicate: true,
      existingTab,
      action: 'auto_redirect'
    };
  }

  handleMessage(event) {
    if (!event || !event.data) return;
    
    const { type, targetTabId, newTabId, path } = event.data;
    
    if (type === 'FOCUS_REQUEST' && targetTabId === this.tabId) {
      window.focus();
      
      this.postMessage({
        type: 'FOCUS_CONFIRMED',
        originalTabId: this.tabId,
        newTabId: newTabId
      });
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Social Gems', {
          body: 'Switched to existing tab',
          icon: '/favicon.ico'
        });
      }
    }
  }

  handleStorageChange(event) {
    if (event.key === 'social_gems_open_tabs') {
      // Handle storage changes if needed
    }
  }

  updateTabPath(newPath) {
    const existingTabs = this.getOpenTabs();
    const updatedTabs = existingTabs.map(tab => 
      tab.tabId === this.tabId 
        ? { 
            ...tab, 
            path: newPath, 
            timestamp: Date.now(), 
            lastSeen: Date.now(),
            url: window.location.href 
          }
        : tab
    );
    
    try {
      localStorage.setItem('social_gems_open_tabs', JSON.stringify(updatedTabs));
    } catch (error) {
      // Handle localStorage errors silently
    }
    
    this.postMessage({
      type: 'URL_UPDATED',
      path: newPath,
      tabId: this.tabId,
      timestamp: Date.now()
    });
  }

  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    const existingTabs = this.getOpenTabs();
    const filteredTabs = existingTabs.filter(tab => tab.tabId !== this.tabId);
    
    try {
      localStorage.setItem('social_gems_open_tabs', JSON.stringify(filteredTabs));
    } catch (error) {
      // Handle localStorage errors silently
    }
    
    if (this.channel && this.isChannelOpen) {
      try {
        this.isChannelOpen = false;
        this.channel.close();
      } catch (error) {
        // Handle channel close errors silently
      }
    }
  }
}

// Create global tab manager instance
const tabManager = new TabManager();

// URL Cleanup Component
function URLCleanup() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const cleanupURL = () => {
      const currentURL = window.location.href;
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      
      // Check for malformed URLs with both path and hash
      if (currentPath !== '/' && currentHash.startsWith('#/')) {
        const intendedRoute = currentHash.substring(1);
        const cleanURL = `${window.location.origin}/#${intendedRoute}`;
        window.history.replaceState(null, '', cleanURL);
        navigate(intendedRoute, { replace: true });
        return;
      }
      
      // Check if we have a path but no hash (redirect to hash)
      if (currentPath !== '/' && !currentHash) {
        const hashRoute = `${currentPath}${window.location.search}`;
        const cleanURL = `${window.location.origin}/#${hashRoute}`;
        window.history.replaceState(null, '', cleanURL);
        navigate(hashRoute, { replace: true });
        return;
      }
    };
    
    cleanupURL();
  }, [navigate]);
  
  return null;
}

// Enhanced Navigation Handler
function NavigationHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Check for malformed URLs
    const fullURL = window.location.href;
    const hasDoubleRouting = fullURL.includes('/campaigns/') && fullURL.includes('#/campaigns/');
    
    if (hasDoubleRouting) {
      const hashPart = window.location.hash;
      if (hashPart.startsWith('#/')) {
        const cleanRoute = hashPart.substring(1);
        const cleanURL = `${window.location.origin}/#${cleanRoute}`;
        window.history.replaceState(null, '', cleanURL);
        navigate(cleanRoute, { replace: true });
        return;
      }
    }
    
    try {
      tabManager.updateTabPath(currentPath);
    } catch (error) {
      console.warn('Error updating tab path:', error);
    }
  }, [location.pathname, location.search, navigate]);

  return null;
}

// Payment Route Component
function PaymentRoute() {
  const walletUrl = `/wallet${window.location.search}`;
  return <Navigate to={walletUrl} replace />;
}

// Enhanced Protected Route
function ProtectedRoute({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (isLoggedIn && !loading) {
      // Validate current URL structure
      const currentURL = window.location.href;
      if (currentURL.includes('/campaigns/') && currentURL.includes('#/campaigns/')) {
        // Fix malformed URL immediately
        const hashPart = window.location.hash;
        if (hashPart.startsWith('#/')) {
          const cleanRoute = hashPart.substring(1);
          navigate(cleanRoute, { replace: true });
          return;
        }
      }

      const currentPath = location.pathname + location.search;
      
      try {
        const result = tabManager.registerTab(currentPath);
        
        if (result.isDuplicate && result.action === 'auto_redirect') {
          setTimeout(() => {
            setShouldRedirect(true);
          }, 1000);
        }
      } catch (error) {
        console.warn('Error registering tab:', error);
      }
    }
  }, [location.pathname, location.search, isLoggedIn, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/dashboard" replace />;
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
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (tabManager) {
        tabManager.cleanup();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <URLCleanup />
        <NavigationHandler />
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