import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiCreditCard, 
  FiBriefcase, 
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiCircle,
  FiUser,
  FiShield,
  FiSettings,
  FiMessageCircle
} from 'react-icons/fi';
import { assets } from '../../assets/assets';
import { get } from '../../utils/service';

import { IoChatbubblesSharp } from "react-icons/io5";

const Sidebar = ({ isOpen, toggleSidebar, userType = 'client' }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [campaignCount, setCampaignCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const navData = useMemo(() => [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <FiHome />,
      badge: null
    },
    {
      title: 'Wallet',
      path: '/wallet',
      icon: <FiCreditCard />,
      badge: null
    },
    {
      title: 'Campaigns',
      icon: <FiBriefcase />,
      badge: campaignCount > 0 ? campaignCount.toString() : null,
      children: [
        {
          title: 'My Campaigns',
          path: '/campaigns',
          icon: <FiCircle />,
        },
        {
          title: 'Create Campaign',
          path: '/campaigns/create',
          icon: <FiPlus />,
        }
      ],
    },
    {
      title: 'Groups',
      path: '/groups',
      icon: <IoChatbubblesSharp />,
      badge: null
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: <FiSettings />,
      badge: null
    }
  ], [campaignCount]);

  useEffect(() => {
    const fetchCampaignCount = async () => {
      try {
        const response = await get('campaigns/brandCampaigns');
        if (response?.data && Array.isArray(response.data)) {
          setCampaignCount(response.data.length);
        }
      } catch (error) {
        console.error('Error fetching campaign count:', error);
        setCampaignCount(0);
      }
    };

    fetchCampaignCount();
  }, []);

  const handleToggle = () => {
    toggleSidebar(!isOpen, true);
  };

  const toggleExpanded = (title) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleNavClick = (item) => {
    if (item.children) {
      toggleExpanded(item.title);
    }
  };

  useEffect(() => {
    navData.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          location.pathname === child.path
        );
        if (hasActiveChild) {
          setExpandedItems(prev => ({ ...prev, [item.title]: true }));
        }
      }
    });
  }, [location.pathname, navData]);

  const isParentActive = (item) => {
    if (!item.children) return false;
    return item.children.some(child => location.pathname === child.path);
  };

  return (
    <aside
      className={`
        bg-white/70 backdrop-blur-lg text-gray-700
        fixed left-0 top-0 bottom-0
        ${isOpen ? 'w-64' : 'w-16'}
        transition-all duration-300 ease-in-out
        shadow-xl border-r border-white/20
        flex flex-col z-40
        ${window.innerWidth < 768 && !isOpen ? '-translate-x-full' : ''}
      `}
      style={{ backdropFilter: 'blur(16px)' }}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>

      <div className="relative z-10 flex items-center justify-between h-20 px-4 border-b border-white/20">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-start w-full"
            >
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img 
                  src={assets.MainLogo} 
                  alt="Social Gems Logo" 
                  className="h-12 w-auto object-contain max-w-full"
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center mx-auto"
            >
              <motion.div 
                className="flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img 
                  src={assets.Logo} 
                  alt="Social Gems" 
                  className="h-8 w-8 object-contain"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg text-secondary hover:bg-primary/20 focus:outline-none transition-colors absolute right-4"
              aria-label="Collapse sidebar"
            >
              <FiChevronLeft size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <nav className="relative z-10 flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="px-2 text-xs font-semibold text-secondary/70 uppercase tracking-wider mb-4"
            >
              Navigation
            </motion.h2>
          )}
        </AnimatePresence>

        {navData.map((item, index) => (
          <motion.div 
            key={item.title} 
            className="space-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Main Navigation Item */}
            <div className="relative group">
              {item.path ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${isOpen ? 'px-3' : 'justify-center px-2'} py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-[#E8C547] text-secondary shadow-lg'
                        : isParentActive(item)
                        ? 'bg-primary/30 text-secondary'
                        : 'text-secondary hover:bg-primary/20 hover:shadow-md backdrop-blur-sm'
                    }`
                  }
                  end
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between flex-1 ml-3"
                      >
                        <span className="text-sm font-medium">{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs bg-secondary text-white px-2 py-0.5 rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </NavLink>
              ) : (
                <motion.button
                  onClick={() => handleNavClick(item)}
                  whileHover={{ x: isOpen ? 5 : 0, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center ${isOpen ? 'px-3' : 'justify-center px-2'} py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                    isParentActive(item)
                      ? 'bg-gradient-to-r from-primary to-[#E8C547] text-secondary shadow-lg'
                      : 'text-secondary hover:bg-primary/20 hover:shadow-md backdrop-blur-sm'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between flex-1 ml-3"
                      >
                        <span className="text-sm font-medium">{item.title}</span>
                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <span className="text-xs bg-secondary text-white px-2 py-0.5 rounded-full font-medium">
                              {item.badge}
                            </span>
                          )}
                          {item.children && (
                            <motion.span
                              animate={{ 
                                rotate: expandedItems[item.title] ? 90 : 0 
                              }}
                              transition={{ duration: 0.3 }}
                              className="ml-auto"
                            >
                              <FiChevronRight className="w-4 h-4" />
                            </motion.span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}

              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-secondary text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                  {item.title}
                  {item.badge && (
                    <span className="ml-1 bg-primary text-secondary px-1.5 py-0.5 rounded-full text-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </div>

            <AnimatePresence>
              {item.children && isOpen && expandedItems[item.title] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-6 space-y-1 overflow-hidden"
                >
                  {item.children.map((child, childIndex) => (
                    <motion.div
                      key={child.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: childIndex * 0.1 }}
                    >
                      <NavLink
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-secondary text-white shadow-md'
                              : 'text-secondary/80 hover:bg-primary/15 hover:text-secondary backdrop-blur-sm'
                          }`
                        }
                        end
                      >
                        <motion.span 
                          className="text-sm flex-shrink-0"
                          whileHover={{ scale: 1.1 }}
                        >
                          {child.icon}
                        </motion.span>
                        <span className="text-sm font-medium">{child.title}</span>
                      </NavLink>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {item.children && !isOpen && (
              <div className="flex justify-center mt-1">
                <div className={`w-1 h-1 rounded-full ${
                  isParentActive(item) ? 'bg-primary' : 'bg-secondary/30'
                }`}></div>
              </div>
            )}
          </motion.div>
        ))}
      </nav>

      <div className="relative z-10 border-t border-white/20 bg-secondary/5 backdrop-blur-sm">
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="px-4 py-3"
            >
              <div className="text-center">
                <p className="text-xs text-secondary/70 mb-1">
                  © {currentYear} Social Gems Business
                </p>
                <p className="text-xs text-secondary/50">
                  Version 1.0.0
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center py-3"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-[#E8C547] rounded-md flex items-center justify-center">
                <span className="text-secondary font-bold text-xs">©</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};

export default Sidebar;