export const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="h-96 bg-gray-200 rounded-2xl"></div>
    </div>
  );
  
  export const SkeletonStatsCard = () => (
    <div className="animate-pulse bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );