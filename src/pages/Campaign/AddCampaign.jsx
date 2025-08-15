import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
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

// Generate unique request ID
const generateRequestId = () => {
  const timestamp = Date.now().toString(16);
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const combined = (timestamp + randomHex).substring(0, 32);
  return `cp${combined}`;
};

// Utility functions
const countWords = (text) => {
  return text
    ? text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length
    : 0;
};

// Helper function to safely convert to number with fallback
const safeToNumber = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

// Helper function to safely call toFixed with fallback
const safeToFixed = (value, decimals = 2, fallback = 0) => {
  const num = safeToNumber(value, fallback);
  return num.toFixed(decimals);
};

// Constants - Updated calculation logic
const INFLUENCER_BASE_RATE = 15; // $15 per influencer
const PLATFORM_FEE = 50; // $50 platform fee
const MIN_BUDGET_PER_INFLUENCER = 65; // $65 minimum per influencer (includes company fee)

// Calculate minimum budget based on number of influencers
const calculateMinimumBudget = (numberOfInfluencers) => {
  return (numberOfInfluencers * INFLUENCER_BASE_RATE) + PLATFORM_FEE;
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
      return new Date(value + 'T00:00:00');
    }
    if (minDate) {
      return new Date(minDate);
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
      setDisplayDate(new Date(value + 'T00:00:00'));
    }
  }, [value]);

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateDisabled = (date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    if (minDate) {
      const minDateTime = new Date(minDate);
      minDateTime.setHours(0, 0, 0, 0);
      if (checkDate < minDateTime) return true;
    }
    
    if (maxDate) {
      const maxDateTime = new Date(maxDate);
      maxDateTime.setHours(0, 0, 0, 0);
      if (checkDate > maxDateTime) return true;
    }
    
    return false;
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    
    const formattedDate = formatDate(date);
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
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() + 3); // Minimum 3 days from today
    
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
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    });
    onClose();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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

                  const isSelected = selectedDate && formatDate(date) === selectedDate;
                  const isDisabled = isDateDisabled(date);
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

              const isSelected = selectedDate && formatDate(date) === selectedDate;
              const isDisabled = isDateDisabled(date);
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
  
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  // State persistence with image handling - only for create mode
  const [persistedCampaignData, setPersistedCampaignData] = useLocalStorage(
    "campaign-draft",
    {
      title: "",
      objective: "",
      description: "",
      start_date: "",
      end_date: "",
      content: null,
      contentUrl: null,
      tasks: [],
    }
  );

  const [persistedBudget, setPersistedBudget] = useLocalStorage(
    "campaign-budget",
    MIN_BUDGET_PER_INFLUENCER
  );
  const [persistedInfluencers, setPersistedInfluencers] = useLocalStorage(
    "campaign-influencers",
    1
  );

  // Add mode tracking
  const [mode, setMode] = useState(state?.mode || "create");
  const [editCampaignData, setEditCampaignData] = useState(
    state?.editCampaignData || null
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [campaignCreatedOnce, setCampaignCreatedOnce] = useState(false);

  // Update initial step based on state
  const [activeStep, setActiveStep] = useState(() => {
    if (state?.openOnStep !== undefined) {
      return state.openOnStep;
    }
    return 0;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [draftCampaignId, setDraftCampaignId] = useState("");
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [socialSites, setSocialSites] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [loadingObjectives, setLoadingObjectives] = useState(false);
  const [dateErrors, setDateErrors] = useState({});
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);

  const [newTask, setNewTask] = useState({
    task: "",
    description: "",
    requires_url: true,
    site_id: "",
    task_type: "",
    repeats_after: "",
  });

  // Budget and influencers are now both state variables
  const [brandBudget, setBrandBudget] = useState(
    safeToNumber(persistedBudget, MIN_BUDGET_PER_INFLUENCER)
  );
  const [numberOfInfluencers, setNumberOfInfluencers] = useState(
    safeToNumber(persistedInfluencers, 1)
  );

  const [filterData, setFilterData] = useState({
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
  });

  const [campaignData, setCampaignData] = useState(() => {
    // Only use persisted data in create mode
    if (mode === "create") {
      return persistedCampaignData;
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

  // Persist budget and influencers when they change - only in create mode
  useEffect(() => {
    if (mode === "create") {
      setPersistedBudget(brandBudget);
    }
  }, [brandBudget, setPersistedBudget, mode]);

  useEffect(() => {
    if (mode === "create") {
      setPersistedInfluencers(numberOfInfluencers);
    }
  }, [numberOfInfluencers, setPersistedInfluencers, mode]);

  // Persist campaign data when it changes - only in create mode
  useEffect(() => {
    if (mode === "create") {
      try {
        // Don't persist the actual File object, just the URL
        const dataToStore = {
          ...campaignData,
          content: null, // Don't store File object
          contentUrl:
            campaignData.content && campaignData.content instanceof File
              ? URL.createObjectURL(campaignData.content)
              : campaignData.contentUrl,
        };
        setPersistedCampaignData(dataToStore);
      } catch (error) {
        console.error("Error persisting campaign data:", error);
        // Fallback: persist without URL
        const dataToStore = {
          ...campaignData,
          content: null,
          contentUrl: null,
        };
        setPersistedCampaignData(dataToStore);
      }
    }
  }, [campaignData, mode, setPersistedCampaignData]);

  // Cleanup blob URLs when component unmounts or when switching files
  useEffect(() => {
    return () => {
      if (
        campaignData.contentUrl &&
        typeof campaignData.contentUrl === "string" &&
        campaignData.contentUrl.startsWith("blob:")
      ) {
        try {
          URL.revokeObjectURL(campaignData.contentUrl);
        } catch (error) {
          console.error("Error revoking blob URL:", error);
        }
      }
    };
  }, [campaignData.contentUrl]);

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

  // Fetch wallet balance FIRST
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setLoadingWallet(true);
        const walletResponse = await get("wallet/getWallets");
        if (walletResponse?.status === 200 && walletResponse?.data) {
          setWalletBalance(safeToNumber(walletResponse.data.balance));
        } else {
          setWalletBalance(0);
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setWalletBalance(0);
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWalletBalance();
  }, []);

  // Handle pre-filling data when in edit mode
  useEffect(() => {
    if (mode === "edit" && editCampaignData) {
      console.log("Pre-filling edit data:", editCampaignData);

      const formatTasksForForm = (tasks) => {
        if (!tasks || !Array.isArray(tasks)) return [];

        return tasks.map((task) => ({
          task: task.task || "",
          description: task.description || "",
          site_id: task.site_id || 4,
          task_type: task.task_type || "repetitive",
          requires_url: task.requires_url === "1" || task.requires_url === true,
          repeats_after: task.repeats_after || "daily",
        }));
      };

      setCampaignData({
        campaign_id: editCampaignData.campaign_id,
        title: editCampaignData.title || "",
        description: editCampaignData.description || "",
        objective: editCampaignData.objective || "",
        start_date: editCampaignData.start_date || "",
        end_date: editCampaignData.end_date || "",
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
  }, [mode, editCampaignData]);

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
          start_date: state.existingCampaign.start_date,
          end_date: state.existingCampaign.end_date,
          contentUrl: state.existingCampaign.image_urls,
        }));
      }

      toast.success("Ready to add more members to your campaign");
    }
  }, [mode, state]);

  // Date validation functions
  const getMinStartDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 3);
    return today;
  };

  const getMinEndDate = () => {
    if (!campaignData.start_date) return null;
    const startDate = new Date(campaignData.start_date + "T00:00:00");
    startDate.setDate(startDate.getDate() + 3);
    return startDate;
  };

  const validateDates = useCallback(() => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (campaignData.start_date) {
      const startDate = new Date(campaignData.start_date + "T00:00:00");
      const minStartDate = new Date(today);
      minStartDate.setDate(minStartDate.getDate() + 3);

      if (startDate < minStartDate) {
        errors.start_date =
          "Campaign start date must be at least 3 days from today";
      }
    }

    if (campaignData.end_date && campaignData.start_date) {
      const startDate = new Date(campaignData.start_date + "T00:00:00");
      const endDate = new Date(campaignData.end_date + "T00:00:00");

      if (endDate <= startDate) {
        errors.end_date = "End date must be after start date";
      } else {
        const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
        if (daysDiff < 3) {
          errors.end_date = "Campaign must run for at least 3 days";
        }
      }
    }

    setDateErrors(errors);
    return Object.keys(errors).length === 0;
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

  // Handle period selection for date picker
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

  // Handle add funds redirect
  const handleAddFunds = () => {
    window.open("/wallet", "_blank");
    toast.info("Opening wallet to add funds");
  };

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
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
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
          end_date: campaignData.end_date,
          industry_ids: [1, 2, 3],
          min_level_id: 3,
          min_points: 1000,
          social_media_requirements: [{ site_id: 1, min_followers: 50 }],
          start_date: campaignData.start_date,
          iso_codes: ["UG"],
          gender: "",
          category_type: "",
        });

        if (eligibleResponse?.status === 200) {
          const newEligibilityData = {
            budget: brandBudget,
            currency: "USD",
            count: eligibleResponse.count || 0,
            eligibleCount: eligibleResponse.eligibleCount || 0,
            totalBudget: brandBudget,
            requestId: requestId,
            brandBudget: brandBudget,
            campaignId: campaignId,
          };

          setEligibilityData(newEligibilityData);

          setFilterData((prev) => ({
            ...prev,
            brandBudget: brandBudget,
            campaignId: campaignId,
            eligibleResults: {
              budget: brandBudget,
              currency: "USD",
              count: eligibleResponse.count || 0,
              eligibleCount: eligibleResponse.eligibleCount || 0,
              totalBudget: brandBudget,
            },
          }));

          toast.success(
            `Perfect! Found ${
              eligibleResponse.eligibleCount || 0
            } matching creators`,
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
    campaignData.title,
    campaignData.description,
    campaignData.objective,
    campaignData.tasks,
    campaignData.start_date,
    campaignData.end_date,
    campaignData.content,
    brandBudget,
    numberOfInfluencers,
    setOriginalData,
  ]);

  // Update existing campaign
  const updateExistingCampaign = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      toast.loading("Updating campaign...", {
        id: "update-campaign",
      });

      let campaignImageUrl = originalDataRef.current?.contentUrl || null;
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
          console.log("New image uploaded successfully:", campaignImageUrl);
        }
      }

      const formattedTasks = campaignData.tasks.map((task) => ({
        task: task.task || "",
        description: task.description || "",
        site_id: parseInt(task.site_id) || 4,
        task_type: task.task_type || "repetitive",
        requires_url: task.requires_url ? "1" : "",
        repeats_after: task.repeats_after || "daily",
      }));

      const updateCampaignPayload = {
        campaign_id: campaignData.campaign_id || draftCampaignId,
        title: campaignData.title,
        description: campaignData.description,
        objective: campaignData.objective,
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
        budget: brandBudget,
        number_of_influencers: numberOfInfluencers,
        industry_ids: editCampaignData?.industry_ids || [],
        min_level_id: editCampaignData?.min_level_id || 3,
        social_media_requirements:
          editCampaignData?.social_media_requirements || [],
        ...(campaignImageUrl && { campaign_image: campaignImageUrl }),
        tasks: formattedTasks,
      };

      console.log("Update campaign payload:", updateCampaignPayload);

      const updateResponse = await patch(
        "campaigns/edit",
        updateCampaignPayload
      );

      console.log("Update campaign response:", updateResponse);

      if (updateResponse?.status === 200) {
        // Update original data after successful update
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

        toast.success("Campaign updated successfully!", {
          id: "update-campaign",
        });
        return true;
      } else {
        throw new Error(updateResponse?.message || "Failed to update campaign");
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
    editCampaignData,
    draftCampaignId,
    setOriginalData,
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

      const eligibleResponse = await post(
        "campaigns/filterInfluencers",
        requestBody
      );

      if (eligibleResponse?.status === 200) {
        const newEligibilityData = {
          budget: safeToNumber(requestBody.brandBudget || brandBudget),
          currency: "USD",
          count: eligibleResponse.count || 0,
          eligibleCount: eligibleResponse.eligibleCount || 0,
          totalBudget: safeToNumber(requestBody.brandBudget || brandBudget),
          requestId: requestBody.requestId,
          brandBudget: safeToNumber(requestBody.brandBudget || brandBudget),
          campaignId: requestBody.campaign_id,
        };

        setEligibilityData(newEligibilityData);

        setFilterData((prev) => ({
          ...prev,
          brandBudget: safeToNumber(requestBody.brandBudget || brandBudget),
          campaignId: requestBody.campaign_id,
          eligibleResults: {
            budget: safeToNumber(requestBody.brandBudget || brandBudget),
            currency: "USD",
            count: eligibleResponse.count || 0,
            eligibleCount: eligibleResponse.eligibleCount || 0,
            totalBudget: safeToNumber(requestBody.brandBudget || brandBudget),
          },
        }));

        toast.success(
          `Perfect! Found ${
            eligibleResponse.eligibleCount || 0
          } matching creators`,
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

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file && file instanceof File) {
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          toast.error("Please upload a valid image (JPEG, PNG, or WebP)");
          return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          toast.error("Image must be smaller than 5MB");
          return;
        }

        // Clean up previous URL if it exists
        if (
          campaignData.contentUrl &&
          typeof campaignData.contentUrl === "string" &&
          campaignData.contentUrl.startsWith("blob:")
        ) {
          try {
            URL.revokeObjectURL(campaignData.contentUrl);
          } catch (error) {
            console.error("Error revoking previous blob URL:", error);
          }
        }

        setCampaignData((prev) => ({
          ...prev,
          content: file,
          contentUrl: null,
        }));
        toast.success("Campaign visual uploaded successfully");
      }
    },
    [campaignData.contentUrl]
  );

  // Handle add task
  const handleAddTask = useCallback(() => {
    if (!newTask.task.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!newTask.description.trim()) {
      toast.error("Task description is required");
      return;
    }

    if (!newTask.site_id) {
      toast.error("Please select a target platform");
      return;
    }

    if (!newTask.task_type) {
      toast.error("Please select a task type");
      return;
    }

    if (newTask.task_type === "repetitive" && !newTask.repeats_after) {
      toast.error("Please select repeat frequency for repetitive tasks");
      return;
    }

    const formattedTask = {
      task: newTask.task.trim(),
      description: newTask.description.trim(),
      site_id: parseInt(newTask.site_id),
      task_type: newTask.task_type,
      requires_url: Boolean(newTask.requires_url),
      repeats_after:
        newTask.task_type === "repetitive" ? newTask.repeats_after : "",
    };

    if (editingTaskIndex !== null) {
      setCampaignData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task, index) =>
          index === editingTaskIndex ? formattedTask : task
        ),
      }));
      toast.success("Task updated successfully");
      setEditingTaskIndex(null);
    } else {
      setCampaignData((prev) => ({
        ...prev,
        tasks: [...prev.tasks, formattedTask],
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

      const totalCost = safeToNumber(eligibilityData?.budget);
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

      toast.loading(
        mode === "addMembers" ? "Adding members..." : "Launching campaign...",
        { id: "create-campaign" }
      );

      const invitePayload = {
        requestId: eligibilityData.requestId,
        campaign_id: draftCampaignId,
      };

      const inviteResponse = await post("campaigns/inviteUsers", invitePayload);

      if (inviteResponse?.status === 200) {
        if (mode === "create") {
          setPersistedCampaignData({
            title: "",
            objective: "",
            description: "",
            start_date: "",
            end_date: "",
            content: null,
            contentUrl: null,
            tasks: [],
          });
          setPersistedBudget(MIN_BUDGET_PER_INFLUENCER);
          setPersistedInfluencers(1);
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
    walletBalance,
    setPersistedCampaignData,
    setPersistedBudget,
    setPersistedInfluencers,
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

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="mx-auto">
            <Card className="shadow-lg border-0 pt-10">
              <CardContent className="p-6">
                <div className="space-y-8">
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
                          <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
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
                    />
                  </div>

                  {/* Tasks Section */}
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
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 text-xs mb-1">
                                  {task.task}
                                </div>
                                <div className="text-gray-600 text-xs mb-2">
                                  {task.description.substring(0, 100)}...
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
                          {campaignData.start_date}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          End Date
                        </div>
                        <div className="text-xs text-gray-800 font-medium">
                          {campaignData.end_date}
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
                              onClick={handleAddFunds}
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
                  walletBalance < safeToNumber(eligibilityData?.totalBudget)
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

      {/* Insufficient Funds Modal */}
      <AnimatePresence>
        {showInsufficientFunds && (
          <InsufficientFundsModal
            isOpen={showInsufficientFunds}
            onClose={() => setShowInsufficientFunds(false)}
            onAddFunds={() => {
              setShowInsufficientFunds(false);
              handleAddFunds();
            }}
            requiredAmount={brandBudget}
            walletBalance={walletBalance}
          />
        )}
      </AnimatePresence>
      
      {/* Add CSS for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CreateCampaign;