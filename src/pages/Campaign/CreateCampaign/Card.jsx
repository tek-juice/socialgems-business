import React from "react";

export const Card = ({ className = "", children, ...props }) => (
  <div
    className={`text-black transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className = "", children, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = "", children, ...props }) => (
  <h3
    className={`text-lg font-bold leading-none tracking-tight text-black ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({ className = "", children, ...props }) => (
  <p
    className={`text-xs text-gray-600 leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </p>
);

export const CardContent = ({ className = "", children, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);