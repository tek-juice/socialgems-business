import { motion, AnimatePresence } from "framer-motion";
import { FiArrowDownLeft, FiArrowUpRight, FiDollarSign, FiX } from "react-icons/fi";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { FaCheckCircle } from "react-icons/fa";
import { MdAccessTimeFilled, MdError } from "react-icons/md";
import { Badge } from "./UIComponents";
import { SkeletonLine } from "./Skeletons";

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

export default TransactionDetailModal;