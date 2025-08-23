import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  FiUsers,
  FiTarget,
  FiArrowRight,
  FiArrowLeft,
  FiPlus,
  FiDollarSign,
  FiEdit,
  FiAlertCircle,
  FiCheckCircle,
  FiImage,
  FiFileText,
  FiSettings,
  FiInfo,
  FiLayers,
  FiTrendingUp,
  FiTrash2,
  FiChevronDown,
  FiRefreshCw,
  FiCreditCard,
  FiCalendar,
  FiX,
  FiLock,
  FiLoader,
} from "react-icons/fi";
import { post, upload, get, patch } from "../../utils/service";
import { toast } from "sonner";
import FilterCampaigns from "./FilterCampaigns";
import StepperComponent from "./CreateCampaign/StepperComponent";
import ImageUploadComponent from "./CreateCampaign/ImageUploadComponent";
import RichTextEditor from "./CreateCampaign/RichTextEditor";
import TaskDialog from "./CreateCampaign/TaskDialog";
import NumberInput from "./CreateCampaign/NumberInput";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./CreateCampaign/Card";
import LoadingSkeleton from "./CreateCampaign/LoadingSkeleton";
import useLocalStorage from "../../hooks/useLocalStorage";

// Import utilities
import {
  createLocalDate,
  createUTCDate,
  formatDateString,
  localDateToUTC,
  utcDateToLocal,
  formatDisplayDate,
  getMinimumDate,
  isDateDisabled,
  isToday,
  validateDateRange,
  generateRequestId,
  countWords,
  safeToNumber,
  safeToFixed,
  calculateMinimumBudget,
  INFLUENCER_BASE_RATE,
  PLATFORM_FEE,
  MIN_BUDGET_PER_INFLUENCER,
} from "./CreateCampaign/utils";

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
          icon: FiLoader,
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
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
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

