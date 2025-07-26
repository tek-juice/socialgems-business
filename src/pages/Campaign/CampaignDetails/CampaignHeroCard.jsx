import { cn } from '../../../lib/utils';
import { getStatusBadge } from './utils';
import { Badge } from './UIComponents';
import {
  FiBriefcase,
  FiCalendar,
  FiUsers,
  FiTarget,
} from 'react-icons/fi';

export default function CampaignHeroCard({ 
  campaign, 
  stats, 
  isDraft, 
  getCampaignStatus, 
  formatDate 
}) {
  return (
    <div className="w-full group/card">
      <div
        className={cn(
          "cursor-pointer overflow-hidden relative card h-96 rounded-2xl shadow-xl w-full flex flex-col justify-between bg-cover bg-center"
        )}
        style={{
          backgroundImage: campaign.image_urls 
            ? `url(${campaign.image_urls})` 
            : 'linear-gradient(135deg, #F9D769 0%, #E8C547 100%)'
        }}
      >
        <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-40" />
        
        {/* Enhanced white background for bottom text */}
        <div className="absolute w-full h-40 bottom-0 left-0 bg-gradient-to-t from-white via-white/95 to-transparent" />
        <div className="absolute w-full h-15 bottom-0 left-0 bg-white" />
        
        <div className="absolute top-4 right-4 z-10">
          {getStatusBadge(campaign, Badge)}
        </div>
        
        <div className="flex flex-row items-center space-x-4 z-10 relative p-6">
          <div className="flex flex-col">
            <p className="font-bold text-sm text-gray-50 relative z-10">
              Campaign Details
            </p>
            <p className="text-xs font-semibold text-gray-300">
              {isDraft ? 'Draft Mode' : 'Live Campaign'}
            </p>
          </div>
        </div>
        
        <div className="text content z-10 relative p-6">
          <div className="flex items-center gap-6 text-gray-900">
            <div className="flex items-center gap-2">
              <FiUsers className="w-4 h-4" />
              <span className="text-sm">{stats.totalMembers} members</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}