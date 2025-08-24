import { motion } from "framer-motion";
import { FiCheckCircle, FiX, FiClock, FiInfo } from "react-icons/fi";

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

export default PaymentStatusBanner;