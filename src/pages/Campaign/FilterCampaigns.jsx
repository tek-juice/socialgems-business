import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDollarSign, 
  FiCalendar, 
  FiUsers, 
  FiStar, 
  FiBriefcase, 
  FiCheck,
  FiX,
  FiRefreshCw,
  FiInfo,
  FiFilter,
  FiTarget,
  FiTrendingUp,
  FiArrowLeft,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiAward,
  FiPlay,
  FiFileText,
  FiImage,
  FiHeart,
  FiEye,
  FiHash
} from 'react-icons/fi';
import { get, post } from '../../utils/service';

// Utility function
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Button-style GridList Components
const GridList = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "flex gap-3 overflow-auto rounded-md bg-white text-black outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const GridListItem = ({ children, className, value, isSelected, onSelect, ...props }) => {
  return (
    <button
      type="button"
      className={cn(
        "relative items-center justify-center px-5 py-2 text-xs font-medium rounded-lg transition-all duration-200 outline-none focus:outline-none focus:ring-2 focus:ring-yellow-400",
        isSelected 
          ? "bg-yellow-400 text-black shadow-md" 
          : "bg-gray-200 text-gray-500 hover:bg-gray-300",
        className
      )}
      onClick={() => onSelect?.(value)}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom hook for click outside
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};

// Skeleton Components
const DropdownSkeleton = () => (
  <div className="space-y-2">
    <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
    <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
  </div>
);

