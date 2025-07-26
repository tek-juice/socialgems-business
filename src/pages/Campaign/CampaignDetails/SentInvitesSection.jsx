import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiClock,
  FiXCircle,
  FiFilter,
  FiUser,
  FiRefreshCw,
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

// Sent Invites Card Component - Only for pending invites
const SentInviteCard = ({ invite, onResendInvite, onCancelInvite, isLastOdd = false }) => {
  const getInviteStatusBadge = () => {
    if (invite.invite_status === 'rejected') {
      return <Badge variant="error">Rejected</Badge>;
    }
    if (invite.invite_status === 'pending') {
      return <Badge variant="warning">Pending</Badge>;
    }
    return <Badge variant="default">{invite.invite_status}</Badge>;
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-xl border border-gray-300 p-4 hover:shadow-md transition-all duration-200 ${
        isLastOdd ? 'col-span-full' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-primary-scale-400 flex items-center justify-center">
              <FiUser className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-scale-500 rounded-full border border-white"></div>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-1">
              Invite #{invite.influencer_rank}
            </h3>
            <p className="text-xs text-gray-600">
              Sent {formatDate(invite.invited_on)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              ${invite.payable_amount}
            </div>
            <p className="text-xs text-gray-600">
              Expires {formatDate(invite.expiry_date)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2 flex-wrap">
            {getInviteStatusBadge()}
          </div>
        </div>
        
        {invite.invite_status === 'pending' && (
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
              <span className="hidden text-xs font-semibold sm:inline">Resend</span>
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
  // Filter state
  const [sentInvitesFilters, setSentInvitesFilters] = useState({
    status: 'all'
  });

  // Pagination state
  const [sentInvitesCurrentPage, setSentInvitesCurrentPage] = useState(1);
  const [sentInvitesItemsPerPage, setSentInvitesItemsPerPage] = useState(6);

  // Filter and pagination logic
  const filteredSentInvites = sentInvites.filter((invite) => {
    const matchesStatus = 
      !sentInvitesFilters.status || sentInvitesFilters.status === 'all' ? true :
      sentInvitesFilters.status === invite.invite_status?.toLowerCase();

    return matchesStatus;
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

  if (sentInvitesLoading) {
    return (
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6 space-y-4 card-hover">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
            <FiMail className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl tracking-tight font-semibold text-gray-900">
              Pending Invites
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Invitations awaiting response from influencers
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <FiMail className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-gray-700">
              {sentInvitesStats.totalInvites} sent
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FiClock className="w-4 h-4 text-primary-scale-600" />
            <span className="text-xs font-medium text-gray-700">
              {sentInvitesStats.pendingInvites} pending
            </span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex gap-2 flex-wrap mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-600 w-4 h-4" />
          <span className="text-xs font-medium text-gray-700">Filters:</span>
        </div>
        
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
              label: 'Rejected',
              onClick: () => setSentInvitesFilters(prev => ({ ...prev, status: 'rejected' })),
              checked: sentInvitesFilters.status === 'rejected'
            }
          ]}
          className="text-secondary border-primary/50 hover:bg-primary/20"
        >
          <span className="hidden sm:inline">Invite Status</span>
          <span className="sm:hidden">Status</span>
        </FilterDropdownMenu>
      </div>

      {/* Cards Grid with full-width support for odd last item */}
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
                  No Pending Invites
                </h3>
                <p className="text-xs text-gray-600 max-w-md">
                  All invitations have been responded to or no invites have been sent for this campaign yet.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
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