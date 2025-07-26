"use client"
import * as React from "react"
import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { get } from '../utils/service';
import { toast } from 'sonner';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';

// ============= CONFIGURATION - EDIT HERE =============
const AVATAR_CONFIG = {
  size: 60,
  gap: 1,             
  imageSize: 50,     
  expandedWidth: 180,
  maxVisible: 2,     
};
// ====================================================

// Animation variants for smooth transitions (slower)
const avatarVariants = {
  initial: {
    width: AVATAR_CONFIG.size,
    paddingLeft: 0,
    paddingRight: 0,
  },
  expanded: {
    width: AVATAR_CONFIG.expandedWidth,
    paddingLeft: 1,
    paddingRight: 16,
  },
};

const textVariants = {
  initial: { 
    opacity: 0, 
    x: -20,
    width: 0,
  },
  expanded: { 
    opacity: 1, 
    x: 0,
    width: "auto",
  },
};

const transition = { 
  type: "spring", 
  bounce: 0.1, 
  duration: 0.9  // Slower transition
};

// Memoized Avatar Component with hover and click functionality
const Avatar = memo(({ 
  avatar, 
  idx, 
  size = AVATAR_CONFIG.size,
  gradientFrom = '#F9D769',
  gradientTo = '#734D20'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  // Click functionality for mobile/touch devices
  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const imageMargin = (AVATAR_CONFIG.size - AVATAR_CONFIG.imageSize) / 2;

  return (
    <motion.li
      variants={avatarVariants}
      initial="initial"
      animate={isExpanded ? "expanded" : "initial"}
      transition={transition}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleToggle}
      style={{ 
        '--gradient-from': gradientFrom, 
        '--gradient-to': gradientTo,
        height: `${AVATAR_CONFIG.size}px`
      }}
      className="relative bg-white shadow-lg rounded-full flex items-center justify-start cursor-pointer overflow-hidden border border-gray-100"
    >
      {/* Gradient background that appears on expand */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)]"
      />
      
      {/* Animated glow effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isExpanded ? 0.5 : 0,
          scale: isExpanded ? 1.1 : 0.8
        }}
        transition={{ duration: 0.6 }}
        className="absolute -inset-1 rounded-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] blur-lg -z-10"
      />
      
      {/* Avatar Image Container - centered initially, then with consistent padding */}
      <motion.div 
        initial={{ marginLeft: `${imageMargin}px` }}
        animate={{ marginLeft: `${imageMargin}px` }}
        transition={transition}
        style={{ 
          width: `${AVATAR_CONFIG.imageSize}px`,
          height: `${AVATAR_CONFIG.imageSize}px`
        }}
        className="relative z-10 rounded-full overflow-hidden flex-shrink-0"
      >
        {!imageLoaded && (
          <div className="w-full h-full bg-gray-300 animate-pulse rounded-full"></div>
        )}
        
        {!imageError && avatar.src ? (
          <img
            src={avatar.src}
            alt={avatar.alt || `Avatar ${idx + 1}`}
            className={`w-full h-full object-cover rounded-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
            {avatar.initials}
          </div>
        )}
      </motion.div>
      
      {/* Expandable Text Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={textVariants}
            initial="initial"
            animate="expanded"
            exit="initial"
            transition={transition}
            className="relative z-10 flex flex-col justify-center ml-3 text-white overflow-hidden"
          >
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-xs font-semibold whitespace-nowrap"
            >
              {avatar.label}
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-[10px] opacity-90 capitalize whitespace-nowrap"
            >
              {avatar.status}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
});

Avatar.displayName = 'Avatar';

// Plus Counter Component
const PlusCounter = memo(({ count, onClick, gradientFrom = '#F9D769', gradientTo = '#734D20' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.li
      style={{ 
        '--gradient-from': gradientFrom, 
        '--gradient-to': gradientTo,
        width: `${AVATAR_CONFIG.size}px`,
        height: `${AVATAR_CONFIG.size}px`
      }}
      className="relative rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Base gradient background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] shadow-lg" />
      
      {/* Animated glow effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isHovered ? 0.6 : 0,
          scale: isHovered ? 1.2 : 0.8
        }}
        transition={{ duration: 0.4 }}
        className="absolute -inset-1 rounded-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] blur-lg -z-10"
      />
      
      <button
        onClick={onClick}
        className="relative z-10 w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xs hover:text-gray-100 transition-colors"
      >
        +{count}
      </button>
    </motion.li>
  );
});

PlusCounter.displayName = 'PlusCounter';

// Memoized AvatarGroup Component
const AvatarGroup = memo(({
  avatars = [],
  maxVisible = AVATAR_CONFIG.maxVisible,
  size = AVATAR_CONFIG.size,
  loading = false,
  onShowMore
}) => {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const extraCount = Math.max(0, avatars.length - maxVisible);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className={`flex flex-wrap gap-${AVATAR_CONFIG.gap}`}>
          {Array.from({ length: Math.min(5, maxVisible) }).map((_, idx) => (
            <motion.div
              key={`skeleton-${idx}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              style={{ 
                width: `${AVATAR_CONFIG.size}px`,
                height: `${AVATAR_CONFIG.size}px`
              }}
              className="bg-gradient-to-r from-primary to-secondary animate-pulse rounded-full opacity-50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (avatars.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-3 flex items-center justify-center">
            <FiPlus className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600 text-sm font-medium">No influencers data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <ul className={`flex flex-wrap gap-${AVATAR_CONFIG.gap}`}>
        <AnimatePresence>
          {visibleAvatars.map((avatar, idx) => (
            <motion.div
              key={`${avatar.label}-${idx}`}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Avatar
                avatar={avatar}
                idx={idx}
                size={size}
                gradientFrom='#F9D769'
                gradientTo='#734D20'
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Plus Counter - Only show when there are more than maxVisible avatars */}
        {avatars.length > maxVisible && extraCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: visibleAvatars.length * 0.1 }}
          >
            <PlusCounter 
              count={extraCount}
              onClick={onShowMore}
              gradientFrom='#F9D769'
              gradientTo='#734D20'
            />
          </motion.div>
        )}
      </ul>
      
    </div>
  );
});

AvatarGroup.displayName = 'AvatarGroup';

const TopInfluencers = () => {
  const [loading, setLoading] = useState(true);
  const [influencersData, setInfluencersData] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [maxVisible, setMaxVisible] = useState(AVATAR_CONFIG.maxVisible);

  // Single gradient color
  const gradientColor = { from: '#F9D769', to: '#734D20' };

  // Transform API data to AvatarGroup format with optimizations
  const transformInfluencersData = useCallback((apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];
    
    return apiData.map((user, index) => {
      return {
        src: user.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}+${encodeURIComponent(user.last_name)}&background=F9D769&color=734D20&size=128&rounded=true`,
        label: `${user.first_name} ${user.last_name}`,
        alt: `${user.first_name} ${user.last_name} - ${user.action_status}`,
        initials: `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase(),
        status: user.action_status,
        actionDate: user.action_date,
        gradientFrom: gradientColor.from,
        gradientTo: gradientColor.to
      };
    });
  }, []);

  // Optimized fetch function
  const fetchTopInfluencers = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await get('/campaigns/getBrandStats');
      
      if (response?.status === 200 && response.data?.actioned_users_top) {
        const transformedData = transformInfluencersData(response.data.actioned_users_top);
        setInfluencersData(transformedData);
        if (showToast) {
          toast.success('Influencers data refreshed successfully!');
        }
      } else {
        throw new Error('No influencers data found');
      }
    } catch (error) {
      console.error('Error fetching top influencers:', error);
      setError(error.message);
      setInfluencersData([]);
      
      if (showToast) {
        toast.error('Failed to fetch influencers data.');
      }
    } finally {
      setLoading(false);
    }
  }, [transformInfluencersData]);

  // Refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTopInfluencers(true);
    setRefreshing(false);
  }, [fetchTopInfluencers]);

  // Show more function - actually expands to show more influencers
  const handleShowMore = useCallback(() => {
    const newMaxVisible = Math.min(maxVisible + 5, influencersData.length);
    setMaxVisible(newMaxVisible);
  }, [maxVisible, influencersData.length]);

  useEffect(() => {
    fetchTopInfluencers();
  }, [fetchTopInfluencers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Top Influencers</h2>
          <p className="text-gray-600 text-sm mt-1">Most active users in your campaigns</p>
        </div>
        
      </div>
      
      {/* Avatar Group */}
      <AvatarGroup
        avatars={influencersData}
        maxVisible={maxVisible}
        size={AVATAR_CONFIG.size}
        loading={loading}
        onShowMore={handleShowMore}
      />
      
      {/* Error Message */}
      {error && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4"
        >
          <p className="text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export { AvatarGroup, TopInfluencers };