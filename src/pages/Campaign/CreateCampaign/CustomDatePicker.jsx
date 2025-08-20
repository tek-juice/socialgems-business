// CustomDatePicker.jsx
import React, { useState, useEffect, useRef } from "react";
import { FiArrowLeft, FiArrowRight, FiCalendar } from "react-icons/fi";
import { 
  createLocalDate, 
  formatDateString, 
  formatDisplayDate, 
  isDateDisabled, 
  isToday,
  getMinimumDate 
} from "../utils/dateUtils";

const CustomDatePicker = ({ 
  label, 
  value, 
  onChange, 
  minDate, 
  maxDate, 
  placeholder,
  error,
  onPeriodSelect,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(() => {
    if (value) {
      return createLocalDate(value);
    }
    if (minDate && minDate !== 'disabled') {
      return typeof minDate === 'string' ? createLocalDate(minDate) : new Date(minDate);
    }
    return new Date();
  });
  const datePickerRef = useRef(null);

  // Check if picker should be disabled
  const isDisabled = disabled || minDate === 'disabled';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateClick = (date) => {
    if (isDisabled) return;
    
    const minDateTime = typeof minDate === 'string' ? createLocalDate(minDate) : minDate;
    const maxDateTime = typeof maxDate === 'string' ? createLocalDate(maxDate) : maxDate;
    
    if (isDateDisabled(date, minDateTime, maxDateTime)) return;
    
    const formattedDate = formatDateString(date);
    onChange(formattedDate);
    setIsOpen(false);
  };

  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
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

  useEffect(() => {
    if (value) {
      setDisplayDate(createLocalDate(value));
    }
  }, [value]);

  // FIXED: Period selection functionality with 1-day option
  const handlePeriodSelect = (period) => {
    if (!onPeriodSelect) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() + 4); // Minimum 3 days from today for start
    
    const endDate = new Date(startDate);
    
    switch (period) {
      case '1day':
        endDate.setDate(startDate.getDate() + 1);
        break;
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
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={datePickerRef}>
      <label className="block text-xs font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value ? formatDisplayDate(value) : ''}
          onClick={() => !isDisabled && setIsOpen(true)}
          placeholder={isDisabled ? "Select start date first" : placeholder}
          className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-scale-100 transition-colors text-xs ${
            isDisabled 
              ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400" 
              : "bg-gray-50 focus:bg-white cursor-pointer"
          } ${
            error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary-scale-400'
          }`}
          readOnly
          disabled={isDisabled}
        />
        <FiCalendar className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${
          isDisabled ? "text-gray-300" : "text-gray-400"
        }`} />
      </div>
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-primary-scale-500 rounded-lg shadow-lg z-50 max-w-[300px]">
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

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(displayDate.getFullYear(), displayDate.getMonth()).map((date, index) => {
                if (!date) {
                  return <div key={index} className="p-2"></div>;
                }

                const isSelected = value && formatDateString(date) === value;
                const minDateTime = typeof minDate === 'string' ? createLocalDate(minDate) : minDate;
                const maxDateTime = typeof maxDate === 'string' ? createLocalDate(maxDate) : maxDate;
                const isDateDisabledFlag = isDateDisabled(date, minDateTime, maxDateTime);
                const isTodayDate = isToday(date);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    disabled={isDateDisabledFlag}
                    className={`p-2 text-xs rounded-full transition-colors min-h-[32px] flex items-center justify-center relative ${
                      isSelected
                        ? 'bg-primary-scale-400 text-black font-semibold'
                        : isDateDisabledFlag
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

            {/* FIXED: Period Selection with 1-day option */}
            {onPeriodSelect && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Quick Selection</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePeriodSelect('1day')}
                    className="p-2 text-xs bg-gray-100 hover:bg-primary-scale-400 rounded transition-colors"
                  >
                    1 Day
                  </button>
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
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;