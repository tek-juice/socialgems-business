function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  
  export const SkeletonCard = ({ className, children }) => (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 p-6", className)}>
      {children}
    </div>
  );
  
  export const SkeletonLine = ({ className }) => (
    <div className={cn("bg-gray-200 rounded animate-pulse", className)} />
  );
  
  export const SkeletonCircle = ({ className }) => (
    <div className={cn("bg-gray-200 rounded-full animate-pulse", className)} />
  );
  
  export const SkeletonButton = ({ className }) => (
    <div className={cn("bg-gray-200 rounded-lg animate-pulse", className)} />
  );