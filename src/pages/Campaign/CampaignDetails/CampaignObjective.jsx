import { FiTarget } from 'react-icons/fi';

export default function CampaignObjective({ objective }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div>
          <h3 className="text-lg sm:text-xl tracking-tight font-semibold text-gray-900">
            Campaign Objective
          </h3>
        </div>
      </div>
      
      <div 
        className="leading-relaxed max-w-none prose prose-sm max-w-none text-xs"
        dangerouslySetInnerHTML={{
          __html: objective
        }}
      />
    </div>
  );
}