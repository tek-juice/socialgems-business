import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBriefcase, 
  FiCreditCard, 
  FiTrendingUp, 
  FiUsers, 
  FiPlus, 
  FiEye,
  FiActivity,
  FiDollarSign,
  FiTarget,
  FiAward,
  FiArrowUpRight,
  FiArrowDownRight,
  FiBarChart,
  FiPieChart,
  FiStar,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiCalendar,
  FiSettings,
  FiFileText,
  FiEdit,
  FiTrash2,
  FiGrid,
  FiMapPin,
  FiInfo
} from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { get } from '../utils/service';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// ============= UTILITY FUNCTION =============
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

// ============= CAMPAIGN DESCRIPTION COMPONENT =============
const CampaignDescription = ({ description, wordLimit = 20, className = "" }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Function to extract first N words from HTML content
  const getPreview = (html, wordLimit) => {
    if (!html) return { text: 'No description available', isTruncated: false };
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.trim().split(/\s+/);
    const isTruncated = words.length > wordLimit;
    const preview = words.slice(0, wordLimit).join(' ');
    return {
      text: preview + (isTruncated ? '...' : ''),
      isTruncated
    };
  };

  const preview = getPreview(description, wordLimit);

  return (
    <div className={className}>
      {!expanded ? (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {preview.text}{' '}
          {preview.isTruncated && (
            <button
              onClick={() => setExpanded(true)}
              className="text-secondary text-xs font-bold hover:underline"
            >
              Read More
            </button>
          )}
        </p>
      ) : (
        <div>
          <div
            className="text-gray-600 text-xs mb-3 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />
          <button
            onClick={() => setExpanded(false)}
            className="text-secondary text-xs font-bold hover:underline"
          >
            Read Less
          </button>
        </div>
      )}
    </div>
  );
};

// ============= SKELETON COMPONENTS =============
const SkeletonLine = ({ className }) => (
  <div className={cn("bg-gray-200 rounded animate-pulse", className)} />
);

const SkeletonCircle = ({ className }) => (
  <div className={cn("bg-gray-200 rounded-full animate-pulse", className)} />
);

const SkeletonButton = ({ className }) => (
  <div className={cn("bg-gray-200 rounded-lg animate-pulse", className)} />
);

const SkeletonCard = ({ className, children }) => (
  <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200", className)}>
    {children}
  </div>
);

// ============= SIMPLE CAMPAIGN CARDS COMPONENT =============
const CampaignCard = ({ campaign, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Open To Applications': return 'bg-primary-scale-100 text-primary-scale-700 border-primary-scale-200';
      case 'Closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const status = getStatusName(campaign);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(campaign)}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-[#E8C547] flex items-center justify-center">
            <FiBriefcase className="w-4 h-4 text-secondary" />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">
            {truncateText(campaign.title || 'Untitled Campaign', 20)}
          </h4>
        </div>
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium border",
          getStatusColor(status)
        )}>
          {status}
        </span>
      </div>
      
      <CampaignDescription 
        description={campaign.description} 
        wordLimit={15}
      />
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <FiCalendar className="w-3 h-3" />
          <span>{format(new Date(campaign.start_date), 'MMM dd, yyyy')}</span>
        </div>
        <FiArrowUpRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
};

