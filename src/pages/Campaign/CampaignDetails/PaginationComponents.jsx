import { cn } from '../../../lib/utils';
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from 'react-icons/fi';

export const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("flex justify-center", className)}
    {...props}
  />
);

export const PaginationContent = ({ className, children, ...props }) => (
  <ul className={cn("flex flex-row items-center gap-1", className)} {...props}>
    {children}
  </ul>
);

export const PaginationItem = ({ className, children, ...props }) => (
  <li className={cn("", className)} {...props}>
    {children}
  </li>
);

export const PaginationLink = ({ className, isActive, children, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8 hover:scale-105 active:scale-95",
      isActive 
        ? "bg-[#E8C547] text-gray-900 shadow-lg" 
        : "hover:bg-gray-100 text-gray-700 hover:shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export const PaginationPrevious = ({ className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 gap-1 pl-2.5 hover:bg-gray-100 text-gray-700 hover:shadow-sm hover:scale-105 active:scale-95",
      className
    )}
    {...props}
  >
    <FiChevronLeft className="h-4 w-4" />
    <span className="hidden sm:inline">Previous</span>
  </button>
);

export const PaginationNext = ({ className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 gap-1 pr-2.5 hover:bg-gray-100 text-gray-700 hover:shadow-sm hover:scale-105 active:scale-95",
      className
    )}
    {...props}
  >
    <span className="hidden sm:inline">Next</span>
    <FiChevronRight className="h-4 w-4" />
  </button>
);

export const PaginationEllipsis = ({ className, ...props }) => (
  <span
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <FiMoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);