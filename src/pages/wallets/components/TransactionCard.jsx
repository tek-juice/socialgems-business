import { motion } from "framer-motion";
import { FiArrowDownLeft, FiArrowUpRight, FiDollarSign, FiChevronRight } from "react-icons/fi";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { FaCheckCircle } from "react-icons/fa";
import { MdAccessTimeFilled, MdError } from "react-icons/md";
import { Badge } from "./UIComponents";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

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

export default TransactionCard;