import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useLocation } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import Dashboard from "./pages/Dashboad";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import { TopInfluencers } from "./components/TopInfluencers";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/Campaign/AddCampaign";
import WalletsPage from "./pages/Wallet";
import CampaignDetailsPage from "./pages/Campaign/CampaignDetails/CampaignDetails";
import SettingsPage from "./pages/settings";
import Groups from "./pages/Groups";
import { logout } from "./utils/service";

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

const AuthUtils = {
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  },

  isAuthenticated: () => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const jwt = localStorage.getItem("jwt");
    const email = localStorage.getItem("email");

    if (!loggedIn || !jwt || !email) {
      return false;
    }

    if (AuthUtils.isTokenExpired(jwt)) {
      logout();
      return false;
    }

    return true;
  },

  logout: () => {
    logout();
  },
};

class TabManager {
  constructor() {
    this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.channel = null;
    this.isChannelOpen = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    try {
      this.channel = new BroadcastChannel("social_gems_tabs");
      this.isChannelOpen = true;
      this.channel.addEventListener("message", this.handleMessage.bind(this));

      this.channel.addEventListener("messageerror", () => {
        this.isChannelOpen = false;
      });
    } catch (error) {
      this.isChannelOpen = false;
    }

    window.addEventListener("storage", this.handleStorageChange.bind(this));
    window.addEventListener("beforeunload", this.cleanup.bind(this));

    this.heartbeatInterval = setInterval(() => {
      this.updateHeartbeat();
    }, 5000);

    this.authCheckInterval = setInterval(() => {
      if (!AuthUtils.isAuthenticated()) {
        this.cleanup();
      }
    }, 30000);
  }

  updateHeartbeat() {
    const existingTabs = this.getOpenTabs();
    const updatedTabs = existingTabs.map((tab) =>
      tab.tabId === this.tabId ? { ...tab, lastSeen: Date.now() } : tab
    );

    try {
      localStorage.setItem(
        "social_gems_open_tabs",
        JSON.stringify(updatedTabs)
      );
    } catch (error) {}
  }

  postMessage(message) {
    if (this.channel && this.isChannelOpen) {
      try {
        this.channel.postMessage(message);
      } catch (error) {
        this.isChannelOpen = false;
      }
    }
  }

  registerTab(path) {
    if (!AuthUtils.isAuthenticated()) {
      return { isDuplicate: false, action: "logout" };
    }

    const existingTabs = this.getOpenTabs();
    const duplicateTab = existingTabs.find(
      (tab) => tab.path === path && tab.tabId !== this.tabId
    );

    if (duplicateTab) {
      return this.handleDuplicateTab(duplicateTab, path);
    }

    const tabInfo = {
      tabId: this.tabId,
      path,
      timestamp: Date.now(),
      lastSeen: Date.now(),
      url: window.location.href,
    };

    const allTabs = [
      ...existingTabs.filter((tab) => tab.tabId !== this.tabId),
      tabInfo,
    ];

    try {
      localStorage.setItem("social_gems_open_tabs", JSON.stringify(allTabs));
    } catch (error) {}

    return { isDuplicate: false, action: "continue" };
  }

  getOpenTabs() {
    try {
      const tabs = localStorage.getItem("social_gems_open_tabs");
      if (!tabs) return [];

      const parsedTabs = JSON.parse(tabs);
      const now = Date.now();

      const activeTabs = parsedTabs.filter(
        (tab) => now - (tab.lastSeen || tab.timestamp) < 30000
      );

      if (activeTabs.length !== parsedTabs.length) {
        localStorage.setItem(
          "social_gems_open_tabs",
          JSON.stringify(activeTabs)
        );
      }

      return activeTabs;
    } catch (error) {
      return [];
    }
  }

  handleDuplicateTab(existingTab, currentPath) {
    this.postMessage({
      type: "FOCUS_REQUEST",
      targetTabId: existingTab.tabId,
      newTabId: this.tabId,
      path: currentPath,
    });

    return {
      isDuplicate: true,
      existingTab,
      action: "auto_redirect",
    };
  }

