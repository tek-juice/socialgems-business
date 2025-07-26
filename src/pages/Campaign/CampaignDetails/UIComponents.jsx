import { cn } from '../../../lib/utils';

export const Button = ({ className, variant = "default", size = "default", children, disabled, ...props }) => {
  const variants = {
    default: "bg-gradient-to-r from-primary to-[#E8C547] text-secondary hover:from-[#E8C547] hover:to-primary hover:shadow-lg",
    outline: "bg-secondary text-white hover:bg-primary hover:text-secondary hover:shadow-sm",
    ghost: "text-gray-700 hover:bg-gray-100 hover:shadow-sm",
    destructive: "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg",
    success: "bg-green-500 text-white hover:bg-green-600 hover:shadow-lg"
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-xs",
    icon: "h-10 w-10"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105 active:scale-95",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ className, ...props }) => (
  <input
    className={cn(
      "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
      className
    )}
    {...props}
  />
);

export const Badge = ({ className, children, variant = "default", ...props }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 border border-gray-200",
    success: "bg-green-100 text-green-800 border border-green-200",
    warning: "bg-primary-scale-100 text-secondary border border-primary-scale-200",
    error: "bg-red-100 text-red-800 border border-red-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200",
    active: "bg-gradient-to-r from-primary to-[#E8C547] text-secondary shadow-sm"
  };
  
  return (
    <div className={cn(
      "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all duration-200 hover:shadow-md",
      variants[variant],
      className
    )} {...props}>
      {children}
    </div>
  );
};