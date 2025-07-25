import { cn } from '../../../lib/utils';
import { getStatusBadge } from './utils';
import { Badge } from './UIComponents';
import {
  FiBriefcase,
  FiCalendar,
  FiUsers,
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
          "cursor-pointer overflow-hidden relative card h-96 rounded-2xl shadow-xl w-full flex flex-col justify-between p-6 bg-cover bg-center",
          "card-hover"
        )}
        style={{
          backgroundImage: campaign.image_urls 
            ? `url(${campaign.image_urls})` 
            : 'linear-gradient(135deg, #F9D769 0%, #E8C547 100%)'
        }}
      >
        <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60" />
        <div className="absolute w-full h-32 bottom-0 left-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent" />
        
        <div className="absolute top-4 right-4 z-10">
          {getStatusBadge(campaign, Badge)}
        </div>
        
        <div className="flex flex-row items-center space-x-4 z-10">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <FiBriefcase className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="font-normal text-sm text-gray-50 relative z-10">
              Created {formatDate(campaign.start_date)}
            </p>
            <p className="text-xs text-gray-300">
              {stats.totalMembers} members • ${campaign.budget || 'No budget set'}
            </p>
          </div>
        </div>
        
        <div className="text content z-10 relative">
          <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl text-gray-900 relative z-10 mb-2">
            {campaign.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-700">
            <div className="flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              <span className="text-xs">
                {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <FiUsers className="w-4 h-4" />
              <span className="text-xs">{stats.totalMembers} members</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}