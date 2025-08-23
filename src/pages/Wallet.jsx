import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { get, post } from "../utils/service";

// React Icons
import {
  FiCreditCard,
  FiTrendingUp,
  FiRefreshCw,
  FiCalendar,
  FiActivity,
  FiX,
  FiPlus,
  FiWifi,
  FiShield,
  FiEye,
  FiEyeOff,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiCheck,
  FiFilter,
  FiDollarSign,
  FiUsers,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiBarChart,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiAlertCircle,
  FiInfo,
  FiLock,
  FiLoader,
  FiMail,
  FiPhone,
  FiKey,
  FiSmartphone,
} from "react-icons/fi";

import { HiArrowsRightLeft } from "react-icons/hi2";

import { FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";

import { MdAccessTimeFilled, MdError } from "react-icons/md";

// Custom utility function
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Payment Status Banner Component
const PaymentStatusBanner = ({ status, refId, sessionId, onClose, onRetry }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'success':
        return {
          icon: FiCheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Payment Successful!',
          description: 'Your wallet has been funded successfully.',
          showRetry: false
        };
      case 'failed':
      case 'error':
      case 'cancelled':
        return {
          icon: FiX,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Payment Failed',
          description: 'Your payment could not be processed. Please try again.',
          showRetry: true
        };
      case 'pending':
        return {
          icon: FiClock,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Payment Pending',
          description: 'Your payment is being processed. This may take a few minutes.',
          showRetry: false
        };
      default:
        return {
          icon: FiInfo,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-100/20',
          borderColor: 'border-green-200',
          title: 'Payment Status: Success',
          description: 'We are verifying your payment status.',
          showRetry: false
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`w-full ${config.bgColor} ${config.borderColor} border rounded-xl p-4 mb-6`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center border ${config.borderColor}`}>
            <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-sm ${config.iconColor} mb-1`}>
              {config.title}
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              {config.description}
            </p>
            {refId && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Reference ID:</span> {refId}
              </div>
            )}
            {sessionId && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Session ID:</span> {sessionId.substring(0, 20)}...
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {config.showRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton Components
const SkeletonCard = ({ className, children }) => (
  <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 p-6", className)}>
    {children}
  </div>
);

const SkeletonLine = ({ className }) => (
  <div className={cn("bg-gray-200 rounded animate-pulse", className)} />
);

const SkeletonCircle = ({ className }) => (
  <div className={cn("bg-gray-200 rounded-full animate-pulse", className)} />
);

const SkeletonButton = ({ className }) => (
  <div className={cn("bg-gray-200 rounded-lg animate-pulse", className)} />
);

// Table Components
const Table = ({ className, children, ...props }) => (
  <div className="relative w-full overflow-auto scrollbar-hide">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props}>
      {children}
    </table>
    <style jsx>{`
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `}</style>
  </div>
);

const TableHeader = ({ className, children, ...props }) => (
  <thead className={cn(className)} {...props}>
    {children}
  </thead>
);

const TableBody = ({ className, children, ...props }) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
    {children}
  </tbody>
);

const TableRow = ({ className, children, ...props }) => (
  <tr
    className={cn(
      "border-b border-gray-200 transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-50",
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

const TableHead = ({ className, children, ...props }) => (
  <th
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-gray-600 bg-gray-50",
      className
    )}
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({ className, children, ...props }) => (
  <td
    className={cn("p-4 align-middle", className)}
    {...props}
  >
    {children}
  </td>
);

// Custom Components
const Button = ({
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

const Input = ({ className, ...props }) => (
  <input
    className={cn(
      "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);

const Badge = ({ className, children, variant = "default", ...props }) => {
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

const Label = ({ className, ...props }) => (
  <label
    className={cn(
      "text-xs font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
);

// Pagination Components
const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("flex justify-center", className)}
    {...props}
  />
);

const PaginationContent = ({ className, children, ...props }) => (
  <ul className={cn("flex flex-row items-center gap-1", className)} {...props}>
    {children}
  </ul>
);

const PaginationItem = ({ className, children, ...props }) => (
  <li className={cn("", className)} {...props}>
    {children}
  </li>
);

const PaginationLink = ({ className, isActive, children, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8",
      isActive
        ? "bg-[#E8C547]/90 text-gray-900 shadow-xl"
        : "hover:bg-gray-100 text-gray-700",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

const PaginationPrevious = ({ className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 gap-1 pl-2.5 hover:bg-gray-100 text-gray-700",
      className
    )}
    {...props}
  >
    <FiChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </button>
);

const PaginationNext = ({ className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 gap-1 pr-2.5 hover:bg-gray-100 text-gray-700",
      className
    )}
    {...props}
  >
    <span>Next</span>
    <FiChevronRight className="h-4 w-4" />
  </button>
);

const PaginationEllipsis = ({ className, ...props }) => (
  <span
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <FiMoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);

// Filter Dropdown Menu Component
const FilterDropdownMenu = ({ options, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className={cn("gap-2", className)}
      >
        {children}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown className="w-4 h-4" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-1">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    option.onClick();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <span>{option.label}</span>
                  {option.checked && (
                    <FiCheck className="w-4 h-4 text-green-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

// AnimatedTabs Component
const AnimatedTabs = ({ tabs, activeTab, onTabChange }) => {
  const containerRef = useRef(null);
  const activeTabRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container && activeTab) {
      const activeTabElement = activeTabRef.current;

      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;

        const clipLeft = offsetLeft + 16;
        const clipRight = offsetLeft + offsetWidth + 16;

        container.style.clipPath = `inset(0 ${Number(
          100 - (clipRight / container.offsetWidth) * 100,
        ).toFixed()}% 0 ${Number(
          (clipLeft / container.offsetWidth) * 100,
        ).toFixed()}% round 17px)`;
      }
    }
  }, [activeTab]);

  return (
    <div className="relative bg-primary/20 border border-secondary/10 flex w-fit flex-col items-center rounded-full py-2 px-4">
      <div
        ref={containerRef}
        className="absolute z-10 w-full overflow-hidden [clip-path:inset(0px_75%_0px_0%_round_17px)] [transition:clip-path_0.25s_ease]"
      >
        <div className="relative flex w-full justify-center bg-secondary">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => onTabChange(tab.value)}
              className="flex h-8 items-center rounded-full p-3 text-sm font-medium text-white whitespace-nowrap"
              tabIndex={-1}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex w-full justify-center">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={index}
              ref={isActive ? activeTabRef : null}
              onClick={() => onTabChange(tab.value)}
              className="flex h-8 items-center cursor-pointer rounded-full p-3 text-sm font-medium text-secondary/70 whitespace-nowrap"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Credit Card Component
const CreditCard = ({ balance, currency, walletId }) => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="relative w-full">
      <motion.div
        className="relative w-full h-56 rounded-2xl p-6 text-white shadow-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #734D20 0%, #5a3a1a 25%, #3d2512 50%, #2a1a0d 75%, #1a1008 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(45deg, #F9D769 0%, transparent 50%, #F9D769 100%)`,
          }}
        />

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/20 to-transparent rounded-full -ml-16 -mb-16"></div>
        </div>

        <div className="relative z-10 flex justify-between items-start mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-[#E8C547] rounded-lg flex items-center justify-center">
              <FiCreditCard className="w-4 h-4 text-secondary" />
            </div>
            <span className="text-xs font-medium text-white">Social Gems</span>
          </div>
          <div className="flex items-center gap-2">
            <FiWifi className="w-4 h-4 text-white/60" />
            <FiShield className="w-4 h-4 text-white/60" />
          </div>
        </div>

        <div className="relative z-10 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-white">Available Balance</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-white/60 hover:text-white transition-colors"
            >
              {showBalance ? (
                <FiEye className="w-3 h-3" />
              ) : (
                <FiEyeOff className="w-3 h-3" />
              )}
            </button>
          </div>
          <div className="text-2xl font-bold text-white">
            {showBalance ? `${currency} ${balance}` : "••••••"}
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-end">
          <div>
            <div className="text-xs text-white/60 mb-1">Wallet ID</div>
            <div className="font-mono text-sm tracking-wider text-white">
              {walletId
                ? `${walletId.slice(0, 4)} •••• •••• ${walletId.slice(-4)}`
                : "•••• •••• •••• ••••"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60 mb-1">Member Since</div>
            <div className="font-mono text-sm text-white">
              {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Transaction Card Component (Mobile)
const TransactionCard = ({ transaction, onClick, isLastOdd = false }) => {
  const getTransactionIcon = (type) => {
    switch (type.toUpperCase()) {
      case "DEPOSIT":
        return <FiArrowDownLeft className="w-5 h-5 text-green-600" />;
      case "WITHDRAWAL":
      case "WITHDRAW":
        return <FiArrowUpRight className="w-5 h-5 text-red-600" />;
      case "CAMPAIGN_PAYMENT":
        return <HiArrowsRightLeft className="w-5 h-5 text-primary" />;
      default:
        return <FiDollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return (
          <Badge variant="success">
            <FaCheckCircle style={{ marginRight: 5 }} />
            Success
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="warning">
            <MdAccessTimeFilled style={{ marginRight: 5 }} />
            Pending
          </Badge>
        );
      case "FAILED":
      case "ERROR":
        return (
          <Badge variant="error">
            <MdError style={{ marginRight: 5 }} />
            Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getAmountColor = (type) => {
    if (
      type.toLowerCase().includes("deposit") ||
      type.toLowerCase().includes("credit") ||
      type.toLowerCase().includes("campaign")
    ) {
      return "text-green-600 font-semibold";
    } else if (
      type.toLowerCase().includes("withdrawal") ||
      type.toLowerCase().includes("withdraw") ||
      type.toLowerCase().includes("debit")
    ) {
      return "text-red-600 font-semibold";
    }
    return "text-gray-800 font-medium";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "rounded-xl border border-gray-300 p-4 hover:shadow-md transition-all duration-200 cursor-pointer",
        isLastOdd ? "sm:col-span-2" : ""
      )}
      onClick={() => onClick(transaction)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            {getTransactionIcon(transaction.trans_type)}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-1">
              {transaction.trans_type === "CAMPAIGN_PAYMENT" ? "Campaign Payment" : 
               transaction.trans_type === "DEPOSIT" ? "Deposit" : 
               transaction.trans_type === "WITHDRAWAL" ? "Withdrawal" : 
               transaction.trans_type}
            </h3>
            <p className="text-xs text-gray-600">{formatDate(transaction.created_on)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-sm font-semibold ${getAmountColor(transaction.trans_type)}`}>
              {transaction.currency} {Number(transaction.amount).toFixed(2)}
            </div>
            <div className="flex justify-end gap-1 mt-1">
              {getStatusBadge(transaction.status)}
            </div>
          </div>
          <FiChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </motion.div>
  );
};

// Transaction Table Row Component (Desktop)
const TransactionTableRow = ({ transaction, onClick }) => {
  const getTransactionIcon = (type) => {
    switch (type.toUpperCase()) {
      case "DEPOSIT":
        return <FiArrowDownLeft className="w-5 h-5 text-green-600" />;
      case "WITHDRAWAL":
      case "WITHDRAW":
        return <FiArrowUpRight className="w-5 h-5 text-red-600" />;
      case "CAMPAIGN_PAYMENT":
        return <HiArrowsRightLeft className="w-5 h-5 text-primary" />;
      default:
        return <FiDollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return (
          <Badge variant="success">
            <FaCheckCircle style={{ marginRight: 5 }} />
            Success
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="warning">
            <MdAccessTimeFilled style={{ marginRight: 5 }} />
            Pending
          </Badge>
        );
      case "FAILED":
      case "ERROR":
        return (
          <Badge variant="error">
            <MdError style={{ marginRight: 5 }} />
            Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getAmountColor = (type) => {
    if (
      type.toLowerCase().includes("deposit") ||
      type.toLowerCase().includes("credit") ||
      type.toLowerCase().includes("campaign")
    ) {
      return "text-green-600 font-semibold";
    } else if (
      type.toLowerCase().includes("withdrawal") ||
      type.toLowerCase().includes("withdraw") ||
      type.toLowerCase().includes("debit")
    ) {
      return "text-red-600 font-semibold";
    }
    return "text-gray-800 font-medium";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-gray-50" 
      onClick={() => onClick(transaction)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {getTransactionIcon(transaction.trans_type)}
          </div>
          <div>
            <div className="font-medium text-sm">
              {transaction.trans_type === "CAMPAIGN_PAYMENT" ? "Campaign Payment" : 
               transaction.trans_type === "DEPOSIT" ? "Deposit" : 
               transaction.trans_type === "WITHDRAWAL" ? "Withdrawal" : 
               transaction.trans_type}
            </div>
            <div className="text-xs text-gray-500">ID: {transaction.trans_id}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-900">{formatDate(transaction.created_on)}</div>
      </TableCell>
      <TableCell>
        <div className={`text-sm ${getAmountColor(transaction.trans_type)}`}>
          {transaction.currency} {Number(transaction.amount).toFixed(2)}
        </div>
      </TableCell>
      <TableCell>
        {getStatusBadge(transaction.status)}
      </TableCell>
      <TableCell>
        {transaction.narration && (
          <div className="text-sm text-gray-600 max-w-xs truncate">
            {transaction.narration}
          </div>
        )}
      </TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-3 text-xs text-secondary text-semibold hover:text-bold hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation();
            onClick(transaction);
          }}
        >
          View
        </Button>
      </TableCell>
    </TableRow>
  );
};

// Transaction Detail Modal
const TransactionDetailModal = ({ isOpen, onClose, transaction, transactionDetails, loading }) => {
  if (!isOpen || !transaction) return null;

  const getTransactionIcon = (type) => {
    switch (type.toUpperCase()) {
      case "DEPOSIT":
        return <FiArrowDownLeft className="w-6 h-6 text-green-600" />;
      case "WITHDRAWAL":
      case "WITHDRAW":
        return <FiArrowUpRight className="w-6 h-6 text-red-600" />;
      case "CAMPAIGN_PAYMENT":
        return <HiArrowsRightLeft className="w-6 h-6 text-primary" />;
      default:
        return <FiDollarSign className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return (
          <Badge variant="success">
            <FaCheckCircle style={{ marginRight: 5 }} />
            Success
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="warning">
            <MdAccessTimeFilled style={{ marginRight: 5 }} />
            Pending
          </Badge>
        );
      case "FAILED":
      case "ERROR":
        return (
          <Badge variant="error">
            <MdError style={{ marginRight: 5 }} />
            Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Transaction Details</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="space-y-4 w-full">
                <SkeletonLine className="h-4 w-3/4" />
                <SkeletonLine className="h-4 w-1/2" />
                <SkeletonLine className="h-4 w-2/3" />
                <SkeletonLine className="h-4 w-1/3" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  {getTransactionIcon(transaction.trans_type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {transaction.trans_type === "CAMPAIGN_PAYMENT" ? "Campaign Payment" : 
                     transaction.trans_type === "DEPOSIT" ? "Deposit" : 
                     transaction.trans_type === "WITHDRAWAL" ? "Withdrawal" : 
                     transaction.trans_type}
                  </h4>
                  <p className="text-xs text-gray-600">{formatDate(transaction.created_on)}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {transaction.currency} {Number(transaction.amount).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Transaction ID</span>
                  <span className="text-sm font-mono text-gray-900">{transaction.id}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  {getStatusBadge(transaction.status)}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {transaction.currency} {Number(transaction.amount).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="text-sm text-gray-900">{formatDate(transaction.created_on)}</span>
                </div>

                {transaction.narration && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Description</span>
                    <span className="text-sm text-gray-900 text-right max-w-xs">
                      {transaction.narration}
                    </span>
                  </div>
                )}
              </div>

              {transactionDetails && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-900 mb-3">Campaign Details</h5>
                  <div className="space-y-2">
                    {transactionDetails.campaign_title && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Campaign</span>
                        <span className="text-sm text-gray-900 text-right max-w-xs">
                          {transactionDetails.campaign_title}
                        </span>
                      </div>
                    )}
                    {transactionDetails.brand_name && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Brand</span>
                        <span className="text-sm text-gray-900">{transactionDetails.brand_name}</span>
                      </div>
                    )}
                    {transactionDetails.campaign_description && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Description</span>
                        <span className="text-sm text-gray-900 text-right max-w-xs">
                          {transactionDetails.campaign_description}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// PIN Verification Modal
const PinVerificationModal = ({ isOpen, onClose, onSuccess, loading, onForgotPin }) => {
  const [pin, setPin] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pin.length !== 5) {
      toast.error('PIN must be 5 digits');
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await post('wallet/pinlogin', {
        pin: pin
      });
      
      if (response?.status === 200) {
        toast.success('PIN verified successfully!');
        onSuccess();
        setPin('');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Invalid PIN. Please try again.');
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCancel = () => {
    setPin('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-[#E8C547] rounded-lg flex items-center justify-center">
              <FiLock className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Verify Wallet PIN</h3>
              <p className="text-xs text-gray-600">Enter your 5-digit PIN to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-pin">Enter PIN</Label>
              <Input
                id="verify-pin"
                type="password"
                placeholder="12345"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                required
                disabled={verifyLoading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={verifyLoading} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={verifyLoading || pin.length !== 5} className="flex-1">
                {verifyLoading ? (
                  <>
                    <div className="flex space-x-1 mr-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    Verifying...
                  </>
                ) : (
                  'Verify PIN'
                )}
              </Button>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onForgotPin}
                className="w-full text-center text-xs text-secondary transition-colors"
                disabled={verifyLoading}
              >
                Forgot PIN ? <span className="font-semibold">Reset via OTP</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Email OTP Modal
const EmailOTPModal = ({ isOpen, onClose, onSuccess, email, loading }) => {
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const sendEmailOTP = async () => {
    setSendingOtp(true);
    try {
      const response = await post('users/sendEmailOTP', {
        email: email
      });
      
      if (response?.status === 200) {
        setOtpSent(true);
        toast.success('Email OTP sent successfully!');
      }
    } catch (error) {
      console.error('Error sending email OTP:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to send email OTP');
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 4) {
      toast.error('OTP must be 4 digits');
      return;
    }

    onSuccess(otp);
  };

  const handleCancel = () => {
    setOtp('');
    setOtpSent(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen && !otpSent) {
      sendEmailOTP();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-[#E8C547] rounded-lg flex items-center justify-center">
              <FiMail className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
              <p className="text-xs text-gray-600">Enter the OTP sent to your email</p>
            </div>
          </div>

          {sendingOtp ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <SkeletonLine className="h-4 w-full" />
                  <SkeletonLine className="h-4 w-3/4 mx-auto" />
                  <SkeletonLine className="h-4 w-1/2 mx-auto" />
                </div>
                <p className="text-sm text-gray-600">Sending OTP to {email}...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-xs text-secondary">
                  We've sent a 4-digit OTP to <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-otp">Email OTP</Label>
                  <Input
                    id="email-otp"
                    type="text"
                    placeholder="1234"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    required
                    disabled={verifyingOtp}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={verifyingOtp} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={verifyingOtp || otp.length !== 4} className="flex-1">
                    {verifyingOtp ? (
                      <>
                        <div className="flex space-x-1 mr-2">
                          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        Verifying...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </Button>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={sendEmailOTP}
                    className="w-full text-center text-sm text-secondary transition-colors"
                    disabled={verifyingOtp || sendingOtp}
                  >
                    Resend Email OTP
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Phone OTP Modal
const PhoneOTPModal = ({ isOpen, onClose, onSuccess, phone, loading }) => {
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const sendPhoneOTP = async () => {
    setSendingOtp(true);
    try {
      const response = await post('users/sendPhoneOTP', {
        phone: phone
      });
      
      if (response?.status === 200) {
        setOtpSent(true);
        toast.success('Phone OTP sent successfully!');
      }
    } catch (error) {
      console.error('Error sending phone OTP:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to send phone OTP');
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 4) {
      toast.error('OTP must be 4 digits');
      return;
    }

    onSuccess(otp);
  };

  const handleCancel = () => {
    setOtp('');
    setOtpSent(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen && !otpSent) {
      sendPhoneOTP();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-[#E8C547] rounded-lg flex items-center justify-center">
              <FiPhone className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Phone Verification</h3>
              <p className="text-xs text-gray-600">Enter the OTP sent to your phone</p>
            </div>
          </div>

          {sendingOtp ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <SkeletonLine className="h-4 w-full" />
                  <SkeletonLine className="h-4 w-3/4 mx-auto" />
                  <SkeletonLine className="h-4 w-1/2 mx-auto" />
                </div>
                <p className="text-sm text-gray-600">Sending OTP to {phone}...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-xs text-secondary">
                  We've sent a 4-digit OTP to <strong>{phone}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-otp">Phone OTP</Label>
                  <Input
                    id="phone-otp"
                    type="text"
                    placeholder="1234"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    required
                    disabled={verifyingOtp}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={verifyingOtp} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={verifyingOtp || otp.length !== 4} className="flex-1">
                    {verifyingOtp ? (
                      <>
                        <div className="flex space-x-1 mr-2">
                          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        Verifying...
                      </>
                    ) : (
                      'Verify Phone'
                    )}
                  </Button>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={sendPhoneOTP}
                    className="w-full text-center text-sm text-secondary transition-colors"
                    disabled={verifyingOtp || sendingOtp}
                  >
                    Resend Phone OTP
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// New PIN Setup Modal (for reset)
const NewPinSetupModal = ({ isOpen, onClose, onSuccess, emailOtp, phoneOtp, onRestartFlow }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    
    if (pin.length !== 5) {
      toast.error('PIN must be 5 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await post('wallet/resetTransactionPin', {
        pin: pin,
        confirmPin: confirmPin,
        emailCode: emailOtp,
        phoneCode: phoneOtp,
        deviceId: ""
      });
      
      if (response?.status === 200) {
        toast.success('PIN reset successfully!');
        onSuccess();
        onClose();
        setPin('');
        setConfirmPin('');
      }
    } catch (error) {
      console.error('Error resetting PIN:', error);
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.toLowerCase().includes('invalid') && 
            (errorMessage.toLowerCase().includes('code') || errorMessage.toLowerCase().includes('otp'))) {
          
          toast.error('OTP codes are invalid or expired. Please verify your codes again.');
          
          // Show option to restart the flow
          setTimeout(() => {
            const shouldRestart = window.confirm(
              'The OTP codes you entered are invalid or have expired. Would you like to restart the verification process?'
            );
            
            if (shouldRestart && onRestartFlow) {
              onRestartFlow();
            }
          }, 1000);
          
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error('Failed to reset PIN. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-[#E8C547] rounded-lg flex items-center justify-center">
              <FiKey className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Set New PIN</h3>
              <p className="text-xs text-gray-600">Create a new 5-digit PIN for your wallet</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-pin">New PIN</Label>
              <Input
                id="new-pin"
                type="password"
                placeholder="12345"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-pin">Confirm New PIN</Label>
              <Input
                id="confirm-new-pin"
                type="password"
                placeholder="12345"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading || pin.length !== 5 || confirmPin.length !== 5} className="flex-1">
                {loading ? (
                  <>
                    <div className="flex space-x-1 mr-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    Resetting PIN...
                  </>
                ) : (
                  'Reset PIN'
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Add Funds Modal
const AddFundsModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CARD");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount) {
      onSubmit({ amount: parseFloat(amount), paymentMethod });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add Funds</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                $
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg h-12"
                min="1"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-12 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="CARD">Credit/Debit Card</option>
              <option value="MOBILE">Mobile Money</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !amount}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  Processing...
                </div>
              ) : (
                <>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Funds
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// PIN Setup Modal
const PinSetupModal = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    
    if (pin.length !== 5) {
      toast.error('PIN must be 5 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await post('wallet/setTransactionPin', {
        pin: pin,
        confirm_pin: confirmPin
      });
      
      if (response?.status === 200) {
        toast.success('Wallet PIN set successfully!');
        onSuccess();
        onClose();
        setPin('');
        setConfirmPin('');
      }
    } catch (error) {
      console.error('Error setting PIN:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to set PIN');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-[#E8C547] rounded-lg flex items-center justify-center">
              <FiLock className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Set Wallet PIN</h3>
              <p className="text-xs text-gray-600">Secure your wallet with a 5-digit PIN</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">Enter PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="12345"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-pin">Confirm PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                placeholder="12345"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <div className="flex space-x-1 mr-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    Setting PIN...
                  </>
                ) : (
                  'Set PIN'
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

// Helper functions
const formatBalance = (balance) => {
  const numBalance = parseFloat(balance);
  return numBalance.toFixed(2);
};

export default function WalletPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addingFunds, setAddingFunds] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPinVerification, setShowPinVerification] = useState(false);

  // PIN Reset flow state
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [showNewPinSetup, setShowNewPinSetup] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [phoneOtpCode, setPhoneOtpCode] = useState('');

  // Payment status state
  const [paymentStatus, setPaymentStatus] = useState({
    show: false,
    status: null,
    refId: null,
    sessionId: null
  });

  // Transaction detail modal state
  const [transactionDetailModal, setTransactionDetailModal] = useState({
    isOpen: false,
    transaction: null,
    details: null,
    loading: false
  });

  // Tab state
  const [activeTab, setActiveTab] = useState("all");

  // Filter state
  const [columnFilters, setColumnFilters] = useState({
    type: 'all',
    amount: 'all'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Handle payment redirect parameters
  useEffect(() => {
    const refId = searchParams.get('refId');
    const status = searchParams.get('status');
    const sessionId = searchParams.get('session_id');

    if (refId || status || sessionId) {
      // Clean up status value (remove quotes if present)
      const cleanStatus = status?.replace(/['"]/g, '');
      
      setPaymentStatus({
        show: true,
        status: cleanStatus,
        refId: refId,
        sessionId: sessionId
      });

      // Show appropriate toast based on status
      switch (cleanStatus?.toLowerCase()) {
        case 'success':
          toast.success('Payment completed successfully!');
          break;
        case 'failed':
        case 'error':
        case 'cancelled':
          toast.error('Payment failed or was cancelled.');
          break;
        case 'pending':
          toast.info('Payment is being processed.');
          break;
        default:
          toast.info('Payment status received.');
      }

      // Clear URL parameters after 100ms to avoid repeated triggers
      setTimeout(() => {
        setSearchParams({});
      }, 100);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    document.title = "Your Wallet | Social Gems";

    const fetchWalletData = async () => {
      try {
        setLoading(true);

        // Fetch user profile to check PIN status
        const userProfileResponse = await get("users/getUserProfile");
        if (userProfileResponse?.status === 200 && userProfileResponse?.data) {
          setUserData(userProfileResponse.data);
        }

        const walletResponse = await get("wallet/getWallets");
        if (walletResponse?.status === 200 && walletResponse?.data) {
          setWalletData(walletResponse.data);
        }

        const transactionsResponse = await post("wallet/accountStatement", {
          currency: "USD",
        });
        if (
          transactionsResponse?.status === 200 &&
          transactionsResponse?.data
        ) {
          setTransactions(transactionsResponse.data);
        }

        // Only show success toast if not coming from payment redirect
        if (!searchParams.get('refId') && !searchParams.get('status')) {
          toast.success("Wallet data loaded successfully");
        }
      } catch (error) {
        toast.error("Failed to load wallet data");
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [searchParams]);

  // Auto-refresh wallet data after successful payment
  useEffect(() => {
    if (paymentStatus.show && paymentStatus.status?.toLowerCase() === 'success') {
      const timer = setTimeout(() => {
        handleRefresh();
      }, 2000); // Refresh after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh user profile as well
      const userProfileResponse = await get("users/getUserProfile");
      if (userProfileResponse?.status === 200 && userProfileResponse?.data) {
        setUserData(userProfileResponse.data);
      }

      const walletResponse = await get("wallet/getWallets");
      if (walletResponse?.status === 200 && walletResponse?.data) {
        setWalletData(walletResponse.data);
      }

      const transactionsResponse = await post("wallet/accountStatement", {
        currency: "USD",
      });
      if (transactionsResponse?.status === 200 && transactionsResponse?.data) {
        setTransactions(transactionsResponse.data);
      }

      toast.success("Wallet data refreshed");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddFunds = async (data) => {
    setAddingFunds(true);
    try {
      const depositData = {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        currency: "USD",
        payment_method_id: "",
      };

      const response = await post("wallet/depositRequest", depositData);

      if (response.status === 200) {
        window.open(response.data.paymentUrl, "_blank");
        toast.success("Redirecting to payment gateway...");
        setShowAddFunds(false);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (data.paymentMethod === 'MOBILE' && errorMessage.includes('Failed to request payment')) {
          toast.error('Mobile Money payment failed. Please check your mobile money account and try again.');
        } else {
          toast.error(errorMessage);
        }
      } else {
        const paymentMethodText = data.paymentMethod === 'MOBILE' ? 'Mobile Money' : 'Card';
        toast.error(`${paymentMethodText} payment failed. Please try again.`);
      }
    } finally {
      setAddingFunds(false);
    }
  };

  const handleTransactionClick = async (transaction) => {
    setTransactionDetailModal({
      isOpen: true,
      transaction,
      details: null,
      loading: true
    });

    try {
      const response = await get(`wallet/getTransactionById/${transaction.trans_id}`);
      if (response?.status === 200 && response?.data) {
        setTransactionDetailModal(prev => ({
          ...prev,
          details: response.data,
          loading: false
        }));
      } else {
        setTransactionDetailModal(prev => ({
          ...prev,
          loading: false
        }));
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      setTransactionDetailModal(prev => ({
        ...prev,
        loading: false
      }));
    }
  };

  const handleCloseTransactionDetail = () => {
    setTransactionDetailModal({
      isOpen: false,
      transaction: null,
      details: null,
      loading: false
    });
  };

  const handlePinSuccess = async () => {
    // Refresh user data to update PIN status
    try {
      const userProfileResponse = await get("users/getUserProfile");
      if (userProfileResponse?.status === 200 && userProfileResponse?.data) {
        setUserData(userProfileResponse.data);
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  const handlePinVerificationSuccess = () => {
    setShowPinVerification(false);
    setShowAddFunds(true);
  };

  const handleClosePaymentStatus = () => {
    setPaymentStatus(prev => ({ ...prev, show: false }));
  };

  const handleRetryPayment = () => {
    setPaymentStatus(prev => ({ ...prev, show: false }));
    if (hasPinSet) {
      setShowPinVerification(true);
    } else {
      setShowPinModal(true);
    }
  };

  // Handle forgot PIN flow
  const handleForgotPin = () => {
    setShowPinVerification(false);
    setShowEmailOtp(true);
  };

  const handleEmailOtpSuccess = (otp) => {
    setEmailOtpCode(otp);
    setShowEmailOtp(false);
    setShowPhoneOtp(true);
  };

  const handlePhoneOtpSuccess = (otp) => {
    setPhoneOtpCode(otp);
    setShowPhoneOtp(false);
    setShowNewPinSetup(true);
  };

  const handleNewPinSuccess = async () => {
    setShowNewPinSetup(false);
    setEmailOtpCode('');
    setPhoneOtpCode('');
    
    // Refresh user data to update PIN status
    try {
      const userProfileResponse = await get("users/getUserProfile");
      if (userProfileResponse?.status === 200 && userProfileResponse?.data) {
        setUserData(userProfileResponse.data);
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  // Handle restart flow for failed OTP verification
  const handleRestartOtpFlow = () => {
    setShowNewPinSetup(false);
    setEmailOtpCode('');
    setPhoneOtpCode('');
    setShowEmailOtp(true);
  };

  // Check if user has set a PIN by looking at wallet_pin data
  const hasPinSet = userData?.wallet_pin && Object.keys(userData.wallet_pin).length > 0;

  const handleAddFundsOrSetPin = () => {
    if (hasPinSet) {
      // Show PIN verification first
      setShowPinVerification(true);
    } else {
      // Show PIN setup
      setShowPinModal(true);
    }
  };

  // Calculate tab counts
  const getTabCounts = () => {
    const all = transactions.length;
    const success = transactions.filter(t => t.status.toUpperCase() === 'SUCCESS').length;
    const pending = transactions.filter(t => t.status.toUpperCase() === 'PENDING').length;
    
    return { all, success, pending };
  };

  const tabCounts = getTabCounts();

  const statusTabs = [
    { label: `All ${tabCounts.all}`, value: "all" },
    { label: `Success ${tabCounts.success}`, value: "success" },
    { label: `Pending ${tabCounts.pending}`, value: "pending" },
  ];

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Status filter from tabs
    const matchesTabStatus = 
      activeTab === 'all' ? true :
      activeTab === 'success' ? transaction.status.toUpperCase() === 'SUCCESS' :
      activeTab === 'pending' ? transaction.status.toUpperCase() === 'PENDING' :
      activeTab === 'failed' ? transaction.status.toUpperCase() === 'FAILED' :
      true;

    const matchesColumnType = 
      !columnFilters.type || columnFilters.type === 'all' ? true :
      columnFilters.type === 'deposit' ? transaction.trans_type.toUpperCase() === 'DEPOSIT' :
      columnFilters.type === 'withdrawal' ? transaction.trans_type.toUpperCase() === 'WITHDRAWAL' :
      columnFilters.type === 'campaign_payment' ? transaction.trans_type.toUpperCase() === 'CAMPAIGN_PAYMENT' :
      true;

    const matchesColumnAmount = 
      !columnFilters.amount || columnFilters.amount === 'all' ? true :
      columnFilters.amount === 'positive' ? parseFloat(transaction.amount) > 0 :
      columnFilters.amount === 'negative' ? parseFloat(transaction.amount) < 0 :
      true;

    return matchesTabStatus && matchesColumnType && matchesColumnAmount;
  });

  // Pagination logic
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8"
          >
            {/* Header Section Skeleton */}
            <motion.div variants={itemVariants} className="flex gap-4 flex-col items-start">
              <SkeletonLine className="h-6 w-32" />
              <div className="flex gap-2 flex-col">
                <SkeletonLine className="h-10 w-64" />
                <SkeletonLine className="h-5 w-96" />
              </div>
            </motion.div>

            {/* Grid Layout Skeleton */}
            <div className="grid grid-cols-1 gap-6">
              {/* Wallet Card Skeleton */}
              <motion.div variants={itemVariants}>
                <SkeletonCard>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <SkeletonCircle className="w-6 h-6" />
                      <div>
                        <SkeletonLine className="h-5 w-24 mb-1" />
                        <SkeletonLine className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                  <div className="relative w-full h-56 rounded-2xl bg-gray-200 animate-pulse p-6">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-2">
                        <SkeletonCircle className="w-8 h-8" />
                        <SkeletonLine className="h-4 w-20" />
                      </div>
                      <div className="flex items-center gap-2">
                        <SkeletonCircle className="w-4 h-4" />
                        <SkeletonCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mb-6">
                      <SkeletonLine className="h-3 w-24 mb-2" />
                      <SkeletonLine className="h-8 w-32" />
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <SkeletonLine className="h-3 w-16 mb-1" />
                        <SkeletonLine className="h-4 w-40" />
                      </div>
                      <div className="text-right">
                        <SkeletonLine className="h-3 w-20 mb-1" />
                        <SkeletonLine className="h-4 w-12" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <SkeletonButton className="w-full h-10" />
                  </div>
                </SkeletonCard>
              </motion.div>
            </div>

            {/* Tabs Skeleton */}
            <motion.div variants={itemVariants}>
              <SkeletonLine className="h-12 w-80" />
            </motion.div>

            {/* Filters Skeleton */}
            <motion.div variants={itemVariants}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex gap-2 flex-wrap">
                  <SkeletonCircle className="w-4 h-4 mt-2" />
                  <SkeletonButton className="h-8 w-16" />
                  <SkeletonButton className="h-8 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonLine className="h-3 w-10" />
                  <SkeletonButton className="h-8 w-12" />
                </div>
              </div>
            </motion.div>

            {/* Transaction Cards Skeleton */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <SkeletonCircle className="w-12 h-12" />
                        <div>
                          <SkeletonLine className="h-4 w-24 mb-1" />
                          <SkeletonLine className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <SkeletonLine className="h-4 w-16 mb-1" />
                          <SkeletonLine className="h-6 w-14" />
                        </div>
                        <SkeletonCircle className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto">
        <div className="flex flex-col gap-8">
          {/* Payment Status Banner */}
          <AnimatePresence>
            {paymentStatus.show && (
              <PaymentStatusBanner
                status={paymentStatus.status}
                refId={paymentStatus.refId}
                sessionId={paymentStatus.sessionId}
                onClose={handleClosePaymentStatus}
                onRetry={handleRetryPayment}
              />
            )}
          </AnimatePresence>

          {/* Header Section */}
          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge variant="gold">Social Gems Wallet</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-4xl tracking-tighter max-w-4xl font-bold text-left text-gray-900">
                Your Wallet
              </h2>
              <p className="text-lg max-w-xl lg:max-w-2xl leading-relaxed tracking-tight text-gray-600 text-left">
                Manage your balance and transactions seamlessly with real-time insights.
              </p>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 gap-6">
            {/* Wallet Card */}
            <div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FiCreditCard className="w-6 h-6 text-secondary" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Your Card</h3>
                      <p className="text-sm text-gray-600">Digital wallet card</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRefresh}
                    variant="ghost"
                    size="sm"
                    disabled={refreshing}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <motion.div
                    animate={refreshing ? { rotate: 360 } : {}}
                    transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                  >
                    <FiRefreshCw className="w-4 h-4" />
                  </motion.div>
                </Button>
              </div>

              <CreditCard
                balance={
                  walletData ? formatBalance(walletData.balance) : "0.00"
                }
                currency={walletData?.asset || "USD"}
                walletId={walletData?.wallet_id}
              />

              <div className="mt-6">
                <Button
                  onClick={handleAddFundsOrSetPin}
                  className="w-full"
                >
                  {hasPinSet ? (
                    <>
                      <FiPlus className="w-4 h-4 mr-2" />
                      Add Funds
                    </>
                  ) : (
                    <>
                      <FiLock className="w-4 h-4 mr-2" />
                      Set PIN
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Status Tabs */}
        <motion.div variants={itemVariants}>
          <AnimatedTabs 
            tabs={statusTabs} 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            <FiFilter className="text-gray-600 w-4 h-4 mt-2" />
            
            <FilterDropdownMenu
              options={[
                {
                  label: 'All Types',
                  onClick: () => setColumnFilters(prev => ({ ...prev, type: 'all' })),
                  checked: !columnFilters.type || columnFilters.type === 'all'
                },
                {
                  label: 'Deposit',
                  onClick: () => setColumnFilters(prev => ({ ...prev, type: 'deposit' })),
                  checked: columnFilters.type === 'deposit'
                },
                {
                  label: 'Withdrawal',
                  onClick: () => setColumnFilters(prev => ({ ...prev, type: 'withdrawal' })),
                  checked: columnFilters.type === 'withdrawal'
                },
                {
                  label: 'Campaign Payment',
                  onClick: () => setColumnFilters(prev => ({ ...prev, type: 'campaign_payment' })),
                  checked: columnFilters.type === 'campaign_payment'
                }
              ]}
              className="text-secondary border-primary/50 hover:bg-primary/20"
            >
              Type
            </FilterDropdownMenu>

            <FilterDropdownMenu
              options={[
                {
                  label: 'All Amounts',
                  onClick: () => setColumnFilters(prev => ({ ...prev, amount: 'all' })),
                  checked: !columnFilters.amount || columnFilters.amount === 'all'
                },
                {
                  label: 'Positive Amounts',
                  onClick: () => setColumnFilters(prev => ({ ...prev, amount: 'positive' })),
                  checked: columnFilters.amount === 'positive'
                },
                {
                  label: 'Negative Amounts',
                  onClick: () => setColumnFilters(prev => ({ ...prev, amount: 'negative' })),
                  checked: columnFilters.amount === 'negative'
                }
              ]}
              className="text-secondary border-primary/50 hover:bg-primary/20"
            >
              Amount
            </FilterDropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="h-8 px-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length ? (
                  currentItems.map((transaction) => (
                    <TransactionTableRow
                      key={transaction.trans_id}
                      transaction={transaction}
                      onClick={handleTransactionClick}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-[#E8C547]/20 rounded-full flex items-center justify-center">
                          <FiCreditCard className="w-8 h-8 text-secondary" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-secondary">
                            No Transactions Available
                          </h3>
                          <p className="text-sm text-gray-600 max-w-md">
                            Your transaction history is empty. Add funds to your wallet to get started with transactions.
                          </p>
                        </div>
                        <Button 
                          onClick={handleAddFundsOrSetPin}
                          className="mt-4"
                        >
                          {hasPinSet ? (
                            <>
                              <FiPlus className="w-4 h-4 mr-2" />
                              Add Funds
                            </>
                          ) : (
                            <>
                              <FiLock className="w-4 h-4 mr-2" />
                              Set PIN
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Card View (Hidden on Desktop) */}
        <div className="md:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentItems.length ? (
              <AnimatePresence mode="wait">
                {currentItems.map((transaction, index) => {
                  const isLastOdd = currentItems.length % 2 !== 0 && index === currentItems.length - 1;
                  return (
                    <TransactionCard
                      key={transaction.trans_id}
                      transaction={transaction}
                      onClick={handleTransactionClick}
                      isLastOdd={isLastOdd}
                    />
                  );
                })}
              </AnimatePresence>
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-[#E8C547]/20 rounded-full flex items-center justify-center">
                    <FiCreditCard className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-secondary">
                      No Transactions Available
                    </h3>
                    <p className="text-sm text-gray-600 max-w-md">
                      Your transaction history is empty. Add funds to your wallet to get started with transactions.
                    </p>
                  </div>
                  <Button 
                    onClick={handleAddFundsOrSetPin}
                    className="mt-4"
                  >
                    {hasPinSet ? (
                      <>
                        <FiPlus className="w-4 h-4 mr-2" />
                        Add Funds
                      </>
                    ) : (
                      <>
                        <FiLock className="w-4 h-4 mr-2" />
                        Set PIN
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-row flex-wrap pt-4 items-center justify-between w-full">
          <div className="text-xs text-gray-600">
            Showing {Math.min(startIndex + 1, totalItems)} to {Math.min(endIndex, totalItems)} of{" "}
            {totalItems} transactions
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(
                        Math.min(totalPages, currentPage + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>

    {/* PIN Verification Modal with Forgot PIN option */}
    <AnimatePresence>
      {showPinVerification && (
        <PinVerificationModal
          isOpen={showPinVerification}
          onClose={() => setShowPinVerification(false)}
          onSuccess={handlePinVerificationSuccess}
          onForgotPin={handleForgotPin}
        />
      )}
    </AnimatePresence>

    {/* Email OTP Modal */}
    <AnimatePresence>
      {showEmailOtp && (
        <EmailOTPModal
          isOpen={showEmailOtp}
          onClose={() => setShowEmailOtp(false)}
          onSuccess={handleEmailOtpSuccess}
          email={userData?.email}
        />
      )}
    </AnimatePresence>

    {/* Phone OTP Modal */}
    <AnimatePresence>
      {showPhoneOtp && (
        <PhoneOTPModal
          isOpen={showPhoneOtp}
          onClose={() => setShowPhoneOtp(false)}
          onSuccess={handlePhoneOtpSuccess}
          phone={userData?.phone}
        />
      )}
    </AnimatePresence>

    {/* New PIN Setup Modal */}
    <AnimatePresence>
      {showNewPinSetup && (
        <NewPinSetupModal
          isOpen={showNewPinSetup}
          onClose={() => setShowNewPinSetup(false)}
          onSuccess={handleNewPinSuccess}
          emailOtp={emailOtpCode}
          phoneOtp={phoneOtpCode}
          onRestartFlow={handleRestartOtpFlow}
        />
      )}
    </AnimatePresence>

    {/* Add Funds Modal */}
    <AnimatePresence>
      {showAddFunds && (
        <AddFundsModal
          isOpen={showAddFunds}
          onClose={() => setShowAddFunds(false)}
          onSubmit={handleAddFunds}
          loading={addingFunds}
        />
      )}
    </AnimatePresence>

    {/* PIN Setup Modal */}
    <AnimatePresence>
      {showPinModal && (
        <PinSetupModal
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onSuccess={handlePinSuccess}
        />
      )}
    </AnimatePresence>

    {/* Transaction Detail Modal */}
    <TransactionDetailModal
      isOpen={transactionDetailModal.isOpen}
      onClose={handleCloseTransactionDetail}
      transaction={transactionDetailModal.transaction}
      transactionDetails={transactionDetailModal.details}
      loading={transactionDetailModal.loading}
    />
  </div>
);
}