const InfluencerMismatchBanner = ({ 
  requestedInfluencers, 
  availableInfluencers, 
  onProceedWithAvailable, 
  onGoBackToEdit,
  loading 
}) => {
  const safeAvailableInfluencers = safeToNumber(availableInfluencers, 0);
  const safeRequestedInfluencers = safeToNumber(requestedInfluencers, 0);
  
  if (safeRequestedInfluencers <= safeAvailableInfluencers) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm mt-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiAlertCircle className="w-5 h-5 rounded-full text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              The number of influencers found is less than the number of influencers that you requested for, you can either go back and edit details and budget or continue to payment with the input budget and this number of influncers found.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onProceedWithAvailable}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-3 h-3" />
                    Continue
                  </>
                )}
              </button>
              <button
                onClick={onGoBackToEdit}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-orange-300 text-secondary bg-white rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
              >
                <FiEdit className="w-3 h-3" />
                Go Back to Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Add Funds Modal Component
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-scale-400 to-primary-scale-500 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Add Funds</h3>
          </div>
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
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-3 text-lg h-12 border border-gray-300 rounded-lg focus:border-primary-scale-400 focus:ring-2 focus:ring-primary-scale-400/20 transition-colors bg-gray-50 focus:bg-white"
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
              className="w-full h-12 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-scale-400 focus:border-transparent"
            >
              <option value="CARD">Credit/Debit Card</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
              disabled={loading || !amount}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                  />
                  Processing...
                </div>
              ) : (
                <>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Funds
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// PIN Verification Modal Component
const PinVerificationModal = ({ isOpen, onClose, onSuccess, loading }) => {
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
      toast.error('Invalid PIN. Please try again.');
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
            <div className="w-10 h-10 bg-gradient-to-r from-primary-scale-400 to-primary-scale-500 rounded-lg flex items-center justify-center">
              <FiLock className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Verify Wallet PIN</h3>
              <p className="text-xs text-gray-600">Enter your 5-digit PIN to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="verify-pin" className="block text-xs font-semibold text-gray-700">
                Enter PIN
              </label>
              <input
                id="verify-pin"
                type="password"
                placeholder="12345"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                required
                disabled={verifyLoading}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-primary-scale-400 focus:ring-2 focus:ring-primary-scale-400/20 transition-colors text-xs"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={verifyLoading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifyLoading || pin.length !== 5}
                className="flex-1 px-4 py-3 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
              >
                {verifyLoading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 mr-2 inline-block"
                    >
                      <FiLoader className="w-4 h-4" />
                    </motion.div>
                    Verifying...
                  </>
                ) : (
                  'Verify PIN'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// PIN Setup Modal Component
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
      toast.error('Failed to set PIN');
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
            <div className="w-10 h-10 bg-gradient-to-r from-primary-scale-400 to-primary-scale-500 rounded-lg flex items-center justify-center">
              <FiLock className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Set Wallet PIN</h3>
              <p className="text-xs text-gray-600">Secure your wallet with a 5-digit PIN</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pin" className="block text-xs font-semibold text-gray-700">
                Enter PIN
              </label>
              <input
                id="pin"
                type="password"
                placeholder="12345"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-primary-scale-400 focus:ring-2 focus:ring-primary-scale-400/20 transition-colors text-xs"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-pin" className="block text-xs font-semibold text-gray-700">
                Confirm PIN
              </label>
              <input
                id="confirm-pin"
                type="password"
                placeholder="12345"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-primary-scale-400 focus:ring-2 focus:ring-primary-scale-400/20 transition-colors text-xs"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
              >
                {loading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 mr-2 inline-block"
                    >
                      <FiLoader className="w-4 h-4" />
                    </motion.div>
                    Setting PIN...
                  </>
                ) : (
                  'Set PIN'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Enhanced Payment Popup with window.open()
const PaymentPopupManager = ({ isOpen, onClose, paymentUrl, onSuccess, onError }) => {
  const popupRef = useRef(null);
  const checkIntervalRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !paymentUrl) return;

    // Clear any existing popup
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }

    // Calculate popup position (centered)
    const width = 800;
    const height = 700;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    // Open popup with specific parameters to ensure it opens as popup
    const popup = window.open(
      paymentUrl,
      'stripe_payment',
      `width=${width},height=${height},left=${left},top=${top},` +
      'scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no,location=no'
    );

    if (!popup) {
      toast.error('Popup blocked! Please allow popups and try again.');
      onClose();
      return;
    }

    popupRef.current = popup;
    toast.success('Payment window opened. Complete your payment to continue.');

    // Monitor popup
    const checkPopup = () => {
      if (popup.closed) {
        clearInterval(checkIntervalRef.current);
        // Give a small delay before checking URL params for completion
        setTimeout(() => {
          checkForPaymentCompletion();
        }, 1000);
        return;
      }

      try {
        // Try to access popup URL to check for completion
        const currentUrl = popup.location.href;
        if (currentUrl.includes('status=')) {
          const urlParams = new URLSearchParams(new URL(currentUrl).search);
          const status = urlParams.get('status');
          const refId = urlParams.get('refId');
          const sessionId = urlParams.get('session_id');
          
          if (status) {
            popup.close();
            clearInterval(checkIntervalRef.current);
            
            const cleanStatus = status.replace(/['"]/g, '');
            
            if (cleanStatus.toLowerCase() === 'success') {
              onSuccess({ status: cleanStatus, refId, sessionId });
            } else {
              onError({ status: cleanStatus, refId, sessionId });
            }
            onClose();
          }
        }
      } catch (error) {
        // Cross-origin errors are expected, continue monitoring
      }
    };

    // Check every 1 second
    checkIntervalRef.current = setInterval(checkPopup, 1000);

    // Cleanup function
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, [isOpen, paymentUrl, onSuccess, onError, onClose]);

  // Check for payment completion in main window (fallback)
  const checkForPaymentCompletion = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const refId = urlParams.get('refId');
    const sessionId = urlParams.get('session_id');
    
    if (status) {
      const cleanStatus = status.replace(/['"]/g, '');
      
      if (cleanStatus.toLowerCase() === 'success') {
        onSuccess({ status: cleanStatus, refId, sessionId });
      } else {
        onError({ status: cleanStatus, refId, sessionId });
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      onClose();
    } else {
      // If no status found, assume cancelled
      toast.info('Payment was cancelled or incomplete.');
      onClose();
    }
  };

  return null; // This component doesn't render anything visible
};

// Custom Date Picker Modal Component
const CustomDatePickerModal = ({ 
  isOpen, 
  onClose, 
  label, 
  value, 
  onChange, 
  minDate, 
  maxDate, 
  placeholder, 
  error,
  onPeriodSelect 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [displayDate, setDisplayDate] = useState(() => {
    if (value) {
      return createLocalDate(value);
    }
    if (minDate) {
      return typeof minDate === 'string' ? createLocalDate(minDate) : new Date(minDate);
    }
    return new Date();
  });
  const [selectedDate, setSelectedDate] = useState(value || "");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setSelectedDate(value || "");
    if (value) {
      setDisplayDate(createLocalDate(value));
    }
  }, [value]);

  const handleDateClick = (date) => {
    const minDateTime = typeof minDate === 'string' ? createLocalDate(minDate) : minDate;
    const maxDateTime = typeof maxDate === 'string' ? createLocalDate(maxDate) : maxDate;
    
    if (isDateDisabled(date, minDateTime, maxDateTime)) return;
    
    const formattedDate = formatDateString(date);
    setSelectedDate(formattedDate);
  };

  const handleConfirm = () => {
    onChange(selectedDate);
    onClose();
  };

  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Period selection functionality
  const handlePeriodSelect = (period) => {
    if (!onPeriodSelect) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() + 4); // Minimum 3 days from today
    
    const endDate = new Date(startDate);
    
    switch (period) {
      case '2weeks':
        endDate.setDate(startDate.getDate() + 14);
        break;
      case '1month':
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case '2months':
        endDate.setMonth(startDate.getMonth() + 2);
        break;
      case '3months':
        endDate.setMonth(startDate.getMonth() + 3);
        break;
      case '6months':
        endDate.setMonth(startDate.getMonth() + 6);
        break;
      default:
        return;
    }
    
    onPeriodSelect({
      startDate: formatDateString(startDate),
      endDate: formatDateString(endDate)
    });
    onClose();
  };

  if (!isOpen) return null;

  // Mobile Drawer
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative z-50 w-full bg-white rounded-t-xl max-h-[80vh] flex flex-col border-t border-gray-200">
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-scale-400 rounded-lg flex items-center justify-center">
                  <FiCalendar className="w-4 h-4 text-black" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-white">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-semibold text-gray-900">
                  {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
                </h3>
                <button
                  type="button"
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-xs text-gray-500 text-center py-2 font-medium">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {getDaysInMonth(displayDate.getFullYear(), displayDate.getMonth()).map((date, index) => {
                  if (!date) {
                    return <div key={index} className="p-2"></div>;
                  }

                  const isSelected = selectedDate && formatDateString(date) === selectedDate;
                  const minDateTime = typeof minDate === 'string' ? createLocalDate(minDate) : minDate;
                  const maxDateTime = typeof maxDate === 'string' ? createLocalDate(maxDate) : maxDate;
                  const isDisabled = isDateDisabled(date, minDateTime, maxDateTime);
                  const isTodayDate = isToday(date);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      disabled={isDisabled}
                      className={`p-2 text-xs rounded-full transition-colors min-h-[32px] flex items-center justify-center relative ${
                        isSelected
                          ? 'bg-primary-scale-400 text-black font-semibold'
                          : isDisabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {date.getDate()}
                      {isTodayDate && !isSelected && (
                        <div className="absolute top-1 right-1 w-1 h-1 bg-green-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Period Selection */}
              {onPeriodSelect && (
                <div className="border-t pt-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Quick Selection</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePeriodSelect('2weeks')}
                      className="p-2 text-xs bg-gray-100 hover:bg-primary-scale-400 rounded transition-colors"
                    >
                      2 Weeks
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePeriodSelect('1month')}
                      className="p-2 text-xs bg-gray-100 hover:bg-primary-scale-400 rounded transition-colors"
                    >
                      1 Month
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePeriodSelect('2months')}
                      className="p-2 text-xs bg-gray-100 hover:bg-primary-scale-400 rounded transition-colors"
                    >
                      2 Months
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePeriodSelect('3months')}
                      className="p-2 text-xs bg-gray-100 hover:bg-primary-scale-400 rounded transition-colors"
                    >
                      3 Months
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedDate}
                className="flex-1 px-4 py-3 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Modal
return (
  <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 pb-8">
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[calc(100vh-4rem)] border border-gray-200 overflow-hidden flex flex-col my-auto">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-scale-400 rounded-lg flex items-center justify-center">
            <FiCalendar className="w-5 h-5 text-black" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <FiX className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-semibold text-gray-900">
              {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-xs text-gray-500 text-center py-2 font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {getDaysInMonth(displayDate.getFullYear(), displayDate.getMonth()).map((date, index) => {
              if (!date) {
                return <div key={index} className="p-2"></div>;
              }

              const isSelected = selectedDate && formatDateString(date) === selectedDate;
              const minDateTime = typeof minDate === 'string' ? createLocalDate(minDate) : minDate;
              const maxDateTime = typeof maxDate === 'string' ? createLocalDate(maxDate) : maxDate;
              const isDisabled = isDateDisabled(date, minDateTime, maxDateTime);
              const isTodayDate = isToday(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  disabled={isDisabled}
                  className={`p-2 text-xs rounded-full transition-colors min-h-[32px] flex items-center justify-center relative ${
                    isSelected
                      ? 'bg-primary-scale-400 text-black font-semibold'
                      : isDisabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {date.getDate()}
                  {isTodayDate && !isSelected && (
                    <div className="absolute top-1 right-1 w-1 h-1 bg-green-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Period Selection */}
          {onPeriodSelect && (
            <div className="border-t pt-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Quick Selection</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePeriodSelect('2weeks')}
                  className="p-2 text-xs bg-gray-100 hover:bg-primary-scale-400 rounded transition-colors"
                >
                  2 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodSelect('1month')}
                  className="p-2 text-xs bg-gray-100 hover:bg-primary-scale-400 rounded transition-colors"
                >
                  1 Month
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodSelect('2months')}
                  className="p-2 text-xs bg-gray-100 hover:bg-primary-scale-400 rounded transition-colors"
                >
                  2 Months
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodSelect('3months')}
                  className="p-2 text-xs bg-gray-100 hover:bg-primary-scale-400 rounded transition-colors"
                >
                  3 Months
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedDate}
          className="flex-1 px-4 py-2 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);
};

// Custom Date Picker Component
const CustomDatePicker = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayValue = props.value ? formatDisplayDate(props.value) : '';

  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          {props.label}
        </label>
        <div 
          onClick={() => setIsModalOpen(true)}
          className={`w-full px-3 py-3 border rounded-lg cursor-pointer transition-colors text-xs bg-gray-50 hover:bg-white focus:ring-2 focus:ring-primary-scale-100 ${
            props.error 
              ? "border-red-500" 
              : "border-gray-300 hover:border-primary-scale-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={displayValue ? "text-gray-900" : "text-gray-500"}>
              {displayValue || props.placeholder}
            </span>
            <FiCalendar className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        {props.error && (
          <p className="text-xs text-red-500 mt-1">{props.error}</p>
        )}
      </div>

      <CustomDatePickerModal
        {...props}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

// Budget validation modal
const BudgetValidationModal = ({ isOpen, onClose, requiredBudget, currentBudget, numberOfInfluencers }) => {
  const shortfall = requiredBudget - currentBudget;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Budget Insufficient
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Your budget does not fit the number of influencers selected. Try increasing your budget by ${shortfall}.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span>Number of Influencers:</span>
              <span className="font-medium">{numberOfInfluencers}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Current Budget:</span>
              <span className="font-medium">${currentBudget}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Required Budget:</span>
              <span className="font-medium">${requiredBudget}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-orange-600 border-t border-gray-200 pt-2">
              <span>Shortfall:</span>
              <span>${shortfall}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 transition-colors text-sm font-medium"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Enhanced NumberInput component for budget
const BudgetInput = ({
  value,
  onChange,
  label,
  helperText,
  className = "",
}) => {
  const [displayValue, setDisplayValue] = useState(value.toString());
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const validateBudget = (budget) => {
    if (budget < MIN_BUDGET_PER_INFLUENCER) {
      return `Minimum budget is $${MIN_BUDGET_PER_INFLUENCER}`;
    }
    return null;
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue === "" || /^\d+(\.\d{0,2})?$/.test(inputValue)) {
      setDisplayValue(inputValue);
      setError("");

      if (inputValue === "") {
        return;
      }

      const numValue = parseFloat(inputValue);
      const validationError = validateBudget(numValue);

      if (validationError) {
        setError(validationError);
        triggerShake();
      } else {
        onChange(numValue);
      }
    }
  };

  const handleBlur = () => {
    if (
      displayValue === "" ||
      parseFloat(displayValue) < MIN_BUDGET_PER_INFLUENCER
    ) {
      setError(`Minimum budget is $${MIN_BUDGET_PER_INFLUENCER}`);
      triggerShake();
      setDisplayValue(MIN_BUDGET_PER_INFLUENCER.toString());
      onChange(MIN_BUDGET_PER_INFLUENCER);

      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-scale-100 transition-all text-xs bg-gray-50 focus:bg-white ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-300 focus:border-primary-scale-400"
        } ${isShaking ? "animate-shake" : ""} ${className}`}
        placeholder={`${MIN_BUDGET_PER_INFLUENCER}`}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1 animate-pulse">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
};

// Enhanced NumberInput component for influencers
const InfluencersInput = ({
  value,
  onChange,
  label,
  helperText,
  className = "",
  currentBudget,
}) => {
  const [displayValue, setDisplayValue] = useState(value.toString());
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const validateInfluencers = (influencers) => {
    if (influencers < 1) {
      return "Minimum 1 influencer required";
    }
    return null;
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue === "" || /^\d+$/.test(inputValue)) {
      setDisplayValue(inputValue);
      setError("");

      if (inputValue === "") {
        return;
      }

      const numValue = parseInt(inputValue);
      const validationError = validateInfluencers(numValue);

      if (validationError) {
        setError(validationError);
        triggerShake();
      } else {
        onChange(numValue);
      }
    }
  };

  const handleBlur = () => {
    if (displayValue === "" || parseInt(displayValue) < 1) {
      setError("Minimum 1 influencer required");
      triggerShake();
      setDisplayValue("1");
      onChange(1);
      setTimeout(() => setError(""), 3000);
      return;
    }

    const numInfluencers = parseInt(displayValue);
    const requiredBudget = calculateMinimumBudget(numInfluencers);
    
    if (currentBudget < requiredBudget) {
      triggerShake();
      setShowBudgetModal(true);
    }
  };

  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          {label}
        </label>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-scale-100 transition-all text-xs bg-gray-50 focus:bg-white ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-primary-scale-400"
          } ${isShaking ? "animate-shake" : ""} ${className}`}
          placeholder="1"
        />
        {error && (
          <p className="text-xs text-red-500 mt-1 animate-pulse">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
        )}
      </div>

      <AnimatePresence>
        {showBudgetModal && (
          <BudgetValidationModal
            isOpen={showBudgetModal}
            onClose={() => setShowBudgetModal(false)}
            requiredBudget={calculateMinimumBudget(parseInt(displayValue))}
            currentBudget={currentBudget}
            numberOfInfluencers={parseInt(displayValue)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// Insufficient Funds Modal
const InsufficientFundsModal = ({
  isOpen,
  onClose,
  onAddFunds,
  requiredAmount,
  walletBalance,
}) => {
  if (!isOpen) return null;

  const shortfall = Math.max(
    0,
    safeToNumber(requiredAmount) - safeToNumber(walletBalance)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Insufficient Funds
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            You need ${safeToFixed(shortfall, 2)} more to proceed with this
            campaign.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <div className="flex justify-between text-xs">
              <span>Current Balance:</span>
              <span className="font-medium">
                ${safeToFixed(walletBalance, 2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Required Amount:</span>
              <span className="font-medium">
                ${safeToFixed(requiredAmount, 2)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-red-600">
              <span>Shortfall:</span>
              <span>${safeToFixed(shortfall, 2)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              onClick={onAddFunds}
              className="flex-1 px-4 py-2 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 transition-colors text-xs"
            >
              Add Funds
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Enhanced state persistence for all steps
  const [persistedCampaignState, setPersistedCampaignState] = useLocalStorage(
    "campaign-create-state",
    {
      activeStep: 0,
      campaignData: {
        title: "",
        objective: "",
        description: "",
        start_date: "",
        end_date: "",
        content: null,
        contentUrl: null,
        tasks: [],
      },
      brandBudget: MIN_BUDGET_PER_INFLUENCER,
      numberOfInfluencers: 1,
      eligibilityData: null,
      draftCampaignId: "",
      filterData: {
        numberInfluencers: 5,
        selectedRank: "3",
        gemPoints: 1000,
        brandBudget: MIN_BUDGET_PER_INFLUENCER,
        socialPlatforms: [],
        minFollowers: "50",
        startDate: "",
        endDate: "",
        selectedIndustries: [],
        socialFollowers: {},
        eligibleResults: undefined,
      },
    }
  );

  // Add mode tracking
  const [mode, setMode] = useState(state?.mode || "create");
  const [editCampaignData, setEditCampaignData] = useState(
    state?.editCampaignData || null
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [campaignCreatedOnce, setCampaignCreatedOnce] = useState(false);

  // Update initial step based on state OR persisted state
  const [activeStep, setActiveStep] = useState(() => {
    if (state?.openOnStep !== undefined) {
      return state.openOnStep;
    }
    if (mode === "create" && persistedCampaignState.activeStep !== undefined) {
      return persistedCampaignState.activeStep;
    }
    return 0;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(
    mode === "create" ? persistedCampaignState.eligibilityData : null
  );
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [draftCampaignId, setDraftCampaignId] = useState(
    mode === "create" ? persistedCampaignState.draftCampaignId : ""
  );
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [socialSites, setSocialSites] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [loadingObjectives, setLoadingObjectives] = useState(false);
  const [dateErrors, setDateErrors] = useState({});
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);

  // Add Funds states
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addingFunds, setAddingFunds] = useState(false);

  // PIN verification states
  const [userData, setUserData] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPinVerification, setShowPinVerification] = useState(false);

  // Add PIN context state to track whether PIN operation is for campaign or add funds
  const [pinContext, setPinContext] = useState('campaign'); // 'campaign' or 'addFunds'

  // Enhanced payment popup states
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  // Payment status state
  const [paymentStatus, setPaymentStatus] = useState({
    show: false,
    status: null,
    refId: null,
    sessionId: null
  });

  const [newTask, setNewTask] = useState({
    task: "",
    description: "",
    requires_url: true,
    site_id: "",
    task_type: "",
    repeats_after: "",
  });

  // Budget and influencers initialized from persisted state
  const [brandBudget, setBrandBudget] = useState(
    mode === "create" 
      ? safeToNumber(persistedCampaignState.brandBudget, MIN_BUDGET_PER_INFLUENCER)
      : MIN_BUDGET_PER_INFLUENCER
  );
  const [numberOfInfluencers, setNumberOfInfluencers] = useState(
    mode === "create" 
      ? safeToNumber(persistedCampaignState.numberOfInfluencers, 1)
      : 1
  );

  const [filterData, setFilterData] = useState(
    mode === "create" ? persistedCampaignState.filterData : {
      numberInfluencers: 5,
      selectedRank: "3",
      gemPoints: 1000,
      brandBudget: MIN_BUDGET_PER_INFLUENCER,
      socialPlatforms: [],
      minFollowers: "50",
      startDate: "",
      endDate: "",
      selectedIndustries: [],
      socialFollowers: {},
      eligibleResults: undefined,
    }
  );

  const [campaignData, setCampaignData] = useState(() => {
    // Only use persisted data in create mode
    if (mode === "create") {
      return persistedCampaignState.campaignData;
    }
    return {
      title: "",
      objective: "",
      description: "",
      start_date: "",
      end_date: "",
      content: null,
      contentUrl: null,
      tasks: [],
    };
  });

  // Add getAllowedSiteIds function inside the component
  const getAllowedSiteIds = useCallback(() => {
    const siteIds = campaignData.tasks.map(task => parseInt(task.site_id)).filter(id => !isNaN(id));
    return [...new Set(siteIds)]; // Remove duplicates
  }, [campaignData.tasks]);

  // Handle payment redirect parameters (fallback for direct navigation)
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
          // Refresh wallet balance after successful payment
          setTimeout(() => {
            handleRefreshWallet();
          }, 2000);
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

  // Enhanced state persistence - save state changes immediately
  useEffect(() => {
    if (mode === "create") {
      setPersistedCampaignState({
        activeStep,
        campaignData: {
          ...campaignData,
          content: null, // Don't persist File objects
        },
        brandBudget,
        numberOfInfluencers,
        eligibilityData,
        draftCampaignId,
        filterData,
      });
    }
  }, [
    mode,
    activeStep,
    campaignData,
    brandBudget,
    numberOfInfluencers,
    eligibilityData,
    draftCampaignId,
    filterData,
    setPersistedCampaignState,
  ]);

  // Track unsaved changes - Enhanced to handle both edit mode and created campaigns
  const originalDataRef = useRef(null);

  // Set original data when campaign is created or in edit mode
  const setOriginalData = useCallback(
    (data) => {
      originalDataRef.current = {
        title: data.title || "",
        description: data.description || "",
        objective: data.objective || "",
        start_date: data.start_date || "",
        end_date: data.end_date || "",
        tasks: data.tasks || [],
        budget: data.budget || brandBudget,
        numberOfInfluencers: data.numberOfInfluencers || numberOfInfluencers,
        contentUrl: data.campaign_image || data.contentUrl || null,
      };
    },
    [brandBudget, numberOfInfluencers]
  );

  // Initialize original data for edit mode
  useEffect(() => {
    if (mode === "edit" && editCampaignData && !originalDataRef.current) {
      setOriginalData({
        title: editCampaignData.title,
        description: editCampaignData.description,
        objective: editCampaignData.objective,
        start_date: editCampaignData.start_date,
        end_date: editCampaignData.end_date,
        tasks: editCampaignData.tasks,
        budget: editCampaignData.budget,
        numberOfInfluencers: editCampaignData.numberOfInfluencers,
        campaign_image: editCampaignData.campaign_image,
      });
    }
  }, [mode, editCampaignData, setOriginalData]);

  // Track changes for both edit mode and created campaigns
  useEffect(() => {
    if (originalDataRef.current) {
      const hasChanges =
        campaignData.title !== originalDataRef.current.title ||
        campaignData.description !== originalDataRef.current.description ||
        campaignData.objective !== originalDataRef.current.objective ||
        campaignData.start_date !== originalDataRef.current.start_date ||
        campaignData.end_date !== originalDataRef.current.end_date ||
        JSON.stringify(campaignData.tasks) !==
          JSON.stringify(originalDataRef.current.tasks) ||
        brandBudget !== originalDataRef.current.budget ||
        numberOfInfluencers !== originalDataRef.current.numberOfInfluencers ||
        campaignData.content !== null || // New image uploaded
        campaignData.contentUrl !== originalDataRef.current.contentUrl;
      setHasUnsavedChanges(hasChanges);
    }
  }, [campaignData, brandBudget, numberOfInfluencers]);

  const steps = useMemo(
    () => [
      {
        id: 0,
        title: mode === "edit" ? "Edit Details" : "Details",
        subtitle: "Campaign details",
        icon: FiFileText,
        description:
          mode === "edit"
            ? "Update your campaign details"
            : "Create your campaign and define the requirements",
        color: "from-black to-gray-800",
      },
      {
        id: 1,
        title: mode === "addMembers" ? "Add Members" : "Influencers",
        subtitle: "Find your perfect creators",
        icon: FiUsers,
        description:
          mode === "addMembers"
            ? "Add more influencers to your existing campaign"
            : "Define criteria to discover the ideal influencers for your brand campaign",
        color: "from-purple-500 to-purple-600",
      },
      {
        id: 2,
        title: "Payment",
        subtitle: "Payment summary",
        icon: FiDollarSign,
        description: "Review payment details and launch campaign",
        color: "from-green-500 to-green-600",
      },
      {
        id: 3,
        title: mode === "edit" ? "Updated" : "Launch",
        subtitle: mode === "edit" ? "Campaign updated" : "Campaign launched",
        icon: FiCheckCircle,
        description:
          mode === "edit"
            ? "Your campaign has been updated successfully"
            : "Your campaign is now live",
        color: "from-green-500 to-green-600",
      },
    ],
    [mode]
  );

  // Fetch social sites
  useEffect(() => {
    const fetchSocialSites = async () => {
      try {
        const response = await get("users/socialSites");
        if (response?.status === 200 && response?.data) {
          setSocialSites(response.data);
        }
      } catch (error) {
        console.error("Error fetching social sites:", error);
        setSocialSites([
          { site_id: 1, site_name: "Facebook", sm_name: "Facebook" },
          { site_id: 2, site_name: "Twitter", sm_name: "Twitter" },
          { site_id: 3, site_name: "LinkedIn", sm_name: "LinkedIn" },
          { site_id: 4, site_name: "Instagram", sm_name: "Instagram" },
          { site_id: 5, site_name: "TikTok", sm_name: "TikTok" },
          { site_id: 6, site_name: "YouTube", sm_name: "YouTube" },
        ]);
      }
    };

    fetchSocialSites();
  }, []);

  // Fetch objectives
  useEffect(() => {
    const fetchObjectives = async () => {
      try {
        setLoadingObjectives(true);
        const response = await get("campaigns/objectives");
        if (response?.status === 200 && response?.data) {
          setObjectives(response.data);
        }
      } catch (error) {
        console.error("Error fetching objectives:", error);
        setObjectives([
          { id: 1, objective: "Brand Awareness" },
          { id: 2, objective: "Lead Generation" },
          { id: 3, objective: "Sales Conversion" },
          { id: 4, objective: "Engagement" },
          { id: 5, objective: "Website Traffic" },
        ]);
      } finally {
        setLoadingObjectives(false);
      }
    };

    fetchObjectives();
  }, []);

  // Fetch wallet balance and user data FIRST
  useEffect(() => {
    const fetchWalletAndUserData = async () => {
      try {
        setLoadingWallet(true);
        
        // Fetch user profile to check PIN status
        const userProfileResponse = await get("users/getUserProfile");
        if (userProfileResponse?.status === 200 && userProfileResponse?.data) {
          setUserData(userProfileResponse.data);
        }

        const walletResponse = await get("wallet/getWallets");
        if (walletResponse?.status === 200 && walletResponse?.data) {
          setWalletBalance(safeToNumber(walletResponse.data.balance));
        } else {
          setWalletBalance(0);
        }
      } catch (error) {
        console.error("Error fetching wallet balance and user data:", error);
        setWalletBalance(0);
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWalletAndUserData();
  }, []);

  // Handle pre-filling data when in edit mode
  useEffect(() => {
    if (mode === "edit" && editCampaignData) {
      console.log("Pre-filling edit data:", editCampaignData);

      // Enhanced task formatting to properly preserve site_id
      const formatTasksForForm = (tasks) => {
        if (!tasks || !Array.isArray(tasks)) return [];

        return tasks.map((task) => ({
          task: task.task || task.title || task.name || "",
          description: task.description || "",
          // Properly handle site_id conversion and validation
          site_id: (() => {
            const siteId = task.site_id || task.platform_id || task.social_media_id;
            const numericSiteId = parseInt(siteId);
            
            // Validate that the site_id exists in our socialSites list
            if (!isNaN(numericSiteId) && socialSites.length > 0) {
              const siteExists = socialSites.find(site => site.site_id === numericSiteId);
              return siteExists ? numericSiteId : (socialSites[0]?.site_id || 4);
            }
            
            // Default fallback
            return socialSites.length > 0 ? socialSites[0].site_id : 4;
          })(),
          task_type: task.task_type || task.type || "repetitive",
          requires_url: task.requires_url === "1" || task.requires_url === true || task.requires_url === 'true',
          repeats_after: task.repeats_after || task.frequency || "daily",
        }));
      };

      setCampaignData({
        campaign_id: editCampaignData.campaign_id,
        title: editCampaignData.title || "",
        description: editCampaignData.description || "",
        objective: editCampaignData.objective || "",
        start_date: utcDateToLocal(editCampaignData.start_date) || "",
        end_date: utcDateToLocal(editCampaignData.end_date) || "",
        content: null,
        contentUrl: editCampaignData.campaign_image || null,
        tasks: formatTasksForForm(editCampaignData.tasks),
      });

      setBrandBudget(
        safeToNumber(editCampaignData.budget, MIN_BUDGET_PER_INFLUENCER)
      );
      setNumberOfInfluencers(
        safeToNumber(editCampaignData.numberOfInfluencers, 1)
      );
      setDraftCampaignId(editCampaignData.campaign_id);

      toast.success("Campaign data loaded for editing");
    }
  }, [mode, editCampaignData, socialSites]); // Added socialSites dependency

  // Add effect to handle add members mode
  useEffect(() => {
    if (mode === "addMembers" && state?.prefilledFilterData) {
      const prefilledData = state.prefilledFilterData;
      console.log("Pre-filling filter data for add members:", prefilledData);

      setDraftCampaignId(prefilledData.campaignId);
      setBrandBudget(
        safeToNumber(prefilledData.brandBudget, MIN_BUDGET_PER_INFLUENCER)
      );
      setNumberOfInfluencers(safeToNumber(prefilledData.numberInfluencers, 1));

      setFilterData((prev) => ({
        ...prev,
        campaignId: prefilledData.campaignId,
        brandBudget: safeToNumber(
          prefilledData.brandBudget,
          MIN_BUDGET_PER_INFLUENCER
        ),
        numberInfluencers: safeToNumber(prefilledData.numberInfluencers, 1),
        selectedIndustries: prefilledData.selectedIndustries,
        startDate: prefilledData.startDate,
        endDate: prefilledData.endDate,
        socialMediaRequirements: prefilledData.socialMediaRequirements,
      }));

      if (state?.existingCampaign) {
        setCampaignData((prev) => ({
          ...prev,
          campaign_id: state.existingCampaign.campaign_id,
          title: state.existingCampaign.title,
          description: state.existingCampaign.description,
          objective: state.existingCampaign.objective,
          start_date: utcDateToLocal(state.existingCampaign.start_date),
          end_date: utcDateToLocal(state.existingCampaign.end_date),
          contentUrl: state.existingCampaign.image_urls,
        }));
      }

      toast.success("Ready to add more members to your campaign");
    }
  }, [mode, state]);

  // Date validation functions - UPDATED with timezone awareness
  const getMinStartDate = () => {
    return getMinimumDate(4);
  };

  const getMinEndDate = () => {
    if (!campaignData.start_date) return null;
    const startDate = createLocalDate(campaignData.start_date);
    if (!startDate) return null;
    const minEndDate = new Date(startDate);
    minEndDate.setDate(minEndDate.getDate() + 1);
    return minEndDate;
  };

  const validateDates = useCallback(() => {
    const { isValid, errors } = validateDateRange(
      campaignData.start_date, 
      campaignData.end_date, 
      3
    );
    setDateErrors(errors);
    return isValid;
  }, [campaignData.start_date, campaignData.end_date]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStep]);

  // Initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Validate dates when they change
  useEffect(() => {
    validateDates();
  }, [validateDates]);

  const handleFilterChange = useCallback((newFilterData) => {
    setFilterData(newFilterData);
  }, []);

  // Handle period selection for date picker - UPDATED with timezone awareness
  const handlePeriodSelect = useCallback((period) => {
    setCampaignData((prev) => ({
      ...prev,
      start_date: period.startDate,
      end_date: period.endDate,
    }));
    toast.success(
      `Campaign period set to ${period.startDate} - ${period.endDate}`
    );
  }, []);

  // Handle wallet balance refresh
  const handleRefreshWallet = async () => {
    try {
      setLoadingWallet(true);
      const walletResponse = await get("wallet/getWallets");
      if (walletResponse?.status === 200 && walletResponse?.data) {
        setWalletBalance(safeToNumber(walletResponse.data.balance));
        toast.success("Wallet balance refreshed");
      }
    } catch (error) {
      console.error("Error refreshing wallet balance:", error);
      toast.error("Failed to refresh wallet balance");
    } finally {
      setLoadingWallet(false);
    }
  };

  // Handle add funds functionality with forced popup window
  const handleAddFunds = async (data) => {
    setAddingFunds(true);
    try {
      const depositData = {
        amount: data.amount,
        paymentMethod: "CARD",
        currency: "USD",
        payment_method_id: "",
      };

      const response = await post("wallet/depositRequest", depositData);

      if (response.status === 200) {
        // Use window.open with proper popup parameters
        setPaymentUrl(response.data.paymentUrl);
        setShowPaymentPopup(true);
        setShowAddFunds(false);
        toast.success("Opening payment window...");
      }
    } catch (error) {
      console.error("Payment request error:", error);
      toast.error("Failed to process deposit request");
    } finally {
      setAddingFunds(false);
    }
  };

  // Handle payment popup success
  const handlePaymentSuccess = (result) => {
    console.log("Payment successful:", result);
    
    setPaymentStatus({
      show: true,
      status: result.status,
      refId: result.refId,
      sessionId: result.sessionId
    });
    
    toast.success('Payment completed successfully!');
    
    // Refresh wallet balance after successful payment
    setTimeout(() => {
      handleRefreshWallet();
    }, 2000);
  };

  // Handle payment popup error
  const handlePaymentError = (result) => {
    console.log("Payment failed:", result);
    
    setPaymentStatus({
      show: true,
      status: result.status,
      refId: result.refId,
      sessionId: result.sessionId
    });
    
    toast.error('Payment failed or was cancelled.');
  };

  // Handle add funds redirect with proper PIN context
  const handleAddFundsRedirect = () => {
    setPinContext('addFunds'); // Set context to add funds
    if (hasPinSet) {
      setShowPinVerification(true);
    } else {
      setShowPinModal(true);
    }
  };

  // Check if user has set a PIN by looking at wallet_pin data
  const hasPinSet = userData?.wallet_pin && Object.keys(userData.wallet_pin).length > 0;

  // Handle PIN success with context awareness
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
    
    // After setting PIN, proceed based on context
    if (pinContext === 'addFunds') {
      setShowAddFunds(true);
    }
    // For campaign context, the flow continues normally
  };

  // Handle PIN verification success with context awareness
  const handlePinVerificationSuccess = () => {
    setShowPinVerification(false);
    
    if (pinContext === 'addFunds') {
      setShowAddFunds(true);
    } else {
      // Campaign creation context
      handleCreateCampaignAfterPinVerification();
    }
  };

  // Handle close payment status
  const handleClosePaymentStatus = () => {
    setPaymentStatus(prev => ({ ...prev, show: false }));
  };

  // Handle retry payment
  const handleRetryPayment = () => {
    setPaymentStatus(prev => ({ ...prev, show: false }));
    setPinContext('addFunds'); // Set context for retry
    if (hasPinSet) {
      setShowPinVerification(true);
    } else {
      setShowPinModal(true);
    }
  };

  // Handle influencer mismatch - Proceed with available influencers (FULL DATA)
const handleProceedWithAvailable = useCallback(async () => {
  try {
    setLoading(true);
    
    const availableInfluencers = safeToNumber(eligibilityData?.totalCount, 0);
    
    // Handle image upload if there's a new image
    let campaignImageUrl = campaignData.contentUrl;
    if (campaignData.content) {
      console.log("Uploading new image...");
      const formData = new FormData();
      formData.append("file_type", "STATUS_POST");
      formData.append("content", campaignData.content);

      const uploadResponse = await upload("media/uploadFile", formData);
      if (
        uploadResponse?.status === 200 &&
        uploadResponse?.data?.[0]?.file_url
      ) {
        campaignImageUrl = uploadResponse.data[0].file_url;
        console.log("Image uploaded successfully:", campaignImageUrl);
      }
    }
    
    // Send full campaign data like regular edit
    const updatePayload = {
      campaign_id: draftCampaignId || campaignData.campaign_id,
      title: campaignData.title,
      description: campaignData.description,
      objective: campaignData.objective,
      start_date: localDateToUTC(campaignData.start_date),
      end_date: localDateToUTC(campaignData.end_date),
      budget: brandBudget,
      number_of_influencers: availableInfluencers, // Use available count instead of requested
      ...(campaignImageUrl && { campaign_image: campaignImageUrl }),
      tasks: campaignData.tasks.map((task) => ({
        task: task.task,
        description: task.description,
        site_id: parseInt(task.site_id) || 4,
        task_type: "repetitive",
        requires_url: task.requires_url ? "1" : "",
        repeats_after: "daily",
      })),
    };

    console.log("Update campaign payload with full data:", updatePayload);

    const updateResponse = await patch("campaigns/edit", updatePayload);

    if (updateResponse?.status === 200) {
      // Update local state
      setNumberOfInfluencers(availableInfluencers);
      
      // Update eligibility data with safe conversions
      setEligibilityData(prev => ({
        ...prev,
        budget: (availableInfluencers * INFLUENCER_BASE_RATE) + PLATFORM_FEE,
        totalBudget: (availableInfluencers * INFLUENCER_BASE_RATE) + PLATFORM_FEE,
      }));

      // Update original data reference like in updateExistingCampaign
      setOriginalData({
        title: campaignData.title,
        description: campaignData.description,
        objective: campaignData.objective,
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
        tasks: campaignData.tasks,
        budget: brandBudget,
        numberOfInfluencers: availableInfluencers,
        contentUrl: campaignImageUrl,
      });

      toast.success(`Campaign updated to proceed with ${availableInfluencers} influencers`);
    } else {
      throw new Error("Failed to update campaign");
    }
  } catch (error) {
    console.error("Error updating campaign:", error);
    toast.error("Failed to update campaign");
  } finally {
    setLoading(false);
  }
}, [
  draftCampaignId,
  eligibilityData,
  campaignData,
  brandBudget,
  setOriginalData,
  localDateToUTC,
]);

  // Handle influencer mismatch - Go back to edit
  const handleGoBackToEdit = useCallback(() => {
    setActiveStep(0);
    toast.info("Please adjust the number of influencers and try again");
  }, []);

  const createDraftCampaignAndFilter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
  
      toast.loading("Creating draft campaign...", {
        id: "create-draft",
      });
  
      // Upload image if exists
      let campaignImageUrl = null;
      if (campaignData.content) {
        console.log("Uploading image...");
        const formData = new FormData();
        formData.append("file_type", "STATUS_POST");
        formData.append("content", campaignData.content);
  
        const uploadResponse = await upload("media/uploadFile", formData);
        console.log("Upload response:", uploadResponse);
  
        if (
          uploadResponse?.status === 200 &&
          uploadResponse?.data?.[0]?.file_url
        ) {
          campaignImageUrl = uploadResponse.data[0].file_url;
          console.log("Image uploaded successfully:", campaignImageUrl);
        }
      }
  
      const draftCampaignPayload = {
        title: campaignData.title || "Draft Campaign",
        description: campaignData.description || "Campaign description",
        objective: campaignData.objective || "brand_awareness",
        start_date: localDateToUTC(campaignData.start_date),
        end_date: localDateToUTC(campaignData.end_date),
        budget: brandBudget,
        number_of_influencers: numberOfInfluencers,
        ...(campaignImageUrl && { campaign_image: campaignImageUrl }),
        tasks: campaignData.tasks.map((task) => ({
          task: task.task,
          description: task.description,
          site_id: parseInt(task.site_id) || 4,
          task_type: "repetitive",
          requires_url: task.requires_url ? "1" : "",
          repeats_after: "daily",
        })),
      };
  
      console.log("Draft campaign payload:", draftCampaignPayload);
  
      const draftResponse = await post(
        "campaigns/create-draft",
        draftCampaignPayload
      );
  
      console.log("Draft campaign response:", draftResponse);
  
      if (draftResponse?.status === 200 && draftResponse?.data?.campaign_id) {
        const campaignId = draftResponse.data.campaign_id;
        setDraftCampaignId(campaignId);
        setCampaignCreatedOnce(true);
  
        setCampaignData((prev) => ({
          ...prev,
          campaign_id: campaignId,
        }));
  
        // Set original data after successful creation
        setOriginalData({
          title: campaignData.title,
          description: campaignData.description,
          objective: campaignData.objective,
          start_date: campaignData.start_date,
          end_date: campaignData.end_date,
          tasks: campaignData.tasks,
          budget: brandBudget,
          numberOfInfluencers: numberOfInfluencers,
          contentUrl: campaignImageUrl,
        });
  
        toast.loading("Analyzing eligible creators...", {
          id: "create-draft",
        });
  
        const requestId = generateRequestId();
        const eligibleResponse = await post("campaigns/filterInfluencers", {
          requestId: requestId,
          brandBudget: brandBudget,
          number_of_users: numberOfInfluencers,
          campaign_id: campaignId,
          end_date: localDateToUTC(campaignData.end_date),
          industry_ids: [1, 2, 3],
          min_level_id: 3,
          min_points: 1000,
          social_media_requirements: [{ site_id: 1, min_followers: 50 }],
          start_date: localDateToUTC(campaignData.start_date),
          iso_codes: ["UG"],
          gender: "",
          category_type: "",
        });
  
        console.log("Filter influencers response:", eligibleResponse);
  
        if (eligibleResponse?.status === 200) {
          // Use the correct response structure
          const newEligibilityData = {
            budget: eligibleResponse.totalBudget || brandBudget,
            currency: eligibleResponse.currency || "USD",
            count: eligibleResponse.totalCount || 0,
            eligibleCount: eligibleResponse.eligibleCount || 0,
            totalBudget: eligibleResponse.totalBudget || brandBudget,
            requestId: requestId,
            brandBudget: brandBudget,
            campaignId: campaignId,
            totalCount: eligibleResponse.totalCount || 0,
          };
  
          setEligibilityData(newEligibilityData);
  
          setFilterData((prev) => ({
            ...prev,
            brandBudget: brandBudget,
            campaignId: campaignId,
            eligibleResults: {
              budget: eligibleResponse.totalBudget || brandBudget,
              currency: eligibleResponse.currency || "USD",
              count: eligibleResponse.totalCount || 0,
              eligibleCount: eligibleResponse.eligibleCount || 0,
              totalBudget: eligibleResponse.totalBudget || brandBudget,
              totalCount: eligibleResponse.totalCount || 0,
            },
          }));
  
          toast.success(
            `Perfect! Found ${eligibleResponse.eligibleCount || 0} matching creators`,
            { id: "create-draft" }
          );
  
          return true;
        } else {
          throw new Error("Failed to get eligible influencers");
        }
      } else {
        throw new Error(
          draftResponse?.message || "Failed to create draft campaign"
        );
      }
    } catch (error) {
      console.error("Error creating draft campaign:", error);
      const errorMessage =
        error.message || "Failed to create draft campaign. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, { id: "create-draft" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    campaignData,
    brandBudget,
    numberOfInfluencers,
    setOriginalData,
    localDateToUTC,
  ]);

  const updateExistingCampaign = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      toast.loading("Updating campaign...", {
        id: "update-campaign",
      });

      // Upload new image if exists
      let campaignImageUrl = campaignData.contentUrl;
      if (campaignData.content) {
        console.log("Uploading new image...");
        const formData = new FormData();
        formData.append("file_type", "STATUS_POST");
        formData.append("content", campaignData.content);

        const uploadResponse = await upload("media/uploadFile", formData);
        console.log("Upload response:", uploadResponse);

        if (
          uploadResponse?.status === 200 &&
          uploadResponse?.data?.[0]?.file_url
        ) {
          campaignImageUrl = uploadResponse.data[0].file_url;
          console.log("Image uploaded successfully:", campaignImageUrl);
        }
      }

      const updatePayload = {
        campaign_id: draftCampaignId || campaignData.campaign_id,
        title: campaignData.title,
        description: campaignData.description,
        objective: campaignData.objective,
        start_date: localDateToUTC(campaignData.start_date), // Convert to UTC
        end_date: localDateToUTC(campaignData.end_date), // Convert to UTC
        budget: brandBudget,
        number_of_influencers: numberOfInfluencers,
        ...(campaignImageUrl && { campaign_image: campaignImageUrl }),
        tasks: campaignData.tasks.map((task) => ({
          task: task.task,
          description: task.description,
          site_id: parseInt(task.site_id) || 4,
          task_type: "repetitive",
          requires_url: task.requires_url ? "1" : "",
          repeats_after: "daily",
        })),
      };

      console.log("Update campaign payload:", updatePayload);

      const updateResponse = await patch("campaigns/edit", updatePayload);

      console.log("Update campaign response:", updateResponse);

      if (updateResponse?.status === 200) {
        // Update original data reference
        setOriginalData({
          title: campaignData.title,
          description: campaignData.description,
          objective: campaignData.objective,
          start_date: campaignData.start_date,
          end_date: campaignData.end_date,
          tasks: campaignData.tasks,
          budget: brandBudget,
          numberOfInfluencers: numberOfInfluencers,
          contentUrl: campaignImageUrl,
        });

        toast.success("Campaign updated successfully", {
          id: "update-campaign",
        });

        return true;
      } else {
        throw new Error("Failed to update campaign");
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      const errorMessage =
        error.message || "Failed to update campaign. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, { id: "update-campaign" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    campaignData,
    brandBudget,
    numberOfInfluencers,
    draftCampaignId,
    setOriginalData,
    localDateToUTC,
  ]);

  const handleCheckEligibility = async (requestBody) => {
    try {
      setLoading(true);
      setError(null);
  
      if (mode === "create" && campaignData.tasks.length === 0) {
        const errorMessage = "Please add at least one task for creators";
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }
  
      if (brandBudget < MIN_BUDGET_PER_INFLUENCER) {
        const errorMessage = `Minimum budget requirement is $${MIN_BUDGET_PER_INFLUENCER}`;
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }
  
      toast.loading("Analyzing eligible creators...", {
        id: "eligibility-check",
      });
  
      if (!requestBody.requestId) {
        requestBody.requestId = generateRequestId();
      }
  
      // Convert dates to UTC for server
      const serverRequestBody = {
        ...requestBody,
        start_date: localDateToUTC(requestBody.start_date),
        end_date: localDateToUTC(requestBody.end_date),
      };
  
      const eligibleResponse = await post(
        "campaigns/filterInfluencers",
        serverRequestBody
      );
  
      console.log("Eligibility response:", eligibleResponse);
  
      if (eligibleResponse?.status === 200) {
        // Use the correct response structure
        const newEligibilityData = {
          budget: eligibleResponse.totalBudget || safeToNumber(requestBody.brandBudget || brandBudget),
          currency: eligibleResponse.currency || "USD",
          count: eligibleResponse.totalCount || 0,
          eligibleCount: eligibleResponse.eligibleCount || 0,
          totalBudget: eligibleResponse.totalBudget || safeToNumber(requestBody.brandBudget || brandBudget),
          requestId: requestBody.requestId,
          brandBudget: safeToNumber(requestBody.brandBudget || brandBudget),
          campaignId: requestBody.campaign_id,
          totalCount: eligibleResponse.totalCount || 0,
        };
  
        setEligibilityData(newEligibilityData);
  
        setFilterData((prev) => ({
          ...prev,
          brandBudget: safeToNumber(requestBody.brandBudget || brandBudget),
          campaignId: requestBody.campaign_id,
          eligibleResults: {
            budget: eligibleResponse.totalBudget || safeToNumber(requestBody.brandBudget || brandBudget),
            currency: eligibleResponse.currency || "USD",
            count: eligibleResponse.totalCount || 0,
            eligibleCount: eligibleResponse.eligibleCount || 0,
            totalBudget: eligibleResponse.totalBudget || safeToNumber(requestBody.brandBudget || brandBudget),
            totalCount: eligibleResponse.totalCount || 0,
          },
        }));
  
        toast.success(
          `Perfect! Found ${eligibleResponse.eligibleCount || 0} matching creators`,
          { id: "eligibility-check" }
        );
      } else {
        throw new Error("Failed to get eligible influencers");
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
      const errorMessage =
        error.message || "Analysis failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, { id: "eligibility-check" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file instanceof File) {
      setCampaignData((prev) => ({
        ...prev,
        content: file,
      }));
    }
  }, []);

  const handleAddTask = useCallback(() => {
    if (
      !newTask.task.trim() ||
      !newTask.description.trim() ||
      !newTask.site_id ||
      !newTask.task_type ||
      (newTask.task_type === "repetitive" && !newTask.repeats_after)
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const taskToAdd = {
      ...newTask,
      site_id: parseInt(newTask.site_id),
    };

    if (editingTaskIndex !== null) {
      setCampaignData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task, index) =>
          index === editingTaskIndex ? taskToAdd : task
        ),
      }));
      toast.success("Task updated successfully");
    } else {
      setCampaignData((prev) => ({
        ...prev,
        tasks: [...prev.tasks, taskToAdd],
      }));
      toast.success("Task added successfully");
    }

    setNewTask({
      task: "",
      description: "",
      requires_url: true,
      site_id: "",
      task_type: "",
      repeats_after: "",
    });
    setOpenTaskDialog(false);
  }, [newTask, editingTaskIndex]);

  const handleEditTask = useCallback(
    (index) => {
      const task = campaignData.tasks[index];

      setNewTask({
        task: task.task || "",
        description: task.description || "",
        site_id: task.site_id ? task.site_id.toString() : "",
        task_type: task.task_type || "",
        requires_url: Boolean(task.requires_url),
        repeats_after: task.repeats_after || "daily",
      });

      setEditingTaskIndex(index);
      setOpenTaskDialog(true);
    },
    [campaignData.tasks]
  );

  const handleRemoveTask = useCallback((index) => {
    setCampaignData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
    toast.success("Task removed");
  }, []);

  // Updated campaign creation flow with PIN verification
  const handleCreateCampaign = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!draftCampaignId) {
        const errorMessage =
          "No draft campaign found. Please go back and analyze criteria first.";
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Handle undefined eligibilityData safely
      const totalCost = safeToNumber(eligibilityData?.budget, 0);
      if (walletBalance < totalCost) {
        const errorMessage = `Insufficient funds. You need $${safeToFixed(
          totalCost,
          2
        )} but only have $${safeToFixed(walletBalance, 2)}`;
        setError(errorMessage);
        toast.error(errorMessage);
        setShowInsufficientFunds(true);
        return;
      }

      // Check if user has PIN set
      if (!hasPinSet) {
        setLoading(false);
        setPinContext('campaign'); // Set context for campaign creation
        setShowPinModal(true);
        return;
      }

      // Show PIN verification
      setLoading(false);
      setPinContext('campaign'); // Set context for campaign creation
      setShowPinVerification(true);
    } catch (error) {
      console.error("Error in handleCreateCampaign:", error);
      const errorMessage = error.message || "Failed to proceed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  }, [
    draftCampaignId,
    eligibilityData,
    walletBalance,
    hasPinSet,
  ]);

  // Actual campaign creation after PIN verification
  const handleCreateCampaignAfterPinVerification = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      toast.loading(
        mode === "addMembers" ? "Adding members..." : "Launching campaign...",
        { id: "create-campaign" }
      );

      // Handle undefined eligibilityData safely
      if (!eligibilityData?.requestId) {
        throw new Error("No eligibility data found. Please analyze criteria first.");
      }

      const invitePayload = {
        requestId: eligibilityData.requestId,
        campaign_id: draftCampaignId,
      };

      const inviteResponse = await post("campaigns/inviteUsers", invitePayload);

      if (inviteResponse?.status === 200) {
        if (mode === "create") {
          // Clear persisted state after successful launch
          setPersistedCampaignState({
            activeStep: 0,
            campaignData: {
              title: "",
              objective: "",
              description: "",
              start_date: "",
              end_date: "",
              content: null,
              contentUrl: null,
              tasks: [],
            },
            brandBudget: MIN_BUDGET_PER_INFLUENCER,
            numberOfInfluencers: 1,
            eligibilityData: null,
            draftCampaignId: "",
            filterData: {
              numberInfluencers: 5,
              selectedRank: "3",
              gemPoints: 1000,
              brandBudget: MIN_BUDGET_PER_INFLUENCER,
              socialPlatforms: [],
              minFollowers: "50",
              startDate: "",
              endDate: "",
              selectedIndustries: [],
              socialFollowers: {},
              eligibleResults: undefined,
            },
          });
        }

        toast.success(
          mode === "addMembers"
            ? "🎉 Members added successfully! Invites sent to creators"
            : "🎉 Campaign launched successfully! Invites sent to creators",
          {
            id: "create-campaign",
            duration: 5000,
          }
        );
        setActiveStep(3);
      } else {
        toast.error(inviteResponse?.message || "Failed to send invites", {
          id: "create-campaign",
        });
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      const errorMessage = error.message || "Launch failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, { id: "create-campaign" });
    } finally {
      setLoading(false);
    }
  }, [
    draftCampaignId,
    eligibilityData,
    mode,
    setPersistedCampaignState,
  ]);

  const nextStep = useCallback(async () => {
    if (activeStep === 0) {
      // Validate step 0
      if (!campaignData.title.trim()) {
        setError("Campaign title is required");
        toast.error("Campaign title is required");
        return;
      }
      if (!campaignData.objective.trim()) {
        setError("Campaign objective is required");
        toast.error("Campaign objective is required");
        return;
      }
      if (countWords(campaignData.description) < 20) {
        setError("Campaign description needs at least 20 words");
        toast.error("Campaign description needs at least 20 words");
        return;
      }
      if (!campaignData.start_date || !campaignData.end_date) {
        setError("Please select campaign dates");
        toast.error("Please select campaign dates");
        return;
      }
      if (!validateDates()) {
        setError("Please fix the date validation errors");
        toast.error("Please fix the date validation errors");
        return;
      }
      if (mode === "create" && campaignData.tasks.length === 0) {
        setError("Please add at least one task for creators");
        toast.error("Please add at least one task for creators");
        return;
      }

      if (brandBudget < MIN_BUDGET_PER_INFLUENCER) {
        setError(`Minimum budget requirement is $${MIN_BUDGET_PER_INFLUENCER}`);
        toast.error(
          `Minimum budget requirement is $${MIN_BUDGET_PER_INFLUENCER}`
        );
        return;
      }

      if (
        mode === "create" &&
        !campaignData.content &&
        !campaignData.contentUrl
      ) {
        setError("Please upload a campaign image");
        toast.error("Please upload a campaign image");
        return;
      }

      // Enhanced logic for handling campaign creation/updates
      if (mode === "edit") {
        if (hasUnsavedChanges) {
          const success = await updateExistingCampaign();
          if (!success) return;
        }
        setActiveStep(1);
        return;
      } else if (mode === "addMembers") {
        // For add members mode, skip to step 1
        setActiveStep(1);
        return;
      } else {
        // Create mode
        if (campaignCreatedOnce && draftCampaignId) {
          // Campaign already exists, check if we need to update
          if (hasUnsavedChanges) {
            const success = await updateExistingCampaign();
            if (!success) return;
          }
          // Just proceed to next step without creating again
          setActiveStep(1);
          toast.success("Proceeding with existing campaign");
          return;
        } else {
          // First time creating campaign
          const success = await createDraftCampaignAndFilter();
          if (!success) return;
        }
      }
    }

    if (
      activeStep === 1 &&
      (!eligibilityData || safeToNumber(eligibilityData.eligibleCount) === 0)
    ) {
      toast.error(
        "Please analyze criteria first and ensure you have matching creators"
      );
      return;
    }

    setError(null);
    setActiveStep((prev) => prev + 1);
    toast.success("Proceeding to next step");
  }, [
    activeStep,
    eligibilityData,
    campaignData,
    brandBudget,
    mode,
    validateDates,
    updateExistingCampaign,
    createDraftCampaignAndFilter,
    hasUnsavedChanges,
    campaignCreatedOnce,
    draftCampaignId,
  ]);

  const prevStep = useCallback(() => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  }, []);

  const canProceed = useMemo(() => {
    switch (activeStep) {
      case 0:
        const hasBasicInfo =
          campaignData.title.trim() &&
          campaignData.objective.trim() &&
          countWords(campaignData.description) >= 20 &&
          campaignData.start_date &&
          campaignData.end_date &&
          Object.keys(dateErrors).length === 0 &&
          brandBudget >= MIN_BUDGET_PER_INFLUENCER;

        if (mode === "edit") {
          return hasBasicInfo;
        }

        if (mode === "addMembers") {
          return hasBasicInfo;
        }

        return (
          hasBasicInfo &&
          campaignData.tasks.length > 0 &&
          (campaignData.content !== null || campaignData.contentUrl !== null)
        );

      case 1:
        return (
          eligibilityData && safeToNumber(eligibilityData.eligibleCount) > 0
        );
      case 2:
        return (
          eligibilityData &&
          walletBalance >= safeToNumber(eligibilityData.budget)
        );
      default:
        return false;
    }
  }, [
    activeStep,
    eligibilityData,
    campaignData,
    walletBalance,
    dateErrors,
    brandBudget,
    mode,
  ]);

  if (isInitialLoading || loadingWallet) {
    return <LoadingSkeleton />;
  }

  // Function to render task description with HTML
  const renderTaskDescription = (htmlContent) => {
    if (!htmlContent) return "No description provided";
    
    return (
      <div 
        className="rich-text-preview"
        dangerouslySetInnerHTML={{ 
          __html: htmlContent.length > 200 
            ? htmlContent.substring(0, 200) + '...'
            : htmlContent 
        }} 
      />
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="mx-auto">
            <Card className="shadow-lg border-0 pt-10">
              <CardContent className="p-6">
                <div className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiTarget className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-black">
                          Campaign Essentials
                        </h2>
                        <p className="text-xs text-gray-600">
                          Define your campaign's core information and objectives
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Campaign Title
                        </label>
                        <input
                          type="text"
                          value={campaignData.title}
                          onChange={(e) =>
                            setCampaignData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-primary-scale-400 focus:ring-2 focus:ring-primary-scale-100 transition-colors text-xs bg-gray-50 focus:bg-white"
                          placeholder="Create an engaging campaign title"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Campaign Objective
                        </label>
                        <div className="relative">
                          <select
                            value={campaignData.objective}
                            onChange={(e) =>
                              setCampaignData((prev) => ({
                                ...prev,
                                objective: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-primary-scale-400 focus:ring-2 focus:ring-primary-scale-100 transition-colors text-xs bg-gray-50 focus:bg-white appearance-none"
                            disabled={loadingObjectives}
                          >
                            <option value="">Select an objective</option>
                            {objectives.map((obj) => (
                              <option key={obj.id} value={obj.objective}>
                                {obj.objective}
                              </option>
                            ))}
                          </select>
                          {loadingObjectives && (
                            <p className="text-xs text-gray-500 mt-1">
                              Loading objectives...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Campaign Duration */}
                    <div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CustomDatePicker
                            label="Campaign Start Date"
                            value={campaignData.start_date}
                            onChange={(date) => {
                              setCampaignData((prev) => ({
                                ...prev,
                                start_date: date,
                              }));
                            }}
                            minDate={getMinStartDate()}
                            placeholder="Select start date"
                            error={dateErrors.start_date}
                            onPeriodSelect={handlePeriodSelect}
                          />
                        </Card>

                        <Card>
                          <CustomDatePicker
                            label="Campaign End Date"
                            value={campaignData.end_date}
                            onChange={(date) => {
                              setCampaignData((prev) => ({
                                ...prev,
                                end_date: date,
                              }));
                            }}
                            minDate={getMinEndDate()}
                            placeholder="Select end date"
                            error={dateErrors.end_date}
                          />
                        </Card>
                      </div>
                    </div>

                    {/* Budget and Number of Influencers */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <BudgetInput
                        value={brandBudget}
                        onChange={setBrandBudget}
                        label="Campaign Budget (USD)"
                      />

                      <InfluencersInput
                        value={numberOfInfluencers}
                        onChange={setNumberOfInfluencers}
                        currentBudget={brandBudget}
                        label="Number of Influencers"
                      />
                    </div>
                  </div>

                  {/* Campaign Visual Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiImage className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-black">
                          Campaign Visual
                        </h2>
                        <p className="text-xs text-gray-600">
                          {mode === "edit"
                            ? "Update campaign image (optional)"
                            : "Upload an image to represent your campaign"}
                        </p>
                      </div>
                    </div>

                    <ImageUploadComponent
                      onFileChange={handleFileChange}
                      currentFile={campaignData.content}
                      existingImageUrl={
                        campaignData.contentUrl ||
                        editCampaignData?.campaign_image
                      }
                    />
                  </div>

                  {/* Campaign Description Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiFileText className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-black">
                          Campaign Brief
                        </h2>
                        <p className="text-xs text-gray-600">
                          Provide detailed information about your campaign
                          expectations and deliverables
                        </p>
                      </div>
                    </div>

                    <RichTextEditor
                      value={campaignData.description}
                      onChange={(value) =>
                        setCampaignData((prev) => ({
                          ...prev,
                          description: value,
                        }))
                      }
                      placeholder="Describe your campaign vision, requirements, deliverables, and what you expect from creators..."
                      minWords={100}
                      showTemplate={true}
                    />
                  </div>

                  {/* Tasks Section - with rich text preview */}
                  {mode !== "addMembers" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FiSettings className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <h2 className="text-xs font-bold text-black">
                              Creator Tasks
                            </h2>
                            <p className="text-xs text-gray-600">
                              Define specific deliverables for creators
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setEditingTaskIndex(null);
                            setNewTask({
                              task: "",
                              description: "",
                              requires_url: true,
                              site_id: "",
                              task_type: "",
                              repeats_after: "",
                            });
                            setOpenTaskDialog(true);
                          }}
                          className="bg-primary-scale-400 text-black px-4 py-2 rounded-lg text-xs font-medium hover:bg-primary-scale-500 transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <FiPlus className="w-3 h-3" />
                          Add Task
                        </button>
                      </div>

                      <div className="space-y-3">
                        {campaignData.tasks.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                            <FiSettings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <div className="text-xs font-medium mb-2">
                              No tasks added yet
                            </div>
                            <div className="text-xs">
                              Add tasks to guide creators through your
                              requirements
                            </div>
                          </div>
                        ) : (
                          campaignData.tasks.map((task, index) => (
                            <div
                              key={index}
                              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 text-xs mb-2">
                                  {task.task}
                                </div>
                                
                                {/* Rich text preview for task description */}
                                <div className="text-gray-600 text-xs mb-3">
                                  {renderTaskDescription(task.description)}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                      task.requires_url
                                        ? "bg-black text-white"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {task.requires_url ? (
                                      <FiLayers className="w-3 h-3" />
                                    ) : (
                                      <FiInfo className="w-3 h-3" />
                                    )}
                                    {task.requires_url
                                      ? "URL Required"
                                      : "No URL Required"}
                                  </span>
                                  
                                  {task.task_type === "repetitive" && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                      Repeats {task.repeats_after}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => handleEditTask(index)}
                                  className="text-gray-400 hover:text-primary-scale-600 transition-colors"
                                >
                                  <FiEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveTask(index)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 1:
        return (
          <div className="mx-auto">
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-6">
                <FilterCampaigns
                  onFilterChange={handleFilterChange}
                  onCheckEligibility={handleCheckEligibility}
                  loading={loading}
                  eligibilityResults={eligibilityData}
                  onBackToCampaigns={() => prevStep()}
                  campaignId={draftCampaignId}
                  startDate={campaignData.start_date}
                  endDate={campaignData.end_date}
                  allowedSiteIds={getAllowedSiteIds()}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xs flex items-center gap-3">
                    <FiTrendingUp className="w-5 h-5 text-green-500" />
                    Campaign Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        Title
                      </div>
                      <div className="text-xs font-semibold text-gray-900">
                        {campaignData.title}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        Objective
                      </div>
                      <div className="text-xs text-gray-800">
                        {campaignData.objective}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          Start Date
                        </div>
                        <div className="text-xs text-gray-800 font-medium">
                          {formatDisplayDate(campaignData.start_date)}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          End Date
                        </div>
                        <div className="text-xs text-gray-800 font-medium">
                          {formatDisplayDate(campaignData.end_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xs flex items-center gap-3">
                    <FiDollarSign className="w-5 h-5 text-green-500" />
                    Investment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eligibilityData && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">
                              Number of influencers
                            </span>
                            <span className="text-xs font-semibold text-gray-900">
                              {safeToNumber(eligibilityData.eligibleCount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">
                              Total Budget (includes fees)
                            </span>
                            <span className="text-xl font-bold text-green-600">
                              ${safeToFixed(eligibilityData.budget, 0)} USD
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black rounded-lg p-4 border border-black">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-white font-medium">
                            Wallet Balance
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              walletBalance < safeToNumber(eligibilityData.budget)
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          >
                            ${safeToFixed(walletBalance, 2)}
                          </span>
                        </div>

                        {walletBalance < safeToNumber(eligibilityData.budget) && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <FiAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              <span className="font-medium text-red-700 text-xs">
                                Insufficient Funds
                              </span>
                            </div>
                            <p className="text-xs text-red-600 mb-3">
                              Need $
                              {safeToFixed(
                                safeToNumber(eligibilityData.budget) -
                                  walletBalance,
                                2
                              )}{" "}
                              more to launch.
                            </p>
                            <button
                              onClick={handleAddFundsRedirect}
                              className="bg-primary-scale-400 text-black px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-scale-500 transition-colors w-full"
                            >
                              Add Funds
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={prevStep}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
              >
                <FiEdit className="w-4 h-4" />
                Edit filters
              </button>

              <button
                onClick={handleCreateCampaign}
                disabled={
                  loading ||
                  walletBalance < safeToNumber(eligibilityData?.budget, 0)
                }
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === "addMembers" ? "Add Members" : "Continue"}
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-10 bg-green-50 rounded-2xl border border-green-200">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {mode === "edit"
                  ? "Campaign Updated Successfully!"
                  : mode === "addMembers"
                  ? "Members Added Successfully!"
                  : "Campaign Launched Successfully!"}
              </h2>
              <p className="text-xs text-gray-600 mb-6">
                {mode === "edit"
                  ? "Your campaign details have been updated and saved."
                  : mode === "addMembers"
                  ? `${safeToNumber(
                      eligibilityData?.eligibleCount
                    )} new members have been added to your campaign. You'll receive notifications as they start accepting invitations.`
                  : `Your campaign has been sent to ${safeToNumber(
                      eligibilityData?.eligibleCount
                    )} eligible creators. You'll receive notifications as influencers start accepting your invitations.`}
              </p>
              <button
                onClick={() => navigate("/campaigns")}
                className="bg-primary-scale-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-primary-scale-500 transition-colors text-xs"
              >
                View All Campaigns
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen ">
      <StepperComponent steps={steps} activeStep={activeStep} />

      <div className="mx-auto">
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

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 max-w-4xl mx-auto"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-800 text-xs">Error</div>
                <div className="text-red-700 text-xs">{error}</div>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Move InfluencerMismatchBanner here - before the navigation buttons */}
        {activeStep === 1 && eligibilityData && (
          <InfluencerMismatchBanner
            requestedInfluencers={numberOfInfluencers}
            availableInfluencers={safeToNumber(eligibilityData?.totalCount, 0)}
            onProceedWithAvailable={handleProceedWithAvailable}
            onGoBackToEdit={handleGoBackToEdit}
            loading={loading}
          />
        )}

        {activeStep < 2 && (
          <div className="flex justify-between items-center mx-auto max-w-full">
            <button
              onClick={prevStep}
              disabled={activeStep === 0}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
            >
              <FiArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={nextStep}
              disabled={!canProceed || loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-xs"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  {mode === "edit" ? "Updating..." : "Processing..."}
                </>
              ) : (
                <>
                  {(() => {
                    if (
                      mode === "edit" &&
                      activeStep === 0 &&
                      hasUnsavedChanges
                    ) {
                      return "Update Campaign";
                    }
                    if (
                      campaignCreatedOnce &&
                      draftCampaignId &&
                      activeStep === 0 &&
                      hasUnsavedChanges
                    ) {
                      return "Update & Continue";
                    }
                    if (
                      campaignCreatedOnce &&
                      draftCampaignId &&
                      activeStep === 0 &&
                      !hasUnsavedChanges
                    ) {
                      return "Continue";
                    }
                    return "Next Step";
                  })()}
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Task Dialog */}
      <TaskDialog
        isOpen={openTaskDialog}
        onClose={() => {
          setOpenTaskDialog(false);
          setEditingTaskIndex(null);
          setNewTask({
            task: "",
            description: "",
            requires_url: true,
            site_id: "",
            task_type: "",
            repeats_after: "",
          });
        }}
        newTask={newTask}
        setNewTask={setNewTask}
        onAddTask={handleAddTask}
        editingTaskIndex={editingTaskIndex}
        socialSites={socialSites}
      />

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

      {/* PIN Verification Modal */}
      <AnimatePresence>
        {showPinVerification && (
          <PinVerificationModal
            isOpen={showPinVerification}
            onClose={() => setShowPinVerification(false)}
            onSuccess={handlePinVerificationSuccess}
            loading={loading}
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

      {/* Payment Popup Manager */}
      <PaymentPopupManager
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
        paymentUrl={paymentUrl}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      {/* Insufficient Funds Modal */}
      <AnimatePresence>
        {showInsufficientFunds && (
          <InsufficientFundsModal
            isOpen={showInsufficientFunds}
            onClose={() => setShowInsufficientFunds(false)}
            onAddFunds={() => {
              setShowInsufficientFunds(false);
              handleAddFundsRedirect();
            }}
            requiredAmount={brandBudget}
            walletBalance={walletBalance}
          />
        )}
      </AnimatePresence>
      
      {/* Enhanced CSS for rich text preview */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .rich-text-preview h1, .rich-text-preview h2, .rich-text-preview h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 8px 0 4px 0;
          color: #1F2937;
        }
        
        .rich-text-preview p {
          margin: 4px 0;
          line-height: 1.5;
        }
        
        .rich-text-preview li {
          margin: 2px 0 2px 16px;
          list-style: none;
          position: relative;
        }
        
        .rich-text-preview li:before {
          content: "•";
          color: #374151;
          font-weight: bold;
          position: absolute;
          left: -16px;
        }
        
        .rich-text-preview strong {
          font-weight: 600;
        }
        
        .rich-text-preview em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default CreateCampaign;