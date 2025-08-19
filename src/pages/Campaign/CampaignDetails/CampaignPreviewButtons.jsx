// Complete CampaignPreviewButtons.jsx with Desktop Modal + Mobile Drawer Pattern
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiMail, 
  FiClock, 
  FiCheck, 
  FiEye,
  FiUser,
  FiDollarSign,
  FiMapPin,
  FiRefreshCw,
  FiXCircle,
  FiStar,
  FiActivity,
  FiX
} from 'react-icons/fi';
import { Badge, Button } from './UIComponents';
import { formatDate } from './utils';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './drawer';

// Enhanced InfluencerCard Component with Full Data
const InfluencerCard = ({ influencer, onMemberClick, onClose, type = "accepted" }) => {
  const getBadgeVariant = () => {
    switch (type) {
      case 'accepted': return 'success';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getBadgeText = () => {
    switch (type) {
      case 'accepted': return 'Accepted';
      case 'pending': return 'Pending';
      default: return influencer.application_status;
    }
  };

  // Use the userProfile data from your response object
  const profileData = influencer.userProfile || influencer;
  const profilePic = profileData.profile_pic || influencer.profile_pic;
  const fullName = influencer.full_name || 
    (profileData.first_name && profileData.last_name ? 
      `${profileData.first_name} ${profileData.last_name}` : 
      `${influencer.first_name || ''} ${influencer.last_name || ''}`.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={() => {
        onMemberClick(influencer);
        onClose();
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          {profilePic ? (
            <img
              src={profilePic}
              alt={fullName}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Placeholder - always render but hide if image loads */}
          <div 
            className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary-scale-400 to-primary-scale-500 flex items-center justify-center ${profilePic ? 'hidden' : 'flex'}`}
          >
            <FiUser className="w-6 h-6 text-white" />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            type === 'accepted' ? 'bg-green-500' : 
            type === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
          }`}></div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900">
            {fullName || profileData.username || 'Unknown User'}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FiMapPin className="w-3 h-3" />
            <span>{influencer.country_name || profileData.iso_code || 'Unknown'}</span>
            <span>•</span>
            <FiDollarSign className="w-3 h-3" />
            <span>${influencer.payable_amount || '0.00'}</span>
          </div>
          {/* Additional info from userProfile */}
          {profileData.influencer_rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <FiStar className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-gray-600">{profileData.influencer_rating}</span>
            </div>
          )}
        </div>
        <Badge variant={getBadgeVariant()} className="text-xs">
          {getBadgeText()}
        </Badge>
      </div>
    </motion.div>
  );
};

// Enhanced InviteCard Component with Full Data
const InviteCard = ({ invite, onResendInvite, onCancelInvite, onClose }) => {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="warning" className="text-xs">Pending</Badge>;
      case 'expired':
        return <Badge variant="destructive" className="text-xs">Expired</Badge>;
      case 'rejected':
        return <Badge variant="error" className="text-xs">Rejected</Badge>;
      case 'accepted':
        return <Badge variant="success" className="text-xs">Accepted</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'from-yellow-400 to-yellow-500';
      case 'expired': return 'from-red-400 to-red-500';
      case 'rejected': return 'from-gray-400 to-gray-500';
      case 'accepted': return 'from-green-400 to-green-500';
      default: return 'from-blue-400 to-blue-500';
    }
  };

  const getBorderColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'border-yellow-200';
      case 'expired': return 'border-red-200';
      case 'rejected': return 'border-gray-200';
      case 'accepted': return 'border-green-200';
      default: return 'border-blue-200';
    }
  };

  const getBackgroundColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-50';
      case 'expired': return 'bg-red-50';
      case 'rejected': return 'bg-gray-50';
      case 'accepted': return 'bg-green-50';
      default: return 'bg-blue-50';
    }
  };

  // Use userProfile data if available
  const profileData = invite.userProfile || invite;
  const profilePic = profileData.profile_pic || invite.profile_pic;
  const fullName = profileData.first_name && profileData.last_name 
    ? `${profileData.first_name} ${profileData.last_name}`
    : `Invite #${invite.influencer_rank || invite.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${getBackgroundColor(invite.invite_status)} rounded-xl p-4 border ${getBorderColor(invite.invite_status)}`}
    >
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          {profilePic ? (
            <img
              src={profilePic}
              alt="Influencer"
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Placeholder */}
          <div 
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${getStatusColor(invite.invite_status)} flex items-center justify-center ${profilePic ? 'hidden' : 'flex'}`}
          >
            <FiUser className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${
              invite.invite_status === 'pending' ? 'bg-yellow-500' :
              invite.invite_status === 'expired' ? 'bg-red-500' :
              invite.invite_status === 'rejected' ? 'bg-gray-500' :
              invite.invite_status === 'accepted' ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
          </div>
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900">
            {fullName}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FiClock className="w-3 h-3" />
            <span>Sent {formatDate(invite.invited_on)}</span>
            {invite.expiry_date && (
              <>
                <span>•</span>
                <span>Expires {formatDate(invite.expiry_date)}</span>
              </>
            )}
          </div>
          {/* Show username if available */}
          {profileData.username && (
            <div className="text-xs text-gray-500 mt-1">
              @{profileData.username}
            </div>
          )}
        </div>
        
        {getStatusBadge(invite.invite_status)}
      </div>

      {/* Payment and Stats Info */}
      <div className="bg-white/70 rounded-lg p-3 mb-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FiDollarSign className="w-3 h-3 text-green-600" />
            <span className="text-gray-600">Payment:</span>
            <span className="font-semibold">${invite.payable_amount}</span>
          </div>
          {invite.fee && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Fee:</span>
              <span className="font-semibold">${invite.fee}</span>
            </div>
          )}
          {invite.application_status && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Application:</span>
              <span className="font-semibold capitalize">{invite.application_status}</span>
            </div>
          )}
          {invite.pay_status && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Payment:</span>
              <span className="font-semibold capitalize">{invite.pay_status.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Info if available */}
      {invite.tasks && invite.tasks.length > 0 && (
        <div className="bg-white/70 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FiActivity className="w-3 h-3" />
            <span>{invite.tasks.length} task{invite.tasks.length !== 1 ? 's' : ''} assigned</span>
          </div>
        </div>
      )}

      {/* Action Buttons - Show based on actual status */}
      {(invite.invite_status === 'pending' || invite.invite_status === 'expired') && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onResendInvite(invite);
              onClose();
            }}
            className="flex-1"
          >
            <FiRefreshCw className="w-3 h-3 mr-1" />
            {invite.invite_status === 'expired' ? 'Resend' : 'Resend'}
          </Button>
          {/* <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              onCancelInvite(invite);
              onClose();
            }}
            className="flex-1"
          >
            <FiXCircle className="w-3 h-3 mr-1" />
            Cancel
          </Button> */}
        </div>
      )}

      {/* Read-only info for accepted/rejected invites */}
      {(invite.invite_status === 'accepted' || invite.invite_status === 'rejected') && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-600">
            {invite.invite_status === 'accepted' 
              ? 'Invite was accepted' 
              : 'Invite was rejected'
            }
            {invite.action_date && (
              <span> on {formatDate(invite.action_date)}</span>
            )}
          </p>
        </div>
      )}
    </motion.div>
  );
};

// Enhanced PendingApplicationCard Component
const PendingApplicationCard = ({ application, onMemberClick, onAccept, onReject, onClose }) => {
  const profileData = application.userProfile || application;
  const profilePic = profileData.profile_pic || application.profile_pic;
  const fullName = application.full_name || 
    (profileData.first_name && profileData.last_name ? 
      `${profileData.first_name} ${profileData.last_name}` : 
      'Unknown User');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-50 rounded-xl p-4 border border-yellow-200"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          {profilePic ? (
            <img
              src={profilePic}
              alt={fullName}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Placeholder */}
          <div 
            className={`w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center ${profilePic ? 'hidden' : 'flex'}`}
          >
            <FiUser className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900">
            {fullName}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FiMapPin className="w-3 h-3" />
            <span>{application.country_name || profileData.iso_code || 'Unknown'}</span>
            <span>•</span>
            <FiDollarSign className="w-3 h-3" />
            <span>${application.payable_amount || '0.00'}</span>
          </div>
          {profileData.username && (
            <div className="text-xs text-gray-500 mt-1">
              @{profileData.username}
            </div>
          )}
        </div>
        <Badge variant="warning" className="text-xs">Pending</Badge>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="success"
          onClick={() => {
            onAccept(application);
            onClose();
          }}
          className="flex-1"
        >
          <FiCheck className="w-3 h-3 mr-1" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            onReject(application);
            onClose();
          }}
          className="flex-1"
        >
          <FiXCircle className="w-3 h-3 mr-1" />
          Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            onMemberClick(application);
            onClose();
          }}
          className="px-3"
        >
          View
        </Button>
      </div>
    </motion.div>
  );
};

// Main Component with Desktop Modal + Mobile Drawer Pattern
export default function CampaignPreviewButtons({
  // Data props
  actionedInfluencers = [],
  pendingApplications = [],
  sentInvites = [],
  stats = {},
  sentInvitesStats = {},

  // Handler props
  onMemberClick,
  onAcceptClick,
  onRejectClick,
  onResendInvite,
  onCancelInvite
}) {
  const [modals, setModals] = useState({
    acceptedInfluencers: false,
    pendingApplications: false,
    sentInvites: false
  });

  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile (same logic as UserProfileModal)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  // Enhanced stats calculation
  const enhancedSentInvitesStats = {
    totalInvites: sentInvitesStats.totalInvites || 0,
    pendingInvites: sentInvitesStats.pendingInvites || 0,
    expiredInvites: sentInvitesStats.expiredInvites || sentInvites.filter(inv => inv.invite_status === 'expired').length,
    acceptedInvites: sentInvitesStats.acceptedInvites || sentInvites.filter(inv => inv.invite_status === 'accepted').length,
    rejectedInvites: sentInvitesStats.rejectedInvites || sentInvites.filter(inv => inv.invite_status === 'rejected').length,
  };

  // Shared Content Components
  const AcceptedInfluencersContent = () => (
    <div className={`${!isMobile ? 'overflow-y-auto max-h-[80vh]' : ''}`}>
      <div className="space-y-3 p-6">
        {actionedInfluencers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-500 text-sm">No accepted influencers yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {actionedInfluencers.map((influencer) => (
              <InfluencerCard
                key={influencer.user_id}
                influencer={influencer}
                onMemberClick={onMemberClick}
                onClose={() => closeModal('acceptedInfluencers')}
                type="accepted"
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );

  const PendingApplicationsContent = () => (
    <div className={`${!isMobile ? 'overflow-y-auto max-h-[80vh]' : ''}`}>
      <div className="space-y-3 p-6">
        {pendingApplications.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiClock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-gray-500 text-sm">No pending applications</p>
          </div>
        ) : (
          <AnimatePresence>
            {pendingApplications.map((application) => (
              <PendingApplicationCard
                key={application.user_id}
                application={application}
                onMemberClick={onMemberClick}
                onAccept={onAcceptClick}
                onReject={onRejectClick}
                onClose={() => closeModal('pendingApplications')}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );

  const SentInvitesContent = () => (
    <div className={`${!isMobile ? 'overflow-y-auto max-h-[80vh]' : ''}`}>
      <div className="p-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{enhancedSentInvitesStats.totalInvites}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{enhancedSentInvitesStats.pendingInvites}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{enhancedSentInvitesStats.expiredInvites}</div>
            <div className="text-xs text-gray-600">Expired</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{enhancedSentInvitesStats.acceptedInvites}</div>
            <div className="text-xs text-gray-600">Accepted</div>
          </div>
        </div>

        {/* Invites List */}
        <div className="space-y-3">
          {sentInvites.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-500 text-sm">No sent invites</p>
            </div>
          ) : (
            <AnimatePresence>
              {sentInvites.map((invite) => (
                <InviteCard
                  key={invite.invite_id}
                  invite={invite}
                  onResendInvite={onResendInvite}
                  onCancelInvite={onCancelInvite}
                  onClose={() => closeModal('sentInvites')}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );

  // Conditional Modal/Drawer Rendering (following UserProfileModal pattern)
  const renderAcceptedInfluencersModal = () => {
    if (isMobile && modals.acceptedInfluencers) {
      return (
        <Drawer open={modals.acceptedInfluencers} onOpenChange={() => closeModal('acceptedInfluencers')}>
          <DrawerContent className="max-h-[90vh] bg-white border-none">
            <div className="mx-auto w-full max-w-lg">
              <DrawerHeader className="sr-only">
                <DrawerTitle>Accepted Influencers</DrawerTitle>
                <DrawerDescription>View all confirmed campaign participants</DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto max-h-[85vh]">
                <AcceptedInfluencersContent />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      );
    }

    if (!isMobile && modals.acceptedInfluencers) {
      return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => closeModal('acceptedInfluencers')}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => closeModal('acceptedInfluencers')}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 shadow-xl backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-all duration-200"
            >
              <FiX className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Accepted Influencers</h2>
              <p className="text-sm text-gray-600">View all confirmed campaign participants</p>
            </div>

            <AcceptedInfluencersContent />
          </motion.div>
        </div>,
        document.body
      );
    }

    return null;
  };

  const renderPendingApplicationsModal = () => {
    if (isMobile && modals.pendingApplications) {
      return (
        <Drawer open={modals.pendingApplications} onOpenChange={() => closeModal('pendingApplications')}>
          <DrawerContent className="max-h-[90vh] bg-white border-none">
            <div className="mx-auto w-full max-w-lg">
              <DrawerHeader className="sr-only">
                <DrawerTitle>Pending Applications</DrawerTitle>
                <DrawerDescription>Review applications awaiting approval</DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto max-h-[85vh]">
                <PendingApplicationsContent />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      );
    }

    if (!isMobile && modals.pendingApplications) {
      return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => closeModal('pendingApplications')}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => closeModal('pendingApplications')}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 shadow-xl backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-all duration-200"
            >
              <FiX className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Pending Applications</h2>
              <p className="text-sm text-gray-600">Review applications awaiting approval</p>
            </div>

            <PendingApplicationsContent />
          </motion.div>
        </div>,
        document.body
      );
    }

    return null;
  };

  const renderSentInvitesModal = () => {
    if (isMobile && modals.sentInvites) {
      return (
        <Drawer open={modals.sentInvites} onOpenChange={() => closeModal('sentInvites')}>
          <DrawerContent className="max-h-[90vh] bg-white border-none">
            <div className="mx-auto w-full max-w-lg">
              <DrawerHeader className="sr-only">
                <DrawerTitle>Sent Invites</DrawerTitle>
                <DrawerDescription>Manage campaign invitations</DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto max-h-[85vh]">
                <SentInvitesContent />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      );
    }

    if (!isMobile && modals.sentInvites) {
      return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => closeModal('sentInvites')}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => closeModal('sentInvites')}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 shadow-xl backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-all duration-200"
            >
              <FiX className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Sent Invites</h2>
              <p className="text-sm text-gray-600">Manage campaign invitations</p>
            </div>

            <SentInvitesContent />
          </motion.div>
        </div>,
        document.body
      );
    }

    return null;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <FiUsers className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-xs text-gray-600">View and manage campaign participants</p>
          </div>
        </div>

        {/* Accepted Influencers Button */}
        <div className="bg-[#F9D769] rounded-xl p-4 mb-4">
          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#734D20] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{stats.totalMembers || 0}</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900">
                  Accepted Influencers
                </h4>
                <p className="text-xs text-gray-600">
                  {stats.totalMembers || 0} confirmed participants
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal('acceptedInfluencers')}
                className="shadow-sm"
              >
                View All
              </Button>
            </div>
          </div>
        </div>

        {/* Pending Applications Button */}
        {pendingApplications.length > 0 && (
          <div className="bg-[#F9D769] rounded-xl p-4 mb-4">
            <div className="flex flex-wrap justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#734D20] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{pendingApplications.length}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">
                    Pending Applications
                  </h4>
                  <p className="text-xs text-gray-600">
                    {pendingApplications.length} applications awaiting review
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openModal('pendingApplications')}
                  className="shadow-sm"
                >
                  Review
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Sent Invites Button */}
        {enhancedSentInvitesStats.totalInvites > 0 && (
          <div className="bg-[#F9D769] rounded-xl p-4 mb-4">
            <div className="flex flex-wrap justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#734D20] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{enhancedSentInvitesStats.totalInvites}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">
                    Sent Invites
                  </h4>
                  <p className="text-xs text-gray-600">
                    {enhancedSentInvitesStats.pendingInvites} pending • {enhancedSentInvitesStats.expiredInvites} expired • {enhancedSentInvitesStats.acceptedInvites} accepted
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openModal('sentInvites')}
                  className="shadow-sm"
                >
                  Manage
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Render Modal/Drawer Components */}
      {renderAcceptedInfluencersModal()}
      {renderPendingApplicationsModal()}
      {renderSentInvitesModal()}
    </>
  );
}