import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "./Sidebar";
import FloatingActionMenu from "./floating-action-menu";
import {
  FiMenu,
  FiX,
  FiUser,
  FiSettings,
  FiLogOut,
  FiCalendar,
  FiClock,
  FiChevronRight,
  FiHome,
  FiCreditCard,
  FiBriefcase,
  FiPlus,
  FiAlertCircle,
  FiCheck,
  FiArrowRight,
} from "react-icons/fi";
import { toast } from "sonner";
import { get, put } from "../../utils/service";
import { assets } from "../../assets/assets";
import { IoChatbubblesSharp } from "react-icons/io5";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const BusinessVerificationCard = ({
  userData,
  onNavigateToSettings,
  onClose,
}) => {
  const getVerificationStatus = () => {
    if (!userData?.business_profile) {
      return "none";
    }
    return userData.business_profile.verification_status;
  };

  const verificationStatus = getVerificationStatus();

  const getCardContent = () => {
    switch (verificationStatus) {
      case "pending":
        return {
          icon: FiClock,
          iconColor: "text-orange-600",
          iconBg: "bg-primary",
          title: "Business Verification",
          subtitle: "Your business verification is under review by our team",
          timeText: `Submitted ${
            userData?.business_profile
              ? new Date(
                  userData.business_profile.created_on
                ).toLocaleDateString()
              : "recently"
          }`,
          buttonText: "View Status",
          bgGradient: "from-orange-50/80 to-yellow-50/80",
          borderColor: "border-primary/60",
        };
      case "rejected":
        return {
          icon: FiX,
          iconColor: "text-red-600",
          iconBg: "bg-red-100",
          title: "Business Verification",
          subtitle:
            "Your verification was rejected. Please resubmit with correct information to unlock all features",
          timeText: "Action required - Please resubmit",
          buttonText: "Resubmit Now",
          bgGradient: "from-red-50/80 to-pink-50/80",
          borderColor: "border-red-200/60",
        };
      default:
        return {
          icon: FiAlertCircle,
          iconColor: "text-secondary",
          iconBg: "bg-primary",
          title: "Business Verification Required",
          subtitle:
            "Complete your business verification to create campaigns and manage your wallet",
          timeText: "Verify now to unlock all platform features",
          buttonText: "Start Verification",
          bgGradient: "from-primary/10 to-[#E8C547]/10",
          borderColor: "border-primary/80",
        };
    }
  };

  const cardContent = getCardContent();
  const IconComponent = cardContent.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.5,
      }}
      className="w-full"
    >
      <div className="w-full max-w-7xl mx-auto px-4 py-3">
        <div
          className={`relative bg-secondary border ${cardContent.borderColor} shadow-[0_2px_20px_0_rgba(249,215,105,0.15)] rounded-xl p-5 overflow-hidden`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all duration-200 cursor-pointer"
          >
            <FiX className="h-5 w-5" />
          </button>

          <div className="relative flex flex-col gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-2">
                  <p className="text-base font-semibold text-white w-fit">
                    {cardContent.title}
                  </p>
                  <p className="text-sm text-white w-fit leading-relaxed">
                    {cardContent.subtitle}
                  </p>
                  <p className="text-xs text-white w-fit flex items-center gap-1">
                    <div className="h-1 w-1 bg-gray-400 rounded-full" />
                    {cardContent.timeText}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onNavigateToSettings}
                className={cn(
                  "rounded-sm flex items-center justify-center py-1.5 px-3 gap-2",
                  "bg-primary",
                  "text-secondary",
                  "text-xs font-semibold",
                  "transition-all duration-200"
                )}
              >
                <span>{cardContent.buttonText}</span>
                <FiArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MainLayout = ({ userType = "client" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [manuallyToggled, setManuallyToggled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showVerificationCard, setShowVerificationCard] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isGroupsPage = location.pathname === "/groups";

  const {
    data: userData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const response = await get("users/getUserProfile");
        if (response?.status === 200 && response.data) {
          return response.data;
        } else if (response) {
          return response;
        }
        throw new Error("Failed to fetch user profile");
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return {
          first_name: localStorage.getItem("name")?.split(" ")[0] || "User",
          last_name: localStorage.getItem("name")?.split(" ")[1] || "",
          email: localStorage.getItem("email") || "user@example.com",
          user_type: localStorage.getItem("role") || "User",
        };
      }
    },

    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 120000 * 1000,
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error("Query error:", error);
      if (!localStorage.getItem("name")) {
        toast.error("Failed to load user profile");
      }
    },
  });

  const updateUserProfileMutation = useMutation({
    mutationFn: async (updatedData) => {
      const response = await put("users/updateProfile", updatedData);
      return response.data || response;
    },
    onMutate: async (newUserData) => {
      await queryClient.cancelQueries({ queryKey: ["userProfile"] });

      const previousUserData = queryClient.getQueryData(["userProfile"]);

      queryClient.setQueryData(["userProfile"], (old) => ({
        ...old,
        ...newUserData,
      }));

      return { previousUserData };
    },
    onError: (error, newUserData, context) => {
      queryClient.setQueryData(["userProfile"], context.previousUserData);
      toast.error("Failed to update profile");
      console.error("Update error:", error);
    },
    onSuccess: (data) => {
      toast.success("Profile updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  const updateUserProfile = (updatedData) => {
    updateUserProfileMutation.mutate(updatedData);
  };

  const getFirstName = (firstName, fullName) => {
    if (firstName) return firstName;
    if (!fullName || typeof fullName !== "string") return "User";
    return fullName.trim().split(" ")[0];
  };

  const displayName = getFirstName(
    userData?.first_name || userData?.firstName,
    userData?.full_name
  );
  const userEmail = userData?.email || "user@example.com";
  const fullName =
    userData?.first_name && userData?.last_name
      ? `${userData.first_name} ${userData.last_name}`
      : userData?.firstName && userData?.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : localStorage.getItem("name") || "User";

  const handleNavigateToSettings = () => {
    navigate("/settings", { state: { focusBusinessVerification: true } });
  };

  const handleCloseVerificationCard = () => {
    setShowVerificationCard(false);

    if (userData?.business_profile?.verification_status !== "approved") {
      setTimeout(() => {
        setShowVerificationCard(true);
      }, 5000);
    }
  };

  const handleLogout = () => {
    queryClient.clear();

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("jwt");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const toggleSidebar = (newState, isManual = false) => {
    setSidebarOpen(newState);
    if (isManual) {
      setManuallyToggled(true);
    }
  };

  const floatingMenuOptions = [
    {
      label: "Dashboard",
      Icon: <FiHome className="w-4 h-4" />,
      onClick: () => navigate("/dashboard"),
    },
    {
      label: "Wallet",
      Icon: <FiCreditCard className="w-4 h-4" />,
      onClick: () => navigate("/wallet"),
    },
    {
      label: "My Campaigns",
      Icon: <FiBriefcase className="w-4 h-4" />,
      onClick: () => navigate("/campaigns"),
    },
    {
      label: "Create Campaign",
      Icon: <FiPlus className="w-4 h-4" />,
      onClick: () => navigate("/campaigns/create"),
    },
    {
      label: "Groups",
      Icon: <IoChatbubblesSharp className="w-4 h-4" />,
      onClick: () => navigate("/groups"),
    },
    {
      label: "Settings",
      Icon: <FiSettings className="w-4 h-4" />,
      onClick: () => navigate("/settings"),
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      const userButton = document.querySelector(".user-button");
      const userMenu = document.querySelector(".user-menu");

      if (
        showUserMenu &&
        userButton &&
        !userButton.contains(e.target) &&
        userMenu &&
        !userMenu.contains(e.target)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const isCurrentlyMobile = windowWidth < 768;
      setIsMobile(isCurrentlyMobile);

      if (!manuallyToggled && !isGroupsPage) {
        setSidebarOpen(!isCurrentlyMobile);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [manuallyToggled, isGroupsPage]);

  useEffect(() => {
    if (isMobile && !isGroupsPage) {
      setSidebarOpen(false);
      setShowUserMenu(false);
    }
  }, [location, isMobile, isGroupsPage]);

  const contentClass = isGroupsPage
    ? ""
    : sidebarOpen
    ? "md:ml-64"
    : "md:ml-16";

  const showFloatingMenu = isMobile || !sidebarOpen || isGroupsPage;

  const excludedPages = ["/groups", "/settings"];

  const shouldShowVerificationCard =
    !loading &&
    userData?.user_type === "brand" &&
    userData?.business_profile?.verification_status !== "approved" &&
    showVerificationCard &&
    !excludedPages.includes(location.pathname);

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {sidebarOpen && isMobile && !isGroupsPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm z-30 bg-secondary/50"
            onClick={() => toggleSidebar(false, true)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {!isGroupsPage && (
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          userType={userType}
        />
      )}

      <header
        className={`fixed top-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 flex items-center justify-between h-16 shadow-lg transition-all duration-300 ${
          isGroupsPage ? "left-0" : sidebarOpen ? "md:left-64" : "md:left-16"
        } left-0`}
        style={{ backdropFilter: "blur(1px)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>

        <div className="relative z-10 flex items-center">
          <div className="md:hidden pl-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center"
            >
              <img
                src={assets.MainLogo}
                alt="Social Gems Logo"
                className="h-8 w-auto object-contain max-w-full"
              />
            </motion.div>
          </div>

          <AnimatePresence>
            {!sidebarOpen && !isMobile && !isGroupsPage && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => toggleSidebar(true, true)}
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="ml-6 p-2 rounded-lg hover:bg-primary/20 transition-all duration-200 text-secondary group"
                aria-label="Expand sidebar"
              >
                <div className="flex items-center gap-2">
                  <FiChevronRight size={18} />
                  <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Expand Menu
                  </span>
                </div>
              </motion.button>
            )}
          </AnimatePresence>

          {isGroupsPage && !isMobile && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="ml-6 flex items-center justify-center"
            >
              <img
                src={assets.MainLogo}
                alt="Social Gems Logo"
                className="h-10 w-auto object-contain max-w-full"
              />
            </motion.div>
          )}
        </div>

        <div className="relative z-10 flex items-center space-x-4 px-4">
          {/* User menu */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="user-button flex items-center space-x-2 p-1 pr-3 rounded-lg hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="User menu"
              aria-haspopup="true"
              aria-expanded={showUserMenu}
              disabled={loading}
            >
              <div className="relative w-8 h-8 flex-shrink-0">
                {loading ? (
                  <div className="w-full h-full rounded-full bg-primary/20 animate-pulse"></div>
                ) : userData?.profile_pic ? (
                  <motion.img
                    src={userData.profile_pic}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  />
                ) : (
                  <motion.div
                    className="w-full h-full rounded-full bg-gradient-to-br from-primary to-[#E8C547] flex items-center justify-center text-secondary shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FiUser size={16} />
                  </motion.div>
                )}

                {!loading && (
                  <motion.span
                    className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              {/* User info */}
              <div className="hidden md:flex flex-col items-start overflow-hidden">
                {loading ? (
                  <>
                    <div className="h-4 w-20 bg-primary/20 rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-24 bg-primary/20 rounded animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-secondary truncate max-w-[120px]">
                      {displayName}
                    </p>
                    <p className="text-xs text-secondary/60 truncate max-w-[140px]">
                      {userEmail}
                    </p>
                  </>
                )}
              </div>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="user-menu absolute right-0 mt-2.5 w-64 bg-white border border-t-transparent border-primary backdrop-blur-lg rounded-b-xl overflow-hidden z-[60]"
                  style={{ backdropFilter: "blur(30px)" }}
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>

                  <div className="relative z-10 p-4 border-b border-white/20 bg-gradient-to-r from-primary/10 to-[#E8C547]/10 flex items-center">
                    <motion.div
                      className="relative mr-3 w-12 h-12 flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                    >
                      {userData?.profile_pic ? (
                        <img
                          src={userData.profile_pic}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-[#E8C547] flex items-center justify-center text-secondary shadow-lg">
                          <FiUser size={20} />
                        </div>
                      )}
                    </motion.div>

                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-secondary truncate max-w-[160px]">
                        {fullName}
                      </p>
                      <p className="text-xs text-secondary/60 truncate max-w-[180px]">
                        {userEmail}
                      </p>
                      <p className="text-xs text-green-500 mt-1 flex items-center">
                        <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5"></span>
                        Live Updates Active
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 py-1">
                    <motion.button
                      onClick={() => {
                        navigate("/settings");
                        setShowUserMenu(false);
                      }}
                      whileHover={{
                        x: 5,
                        backgroundColor: "rgba(249, 215, 105, 0.1)",
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-secondary hover:bg-primary/10 transition-colors"
                    >
                      <FiSettings
                        className="mr-2 text-secondary/60"
                        size={16}
                      />
                      Account Settings
                    </motion.button>
                    <motion.button
                      onClick={handleLogout}
                      whileHover={{
                        x: 5,
                        backgroundColor: "rgba(239, 68, 68, 0.05)",
                      }}
                      className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors"
                    >
                      <FiLogOut className="mr-3" size={16} />
                      Sign out
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className={`transition-all duration-300 ${contentClass} pt-16`}>
        <AnimatePresence mode="wait">
          {shouldShowVerificationCard && (
            <BusinessVerificationCard
              userData={userData}
              onNavigateToSettings={handleNavigateToSettings}
              onClose={handleCloseVerificationCard}
            />
          )}
        </AnimatePresence>

        <main className={cn(isGroupsPage && isMobile ? "" : "p-6")}>
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {showFloatingMenu && (
          <FloatingActionMenu options={floatingMenuOptions} className="z-50" />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