const CampaignTable = ({ campaigns, onCampaignClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Open to Applications': return 'bg-primary-scale-100 text-primary-scale-700';
      case 'Closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Campaign</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Start Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.slice(0, 3).map((campaign, index) => {
              const status = getStatusName(campaign);
              return (
                <motion.tr
                  key={campaign.campaign_id || index}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  onClick={() => onCampaignClick(campaign)}
                  className="border-b border-gray-100 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-[#E8C547] flex items-center justify-center flex-shrink-0">
                        <FiBriefcase className="w-3 h-3 text-secondary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {truncateText(campaign.title || 'Untitled Campaign', 25)}
                        </p>
                        <div className="max-w-xs">
                          <CampaignDescription 
                            description={campaign.description} 
                            wordLimit={8}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getStatusColor(status)
                    )}>
                      {status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {format(new Date(campaign.start_date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1 text-secondary hover:text-[#5A3C19] text-xs font-medium"
                    >
                      <span>View</span>
                      <FiArrowUpRight className="w-3 h-3" />
                    </motion.button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CampaignGrid = ({ campaigns, onCampaignClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {campaigns.slice(0, 3).map((campaign, index) => (
        <div 
          key={campaign.campaign_id || index} 
          className={index === 2 ? 'md:col-span-2' : ''}
        >
          <CampaignCard
            campaign={campaign}
            onClick={onCampaignClick}
          />
        </div>
      ))}
    </div>
  );
};

// ============= BADGE COMPONENT =============
const Badge = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "border-transparent bg-gradient-to-r from-primary to-[#E8C547] text-secondary hover:from-[#E8C547] hover:to-primary",
    secondary: "border-transparent bg-secondary text-white hover:bg-secondary/80",
    outline: "text-secondary border-primary",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        variants[variant],
        className
      )} 
      {...props} 
    />
  );
};

// ============= CARD COMPONENTS =============
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// ============= AVATAR CONFIGURATION =============
const AVATAR_CONFIG = {
  size: 60,
  gap: 1,             
  imageSize: 50,     
  expandedWidth: 180,
  maxVisible: 5,     
};

// Memoized Avatar Component with improved hover functionality
const Avatar = memo(({ 
  avatar, 
  idx, 
  size = AVATAR_CONFIG.size,
  gradientFrom = '#F9D769',
  gradientTo = '#734D20'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const imageMargin = (AVATAR_CONFIG.size - AVATAR_CONFIG.imageSize) / 2;

  return (
    <motion.li
      whileHover={{ scale: 1.05 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        '--gradient-from': gradientFrom, 
        '--gradient-to': gradientTo,
        height: `${AVATAR_CONFIG.size}px`,
        width: isHovered ? `${AVATAR_CONFIG.expandedWidth}px` : `${AVATAR_CONFIG.size}px`
      }}
      className="relative rounded-full flex items-center justify-start cursor-pointer overflow-hidden border border-gray-100 transition-all duration-300 shadow-lg"
    >
      {/* Background gradient that shows on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* White background when not hovered */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-white transition-opacity duration-300",
          isHovered ? "opacity-0" : "opacity-100"
        )}
      />
      
      <div 
        style={{ 
          width: `${AVATAR_CONFIG.imageSize}px`,
          height: `${AVATAR_CONFIG.imageSize}px`,
          marginLeft: `${imageMargin}px`
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
      </div>
      
      {isHovered && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 flex flex-col justify-center ml-3 text-white overflow-hidden"
        >
          <span className="text-xs font-semibold whitespace-nowrap">
            {avatar.label}
          </span>
          <span className="text-[10px] opacity-90 capitalize whitespace-nowrap">
            {avatar.status}
          </span>
        </motion.div>
      )}
    </motion.li>
  );
});

Avatar.displayName = 'Avatar';

// Plus Counter Component
const PlusCounter = memo(({ count, onClick, gradientFrom = '#F9D769', gradientTo = '#734D20' }) => {
  return (
    <motion.li
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ 
        '--gradient-from': gradientFrom, 
        '--gradient-to': gradientTo,
        width: `${AVATAR_CONFIG.size}px`,
        height: `${AVATAR_CONFIG.size}px`
      }}
      className="relative rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] shadow-lg" />
      
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
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: Math.min(5, maxVisible) }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
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
      <div className="flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-3 flex items-center justify-center">
            <FiPlus className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600 text-sm font-medium">No influencers data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-1">
        {visibleAvatars.map((avatar, idx) => (
          <Avatar
            key={`${avatar.label}-${idx}`}
            avatar={avatar}
            idx={idx}
            size={size}
            gradientFrom='#F9D769'
            gradientTo='#734D20'
          />
        ))}
        
        {avatars.length > maxVisible && extraCount > 0 && (
          <PlusCounter 
            count={extraCount}
            onClick={onShowMore}
            gradientFrom='#F9D769'
            gradientTo='#734D20'
          />
        )}
      </ul>
    </div>
  );
});

AvatarGroup.displayName = 'AvatarGroup';

