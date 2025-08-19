import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiClock,
  FiXCircle,
  FiFilter,
  FiUser,
  FiRefreshCw,
  FiDollarSign,
  FiTarget,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { Badge, Button } from './UIComponents';
import { FilterDropdownMenu } from './DropdownComponents';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationPrevious, 
  PaginationNext, 
  PaginationEllipsis 
} from './PaginationComponents';
import { formatDate } from './utils';

// Enhanced Sent Invites Card Component
const SentInviteCard = ({ invite, onResendInvite, onCancelInvite, isLastOdd = false }) => {
  const getInviteStatusBadge = () => {
    switch (invite.invite_status) {
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      default:
        return <Badge variant="default">{invite.invite_status}</Badge>;
    }
  };

  const getApplicationStatusBadge = () => {
    switch (invite.application_status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'pending':
        return <Badge variant="warning">Under Review</Badge>;
      default:
        return <Badge variant="secondary">{invite.application_status}</Badge>;
    }
  };

  const getPaymentStatusBadge = () => {
    switch (invite.pay_status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Payment Pending</Badge>;
      case 'not_paid':
        return <Badge variant="secondary">Not Paid</Badge>;
      default:
        return <Badge variant="secondary">{invite.pay_status}</Badge>;
    }
  };

  const getActionStatusIcon = () => {
    switch (invite.action_status) {
      case 'completed':
        return <FiCheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <FiClock className="w-4 h-4 text-orange-600" />;
      case 'not_started':
        return <FiAlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <FiAlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-xl border border-gray-300 p-5 hover:shadow-lg transition-all duration-200 ${
        isLastOdd ? 'col-span-full' : ''
      }`}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-primary-scale-400 flex items-center justify-center">
              <FiUser className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-scale-500 rounded-full border border-white"></div>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-1">
              {invite.title || `Invite #${invite.influencer_rank}`}
            </h3>
            <p className="text-xs text-gray-600">
              Sent {formatDate(invite.invited_on)}
            </p>
            {invite.objective && (
              <p className="text-xs text-primary-scale-600 font-medium">
                {invite.objective}
              </p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 mb-1">
            <FiDollarSign className="w-3 h-3" />
            {invite.payable_amount}
          </div>
          {invite.fee && (
            <p className="text-xs text-gray-500">
              Fee: ${invite.fee}
            </p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            Expires {formatDate(invite.expiry_date)}
          </p>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FiTarget className="w-3 h-3 text-primary-scale-600" />
            <span className="text-gray-600">Budget:</span>
            <span className="font-medium">${invite.budget}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar className="w-3 h-3 text-primary-scale-600" />
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">
              {formatDate(invite.start_date)} - {formatDate(invite.end_date)}
            </span>
          </div>
          {invite.number_of_influencers && (
            <div className="flex items-center gap-2">
              <FiUser className="w-3 h-3 text-primary-scale-600" />
              <span className="text-gray-600">Influencers:</span>
              <span className="font-medium">{invite.number_of_influencers}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {getActionStatusIcon()}
            <span className="text-gray-600">Progress:</span>
            <span className="font-medium capitalize">
              {invite.action_status?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2 flex-wrap">
            {getInviteStatusBadge()}
            {getApplicationStatusBadge()}
            {getPaymentStatusBadge()}
          </div>
        </div>
        
        {/* Action Buttons */}
        {(invite.invite_status === 'pending' || invite.invite_status === 'expired') && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onResendInvite(invite);
              }}
              className="shadow-sm px-4"
            >
              <FiRefreshCw className="w-3 h-3 sm:mr-1" />
              <span className="hidden text-xs font-semibold sm:inline">
                {invite.invite_status === 'expired' ? 'Resend' : 'Resend'}
              </span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCancelInvite(invite);
              }}
              className="shadow-sm px-4"
            >
              <FiXCircle className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          </div>
        )}

        {/* Additional Info for Completed/Accepted Invites */}
        {invite.action_date && invite.invite_status === 'accepted' && (
          <div className="mt-2 text-xs text-gray-600">
            <span>Action taken: {formatDate(invite.action_date)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function SentInvitesSection({ 
  sentInvites, 
  sentInvitesStats, 
  sentInvitesLoading, 
  onResendInvite, 
  onCancelInvite 
}) {
  // Enhanced Filter state
  const [sentInvitesFilters, setSentInvitesFilters] = useState({
    status: 'all',
    applicationStatus: 'all',
    paymentStatus: 'all'
  });

  // Pagination state
  const [sentInvitesCurrentPage, setSentInvitesCurrentPage] = useState(1);
  const [sentInvitesItemsPerPage, setSentInvitesItemsPerPage] = useState(6);

  // Enhanced Filter and pagination logic
  const filteredSentInvites = sentInvites.filter((invite) => {
    const matchesStatus = 
      !sentInvitesFilters.status || sentInvitesFilters.status === 'all' ? true :
      sentInvitesFilters.status === invite.invite_status?.toLowerCase();

    const matchesApplicationStatus = 
      !sentInvitesFilters.applicationStatus || sentInvitesFilters.applicationStatus === 'all' ? true :
      sentInvitesFilters.applicationStatus === invite.application_status?.toLowerCase();

    const matchesPaymentStatus = 
      !sentInvitesFilters.paymentStatus || sentInvitesFilters.paymentStatus === 'all' ? true :
      sentInvitesFilters.paymentStatus === invite.pay_status?.toLowerCase();

    return matchesStatus && matchesApplicationStatus && matchesPaymentStatus;
  });

  const sentInvitesTotalItems = filteredSentInvites.length;
  const sentInvitesTotalPages = Math.ceil(sentInvitesTotalItems / sentInvitesItemsPerPage);
  const sentInvitesStartIndex = (sentInvitesCurrentPage - 1) * sentInvitesItemsPerPage;
  const sentInvitesEndIndex = sentInvitesStartIndex + sentInvitesItemsPerPage;
  const sentInvitesCurrentItems = filteredSentInvites.slice(sentInvitesStartIndex, sentInvitesEndIndex);

  const handleSentInvitesPageChange = (page) => {
    setSentInvitesCurrentPage(page);
  };

  const handleSentInvitesItemsPerPageChange = (value) => {
    setSentInvitesItemsPerPage(parseInt(value));
    setSentInvitesCurrentPage(1);
  };

  // Calculate enhanced stats
  const enhancedStats = {
    ...sentInvitesStats,
    totalBudget: sentInvites.reduce((sum, invite) => sum + parseFloat(invite.budget || 0), 0),
    totalPayable: sentInvites.reduce((sum, invite) => sum + parseFloat(invite.payable_amount || 0), 0),
    expiredInvites: sentInvites.filter(invite => invite.invite_status === 'expired').length,
    acceptedInvites: sentInvites.filter(invite => invite.invite_status === 'accepted').length,
  };

  if (sentInvitesLoading) {
    return (
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6 space-y-4 card-hover">
      {/* Enhanced Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
            <FiMail className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl tracking-tight font-semibold text-gray-900">
              Campaign Invitations
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Manage and track all sent invitations
            </p>
          </div>
        </div>
        
        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <FiMail className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-gray-700">
              {enhancedStats.totalInvites} sent
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FiClock className="w-4 h-4 text-primary-scale-600" />
            <span className="text-xs font-medium text-gray-700">
              {enhancedStats.pendingInvites} pending
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FiCheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-700">
              {enhancedStats.acceptedInvites} accepted
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FiDollarSign className="w-4 h-4 text-primary-scale-600" />
            <span className="text-xs font-medium text-gray-700">
              ${enhancedStats.totalPayable.toFixed(2)} total
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Section */}
      <div className="flex gap-2 flex-wrap mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-600 w-4 h-4" />
          <span className="text-xs font-medium text-gray-700">Filters:</span>
        </div>
        
        {/* Invite Status Filter */}
        <FilterDropdownMenu
          options={[
            {
              label: 'All Status',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, status: 'all' })),
              checked: !sentInvitesFilters.status || sentInvitesFilters.status === 'all'
            },
            {
              label: 'Pending',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, status: 'pending' })),
              checked: sentInvitesFilters.status === 'pending'
            },
            {
              label: 'Accepted',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, status: 'accepted' })),
              checked: sentInvitesFilters.status === 'accepted'
            },
            {
              label: 'Rejected',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, status: 'rejected' })),
              checked: sentInvitesFilters.status === 'rejected'
            },
            {
              label: 'Expired',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, status: 'expired' })),
              checked: sentInvitesFilters.status === 'expired'
            }
          ]}
          className="text-secondary border-primary/50 hover:bg-primary/20"
        >
          <span className="hidden sm:inline">Invite Status</span>
          <span className="sm:hidden">Status</span>
        </FilterDropdownMenu>

        {/* Application Status Filter */}
        <FilterDropdownMenu
          options={[
            {
              label: 'All Applications',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, applicationStatus: 'all' })),
              checked: !sentInvitesFilters.applicationStatus || sentInvitesFilters.applicationStatus === 'all'
            },
            {
              label: 'Pending Review',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, applicationStatus: 'pending' })),
              checked: sentInvitesFilters.applicationStatus === 'pending'
            },
            {
              label: 'Approved',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, applicationStatus: 'approved' })),
              checked: sentInvitesFilters.applicationStatus === 'approved'
            },
            {
              label: 'Rejected',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, applicationStatus: 'rejected' })),
              checked: sentInvitesFilters.applicationStatus === 'rejected'
            }
          ]}
          className="text-secondary border-primary/50 hover:bg-primary/20"
        >
          <span className="hidden sm:inline">Application</span>
          <span className="sm:hidden">App</span>
        </FilterDropdownMenu>

        {/* Payment Status Filter */}
        <FilterDropdownMenu
          options={[
            {
              label: 'All Payments',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, paymentStatus: 'all' })),
              checked: !sentInvitesFilters.paymentStatus || sentInvitesFilters.paymentStatus === 'all'
            },
            {
              label: 'Not Paid',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, paymentStatus: 'not_paid' })),
              checked: sentInvitesFilters.paymentStatus === 'not_paid'
            },
            {
              label: 'Pending Payment',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, paymentStatus: 'pending' })),
              checked: sentInvitesFilters.paymentStatus === 'pending'
            },
            {
              label: 'Paid',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, paymentStatus: 'paid' })),
              checked: sentInvitesFilters.paymentStatus === 'paid'
            }
          ]}
          className="text-secondary border-primary/50 hover:bg-primary/20"
        >
          <span className="hidden sm:inline">Payment</span>
          <span className="sm:hidden">Pay</span>
        </FilterDropdownMenu>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sentInvitesCurrentItems.length ? (
          <AnimatePresence mode="wait">
            {sentInvitesCurrentItems.map((invite, index) => {
              const isLastItem = index === sentInvitesCurrentItems.length - 1;
              const totalItems = sentInvitesCurrentItems.length;
              const isOddCount = totalItems % 2 !== 0;
              const isLastOdd = isLastItem && isOddCount;
              
              return (
                <SentInviteCard
                  key={invite.invite_id}
                  invite={invite}
                  onResendInvite={onResendInvite}
                  onCancelInvite={onCancelInvite}
                  isLastOdd={isLastOdd}
                />
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-primary-scale-100 rounded-full flex items-center justify-center">
                <FiMail className="w-8 h-8 text-orange-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  No Invitations Found
                </h3>
                <p className="text-xs text-gray-600 max-w-md">
                  No invitations match your current filter criteria. Try adjusting your filters or create new campaign invitations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination - Same as before */}
      {sentInvitesTotalPages > 1 && (
        <div className="flex flex-col lg:flex-row pt-4 items-start lg:items-center justify-between w-full gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Show:</span>
              <select
                value={sentInvitesItemsPerPage}
                onChange={(e) => handleSentInvitesItemsPerPageChange(e.target.value)}
                className="h-8 px-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>

            <div className="text-xs text-gray-600">
              Showing {sentInvitesStartIndex + 1} to {Math.min(sentInvitesEndIndex, sentInvitesTotalItems)} of{" "}
              {sentInvitesTotalItems} invites
            </div>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    handleSentInvitesPageChange(Math.max(1, sentInvitesCurrentPage - 1))
                  }
                  disabled={sentInvitesCurrentPage === 1}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, sentInvitesTotalPages) }, (_, i) => {
                let pageNumber;
                if (sentInvitesTotalPages <= 5) {
                  pageNumber = i + 1;
                } else if (sentInvitesCurrentPage <= 3) {
                  pageNumber = i + 1;
                } else if (sentInvitesCurrentPage >= sentInvitesTotalPages - 2) {
                  pageNumber = sentInvitesTotalPages - 4 + i;
                } else {
                  pageNumber = sentInvitesCurrentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handleSentInvitesPageChange(pageNumber)}
                      isActive={sentInvitesCurrentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {sentInvitesTotalPages > 5 && sentInvitesCurrentPage < sentInvitesTotalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handleSentInvitesPageChange(
                      Math.min(sentInvitesTotalPages, sentInvitesCurrentPage + 1)
                    )
                  }
                  disabled={sentInvitesCurrentPage === sentInvitesTotalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}