  handleMessage(event) {
    if (!event || !event.data) return;

    const { type, targetTabId, newTabId } = event.data;

    if (type === "FOCUS_REQUEST" && targetTabId === this.tabId) {
      window.focus();

      this.postMessage({
        type: "FOCUS_CONFIRMED",
        originalTabId: this.tabId,
        newTabId: newTabId,
      });

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Social Gems", {
          body: "Switched to existing tab",
          icon: "/favicon.ico",
        });
      }
    }

    if (type === "USER_LOGGED_OUT") {
      window.location.href = "/login";
    }
  }

  handleStorageChange(event) {
    if (event.key === "isLoggedIn" || event.key === "jwt") {
      if (!AuthUtils.isAuthenticated()) {
        this.cleanup();
        window.location.href = "/login";
      }
    }
  }

  updateTabPath(newPath) {
    if (!AuthUtils.isAuthenticated()) {
      return;
    }

    const existingTabs = this.getOpenTabs();
    const updatedTabs = existingTabs.map((tab) =>
      tab.tabId === this.tabId
        ? {
            ...tab,
            path: newPath,
            timestamp: Date.now(),
            lastSeen: Date.now(),
            url: window.location.href,
          }
        : tab
    );

    try {
      localStorage.setItem(
        "social_gems_open_tabs",
        JSON.stringify(updatedTabs)
      );
    } catch (error) {}

    this.postMessage({
      type: "URL_UPDATED",
      path: newPath,
      tabId: this.tabId,
      timestamp: Date.now(),
    });
  }

  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
    }

    const existingTabs = this.getOpenTabs();
    const filteredTabs = existingTabs.filter((tab) => tab.tabId !== this.tabId);

    try {
      localStorage.setItem(
        "social_gems_open_tabs",
        JSON.stringify(filteredTabs)
      );
    } catch (error) {}

    if (this.channel && this.isChannelOpen) {
      try {
        this.isChannelOpen = false;
        this.channel.close();
      } catch (error) {}
    }
  }
}

const tabManager = new TabManager();

function NavigationHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname + location.search;

    if (
      !AuthUtils.isAuthenticated() &&
      !["/login", "/signup"].includes(location.pathname)
    ) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      tabManager.updateTabPath(currentPath);
    } catch (error) {
      console.warn("Error updating tab path:", error);
    }
  }, [location.pathname, location.search, navigate]);

  return null;
}

function PaymentRoute() {
  const walletUrl = `/wallet${window.location.search}`;
  return <Navigate to={walletUrl} replace />;
}

function ProtectedRoute({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuthenticated = AuthUtils.isAuthenticated();

      if (!isAuthenticated && localStorage.getItem("isLoggedIn") === "true") {
        AuthUtils.logout();
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(isAuthenticated);
      setLoading(false);
    };

    checkAuthStatus();

    const authCheckInterval = setInterval(() => {
      if (!AuthUtils.isAuthenticated()) {
        setIsLoggedIn(false);
        AuthUtils.logout();
      }
    }, 30000);

    return () => clearInterval(authCheckInterval);
  }, []);

  useEffect(() => {
    if (isLoggedIn && !loading) {
      const currentPath = location.pathname + location.search;

      try {
        const result = tabManager.registerTab(currentPath);

        if (result.action === "logout") {
          AuthUtils.logout();
          return;
        }

        if (result.isDuplicate && result.action === "auto_redirect") {
          setTimeout(() => {
            setShouldRedirect(true);
          }, 1000);
        }
      } catch (error) {
        console.warn("Error registering tab:", error);
      }
    }
  }, [location.pathname, location.search, isLoggedIn, loading, navigate]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "isLoggedIn" && e.newValue !== "true") {
        setIsLoggedIn(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
      const isAuthenticated = AuthUtils.isAuthenticated();
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
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (
      !AuthUtils.isAuthenticated() &&
      !["/login", "/signup"].includes(window.location.pathname)
    ) {
      window.location.href = "/login";
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
              <Route
                path="profile"
                element={
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-800">
                      Profile Page
                    </h1>
                  </div>
                }
              />
              <Route
                path="verification"
                element={
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-800">
                      Verification Page
                    </h1>
                  </div>
                }
              />
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