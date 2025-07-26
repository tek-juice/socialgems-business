import { useState, useEffect, useMemo } from 'react';
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
  FiCheck
} from 'react-icons/fi';
import { get } from '../utils/service';
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

// Custom Table Components (copied from wallet)
const Table = ({ className, children, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table
      className={cn("w-full caption-bottom text-xs", className)}
      {...props}
    >
      {children}
    </table>
  </div>
);

const TableHeader = ({ className, children, ...props }) => (
  <thead className={cn(className)} {...props}>
    {children}
  </thead>
);

const TableBody = ({ className, children, ...props }) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
    {children}
  </tbody>
);

const TableRow = ({ className, children, ...props }) => (
  <tr
    className={cn(
      "border-b border-gray-200 transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50",
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

const TableHead = ({ className, children, ...props }) => (
  <th
    className={cn(
      "h-12 px-3 text-left align-middle font-medium text-gray-600 text-xs [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
      className
    )}
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({ className, children, ...props }) => (
  <td
    className={cn(
      "p-3 align-middle text-xs [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
      className
    )}
    {...props}
  >
    {children}
  </td>
);

// Custom Components (copied from wallet)
const Button = ({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}) => {
  const variants = {
    default:
      "bg-gradient-to-r from-primary to-[#E8C547] text-secondary hover:from-[#E8C547] hover:to-primary",
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
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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

const Input = ({ className, ...props }) => (
  <input
    className={cn(
      "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);

const Badge = ({ className, children, variant = "default", ...props }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-primary-scale-100 text-secondary",
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

// Pagination Components (copied from wallet)
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
      "inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8",
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
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 gap-1 pl-2.5 hover:bg-gray-100 text-gray-700",
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
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 gap-1 pr-2.5 hover:bg-gray-100 text-gray-700",
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

// Dropdown Menu Component (copied from wallet)
const DropdownMenu = ({ options, children, className }) => {
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
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
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

// Filter Dropdown Menu Component (copied from wallet)
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

const getStatusColor = (campaign) => {
  if (campaign.closed_date) return '#EF4444'; // Red for closed
  const endDate = new Date(campaign.end_date);
  const startDate = new Date(campaign.start_date);
  const now = new Date();
  
  if (now < startDate) return '#F59E0B'; // Orange for planned
  if (now > endDate) return '#6B7280'; // Gray for completed
  return '#10B981'; // Green for active
};

const getStatusName = (campaign) => {
  if (campaign.closed_date) return 'Closed';
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
  
  // Table state (copied from wallet)
  const [visibleColumns, setVisibleColumns] = useState([
    "Title",
    "Status", 
    "Start Date",
    "End Date",
    "Budget",
    "Actions"
  ]);
  
  // Pagination state (copied from wallet)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter state (copied from wallet)
  const [columnFilters, setColumnFilters] = useState({
    status: 'all',
    budget: 'all',
    duration: 'all'
  });

  const allColumns = ["Title", "Status", "Start Date", "End Date", "Budget", "Actions"];

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await get('campaigns/brandCampaigns');
      if (response?.data) {
        const sortedCampaigns = response.data.sort((a, b) => 
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
        setCampaigns(sortedCampaigns);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Filter campaigns with pagination (copied from wallet logic)
  const filteredCampaigns = useMemo(() => {
    const filtered = campaigns.filter(campaign => {
      // Column filters
      const matchesColumnStatus = 
        !columnFilters.status || columnFilters.status === 'all' ? true :
        columnFilters.status === getStatusName(campaign).toLowerCase();

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

      return matchesColumnStatus && matchesColumnBudget && matchesColumnDuration;
    });

    return filtered;
  }, [campaigns, columnFilters]);

  // Pagination logic (copied from wallet)
  const totalItems = filteredCampaigns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCampaigns.slice(startIndex, endIndex);

  const toggleColumn = (col) => {
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleViewCampaign = (campaign) => {
    navigate(`/campaigns/${campaign.campaign_id}`, {
      state: { campaign }
    });
  };

  const handleCreateCampaign = () => {
    navigate('/campaigns/create');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-sm">Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-secondary py-4 mb-5">
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
              className="bg-primary hover:bg-[#E8C547] text-secondary font-medium"
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
        {/* Campaign Table (exact copy from wallet structure) */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 space-y-4 overflow-x-auto">
            <div className="flex flex-wrap lg:items-center justify-between gap-4 mb-6">

              {/* Filter Section - Using FilterDropdownMenu for left-aligned positioning */}
              <div className="flex gap-2 flex-wrap mb-4">
                <FiFilter className="text-gray-600 w-4 h-4 mt-2" />
                
                <FilterDropdownMenu
                  options={[
                    {
                      label: 'All Statuses',
                      onClick: () => setColumnFilters(prev => ({ ...prev, status: 'all' })),
                      checked: !columnFilters.status || columnFilters.status === 'all'
                    },
                    {
                      label: 'Active',
                      onClick: () => setColumnFilters(prev => ({ ...prev, status: 'active' })),
                      checked: columnFilters.status === 'active'
                    },
                    {
                      label: 'Planned',
                      onClick: () => setColumnFilters(prev => ({ ...prev, status: 'planned' })),
                      checked: columnFilters.status === 'planned'
                    },
                    {
                      label: 'Completed',
                      onClick: () => setColumnFilters(prev => ({ ...prev, status: 'completed' })),
                      checked: columnFilters.status === 'completed'
                    },
                    {
                      label: 'Closed',
                      onClick: () => setColumnFilters(prev => ({ ...prev, status: 'closed' })),
                      checked: columnFilters.status === 'closed'
                    }
                  ]}
                  className="text-secondary border-primary/50 hover:bg-primary/20"
                >
                  Status
                </FilterDropdownMenu>

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
                  className="text-secondary border-primary/50 hover:bg-primary/20"
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
                  className="text-secondary border-primary/50 hover:bg-primary/20"
                >
                  Duration
                </FilterDropdownMenu>
              </div>
              
              <div className="flex items-center gap-3">
                <DropdownMenu
                  options={allColumns.map((col) => ({
                    label: col,
                    onClick: () => toggleColumn(col),
                    checked: visibleColumns.includes(col),
                  }))}
                >
                  Columns
                </DropdownMenu>
              </div>
            </div>

            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes("Title") && (
                    <TableHead className="w-[200px]">Campaign</TableHead>
                  )}
                  {visibleColumns.includes("Status") && (
                    <TableHead className="w-[120px]">Status</TableHead>
                  )}
                  {visibleColumns.includes("Start Date") && (
                    <TableHead className="w-[150px]">Start Date</TableHead>
                  )}
                  {visibleColumns.includes("End Date") && (
                    <TableHead className="w-[150px]">End Date</TableHead>
                  )}
                  {visibleColumns.includes("Budget") && (
                    <TableHead className="w-[120px]">Budget</TableHead>
                  )}
                  {visibleColumns.includes("Actions") && (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length ? (
                  currentItems.map((campaign) => (
                    <TableRow key={campaign.campaign_id}>
                      {visibleColumns.includes("Title") && (
                        <TableCell>
                          <div>
                            <div className="font-semibold text-secondary text-sm">{campaign.title}</div>
                            <div className="text-xs text-gray-600 truncate max-w-[250px]">
                              {campaign.description}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.includes("Status") && (
                        <TableCell className="whitespace-nowrap">
                          {getStatusBadge(campaign)}
                        </TableCell>
                      )}
                      {visibleColumns.includes("Start Date") && (
                        <TableCell className="whitespace-nowrap text-sm text-secondary">
                          {format(new Date(campaign.start_date), 'MMM dd, yyyy')}
                        </TableCell>
                      )}
                      {visibleColumns.includes("End Date") && (
                        <TableCell className="whitespace-nowrap text-sm text-secondary">
                          {format(new Date(campaign.end_date), 'MMM dd, yyyy')}
                        </TableCell>
                      )}
                      {visibleColumns.includes("Budget") && (
                        <TableCell className="whitespace-nowrap text-sm text-secondary font-medium">
                          {campaign.budget ? `$${campaign.budget}` : 'Not specified'}
                        </TableCell>
                      )}
                      {visibleColumns.includes("Actions") && (
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCampaign(campaign)}
                            className="h-8 text-secondary border-primary/50 hover:bg-primary/20"
                          >
                            <FiEye className="mr-2 h-3 w-3" />
                            View
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length}
                      className="text-center py-12"
                    >
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-[#E8C547]/20 rounded-full flex items-center justify-center">
                          <FiBriefcase className="w-8 h-8 text-secondary" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-secondary">
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
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex flex-row flex-wrap pt-4 items-center justify-between w-full">

              <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="h-8 px-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="text-xs text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
                {totalItems} campaigns
              </div>
              </div>

              {/* Pagination */}
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
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Campaigns;