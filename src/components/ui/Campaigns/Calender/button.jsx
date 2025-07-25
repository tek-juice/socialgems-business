"use client";

import * as React from "react";
import { cn } from "../../../../lib/utils";

const buttonVariants = {
  base: "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9D769] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  variants: {
    default: "bg-[#F9D769] text-[#734D20] hover:bg-[#E8C547] shadow-sm hover:shadow-md",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    outline: "border border-gray-300 bg-white text-[#734D20] hover:bg-[#F9D769]/10 hover:border-[#F9D769] shadow-sm",
    secondary: "bg-gray-100 text-[#734D20] hover:bg-gray-200 shadow-sm",
    ghost: "text-[#734D20] hover:bg-[#F9D769]/10 hover:text-[#734D20]",
    link: "text-[#F9D769] underline-offset-4 hover:underline",
  },
  sizes: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3 text-xs",
    lg: "h-11 rounded-md px-8 text-base",
    icon: "h-10 w-10",
  }
};

const getButtonClasses = (variant = "default", size = "default") => {
  return cn(
    buttonVariants.base,
    buttonVariants.variants[variant],
    buttonVariants.sizes[size]
  );
};

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children,
  type = "button",
  ...props 
}, ref) => {
  return (
    <button
      type={type}
      className={cn(getButtonClasses(variant, size), className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };