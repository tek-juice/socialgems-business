import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiCalendar,
  FiClock,
  FiTarget,
  FiDollarSign,
  FiLoader,
  FiGrid,
  FiList,
  FiSearch,
  FiFilter,
  FiMoreHorizontal,
  FiChevronDown,
  FiPlus,
  FiBriefcase,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiUsers,
  FiBarChart,
  FiCheck,
  FiUserPlus
} from 'react-icons/fi';
import { get, post } from '../utils/service';
import { toast } from 'sonner';
import { EmptyState } from '../components/ui/Campaigns/No-Data/empty-state';
import { 
  addMonths,
  endOfMonth,
  startOfMonth,
  subDays,
  subMonths,
  format,
  formatDistance,
  differenceInDays,
  isSameDay,
  addDays,
  min,
  max
} from 'date-fns';
import { cn } from '../lib/utils';

// Helper functions for HTML processing
const decodeHtmlEntities = (text) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const formatHtmlContent = (htmlContent) => {
  if (!htmlContent) return '';
  
  let decodedContent = decodeHtmlEntities(htmlContent);
  
  decodedContent = decodedContent.replace(/<h>/g, '<h3 class="text-xs font-bold text-gray-900 mt-4 mb-2 first:mt-0">');
  decodedContent = decodedContent.replace(/<\/h>/g, '</h3>');
  
  decodedContent = decodedContent.replace(/<li>/g, '<div class="flex items-start gap-2 mb-1"><span class="text-xs text-gray-600 mt-0.5">•</span><span class="text-xs text-gray-700 flex-1">');
  decodedContent = decodedContent.replace(/<\/li>/g, '</span></div>');
  
  decodedContent = decodedContent.replace(/<p>/g, '<p class="text-xs text-gray-700 mb-2">');
  
  decodedContent = decodedContent.replace(/<strong>/g, '<strong class="font-semibold text-gray-900">');
  
  decodedContent = decodedContent.replace(/<p class="text-xs text-gray-700 mb-2"><br><\/p>/g, '');
  decodedContent = decodedContent.replace(/<p class="text-xs text-gray-700 mb-2">\s*<\/p>/g, '');
  
  return decodedContent;
};

const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
};

// Local Storage Keys
const STORAGE_KEYS = {
  CURRENT_PAGE: 'campaigns_current_page',
  ITEMS_PER_PAGE: 'campaigns_items_per_page',
  ACTIVE_STATUS_TAB: 'campaigns_active_status_tab',
  COLUMN_FILTERS: 'campaigns_column_filters'
};

// Helper functions for localStorage
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, campaignTitle }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6"
        >
          <div className="text-center">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Delete campaign
            </h3>
            <p className="text-gray-600 text-xs mb-6">
              Are you sure you want to delete "{campaignTitle}"?<br />
              This action is not reversible.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Skeleton Loading Component
const SkeletonCard = ({ isLastOdd = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden",
        isLastOdd ? "md:col-span-2" : ""
      )}
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-32 h-32 md:h-auto relative flex-shrink-0">
          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
            <div className="space-y-1 mb-3">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse border-2 border-white"></div>
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse border-2 border-white"></div>
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse border-2 border-white"></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// AvatarCircles Component
const AvatarCircles = ({ numPeople, className, avatarUrls }) => {
  const displayUrls = avatarUrls.slice(0, 3);
  const remainingCount = Math.max(0, numPeople - 3);

  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {displayUrls.map((url, index) => (
        <img
          key={index}
          className="h-10 w-10 rounded-full border-4 border-white"
          src={url}
          width={40}
          height={40}
          alt={`Avatar ${index + 1}`}
        />
      ))}
      {remainingCount > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#734D20] text-center text-xs font-medium text-white">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

// Campaign Card Component
const CampaignCard = ({ campaign, onClick, onDelete, onEdit, onAddMember, isLastOdd = false }) => {
  const endDate = new Date(campaign.end_date);
  const now = new Date();
  const daysLeft = Math.max(0, differenceInDays(endDate, now));
  
  const hasActiveInfluencers = campaign.actionedUsers && campaign.actionedUsers.length > 0;
  const influencerAvatars = hasActiveInfluencers 
    ? campaign.actionedUsers.map(user => user.userProfile?.profile_pic || user.profile_pic).filter(Boolean)
    : [];

  // Only draft campaigns can be edited or have members added
  const isDraftCampaign = campaign.status === 'draft';

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(campaign);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(campaign);
  };

  const handleAddMember = (e) => {
    e.stopPropagation();
    onAddMember(campaign);
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer relative group",
        isLastOdd ? "md:col-span-2" : ""
      )}
      onClick={() => onClick(campaign)}
    >
      {/* Action Buttons - Only show edit/add member for draft campaigns */}
      {isDraftCampaign && (
        <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleEdit}
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
            title="Edit Campaign"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleAddMember}
            className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
            title="Add Member"
          >
            <FiUserPlus className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
            title="Delete Campaign"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete button only for non-draft campaigns */}
      {!isDraftCampaign && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
          title="Delete Campaign"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      )}

      <div className="flex flex-col md:flex-row">
        <div className="md:w-32 h-32 md:h-auto relative flex-shrink-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: campaign.image_urls 
                ? `url(${campaign.image_urls})` 
                : 'linear-gradient(135deg, #F9D769 0%, #E8C547 100%)'
            }}
          >
            {!campaign.image_urls && (
              <div className="w-full h-full flex items-center justify-center">
                <FiBriefcase className="w-8 h-8 text-[#734D20]" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm md:text-base text-[#734D20] line-clamp-2 pr-2">
                {campaign.title}
              </h3>
              {isDraftCampaign && (
                <Badge variant="warning" className="ml-2 flex-shrink-0">
                  Draft
                </Badge>
              )}
            </div>
            <div 
              className="text-xs text-gray-600 mb-3 line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: formatHtmlContent(truncateText(campaign.description, 150))
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasActiveInfluencers ? (
                <AvatarCircles 
                  numPeople={campaign.actionedUsers.length}
                  avatarUrls={influencerAvatars}
                />
              ) : (
                <div className="flex items-center gap-1">
                  {!isDraftCampaign && getStatusBadge(campaign)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-gray-500">
                <FiClock className="w-3 h-3" />
                <span className="text-xs">
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                </span>
              </div>
              <Button
                variant="default"
                size="sm"
                className="text-xs px-3 py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(campaign);
                }}
              >
                Details →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// AnimatedTabs Component
const AnimatedTabs = ({ tabs, activeTab, onTabChange }) => {
  const containerRef = useRef(null);
  const activeTabRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container && activeTab) {
      const activeTabElement = activeTabRef.current;

      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;

        const clipLeft = offsetLeft + 16;
        const clipRight = offsetLeft + offsetWidth + 16;

        container.style.clipPath = `inset(0 ${Number(
          100 - (clipRight / container.offsetWidth) * 100,
        ).toFixed()}% 0 ${Number(
          (clipLeft / container.offsetWidth) * 100,
        ).toFixed()}% round 17px)`;
      }
    }
  }, [activeTab]);

  return (
    <div className="relative bg-[#F9D769]/20 border border-[#734D20]/10 flex w-fit flex-col items-center rounded-full py-2 px-4">
      <div
        ref={containerRef}
        className="absolute z-10 w-full overflow-hidden [clip-path:inset(0px_75%_0px_0%_round_17px)] [transition:clip-path_0.25s_ease]"
      >
        <div className="relative flex w-full justify-center bg-[#734D20]">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => onTabChange(tab.value)}
              className="flex h-8 items-center rounded-full p-3 text-sm font-medium text-white"
              tabIndex={-1}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex w-full justify-center">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={index}
              ref={isActive ? activeTabRef : null}
              onClick={() => onTabChange(tab.value)}
              className="flex h-8 items-center cursor-pointer rounded-full p-3 text-sm font-medium text-[#734D20]/70"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Custom Components
const Button = ({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}) => {
  const variants = {
    default:
      "bg-gradient-to-r from-[#F9D769] to-[#E8C547] text-[#734D20] hover:from-[#E8C547] hover:to-[#F9D769]",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-sm",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F9D769] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ className, children, variant = "default", ...props }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Pagination Components
const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("flex justify-center", className)}
    {...props}
  />
);

const PaginationContent = ({ className, children, ...props }) => (
  <ul className={cn("flex flex-row items-center gap-1", className)} {...props}>
    {children}
  </ul>
);

const PaginationItem = ({ className, children, ...props }) => (
  <li className={cn("", className)} {...props}>
    {children}
  </li>
);

const PaginationLink = ({ className, isActive, children, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#F9D769] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8",
      isActive
        ? "bg-[#E8C547]/90 text-gray-900 shadow-xl"
        : "hover:bg-gray-100 text-gray-700",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

const PaginationPrevious = ({ className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#F9D769] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 gap-1 pl-2.5 hover:bg-gray-100 text-gray-700",
      className
    )}
    {...props}
  >
    <FiChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </button>
);

const PaginationNext = ({ className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#F9D769] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 gap-1 pr-2.5 hover:bg-gray-100 text-gray-700",
      className
    )}
    {...props}
  >
    <span>Next</span>
    <FiChevronRight className="h-4 w-4" />
  </button>
);

const PaginationEllipsis = ({ className, ...props }) => (
  <span
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <FiMoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);

// Filter Dropdown Menu Component
const FilterDropdownMenu = ({ options, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className={cn("gap-2", className)}
      >
        {children}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown className="w-4 h-4" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-1">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    option.onClick();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <span>{option.label}</span>
                  {option.checked && (
                    <FiCheck className="w-4 h-4 text-green-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

// Keep your original getStatusName function unchanged
const getStatusName = (campaign) => {
  // Check explicit status first
  if (campaign.status === 'draft') return 'Draft';
  if (campaign.status === 'completed') return 'Closed';
  if (campaign.status === 'active') return 'Active';
  if (campaign.status === 'planned') return 'Planned';
  if (campaign.closed_date) return 'Closed';
  
  // Fall back to date-based logic
  const endDate = new Date(campaign.end_date);
  const startDate = new Date(campaign.start_date);
  const now = new Date();
  
  if (now < startDate) return 'Planned';
  if (now > endDate) return 'Completed';
  return 'Active';
};

const getStatusBadge = (campaign) => {
  const status = getStatusName(campaign);
  switch (status) {
    case "Active":
      return <Badge variant="success">Active</Badge>;
    case "Planned":
      return <Badge variant="warning">Planned</Badge>;
    case "Completed":
      return <Badge variant="info">Completed</Badge>;
    case "Closed":
      return <Badge variant="error">Closed</Badge>;
    case "Draft":
      return <Badge variant="warning">Draft</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const Campaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingCampaigns, setDeletingCampaigns] = useState(new Set());
  
  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    campaign: null
  });

  // Pagination state with localStorage persistence
  const [currentPage, setCurrentPage] = useState(() => 
    loadFromStorage(STORAGE_KEYS.CURRENT_PAGE, 1)
  );
  const [itemsPerPage, setItemsPerPage] = useState(() => 
    loadFromStorage(STORAGE_KEYS.ITEMS_PER_PAGE, 6)
  );

  // Filter state with localStorage persistence
  const [columnFilters, setColumnFilters] = useState(() => 
    loadFromStorage(STORAGE_KEYS.COLUMN_FILTERS, {
      status: 'all',
      budget: 'all',
      duration: 'all'
    })
  );

  // Status tabs state with localStorage persistence
  const [activeStatusTab, setActiveStatusTab] = useState(() => 
    loadFromStorage(STORAGE_KEYS.ACTIVE_STATUS_TAB, 'all')
  );

  const statusTabs = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Active", value: "active" },
    { label: "Closed", value: "closed" }
  ];

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_PAGE, currentPage);
  }, [currentPage]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ITEMS_PER_PAGE, itemsPerPage);
  }, [itemsPerPage]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.COLUMN_FILTERS, columnFilters);
  }, [columnFilters]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVE_STATUS_TAB, activeStatusTab);
  }, [activeStatusTab]);

  // Enhanced campaign fetching with proper API separation
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      console.log('📋 Starting campaign fetch...');
      
      // Step 1: Get list of all campaigns
      const response = await get('campaigns/brandCampaigns');
      if (!response?.data) {
        console.log('❌ No campaigns data received');
        setCampaigns([]);
        return;
      }

      console.log(`📋 Found ${response.data.length} campaigns from brandCampaigns API`);
      
      // Filter out deleted campaigns immediately
      const activeCampaigns = response.data.filter(campaign => 
        campaign.status !== 'deleted' && 
        campaign.status !== 'Deleted' &&
        !campaign.deleted_at &&
        !campaign.is_deleted
      );

      console.log(`📋 ${activeCampaigns.length} active campaigns after filtering deleted ones`);

      // Step 2: Process each campaign based on its status
      const processedCampaigns = await Promise.all(
        activeCampaigns.map(async (baseCampaign) => {
          const campaignId = baseCampaign.campaign_id;
          console.log(`🔍 Processing campaign ${campaignId} with status: ${baseCampaign.status}`);
          
          try {
            if (baseCampaign.status === 'draft') {
              // For draft campaigns, get detailed data from getDraftCampaign
              console.log(`📝 Fetching draft campaign details for ${campaignId}`);
              
              try {
                const draftResponse = await get(`campaigns/getDraftCampaign/${campaignId}`);
                if (draftResponse?.data) {
                  console.log(`✅ Draft campaign details loaded for ${campaignId}`);
                  return {
                    ...baseCampaign,
                    ...draftResponse.data,
                    actionedUsers: [], // Draft campaigns don't have actioned users
                    isDraft: true
                  };
                } else {
                  console.log(`⚠️ No draft details found for ${campaignId}, using base data`);
                  return {
                    ...baseCampaign,
                    actionedUsers: [],
                    isDraft: true
                  };
                }
              } catch (draftError) {
                console.error(`❌ Error fetching draft campaign details for ${campaignId}:`, draftError);
                return {
                  ...baseCampaign,
                  actionedUsers: [],
                  isDraft: true
                };
              }
            } else {
              // For non-draft campaigns, try to get actioned users
              console.log(`👥 Fetching actioned users for campaign ${campaignId}`);
              
              try {
                const actionedResponse = await get(`campaigns/getActionedInfluencers/${campaignId}`);
                if (actionedResponse?.status === 200 && actionedResponse?.data) {
                  console.log(`✅ Found ${actionedResponse.data.length} actioned users for ${campaignId}`);
                  return {
                    ...baseCampaign,
                    actionedUsers: actionedResponse.data,
                    isDraft: false
                  };
                } else {
                  console.log(`⚠️ No actioned users found for ${campaignId}`);
                  return {
                    ...baseCampaign,
                    actionedUsers: [],
                    isDraft: false
                  };
                }
              } catch (actionedError) {
                console.error(`❌ Error fetching actioned users for ${campaignId}:`, actionedError);
                
                // If actioned users call fails with 404, might still be a draft
                if (actionedError.response?.status === 404) {
                  console.log(`🔄 Campaign ${campaignId} might be draft, trying draft endpoint`);
                  
                  try {
                    const draftResponse = await get(`campaigns/getDraftCampaign/${campaignId}`);
                    if (draftResponse?.data) {
                      console.log(`✅ Found draft data for ${campaignId}`);
                      return {
                        ...baseCampaign,
                        ...draftResponse.data,
                        status: 'draft', // Override status
                        actionedUsers: [],
                        isDraft: true
                      };
                    }
                  } catch (draftError) {
                    console.error(`❌ Draft endpoint also failed for ${campaignId}:`, draftError);
                  }
                }
                
                // Return base campaign data if all else fails
                return {
                  ...baseCampaign,
                  actionedUsers: [],
                  isDraft: false
                };
              }
            }
          } catch (error) {
            console.error(`❌ Error processing campaign ${campaignId}:`, error);
            return {
              ...baseCampaign,
              actionedUsers: [],
              isDraft: baseCampaign.status === 'draft'
            };
          }
        })
      );

      // Step 3: Sort campaigns by creation date (newest first)
      const sortedCampaigns = processedCampaigns.sort((a, b) => 
        new Date(b.created_on || b.start_date).getTime() - new Date(a.created_on || a.start_date).getTime()
      );

      console.log(`✅ Successfully processed ${sortedCampaigns.length} campaigns`);
      setCampaigns(sortedCampaigns);
      
    } catch (error) {
      console.error('❌ Error in campaign fetch process:', error);
      toast.error('Failed to fetch campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (campaign) => {
    setDeleteModal({
      isOpen: true,
      campaign: campaign
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.campaign) return;

    const campaignId = deleteModal.campaign.campaign_id;
    
    try {
      setDeletingCampaigns(prev => new Set([...prev, campaignId]));
      
      const response = await post('campaigns/deleteCampaign', {
        campaign_id: campaignId
      });
      
      setCampaigns(prevCampaigns => {
        const updatedCampaigns = prevCampaigns.filter(campaign => campaign.campaign_id !== campaignId);
        
        const filteredAfterDeletion = updatedCampaigns.filter(campaign => {
          const campaignStatus = getStatusName(campaign).toLowerCase();
          const matchesTabStatus = 
            activeStatusTab === 'all' ? true :
            activeStatusTab === 'closed' ? (campaign.status === 'completed' || campaign.closed_date) :
            activeStatusTab === campaignStatus || 
            (activeStatusTab === 'draft' && campaign.status === 'draft');

          const matchesColumnBudget = 
            !columnFilters.budget || columnFilters.budget === 'all' ? true :
            columnFilters.budget === 'with-budget' ? !!campaign.budget :
            columnFilters.budget === 'no-budget' ? !campaign.budget :
            true;

          const campaignDuration = differenceInDays(new Date(campaign.end_date), new Date(campaign.start_date));
          const matchesColumnDuration = 
            !columnFilters.duration || columnFilters.duration === 'all' ? true :
            columnFilters.duration === 'short' ? campaignDuration <= 30 :
            columnFilters.duration === 'medium' ? campaignDuration > 30 && campaignDuration <= 90 :
            columnFilters.duration === 'long' ? campaignDuration > 90 :
            true;

          return matchesTabStatus && matchesColumnBudget && matchesColumnDuration;
        });

        const maxPage = Math.ceil(filteredAfterDeletion.length / itemsPerPage);
        if (currentPage > maxPage && maxPage > 0) {
          setCurrentPage(maxPage);
        } else if (filteredAfterDeletion.length === 0) {
          setCurrentPage(1);
        }
        
        return updatedCampaigns;
      });
      
      toast.success('Campaign deleted successfully');
      
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign. Please try again.');
    } finally {
      setDeletingCampaigns(prev => {
        const newSet = new Set(prev);
        newSet.delete(campaignId);
        return newSet;
      });
      
      setDeleteModal({
        isOpen: false,
        campaign: null
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      campaign: null
    });
  };

  const handleEditCampaign = (campaign) => {
    navigate(`/campaigns/${campaign.campaign_id}/edit`, {
      state: { campaign }
    });
  };

  const handleAddMember = (campaign) => {
    navigate(`/campaigns/${campaign.campaign_id}/add-member`, {
      state: { campaign }
    });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Handle status tab change
  const handleStatusTabChange = (status) => {
    setActiveStatusTab(status);
    setColumnFilters(prev => ({ ...prev, status: status }));
    setCurrentPage(1);
  };

  // Filter campaigns with pagination
  const filteredCampaigns = useMemo(() => {
    const filtered = campaigns.filter(campaign => {
      if (campaign.status === 'deleted' || 
          campaign.status === 'Deleted' || 
          campaign.deleted_at || 
          campaign.is_deleted) {
        return false;
      }

      const campaignStatus = getStatusName(campaign).toLowerCase();
      const matchesTabStatus = 
        activeStatusTab === 'all' ? true :
        activeStatusTab === 'closed' ? (campaign.status === 'completed' || campaign.closed_date) :
        activeStatusTab === campaignStatus || 
        (activeStatusTab === 'draft' && campaign.status === 'draft');

      const matchesColumnBudget = 
        !columnFilters.budget || columnFilters.budget === 'all' ? true :
        columnFilters.budget === 'with-budget' ? !!campaign.budget :
        columnFilters.budget === 'no-budget' ? !campaign.budget :
        true;

      const campaignDuration = differenceInDays(new Date(campaign.end_date), new Date(campaign.start_date));
      const matchesColumnDuration = 
        !columnFilters.duration || columnFilters.duration === 'all' ? true :
        columnFilters.duration === 'short' ? campaignDuration <= 30 :
        columnFilters.duration === 'medium' ? campaignDuration > 30 && campaignDuration <= 90 :
        columnFilters.duration === 'long' ? campaignDuration > 90 :
        true;

      return matchesTabStatus && matchesColumnBudget && matchesColumnDuration;
    });

    return filtered;
  }, [campaigns, activeStatusTab, columnFilters]);

  // Pagination logic
  const totalItems = filteredCampaigns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCampaigns.slice(startIndex, endIndex);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleViewCampaign = (campaign) => {
    navigate(`/campaigns/${campaign.campaign_id}`, {
      state: { 
        campaign,
        isDraft: campaign.isDraft || campaign.status === 'draft'
      }
    });
  };

  const handleCreateCampaign = () => {
    navigate('/campaigns/create');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="border-b border-[#734D20] py-4 mb-5">
          <div className="mx-auto flex flex-wrap sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                Campaign Management
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                Manage your campaigns and track performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleCreateCampaign} 
                size="sm"
                className="bg-[#F9D769] hover:bg-[#E8C547] text-[#734D20] font-medium"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Campaign
              </Button>
            </div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <div className="h-12 w-80 bg-gray-200 rounded-full animate-pulse"></div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2 flex-wrap">
                <div className="h-8 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Array.from({ length: 6 }, (_, index) => {
                const isLastOdd = 6 % 2 !== 0 && index === 6 - 1;
                return (
                  <SkeletonCard
                    key={index}
                    isLastOdd={isLastOdd}
                  />
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex flex-row flex-wrap pt-4 items-center justify-between w-full">
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        campaignTitle={deleteModal.campaign?.title || ''}
      />

      <div className="border-b border-[#734D20] py-4 mb-5">
        <div className="mx-auto flex flex-wrap sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              Campaign Management
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Manage your campaigns and track performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleCreateCampaign} 
              size="sm"
              className="bg-[#F9D769] hover:bg-[#E8C547] text-[#734D20] font-medium"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Campaign
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <AnimatedTabs 
            tabs={statusTabs} 
            activeTab={activeStatusTab}
            onTabChange={handleStatusTabChange}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <FiFilter className="text-gray-600 w-4 h-4 mt-2" />

              <FilterDropdownMenu
                options={[
                  {
                    label: 'All Budgets',
                    onClick: () => setColumnFilters(prev => ({ ...prev, budget: 'all' })),
                    checked: !columnFilters.budget || columnFilters.budget === 'all'
                  },
                  {
                    label: 'With Budget',
                    onClick: () => setColumnFilters(prev => ({ ...prev, budget: 'with-budget' })),
                    checked: columnFilters.budget === 'with-budget'
                  },
                  {
                    label: 'No Budget',
                    onClick: () => setColumnFilters(prev => ({ ...prev, budget: 'no-budget' })),
                    checked: columnFilters.budget === 'no-budget'
                  }
                ]}
                className="text-[#734D20] border-[#F9D769]/50 hover:bg-[#F9D769]/20"
              >
                Budget
              </FilterDropdownMenu>

              <FilterDropdownMenu
                options={[
                  {
                    label: 'All Durations',
                    onClick: () => setColumnFilters(prev => ({ ...prev, duration: 'all' })),
                    checked: !columnFilters.duration || columnFilters.duration === 'all'
                  },
                  {
                    label: 'Short (≤30 days)',
                    onClick: () => setColumnFilters(prev => ({ ...prev, duration: 'short' })),
                    checked: columnFilters.duration === 'short'
                  },
                  {
                    label: 'Medium (31-90 days)',
                    onClick: () => setColumnFilters(prev => ({ ...prev, duration: 'medium' })),
                    checked: columnFilters.duration === 'medium'
                  },
                  {
                    label: 'Long (>90 days)',
                    onClick: () => setColumnFilters(prev => ({ ...prev, duration: 'long' })),
                    checked: columnFilters.duration === 'long'
                  }
                ]}
                className="text-[#734D20] border-[#F9D769]/50 hover:bg-[#F9D769]/20"
              >
                Duration
              </FilterDropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="h-8 px-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#F9D769] focus:border-transparent"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {currentItems.length ? (
            <AnimatePresence mode="wait">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {currentItems.map((campaign, index) => {
                  const isLastOdd = currentItems.length % 2 !== 0 && index === currentItems.length - 1;
                  return (
                    <CampaignCard
                      key={campaign.campaign_id}
                      campaign={campaign}
                      onClick={handleViewCampaign}
                      onDelete={handleDeleteRequest}
                      onEdit={handleEditCampaign}
                      onAddMember={handleAddMember}
                      isLastOdd={isLastOdd}
                    />
                  );
                })}
              </div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F9D769]/20 to-[#E8C547]/20 rounded-full flex items-center justify-center">
                  <FiBriefcase className="w-8 h-8 text-[#734D20]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-[#734D20]">
                    No Campaigns Available
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md">
                    Your campaign portfolio is empty. Create your first campaign to start tracking your marketing initiatives and drive business growth.
                  </p>
                </div>
                <Button 
                  onClick={handleCreateCampaign}
                  className="mt-4"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Launch Your First Campaign
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex flex-row flex-wrap pt-4 items-center justify-between w-full">
            <div className="text-xs text-gray-600">
              Showing {Math.min(startIndex + 1, totalItems)} to {Math.min(endIndex, totalItems)} of{" "}
              {totalItems} campaigns
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(
                          Math.min(totalPages, currentPage + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Campaigns;