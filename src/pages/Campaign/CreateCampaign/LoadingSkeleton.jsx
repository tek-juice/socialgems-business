import React from "react";

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Stepper Skeleton */}
      <div className="w-full py-6 border-b border-gray-200">
        <div className="w-full mx-auto">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-grow">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                </div>
                {step < 4 && (
                  <div className="flex-grow mx-1">
                    <div className="h-0.5 w-full bg-gray-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mx-auto p-6">
        <div className="p-10 bg-gray-200 rounded-2xl my-8 flex gap-10">
          <div className="w-16 h-16 rounded-xl bg-gray-400"></div>
          <div className="flex flex-col flex-1">
            <div className="h-8 bg-gray-400 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Form fields skeleton */}
          {[1, 2, 3, 4].map((field) => (
            <div key={field} className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
          ))}

          {/* Large text area skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        {/* Button skeleton */}
        <div className="flex justify-between items-center mt-8">
          <div className="h-12 bg-gray-300 rounded-lg w-24"></div>
          <div className="h-12 bg-gray-400 rounded-lg w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;