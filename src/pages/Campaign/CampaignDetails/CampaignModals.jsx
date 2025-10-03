import { UserProfileModal } from './UserProfileModal';
import { Modal } from './ModalComponents';
import { Button } from './UIComponents';
import {
  FiCheck,
  FiXCircle,
  FiAlertCircle,
  FiDollarSign,
  FiTrash,
  FiMail,
  FiPlay,
} from 'react-icons/fi';

export default function CampaignModals({
  // Modal states
  userProfileModal,
  approvePaymentModal,
  rejectPaymentModal,
  closeCampaignModal,
  payAllModal,
  deleteCampaignModal,
  resendInviteModal,
  cancelInviteModal,
  activateCampaignModal,
  
  // Modal setters
  setUserProfileModal,
  setApprovePaymentModal,
  setRejectPaymentModal,
  setCloseCampaignModal,
  setPayAllModal,
  setDeleteCampaignModal,
  setResendInviteModal,
  setCancelInviteModal,
  setActivateCampaignModal,
  
  // Data
  selectedMember,
  selectedInvite,
  campaign,
  campaignId,
  stats,
  isProcessing,
  industries,
  countries,
  actionedMembers,
  
  // New handlers for UserProfileModal
  getInfluencerDetails,
  onAcceptClick,
  onRejectFromModal,
  
  // Existing handlers
  onPayoutAction,
  onResendInvite,
  onCancelInvite,
  onCloseCampaign,
  onPayAllInfluencers,
  onDeleteCampaign,
  onActivateCampaign
}) {
  return (
    <>
      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={userProfileModal}
        onClose={() => setUserProfileModal(false)}
        member={selectedMember}
        actionedMembers={actionedMembers}
        onPayClick={(member) => {
          setSelectedMember(member);
          setUserProfileModal(false);
          setApprovePaymentModal(true);
        }}
        onRejectClick={onRejectFromModal || ((member) => {
          setSelectedMember(member);
          setUserProfileModal(false);
          setRejectPaymentModal(true);
        })}
        onAcceptClick={onAcceptClick}
        industries={industries}
        countries={countries}
        getInfluencerDetails={getInfluencerDetails}
        campaignId={campaignId || campaign?.campaign_id}
      />

      {/* Payment Modals */}
      {approvePaymentModal && (
        <Modal
          isOpen={approvePaymentModal}
          onClose={() => !isProcessing && setApprovePaymentModal(false)}
          title="Confirm Payment"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Approve Payment</h4>
                <p className="text-xs text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Approve payment for {selectedMember?.userProfile?.first_name} {selectedMember?.userProfile?.last_name}?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">${selectedMember?.payable_amount}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setApprovePaymentModal(false)}
                disabled={isProcessing}
                className="flex-1 shadow-sm"
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={() => onPayoutAction(selectedMember, 'paid')}
                disabled={isProcessing}
                className="flex-1 shadow-lg"
              >
                {isProcessing ? 'Processing...' : 'Approve Payment'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {rejectPaymentModal && (
        <Modal
          isOpen={rejectPaymentModal}
          onClose={() => !isProcessing && setRejectPaymentModal(false)}
          title="Reject Payment"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiXCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Reject Payment</h4>
                <p className="text-xs text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Reject payment for {selectedMember?.userProfile?.first_name} {selectedMember?.userProfile?.last_name}?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setRejectPaymentModal(false)}
                disabled={isProcessing}
                className="flex-1 shadow-sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => onPayoutAction(selectedMember, 'rejected')}
                disabled={isProcessing}
                className="flex-1 shadow-lg"
              >
                {isProcessing ? 'Processing...' : 'Reject Payment'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {closeCampaignModal && (
        <Modal
          isOpen={closeCampaignModal}
          onClose={() => !isProcessing && setCloseCampaignModal(false)}
          title="Close Campaign"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Close Campaign</h4>
                <p className="text-xs text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to close this campaign? No new actions will be allowed after closing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setCloseCampaignModal(false)}
                disabled={isProcessing}
                className="flex-1 shadow-sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onCloseCampaign}
                disabled={isProcessing}
                className="flex-1 shadow-lg"
              >
                {isProcessing ? 'Closing...' : 'Close Campaign'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {payAllModal && (
        <Modal
          isOpen={payAllModal}
          onClose={() => !isProcessing && setPayAllModal(false)}
          title="Pay All Influencers"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Bulk Payment</h4>
                <p className="text-xs text-gray-600">Pay all eligible members at once</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Process payments for all completed tasks?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Members to pay:</span>
                <span className="font-semibold text-gray-900">{stats.pendingPayments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total amount:</span>
                <span className="font-semibold text-gray-900">${stats.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setPayAllModal(false)}
                disabled={isProcessing}
                className="flex-1 shadow-sm"
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={onPayAllInfluencers}
                disabled={isProcessing}
                className="flex-1 shadow-lg"
              >
                <FiDollarSign className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Confirm Payments'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {deleteCampaignModal && (
        <Modal
          isOpen={deleteCampaignModal}
          onClose={() => !isProcessing && setDeleteCampaignModal(false)}
          title="Delete Campaign"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiTrash className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Delete Campaign</h4>
                <p className="text-xs text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to permanently delete this campaign? All campaign data, members, and statistics will be lost.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteCampaignModal(false)}
                disabled={isProcessing}
                className="flex-1 shadow-sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onDeleteCampaign}
                disabled={isProcessing}
                className="flex-1 shadow-lg"
              >
                {isProcessing ? 'Deleting...' : 'Delete Campaign'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Resend Invite Modal */}
      {resendInviteModal && (
        <Modal
          isOpen={resendInviteModal}
          onClose={() => !isProcessing && setResendInviteModal(false)}
          title="Resend Invitation"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiMail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Resend Invitation</h4>
                <p className="text-xs text-gray-600">Send invitation again to the influencer</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Resend invitation for Invite #{selectedInvite?.influencer_rank}?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">${selectedInvite?.payable_amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-gray-900">{selectedInvite?.invite_status}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setResendInviteModal(false)}
                disabled={isProcessing}
                className="flex-1 shadow-sm"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => onResendInvite(selectedInvite)}
                disabled={isProcessing}
                className="flex-1 shadow-lg"
              >
                {isProcessing ? 'Sending...' : 'Resend Invitation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Invite Modal */}
      {cancelInviteModal && (
        <Modal
          isOpen={cancelInviteModal}
          onClose={() => !isProcessing && setCancelInviteModal(false)}
          title="Cancel Invitation"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiXCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Cancel Invitation</h4>
                <p className="text-xs text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Cancel invitation for Invite #{selectedInvite?.influencer_rank}? This invitation will be permanently removed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setCancelInviteModal(false)}
                disabled={isProcessing}
                className="flex-1 shadow-sm"
              >
                Keep Invitation
              </Button>
              <Button
                variant="destructive"
                onClick={() => onCancelInvite(selectedInvite)}
                disabled={isProcessing}
                className="flex-1 shadow-lg"
              >
                {isProcessing ? 'Cancelling...' : 'Cancel Invitation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Activate Campaign Modal */}
      {activateCampaignModal && (
        <Modal
          isOpen={activateCampaignModal}
          onClose={() => !isProcessing && setActivateCampaignModal(false)}
          title="Activate Campaign"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiPlay className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Activate Campaign</h4>
                <p className="text-xs text-gray-600">This will make the campaign live and start sending invites</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to activate "{campaign?.title}"? This will start the campaign and begin sending invites to eligible influencers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setActivateCampaignModal(false)}
                disabled={isProcessing}
                className="flex-1 shadow-sm"
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={onActivateCampaign}
                disabled={isProcessing}
                className="flex-1 shadow-lg"
              >
                {isProcessing ? 'Activating...' : 'Activate Campaign'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}