const GridSkeleton = ({ count = 6 }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="flex flex-wrap gap-3">
      {[...Array(count)].map((_, index) => (
        <div 
          key={index}
          className="px-5 py-2 bg-gray-200 rounded-lg animate-pulse"
        >
          <div className="h-4 w-16 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

const SocialPlatformCardSkeleton = () => (
  <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 bg-white">
    <div className="flex justify-between items-start gap-2">
      <div className="w-4 h-4 bg-gray-300 rounded border-2 animate-pulse"></div>
      <div className="w-8 h-8 bg-gray-300 rounded-lg animate-pulse"></div>
    </div>
    <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
    <div className="space-y-2">
      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
      <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  </div>
);

const EligibilityResultsSkeleton = () => (
  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 shadow-sm">
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-lg animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 w-48 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Multi-select dropdown component
const MultiSelectDropdown = ({ 
  options, 
  selectedValues, 
  onSelectionChange, 
  placeholder, 
  label,
  icon: Icon,
  autoRefresh = false,
  onAutoRefresh
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option => 
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleToggleOption = useCallback((optionId) => {
    onSelectionChange(prev => {
      const newSelection = prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId];
      
      if (autoRefresh && onAutoRefresh) {
        setTimeout(() => onAutoRefresh(), 300);
      }
      
      return newSelection;
    });
  }, [onSelectionChange, autoRefresh, onAutoRefresh]);

  const handleSelectAll = useCallback(() => {
    const newSelection = options.map(option => option.id);
    onSelectionChange(newSelection);
    if (autoRefresh && onAutoRefresh) {
      setTimeout(() => onAutoRefresh(), 300);
    }
  }, [options, onSelectionChange, autoRefresh, onAutoRefresh]);

  const handleClearAll = useCallback(() => {
    onSelectionChange([]);
    if (autoRefresh && onAutoRefresh) {
      setTimeout(() => onAutoRefresh(), 300);
    }
  }, [onSelectionChange, autoRefresh, onAutoRefresh]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-medium text-black mb-2">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-3 text-left bg-white border border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-colors text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-gray-500" />}
            <span className="text-gray-700 truncate">
              {selectedValues.length === 0 
                ? placeholder 
                : `${selectedValues.length} selected`}
            </span>
          </div>
          {isOpen ? (
            <FiChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
          ) : (
            <FiChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-yellow-400"
              />
            </div>
            
            <div className="p-2 border-b border-gray-200 flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto">
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleToggleOption(option.id)}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedValues.includes(option.id) 
                      ? 'bg-yellow-400 border-yellow-400' 
                      : 'border-gray-300'
                  }`}>
                    {selectedValues.includes(option.id) && (
                      <FiCheck className="w-2 h-2 text-white" />
                    )}
                  </div>
                  <span className="text-xs text-gray-700">{option.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Social Platform Card Component
const SocialPlatformCard = memo(({ 
  platform, 
  isSelected,
  onToggle,
  followerCount,
  onFollowerChange,
  autoRefresh = false,
  onAutoRefresh
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleToggle = useCallback(() => {
    onToggle();
    if (autoRefresh && onAutoRefresh) {
      setTimeout(() => onAutoRefresh(), 300);
    }
  }, [onToggle, autoRefresh, onAutoRefresh]);

  const handleFollowerChange = useCallback((value) => {
    onFollowerChange(value);
    if (autoRefresh && onAutoRefresh) {
      setTimeout(() => onAutoRefresh(), 1000);
    }
  }, [onFollowerChange, autoRefresh, onAutoRefresh]);

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-lg border cursor-pointer transition-all shadow-sm p-4 ${
        isSelected 
          ? 'border-yellow-400 bg-yellow-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={handleToggle}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
          <FiCheck className="w-2 h-2 text-white" />
        </div>
      )}

      <div className="flex justify-between items-start gap-2">
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
          isSelected 
            ? 'border-yellow-400 bg-yellow-400' 
            : 'border-gray-300 bg-white'
        }`}>
          {isSelected && (
            <FiCheck className="w-2 h-2 text-white" />
          )}
        </div>
        
        <div className="w-8 h-8 rounded-lg overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="w-full h-full bg-gray-300 animate-pulse"></div>
          )}
          
          {!imageError && platform.logo ? (
            <img
              src={platform.logo}
              alt={platform.sm_name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
              {platform.sm_name?.[0]?.toUpperCase() || 'S'}
            </div>
          )}
        </div>
      </div>

      <div className={`text-sm font-medium ${
        isSelected ? 'text-yellow-700' : 'text-gray-700'
      }`}>
        {platform.sm_name}
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">Min. Followers</label>
        <input
          type="number"
          value={followerCount}
          onChange={(e) => handleFollowerChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          disabled={!isSelected}
          className={`w-full px-3 py-2 text-sm border rounded-lg transition-all ${
            isSelected 
              ? 'border-yellow-200 bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200' 
              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
          placeholder="50"
          min="0"
        />
      </div>
    </div>
  );
});

SocialPlatformCard.displayName = 'SocialPlatformCard';

const FilterCampaigns = ({ 
  onFilterChange, 
  onCheckEligibility,
  loading = false,
  eligibilityResults = null,
  onBackToCampaigns,
  campaignId = '',
  startDate = '',
  endDate = ''
}) => {
  const [socialSites, setSocialSites] = useState([]);
  const [socialFollowers, setSocialFollowers] = useState({});
  const [fetchingSites, setFetchingSites] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [fetchingIndustries, setFetchingIndustries] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState(['UG']);
  const [selectedGender, setSelectedGender] = useState('any');
  const [selectedInfluencerCategory, setSelectedInfluencerCategory] = useState('engagement');
  const [selectedContentTypes, setSelectedContentTypes] = useState(['VIDEO', 'PHOTOS']);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);
  const [fetchingPlatforms, setFetchingPlatforms] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Country options
  const countryOptions = [
    { id: 'UG', name: 'Uganda' },
    { id: 'KE', name: 'Kenya' },
    { id: 'TZ', name: 'Tanzania' },
    { id: 'RW', name: 'Rwanda' },
    { id: 'BI', name: 'Burundi' },
    { id: 'SS', name: 'South Sudan' },
    { id: 'ET', name: 'Ethiopia' },
    { id: 'SO', name: 'Somalia' },
    { id: 'DJ', name: 'Djibouti' },
    { id: 'ER', name: 'Eritrea' }
  ];

  // Influencer category options
  const influencerCategoryOptions = [
    { id: 'followers', name: 'Number of Followers' },
    { id: 'engagement', name: 'Engagement' },
    { id: 'views', name: 'Views' }
  ];

  // Content type options
  const contentTypeOptions = [
    { id: 'PODCASTS', name: 'Podcasts' },
    { id: 'VIDEO', name: 'Video' },
    { id: 'TEXT', name: 'Text' },
    { id: 'PHOTOS', name: 'Photos' },
    { id: 'GIFS', name: 'GIFs' },
    { id: 'INFOGRAPHICS', name: 'Infographics' },
    { id: 'E-BOOKS', name: 'E-Books' },
    { id: 'NEWSLETTERS', name: 'Newsletters' },
    { id: 'MEMES', name: 'Memes' }
  ];

  // Map platform names to IDs for the API
  const getPlatformIds = useCallback((selectedPlatformNames) => {
    const platformMap = {};
    platformOptions.forEach(platform => {
      platformMap[platform.name.toUpperCase()] = platform.site_id;
    });
    
    return selectedPlatformNames.map(name => platformMap[name.toUpperCase()]).filter(id => id !== undefined);
  }, [platformOptions]);

  // Generate UUID-like requestId
  const generateRequestId = useCallback(() => {
    return `req_${Date.now()}`;
  }, []);

  // Build the correct request payload matching your sample
  const buildRequestPayload = useCallback(() => {
    const platformIds = getPlatformIds(selectedPlatforms);
    
    const payload = {
      requestId: generateRequestId(),
      campaign_id: campaignId,
      iso_codes: selectedCountries.length > 0 ? selectedCountries : ["UG"],
      gender: selectedGender === 'any' ? '' : selectedGender,
      category_type: selectedInfluencerCategory,
      industry_ids: selectedIndustries.length > 0 ? selectedIndustries : [1]
    };

    // Only add platforms if we have selections (backend requires non-empty array)
    if (platformIds.length > 0) {
      payload.platforms = platformIds;
    } else {
      // Default to at least one platform to avoid validation error
      payload.platforms = [1]; // Default to Instagram
    }
    
    return payload;
  }, [campaignId, selectedCountries, selectedGender, selectedInfluencerCategory, selectedIndustries, selectedPlatforms, generateRequestId, getPlatformIds]);

  // Auto-refresh function
  const handleAutoRefresh = useCallback(() => {
    if (!autoRefreshEnabled || !campaignId) return;
    
    const requestBody = buildRequestPayload();
    console.log('Auto-refresh API Request:', requestBody);
    onCheckEligibility(requestBody);
  }, [autoRefreshEnabled, campaignId, buildRequestPayload, onCheckEligibility]);

  // Calculate social platforms from socialFollowers
  const socialPlatformsComputed = useMemo(() => 
    Object.entries(socialFollowers)
      .filter(([_, data]) => data.selected)
      .map(([siteId, _]) => socialSites.find(site => site.site_id.toString() === siteId)?.sm_name || '')
  , [socialFollowers, socialSites]);

  // Update parent component when data changes
  useEffect(() => {
    onFilterChange({
      socialPlatforms: socialPlatformsComputed,
      minFollowers: '50',
      startDate,
      endDate,
      selectedIndustries,
      socialFollowers,
      selectedCountries,
      selectedGender,
      selectedInfluencerCategory,
      selectedContentTypes,
      selectedPlatforms,
      campaignId,
      eligibleResults: eligibilityResults ? {
        budget: eligibilityResults.budget,
        fee: eligibilityResults.fee,
        currency: eligibilityResults.currency,
        count: eligibilityResults.count,
        eligibleCount: eligibilityResults.eligibleCount,
        totalBudget: eligibilityResults.totalBudget
      } : undefined
    });
  }, [socialPlatformsComputed, startDate, endDate, selectedIndustries, socialFollowers, selectedCountries, selectedGender, selectedInfluencerCategory, selectedContentTypes, selectedPlatforms, campaignId, eligibilityResults, onFilterChange]);

  // Fetch platforms from backend using socialSites endpoint
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setFetchingPlatforms(true);
        const response = await get('users/socialSites');
        if (response && response.status === 200 && response.data) {
          const formattedPlatforms = response.data.map(site => ({
            id: site.sm_name.toUpperCase(),
            name: site.sm_name,
            site_id: site.site_id
          }));
          setPlatformOptions(formattedPlatforms);
        }
      } catch (error) {
        console.error('Error fetching platforms:', error);
        // Fallback to default platforms
        setPlatformOptions([
          { id: 'LINKEDIN', name: 'LinkedIn', site_id: 5 },
          { id: 'YOUTUBE', name: 'YouTube', site_id: 6 },
          { id: 'TIKTOK', name: 'TikTok', site_id: 4 },
          { id: 'X', name: 'X', site_id: 3 },
          { id: 'FACEBOOK', name: 'Facebook', site_id: 2 },
          { id: 'INSTAGRAM', name: 'Instagram', site_id: 1 },
          { id: 'WHATSAPP', name: 'WhatsApp', site_id: 7 },
          { id: 'TWITCH', name: 'Twitch', site_id: 8 },
          { id: 'REDDIT', name: 'Reddit', site_id: 9 },
          { id: 'SNAPCHAT', name: 'Snapchat', site_id: 10 },
          { id: 'PINTEREST', name: 'Pinterest', site_id: 11 },
          { id: 'QUORA', name: 'Quora', site_id: 12 }
        ]);
      } finally {
        setFetchingPlatforms(false);
      }
    };

    fetchPlatforms();
  }, []);

  // Fetch social media sites
  useEffect(() => {
    const fetchSocialSites = async () => {
      try {
        setFetchingSites(true);
        const response = await get('users/socialSites');
        if (response && response.status === 200 && response.data) {
          setSocialSites(response.data);
          
          const initialSocialFollowers = {};
          response.data.forEach((site) => {
            initialSocialFollowers[site.site_id.toString()] = {
              selected: true,
              minFollowers: '50'
            };
          });
          setSocialFollowers(initialSocialFollowers);
        }
      } catch (error) {
        console.error('Error fetching social sites:', error);
      } finally {
        setFetchingSites(false);
      }
    };

    fetchSocialSites();
  }, []);

  // Fetch industries
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setFetchingIndustries(true);
        const response = await get('users/industries');
        if (response && response.status === 200 && response.data) {
          setIndustries(response.data);
          const allIndustryIds = response.data.map((industry) => industry.id);
          setSelectedIndustries(allIndustryIds);
        }
      } catch (error) {
        console.error('Error fetching industries:', error);
      } finally {
        setFetchingIndustries(false);
      }
    };

    fetchIndustries();
  }, []);

  // Handle initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fetchingPlatforms && !fetchingIndustries && !fetchingSites) {
        setIsInitialLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchingPlatforms, fetchingIndustries, fetchingSites]);

  const handleSocialSiteToggle = useCallback((siteId) => {
    setSocialFollowers(prev => ({
      ...prev,
      [siteId]: {
        ...prev[siteId],
        selected: !prev[siteId].selected
      }
    }));
  }, []);

  const handleMinFollowersChange = useCallback((siteId, value) => {
    setSocialFollowers(prev => ({
      ...prev,
      [siteId]: {
        ...prev[siteId],
        minFollowers: value
      }
    }));
  }, []);

  const handleInfluencerCategoryChange = useCallback((category) => {
    setSelectedInfluencerCategory(category);
    if (autoRefreshEnabled) {
      setTimeout(() => handleAutoRefresh(), 300);
    }
  }, [autoRefreshEnabled, handleAutoRefresh]);

  const handleContentTypeToggle = useCallback((contentType) => {
    setSelectedContentTypes(prev => {
      const newTypes = prev.includes(contentType) 
        ? prev.filter(type => type !== contentType)
        : [...prev, contentType];
      
      if (autoRefreshEnabled) {
        setTimeout(() => handleAutoRefresh(), 300);
      }
      
      return newTypes;
    });
  }, [autoRefreshEnabled, handleAutoRefresh]);

  const handlePlatformToggle = useCallback((platform) => {
    setSelectedPlatforms(prev => {
      const newPlatforms = prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform];
      
      if (autoRefreshEnabled) {
        setTimeout(() => handleAutoRefresh(), 300);
      }
      
      return newPlatforms;
    });
  }, [autoRefreshEnabled, handleAutoRefresh]);

  const handleGenderChange = useCallback((gender) => {
    setSelectedGender(gender);
    if (autoRefreshEnabled) {
      setTimeout(() => handleAutoRefresh(), 300);
    }
  }, [autoRefreshEnabled, handleAutoRefresh]);

  // Check eligibility with current form values
  const handleCheckEligibility = useCallback(async () => {
    if (!campaignId) {
      console.error('Campaign ID is required');
      return;
    }

    const requestBody = buildRequestPayload();
    console.log('API Request Body:', requestBody);

    localStorage.setItem('lastEligibilityRequest', JSON.stringify(requestBody));
    onCheckEligibility(requestBody);
  }, [campaignId, buildRequestPayload, onCheckEligibility]);

  // Refresh eligibility with current form values
  const handleRefreshEligibility = useCallback(async () => {
    if (!campaignId) {
      console.error('Campaign ID is required');
      return;
    }

    const requestBody = buildRequestPayload();
    console.log('Refresh API Request Body:', requestBody);

    localStorage.setItem('lastEligibilityRequest', JSON.stringify(requestBody));
    onCheckEligibility(requestBody);
  }, [campaignId, buildRequestPayload, onCheckEligibility]);

  if (isInitialLoading) {
    return (
      <div className="w-full min-h-screen">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="w-full py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="h-8 w-32 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="w-full py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-3">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-3 w-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Demographics Section Skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <DropdownSkeleton />
              <DropdownSkeleton />
              <GridSkeleton count={3} />
            </motion.div>

            {/* Influencer Category Skeleton */}
            <GridSkeleton count={3} />

            {/* Content Type Skeleton */}
            <GridSkeleton count={9} />

            {/* Platforms Skeleton */}
            <GridSkeleton count={8} />

            {/* Check Eligibility Button Skeleton */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-4 lg:p-6 text-center space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-gray-300 rounded animate-pulse mx-auto"></div>
                  <div className="h-3 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
                <div className="h-12 w-48 bg-gray-300 rounded-lg animate-pulse mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="w-full py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={onBackToCampaigns}
              className="flex items-center gap-2 px-3 py-2 text-xs text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-all font-medium w-fit"
            >
              <FiArrowLeft className="w-3 h-3" />
              Back to Campaigns
            </button>

            {/* Auto-refresh toggle */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefreshEnabled}
                  onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                  className="w-4 h-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
                />
                <span className="text-xs text-gray-600">Auto-refresh</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="w-full py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Eligibility Results */}
          {eligibilityResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 shadow-sm"
            >
              <div className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiUsers className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold ${eligibilityResults.eligibleCount === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {eligibilityResults.eligibleCount || 0} <span className="text-black">eligible influencers found</span>
                      </h2>
                      <p className="text-xs text-gray-600">
                        {autoRefreshEnabled ? 'Updates automatically as you change filters' : 'Click refresh to update results'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Only show refresh button if auto-refresh is disabled */}
                  {!autoRefreshEnabled && (
                    <button
                      onClick={handleRefreshEligibility}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-all text-xs font-medium disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          Updating
                        </>
                      ) : (
                        <>
                          <FiRefreshCw className="w-3 h-3" />
                          Refresh
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg sm:text-2xl font-semibold text-black">Filter Influencers</h1>
                <p className="text-xs text-gray-600">Adjust filters below to match your campaign needs</p>
              </div>
            </div>

          {/* Demographics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Country Selection */}
                <MultiSelectDropdown
                  options={countryOptions}
                  selectedValues={selectedCountries}
                  onSelectionChange={setSelectedCountries}
                  placeholder="Select countries"
                  label="Location / Country"
                  icon={FiMapPin}
                  autoRefresh={autoRefreshEnabled}
                  onAutoRefresh={handleAutoRefresh}
                />

                {/* Industries */}
              
              {fetchingIndustries ? (
                <DropdownSkeleton />
              ) : (
                <div className="space-y-4">
                  <MultiSelectDropdown
                    options={industries}
                    selectedValues={selectedIndustries}
                    onSelectionChange={setSelectedIndustries}
                    placeholder="Select industries"
                    label="Select Industries"
                    icon={FiBriefcase}
                    autoRefresh={autoRefreshEnabled}
                    onAutoRefresh={handleAutoRefresh}
                  />
                </div>
              )}

                {/* Gender Selection */}
                <div className="space-y-2 my-4">
                  <label className="block text-xs font-medium text-black">Gender</label>
                  <GridList className="flex flex-wrap gap-2">
                    {['any', 'male', 'female'].map((gender) => (
                      <GridListItem
                        key={gender}
                        value={gender}
                        isSelected={selectedGender === gender}
                        onSelect={() => handleGenderChange(gender)}
                        className="text-xs"
                      >
                        {gender === 'any' ? 'Any' : gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </GridListItem>
                    ))}
                  </GridList>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Influencer Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >

              <div className="flex items-center gap-3 my-4">
                <div>
                  <h2 className="text-sm font-bold text-black">Influencer Category</h2>
                  <p className="text-xs text-gray-600">Select the [#F9D769] metric for influencer categorization</p>
                </div>
              </div>
              
              <GridList className="flex flex-wrap gap-3">
                {influencerCategoryOptions.map((category) => (
                  <GridListItem
                    key={category.id}
                    value={category.id}
                    isSelected={selectedInfluencerCategory === category.id}
                    onSelect={() => handleInfluencerCategoryChange(category.id)}
                    className="text-xs"
                  >
                    {category.name}
                  </GridListItem>
                ))}
              </GridList>
          </motion.div>

          {/* Content Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >

              <div className="flex items-center gap-3 my-4">
                <div>
                  <h2 className="text-sm font-bold text-black">Content Type</h2>
                  <p className="text-xs text-gray-600">Select the types of content you want influencers to create</p>
                </div>
              </div>
              
              <GridList className="flex flex-wrap gap-3">
                {contentTypeOptions.map((contentType) => (
                  <GridListItem
                    key={contentType.id}
                    value={contentType.id}
                    isSelected={selectedContentTypes.includes(contentType.id)}
                    onSelect={() => handleContentTypeToggle(contentType.id)}
                    className="text-xs"
                  >
                    {contentType.name}
                  </GridListItem>
                ))}
              </GridList>
          </motion.div>

          {/* Platforms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-black">Platforms</h2>
                  <p className="text-xs text-gray-600">Select the social media platforms for your campaign</p>
                </div>
              </div>
              
              {fetchingPlatforms ? (
                <GridSkeleton count={8} />
              ) : (
                <GridList className="flex flex-row flex-wrap gap-3">
                  {platformOptions.map((platform) => (
                    <GridListItem
                      key={platform.id}
                      value={platform.id}
                      isSelected={selectedPlatforms.includes(platform.id)}
                      onSelect={() => handlePlatformToggle(platform.id)}
                      className="text-xs"
                    >
                      {platform.name}
                    </GridListItem>
                  ))}
                </GridList>
              )}
          </motion.div>

          {/* Social Platforms - Only show if category is "followers" */}
          {selectedInfluencerCategory === 'followers' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FiUsers className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-black">Social Platforms</h2>
                    <p className="text-xs text-gray-600">Select platforms and set minimum followers</p>
                  </div>
                </div>
                
                {fetchingSites ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, index) => (
                      <SocialPlatformCardSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {socialSites.map((site) => (
                      <SocialPlatformCard
                        key={site.site_id}
                        platform={site}
                        isSelected={socialFollowers[site.site_id.toString()]?.selected || false}
                        onToggle={() => handleSocialSiteToggle(site.site_id.toString())}
                        followerCount={socialFollowers[site.site_id.toString()]?.minFollowers || '50'}
                        onFollowerChange={(value) => handleMinFollowersChange(site.site_id.toString(), value)}
                        autoRefresh={autoRefreshEnabled}
                        onAutoRefresh={handleAutoRefresh}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Check Eligibility Button */}
          {!eligibilityResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="p-4 lg:p-6 text-center">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-black mb-2">
                    Ready to Find Your Influencers?
                  </h3>
                  <p className="text-xs text-gray-600 max-w-md mx-auto">
                    Check how many influencers match your criteria
                  </p>
                </div>

                <button
                  onClick={handleCheckEligibility}
                  disabled={loading || !campaignId}
                  className="bg-yellow-400 text-black py-3 px-6 rounded-lg font-bold text-xs hover:bg-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto shadow-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Checking...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      Check Availability
                    </>
                  )}
                </button>

                {!campaignId && (
                  <p className="text-xs text-red-600 mt-2">
                    Campaign ID is required to check eligibility
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterCampaigns;