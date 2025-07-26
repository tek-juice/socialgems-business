import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiDollarSign,
  FiFilter,
  FiPlus,
  FiCheck,
  FiX,
  FiCheckSquare,
  FiSquare,
} from 'react-icons/fi';
import { Button } from './UIComponents';
import { FilterDropdownMenu } from './DropdownComponents';
import { InfluencerCard } from './InfluencerCard';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationPrevious, 
  PaginationNext, 
  PaginationEllipsis 
} from './PaginationComponents';
import { get } from '../../../utils/service';
import { toast } from 'sonner';

export default function MembersSection({ 
  actionedMembers, 
  stats, 
  isProcessing, 
  canAddMembers,
  campaign,
  onAddMembers,
  onMemberClick,
  onPayClick,
  onRejectClick,
  onViewTasks,
  onBatchProcessApplications,
  // Accept click handler from parent
  onAcceptClick
}) {
  // State for approved users and combined data
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [combinedMembers, setCombinedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter state - Updated to include user type filter
  const [columnFilters, setColumnFilters] = useState({
    actionStatus: 'all',
    paymentStatus: 'all',
    amount: 'all',
    applicationStatus: 'all',
    userType: 'all' // New filter for accepted/approved
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  
  // Batch selection state
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showBatchActions, setShowBatchActions] = useState(false);

  // Function to fetch user profile details for missing data
  const fetchUserProfile = async (userId) => {
    try {
      const response = await get(`users/influencerDetails/${userId}`);
      if (response?.status === 200 && response?.data) {
        return {
          profile_pic: response.data.profile_pic,
          first_name: response.data.name?.split(' ')[0] || 'Unknown',
          last_name: response.data.name?.split(' ').slice(1).join(' ') || 'User',
          full_name: response.data.name || 'Unknown User',
          username: response.data.username,
          influencer_rating: response.data.sgRating || 0,
          iso_code: response.data.location
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Fetch approved users
  const fetchApprovedUsers = async () => {
    if (!campaign?.campaign_id) return;
    
    try {
      const response = await get(`campaigns/approved-influencers/${campaign.campaign_id}`);
      
      if (response?.status === 200 && response?.data) {
        // Transform the approved users data and fetch missing profile data
        const transformedData = await Promise.all(
          response.data.map(async (user) => {
            // Fetch user profile details for missing data
            const profileData = await fetchUserProfile(user.user_id);
            
            return {
              // Keep all original fields
              ...user,
              // Add missing fields for component compatibility
              id: user.user_id,
              full_name: profileData?.full_name || `User ${user.user_id.slice(-4)}`,
              profile_pic: profileData?.profile_pic,
              first_name: profileData?.first_name || 'Unknown',
              last_name: profileData?.last_name || 'User',
              username: profileData?.username,
              influencer_rating: profileData?.influencer_rating || 0,
              iso_code: profileData?.iso_code,
              country_name: profileData?.iso_code,
              
              // Add userProfile object for backward compatibility
              userProfile: {
                profile_pic: profileData?.profile_pic,
                first_name: profileData?.first_name || 'Unknown',
                last_name: profileData?.last_name || 'User',
                influencer_rating: profileData?.influencer_rating || 0,
                iso_code: profileData?.iso_code,
                username: profileData?.username
              },
              
              // Tasks array and mark as approved user
              tasks: user.tasks || [],
              userType: 'approved' // Mark as approved user
            };
          })
        );
        
        setApprovedUsers(transformedData);
        return transformedData;
      } else {
        setApprovedUsers([]);
        return [];
      }
    } catch (error) {
      setApprovedUsers([]);
      toast.error('Failed to fetch approved users');
      return [];
    }
  };

  // Fetch accepted users (enhance existing actionedMembers with profile data if missing)
  const enhanceActionedMembers = async (members) => {
    if (!members || members.length === 0) return [];
    
    const enhancedMembers = await Promise.all(
      members.map(async (member) => {
        // If profile picture is missing, fetch it
        let profileData = null;
        if (!member.profile_pic && !member.userProfile?.profile_pic) {
          profileData = await fetchUserProfile(member.user_id);
        }
        
        return {
          ...member,
          // Enhance with fetched profile data if needed
          profile_pic: member.profile_pic || member.userProfile?.profile_pic || profileData?.profile_pic,
          full_name: member.full_name || `${member.first_name} ${member.last_name}`,
          userProfile: {
            ...member.userProfile,
            profile_pic: member.userProfile?.profile_pic || profileData?.profile_pic
          },
          userType: 'accepted' // Mark as accepted user
        };
      })
    );
    
    return enhancedMembers;
  };

  // Combine accepted and approved users
  const combineMembers = async () => {
    if (!campaign?.campaign_id) return;
    
    setLoading(true);
    try {
      // Fetch approved users
      const approvedData = await fetchApprovedUsers();
      
      // Enhance accepted members with missing profile data
      const enhancedAccepted = await enhanceActionedMembers(actionedMembers);
      
      // Combine both arrays
      const combined = [...enhancedAccepted, ...approvedData];
      setCombinedMembers(combined);
      
    } catch (error) {
      console.error('❌ Error combining members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or campaign/actionedMembers changes
  useEffect(() => {
    if (campaign?.campaign_id) {
      combineMembers();
    }
  }, [campaign?.campaign_id, actionedMembers]);

  // Filter members based on all criteria including user type
  const filteredMembers = combinedMembers.filter((member) => {
    // Hide rejected applications completely
    if (member.application_status === 'rejected') {
      return false;
    }

    // User type filter (accepted/approved)
    const matchesUserType = 
      !columnFilters.userType || columnFilters.userType === 'all' ? true :
      columnFilters.userType === 'accepted' ? member.userType === 'accepted' :
      columnFilters.userType === 'approved' ? member.userType === 'approved' :
      true;

    const matchesActionStatus = 
      !columnFilters.actionStatus || columnFilters.actionStatus === 'all' ? true :
      columnFilters.actionStatus === member.action_status?.toLowerCase();

    const matchesPaymentStatus = 
      !columnFilters.paymentStatus || columnFilters.paymentStatus === 'all' ? true :
      columnFilters.paymentStatus === member.pay_status?.toLowerCase();

    const matchesApplicationStatus = 
      !columnFilters.applicationStatus || columnFilters.applicationStatus === 'all' ? true :
      columnFilters.applicationStatus === member.application_status?.toLowerCase();

    const memberAmount = parseFloat(member.payable_amount || 0);
    const matchesAmount = 
      !columnFilters.amount || columnFilters.amount === 'all' ? true :
      columnFilters.amount === 'positive' ? memberAmount > 0 :
      columnFilters.amount === 'negative' ? memberAmount < 0 :
      true;

    return matchesUserType && matchesActionStatus && matchesPaymentStatus && matchesAmount && matchesApplicationStatus;
  });

  // Get pending applications (submitted status means pending review)
  const pendingApplications = filteredMembers.filter(member => 
    (member.application_status === 'submitted' || member.application_status === 'pending') && 
    member.userType === 'accepted'
  );

  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredMembers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Batch selection handlers
  const handleSelectionChange = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    const pendingIds = pendingApplications.map(member => member.user_id);
    setSelectedMembers(selectedMembers.length === pendingIds.length ? [] : pendingIds);
  };

  const toggleBatchActions = () => {
    setShowBatchActions(!showBatchActions);
    setSelectedMembers([]);
  };

  // Enhanced member click handler that passes campaign context
  const handleMemberClick = (member) => {
    // Enhance member data with campaign context for review functionality
    const enhancedMember = {
      ...member,
      campaign_id: campaign?.campaign_id, // Ensure campaign_id is available for reviews
      campaign_title: campaign?.title // Add campaign title for context
    };
    
    // Call the parent's onMemberClick with enhanced member data
    if (onMemberClick) {
      onMemberClick(enhancedMember);
    }
  };

  // Individual application handlers
  const handleAcceptApplication = async (member) => {
    if (onAcceptClick) {
      onAcceptClick(member);
      
      // Refresh combined members after accept
      setTimeout(() => {
        combineMembers();
      }, 1000);
    } else {
      await handleBatchProcess([member.user_id], []);
    }
  };

  const handleRejectApplication = async (member) => {
    if (onRejectClick) {
      onRejectClick(member);
      
      // Refresh combined members after reject
      setTimeout(() => {
        combineMembers();
      }, 1000);
    } else {
      await handleBatchProcess([], [member.user_id]);
    }
  };

  // Batch process applications
  const handleBatchProcess = async (acceptedIds, rejectedIds) => {
    if (!campaign?.campaign_id) return;
    
    try {
      await onBatchProcessApplications({
        campaign_id: campaign.campaign_id,
        accepted_applications: acceptedIds,
        rejected_applications: rejectedIds
      });
      
      setSelectedMembers([]);
      
      // Refresh combined members after batch process
      setTimeout(() => {
        combineMembers();
      }, 1000);
    } catch (error) {
      console.error('Error processing applications:', error);
    }
  };

  const handleBatchAccept = () => {
    handleBatchProcess(selectedMembers, []);
  };

  const handleBatchReject = () => {
    handleBatchProcess([], selectedMembers);
  };

  // Get counts for display
  const acceptedCount = combinedMembers.filter(m => m.userType === 'accepted').length;
  const approvedCount = combinedMembers.filter(m => m.userType === 'approved').length;

  // Skeleton loading component
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex space-x-2 pt-2">
          <div className="h-8 bg-gray-200 rounded-md w-1/3 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded-md w-1/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg sm:text-xl tracking-tight font-semibold text-gray-900">
              Campaign Members
            </h3>
          </div>
        </div>
        
        {canAddMembers && (
          <Button 
            onClick={onAddMembers}
            className="shadow-lg"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Members</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>

      {/* Batch Actions Section for Pending Applications */}
      {pendingApplications.length > 0 && (
        <div className="bg-[#F9D769] rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#734D20] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{pendingApplications.length}</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900">
                  Pending Applications
                </h4>
                <p className="text-xs text-gray-600">
                  {pendingApplications.length} applications waiting for review
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleBatchActions}
                className="shadow-sm"
              >
                {showBatchActions ? 'Cancel Batch' : 'Batch Actions'}
              </Button>
              
              {showBatchActions && selectedMembers.length > 0 && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleBatchAccept}
                    disabled={isProcessing}
                    className="shadow-sm"
                  >
                    <FiCheck className="w-3 h-3 mr-1" />
                    Accept ({selectedMembers.length})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBatchReject}
                    disabled={isProcessing}
                    className="shadow-sm"
                  >
                    <FiX className="w-3 h-3 mr-1" />
                    Reject ({selectedMembers.length})
                  </Button>
                </>
              )}
              
              {showBatchActions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="shadow-sm"
                >
                  {selectedMembers.length === pendingApplications.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : currentItems.length ? (
          <AnimatePresence mode="wait">
            {currentItems.map((member, index) => {
              const isLastOdd = currentItems.length % 2 !== 0 && index === currentItems.length - 1;
              const isPendingApplication = member.userType === 'accepted' && 
                (member.application_status === 'submitted' || member.application_status === 'pending');
              const isSelected = selectedMembers.includes(member.user_id);
              
              return (
                <InfluencerCard
                  key={member.user_id}
                  member={member}
                  onClick={handleMemberClick} // Use enhanced handler
                  onPayClick={onPayClick}
                  onRejectClick={onRejectClick}
                  onViewTasks={onViewTasks}
                  onAcceptApplication={handleAcceptApplication}
                  onRejectApplication={handleRejectApplication}
                  isLastOdd={isLastOdd}
                  isSelected={isSelected}
                  onSelectionChange={() => handleSelectionChange(member.user_id)}
                  showBatchActions={showBatchActions && isPendingApplication}
                  showApplicationActions={isPendingApplication}
                  showAcceptedIcon={member.userType === 'approved'}
                />
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F9D769]/20 to-[#E8C547]/20 rounded-full flex items-center justify-center">
                <FiUsers className="w-8 h-8 text-[#734D20]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#734D20]">
                  No Campaign Members Found
                </h3>
                <p className="text-xs text-gray-600 max-w-md">
                  This campaign doesn't have any members matching your current filters. Try adjusting your filters or invite influencers to join this campaign.
                </p>
              </div>
              {canAddMembers && (
                <Button 
                  onClick={onAddMembers}
                  className="mt-4 shadow-lg"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Invite Members
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col lg:flex-row pt-4 items-start lg:items-center justify-between w-full gap-4">
          <div className="flex flex-col gap-2">
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
              </select>
            </div>

            <div className="text-xs text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
              {totalItems} members
            </div>
          </div>

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
        </div>
      )}
    </div>
  );
}