// TopInfluencers Component with dynamic height
const TopInfluencers = memo(({ influencersData, loading, onRefresh }) => {
  const [maxVisible, setMaxVisible] = useState(AVATAR_CONFIG.maxVisible);

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
        gradientFrom: '#F9D769',
        gradientTo: '#734D20'
      };
    });
  }, []);

  const handleShowMore = useCallback(() => {
    const transformedData = transformInfluencersData(influencersData);
    const newMaxVisible = Math.min(maxVisible + 5, transformedData.length);
    setMaxVisible(newMaxVisible);
  }, [maxVisible, influencersData, transformInfluencersData]);

  const transformedData = transformInfluencersData(influencersData);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <FiStar className="w-6 h-6 text-secondary" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Top Performers</h3>
          <p className="text-gray-600 text-sm">Most active campaign participants</p>
        </div>
      </div>
      <AvatarGroup
        avatars={transformedData}
        maxVisible={maxVisible}
        size={AVATAR_CONFIG.size}
        loading={loading}
        onShowMore={handleShowMore}
      />
    </div>
  );
});

TopInfluencers.displayName = 'TopInfluencers';

// Helper functions for campaigns
const getStatusName = (campaign) => {
  if (campaign.closed_date) return 'Closed';
  const endDate = new Date(campaign.end_date);
  const startDate = new Date(campaign.start_date);
  const now = new Date();
  
  if (now < startDate) return 'Open to Applications';
  if (now > endDate) return 'Completed';
  return 'Active';
};

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('name') || 'User';
  const displayName = userName.split(' ')[0];

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [brandStats, setBrandStats] = useState({
    total_campaigns: 0,
    total_completed_users: 0,
    total_paid_users: 0,
    total_amount_spent: 0,
    actioned_users_top: []
  });

  const fetchCampaigns = async () => {
    try {
      const response = await get('campaigns/brandCampaigns');
      if (response?.data) {
        setCampaigns(response.data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    }
  };

  const fetchBrandStats = async () => {
    try {
      const response = await get('/campaigns/getBrandStats');
      if (response?.status === 200 && response.data) {
        setBrandStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching brand stats:', error);
      setBrandStats({
        total_campaigns: 156,
        total_completed_users: 89,
        total_paid_users: 67,
        total_amount_spent: 48250,
        actioned_users_top: [
          {
            invite_status: 'accepted',
            action_status: 'completed',
            action_date: new Date().toISOString(),
            first_name: 'Sarah',
            last_name: 'Wilson',
            profile_pic: ''
          },
          {
            invite_status: 'accepted',
            action_status: 'completed',
            action_date: new Date().toISOString(),
            first_name: 'Mike',
            last_name: 'Johnson',
            profile_pic: ''
          },
          {
            invite_status: 'accepted',
            action_status: 'pending',
            action_date: new Date().toISOString(),
            first_name: 'Emma',
            last_name: 'Davis',
            profile_pic: ''
          }
        ]
      });
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCampaigns(),
          fetchBrandStats()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchCampaigns(),
        fetchBrandStats()
      ]);
      toast.success('Dashboard refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateCampaign = () => {
    navigate('/campaigns/create');
  };

  const handleViewCampaigns = () => {
    navigate('/campaigns');
  };

  const handleViewCampaign = (campaign) => {
    navigate(`/campaigns/${campaign.campaign_id}`, {
      state: { campaign }
    });
  };

  const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      const timer = setTimeout(() => {
        const increment = value / 50;
        const interval = setInterval(() => {
          setDisplayValue(prev => {
            const next = prev + increment;
            if (next >= value) {
              clearInterval(interval);
              return value;
            }
            return next;
          });
        }, 30);
        return () => clearInterval(interval);
      }, 200);

      return () => clearTimeout(timer);
    }, [value]);

    return (
      <span>
        {prefix}{Math.floor(displayValue).toLocaleString()}{suffix}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-10"
          >
            {/* Header Section Skeleton */}
            <div className="flex gap-4 flex-col items-start">
              <SkeletonButton className="h-6 w-40" />
              <div className="flex gap-2 flex-col">
                <SkeletonLine className="h-12 w-80" />
                <SkeletonLine className="h-6 w-96" />
              </div>
              <SkeletonButton className="h-12 w-32" />
            </div>

            {/* Row 1: Campaign Overview + Right Column Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Campaign Overview Skeleton */}
              <div className="lg:col-span-2 bg-gray-200 rounded-xl p-8 animate-pulse min-h-[320px]">
                <SkeletonCircle className="w-8 h-8 mb-6" />
                <div className="flex flex-col">
                  <SkeletonLine className="h-8 w-64 mb-3" />
                  <SkeletonLine className="h-5 w-96 mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/25 rounded-xl p-6">
                      <SkeletonLine className="h-4 w-24 mb-2" />
                      <SkeletonLine className="h-8 w-16 mb-2" />
                      <div className="flex items-center">
                        <SkeletonCircle className="w-4 h-4 mr-1" />
                        <SkeletonLine className="h-4 w-20" />
                      </div>
                    </div>
                    <div className="bg-white/25 rounded-xl p-6">
                      <SkeletonLine className="h-4 w-20 mb-2" />
                      <SkeletonLine className="h-8 w-12 mb-2" />
                      <div className="flex items-center">
                        <SkeletonCircle className="w-4 h-4 mr-1" />
                        <SkeletonLine className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column Skeleton */}
              <div className="flex flex-col gap-8">
                {/* Total Investment Skeleton */}
                <div className="bg-gray-800 rounded-xl p-6 min-h-[150px]">
                  <SkeletonCircle className="w-6 h-6 mb-4" />
                  <div className="flex flex-col">
                    <SkeletonLine className="h-5 w-32 mb-1" />
                    <SkeletonLine className="h-4 w-40 mb-3" />
                    <SkeletonLine className="h-6 w-20" />
                  </div>
                </div>

                {/* Completed Tasks Skeleton */}
                <SkeletonCard className="p-6 min-h-[150px]">
                  <SkeletonCircle className="w-6 h-6 mb-4" />
                  <div className="flex flex-col">
                    <SkeletonLine className="h-5 w-36 mb-1" />
                    <SkeletonLine className="h-4 w-48 mb-3" />
                    <SkeletonLine className="h-6 w-16" />
                  </div>
                </SkeletonCard>
              </div>
            </div>

            {/* Top Performers Skeleton */}
            <SkeletonCard className="p-8 w-full">
              <div className="flex items-center gap-3 mb-4">
                <SkeletonCircle className="w-6 h-6" />
                <div>
                  <SkeletonLine className="h-5 w-32 mb-1" />
                  <SkeletonLine className="h-4 w-48" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonCircle key={idx} className="w-16 h-16" />
                ))}
              </div>
            </SkeletonCard>

            {/* Bottom Row Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Campaign History Skeleton */}
              <SkeletonCard className="lg:col-span-2 p-8 min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <SkeletonCircle className="w-5 h-5" />
                    <div>
                      <SkeletonLine className="h-5 w-36 mb-1" />
                      <SkeletonLine className="h-4 w-40" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <SkeletonButton className="h-8 w-20" />
                    <SkeletonButton className="h-8 w-24" />
                  </div>
                </div>
                
                {/* Table Skeleton */}
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 border-b pb-3">
                    <SkeletonLine className="h-4 w-20" />
                    <SkeletonLine className="h-4 w-16" />
                    <SkeletonLine className="h-4 w-20" />
                    <SkeletonLine className="h-4 w-16" />
                  </div>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <SkeletonCircle className="w-6 h-6" />
                        <div>
                          <SkeletonLine className="h-4 w-32 mb-1" />
                          <SkeletonLine className="h-3 w-40" />
                        </div>
                      </div>
                      <SkeletonButton className="h-6 w-16" />
                      <SkeletonLine className="h-4 w-24" />
                      <SkeletonButton className="h-6 w-12" />
                    </div>
                  ))}
                </div>
              </SkeletonCard>

              {/* Quick Actions Skeleton */}
              <div className="bg-gray-800 rounded-xl p-8 min-h-[400px]">
                <SkeletonCircle className="w-8 h-8 mb-6" />
                <div className="flex flex-col">
                  <SkeletonLine className="h-5 w-28 mb-3" />
                  <SkeletonLine className="h-4 w-56 mb-6" />
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-white/10">
                        <SkeletonCircle className="w-5 h-5" />
                        <div className="flex-1">
                          <SkeletonLine className="h-4 w-32 mb-1" />
                          <SkeletonLine className="h-3 w-40" />
                        </div>
                        <SkeletonCircle className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          {/* Header Section */}
          <div className="flex gap-4 flex-col items-start">
            <div className="flex gap-2 flex-col">
              <h2 className="text-2xl md:text-4xl tracking-tighter max-w-4xl font-regular text-left text-gray-900">
                Welcome back, {displayName} 👋
              </h2>
              <p className="text-lg max-w-xl lg:max-w-2xl leading-relaxed tracking-tight text-gray-600 text-left">
                Here's your campaign performance overview and key metrics at a glance.
              </p>
            </div>
            {/* <motion.button
              onClick={handleRefresh}
              disabled={refreshing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-[#E8C547] text-secondary rounded-xl hover:from-[#E8C547] hover:to-primary transition-all duration-300 font-medium shadow-lg ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
              >
                <FiRefreshCw className="w-4 h-4" />
              </motion.div>
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </motion.button> */}
          </div>

          {/* Row 1: Campaign Overview (left) | Total Investment (top right) + Completed Tasks (bottom right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Campaign Overview - Takes 2/3 width */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-primary to-[#E8C547] rounded-xl lg:col-span-2 p-8 flex justify-between flex-col shadow-lg min-h-[320px]"
            >
              <FiBriefcase className="w-5 h-5 sm:w-8 sm:h-8 stroke-1 text-secondary" />
              <div className="flex flex-col">
                <h3 className="text-2xl lg:text-3xl tracking-tight font-bold text-secondary mb-3">
                  Campaign Overview
                </h3>
                <p className="text-secondary/80 max-w-md text-base leading-relaxed mb-6">
                  Monitor your active campaigns, completed tasks, and overall performance metrics in real-time.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/25 backdrop-blur-sm rounded-xl p-6">
                    <p className="text-secondary/70 text-sm font-medium mb-2">Total Campaigns</p>
                    <p className="text-3xl font-bold text-secondary">
                      <AnimatedCounter value={brandStats.total_campaigns} />
                    </p>
                    <div className="flex items-center mt-2">
                      <FiTrendingUp className="w-4 h-4 text-secondary/70 mr-1" />
                      <span className="text-secondary/70 text-sm font-medium">+12% this month</span>
                    </div>
                  </div>
                  <div className="bg-white/25 backdrop-blur-sm rounded-xl p-6">
                    <p className="text-secondary/70 text-sm font-medium mb-2">Active Users</p>
                    <p className="text-3xl font-bold text-secondary">
                      <AnimatedCounter value={brandStats.total_completed_users} />
                    </p>
                    <div className="flex items-center mt-2">
                      <FiUsers className="w-4 h-4 text-secondary/70 mr-1" />
                      <span className="text-secondary/70 text-sm font-medium">Engaged users</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Stack Total Investment and Completed Tasks */}
            <div className="flex flex-col gap-8">
              {/* Total Investment Card */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-secondary rounded-xl p-6 flex justify-between flex-col shadow-lg min-h-[150px]"
              >
                <FiDollarSign className="w-6 h-6 stroke-1 text-white" />
                <div className="flex flex-col">
                  <h3 className="text-lg tracking-tight font-semibold text-white mb-1">Total Investment</h3>
                  <p className="text-white/80 text-sm mb-3">
                    Your total campaign spend
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    $<AnimatedCounter value={brandStats.total_amount_spent} />
                  </p>
                </div>
              </motion.div>

              {/* Completed Tasks Card */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 flex justify-between flex-col shadow-lg border border-gray-200 min-h-[150px]"
              >
                <FiCheckCircle className="w-6 h-6 stroke-1 text-secondary" />
                <div className="flex flex-col">
                  <h3 className="text-lg tracking-tight font-semibold text-gray-900 mb-1">Completed Tasks</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Successfully completed campaigns
                  </p>
                  <p className="text-2xl font-bold text-secondary">
                    <AnimatedCounter value={brandStats.total_completed_users} />
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Row 2: Top Performers - Full Width with dynamic height */}
          {brandStats.actioned_users_top && brandStats.actioned_users_top.length > 0 && (
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 w-full"
            >
              <TopInfluencers 
                influencersData={brandStats.actioned_users_top}
                loading={loading}
                onRefresh={handleRefresh}
              />
            </motion.div>
          )}

          {/* Row 3: Campaign History (left) + Quick Actions (right) - Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Campaign History - Takes 2/3 width */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl lg:col-span-2 p-8 flex justify-between flex-col shadow-lg border border-gray-200 min-h-[400px] overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FiGrid className="w-5 h-5 stroke-1 text-secondary" />
                  <div>
                    <h3 className="text-xl tracking-tight font-semibold text-gray-900">Campaign History</h3>
                    <p className="text-gray-600 text-sm">
                      {campaigns.length === 0 
                        ? 'No campaigns created yet' 
                        : `${campaigns.length} campaigns created`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {campaigns.length > 0 && (
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('table')}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                          viewMode === 'table' 
                            ? "bg-white text-secondary shadow-sm" 
                            : "text-gray-600 hover:text-secondary"
                        )}
                      >
                        <FiFileText className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                          viewMode === 'grid' 
                            ? "bg-white text-secondary shadow-sm" 
                            : "text-gray-600 hover:text-secondary"
                        )}
                      >
                        <FiGrid className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <motion.button
                    onClick={handleCreateCampaign}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-[#E8C547] text-secondary rounded-lg hover:from-[#E8C547] hover:to-primary transition-all duration-300 font-medium text-sm"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Campaign
                  </motion.button>
                  {campaigns.length > 0 && (
                    <motion.button
                      onClick={handleViewCampaigns}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 border border-primary text-secondary rounded-lg hover:bg-primary/10 transition-all duration-300 font-medium text-sm"
                    >
                      <FiEye className="w-4 h-4" />
                      View All
                    </motion.button>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                {campaigns.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-[#E8C547]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiBriefcase className="w-8 h-8 text-secondary" />
                      </div>
                      <h4 className="text-lg font-semibold text-secondary mb-2">No Campaigns Yet</h4>
                      <p className="text-gray-500 text-sm mb-4 max-w-md">
                        Start your marketing journey by creating your first campaign. Track performance and engage with your audience.
                      </p>
                      <motion.button
                        onClick={handleCreateCampaign}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-[#E8C547] text-secondary rounded-lg hover:from-[#E8C547] hover:to-primary transition-all duration-300 font-medium mx-auto"
                      >
                        <FiPlus className="w-4 h-4" />
                        Create Your First Campaign
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    {viewMode === 'table' ? (
                      <CampaignTable 
                        campaigns={campaigns}
                        onCampaignClick={handleViewCampaign}
                      />
                    ) : (
                      <CampaignGrid 
                        campaigns={campaigns}
                        onCampaignClick={handleViewCampaign}
                      />
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions Card - Right side matching height */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 flex justify-between flex-col shadow-lg min-h-[400px]"
            >
              <FiActivity className="w-8 h-8 stroke-1 text-white" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight font-semibold text-white mb-3">Quick Actions</h3>
                <p className="text-gray-300 text-sm mb-6">
                  Essential tools to manage your campaigns efficiently.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { 
                      icon: FiPlus, 
                      label: 'Create New Campaign', 
                      description: 'Launch a new marketing campaign',
                      onClick: handleCreateCampaign
                    },
                    { 
                      icon: FiEye, 
                      label: 'View All Campaigns', 
                      description: 'Browse your campaign portfolio',
                      onClick: handleViewCampaigns
                    }
                  ].map((action, index) => (
                    <motion.button
                      key={action.label}
                      onClick={action.onClick}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 text-left"
                    >
                      <action.icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white text-sm">{action.label}</p>
                        <p className="text-gray-400 text-xs">{action.description}</p>
                      </div>
                      <FiArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}