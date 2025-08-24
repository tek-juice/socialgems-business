function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  
  export const Button = ({
    className,
    variant = "default",
    size = "default",
    children,
    ...props
  }) => {
    const variants = {
      default:
        "bg-gradient-to-r from-primary to-[#E8C547] text-secondary hover:from-[#E8C547] hover:to-primary",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
      ghost: "text-gray-700 hover:bg-gray-100",
      destructive: "bg-red-500 text-white hover:bg-red-600",
    };
  
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-6 text-sm",
      icon: "h-10 w-10",
    };
  
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  };
  
  export const Input = ({ className, ...props }) => (
    <input
      className={cn(
        "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
  
  export const Badge = ({ className, children, variant = "default", ...props }) => {
    const variants = {
      default: "bg-gray-100 text-gray-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
      info: "bg-primary/10 text-primary",
      gold: "bg-gradient-to-r from-primary to-[#E8C547] text-secondary",
    };
  
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  };
  
  export const Label = ({ className, ...props }) => (
    <label
      className={cn(
        "text-xs font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );