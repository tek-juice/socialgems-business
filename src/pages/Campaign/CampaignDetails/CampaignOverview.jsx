import {
  FiBarChart,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiCheck,
  FiClock,
  FiAward,
} from 'react-icons/fi';

export default function CampaignOverview({ campaign, stats, sentInvitesStats }) {
  return (
    <div className="rounded-xl p-3 sm:p-6 border border-gray-200">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-6 text-sm divide-x-2 divide-gray-200">
          <div className="flex justify-center items-center">
            <div>
              <p className="text-2xl text-center font-bold text-gray-900">
                {campaign.budget ? `$${parseInt(campaign.budget)}` : 'Not set'}
              </p>
              <p className="text-xs text-center font-medium text-gray-600">Budget</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center">
            <div>
              <p className="text-2xl text-center font-bold text-gray-900">
                {Math.ceil((new Date(campaign.end_date) - new Date(campaign.start_date)) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-xs text-center font-medium text-gray-600">Days</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center">
            <div>
              <p className="text-2xl text-center font-bold text-gray-900">
                {sentInvitesStats?.totalInvites || 0}
              </p>
              <p className="text-xs text-center font-medium text-gray-600">Sent Invites</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}