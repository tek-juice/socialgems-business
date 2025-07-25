import { Button } from './UIComponents';
import {
  FiPlus,
  FiEdit,
  FiPlay,
  FiXCircle,
  FiTrash,
} from 'react-icons/fi';

export default function CampaignActionButtons({
  campaign,
  isDraft,
  canEditCampaign,
  canActivateCampaign,
  canDeleteCampaign,
  canAddMembers,
  getCampaignStatus,
  stats,
  isProcessing,
  loading,
  onAddMembers,
  onEditCampaign,
  onActivateCampaign,
  onCloseCampaign,
  onDeleteCampaign
}) {
  const campaignStatus = getCampaignStatus();
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {canAddMembers && (
        <Button
          onClick={onAddMembers}
          className="shadow-lg hover:shadow-xl"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Members</span>
          <span className="sm:hidden">Add</span>
        </Button>
      )}
      
      {canEditCampaign && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEditCampaign}
          disabled={loading}
          className="shadow-sm hover:shadow-md"
        >
          <FiEdit className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Edit Campaign</span>
          <span className="sm:hidden">Edit</span>
        </Button>
      )}
      
      {canActivateCampaign && (
        <Button
          variant="success"
          size="sm"
          onClick={onActivateCampaign}
          disabled={isProcessing}
          className="shadow-lg hover:shadow-xl"
        >
          <FiPlay className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Activate Campaign</span>
          <span className="sm:hidden">Activate</span>
        </Button>
      )}
      
      {!campaign.closed_date && 
       !canActivateCampaign && 
       campaignStatus !== 'draft' && 
       campaignStatus === 'active' && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCloseCampaign}
          className="shadow-sm hover:shadow-md"
        >
          <FiXCircle className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Close Campaign</span>
          <span className="sm:hidden">Close</span>
        </Button>
      )}
      
      {canDeleteCampaign && (
        <Button
          variant="destructive"
          size="icon"
          onClick={onDeleteCampaign}
          className="shadow-lg hover:shadow-xl"
        >
          <FiTrash className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}