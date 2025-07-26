"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiArrowRight, FiX, FiClock } from 'react-icons/fi';
import { Calendar } from './calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { cn } from "../../../../lib/utils";

const DateRangePicker = ({ 
  value, 
  onChange, 
  className = "", 
  placeholder = "Select campaign dates",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState(value);

  useEffect(() => {
    setDateRange(value);
  }, [value]);

  const handleSelect = (range) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onChange?.(range);
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setDateRange(undefined);
    onChange?.({});
  };

  const formatDateRange = (range) => {
    if (!range?.from) return placeholder;
    if (!range.to) {
      return `${range.from.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })} - ...`;
    }
    return `${range.from.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${range.to.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;
  };

  const getDaysDifference = (range) => {
    if (!range?.from || !range?.to) return 0;
    const timeDiff = range.to.getTime() - range.from.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const getQuickSelectDate = (days) => {
    const from = new Date();
    const to = new Date();
    to.setDate(from.getDate() + days - 1);
    return { from, to };
  };

  const quickSelectOptions = [
    { label: "1 Week", days: 7, icon: FiClock },
    { label: "2 Weeks", days: 14, icon: FiClock },
    { label: "1 Month", days: 30, icon: FiClock },
    { label: "2 Months", days: 60, icon: FiClock },
  ];

  return (
    <div className={cn("relative", className)}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 bg-white cursor-pointer",
          disabled 
            ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50" 
            : isOpen 
              ? "border-primary ring-2 ring-primary/20 shadow-sm" 
              : "border-gray-300 hover:border-primary/50",
          dateRange?.from && dateRange?.to ? "text-secondary" : "text-gray-500"
        )}
      >
        <div className="flex items-center gap-3">
          <FiCalendar className={cn(
            "w-4 h-4",
            disabled ? "text-gray-400" : "text-secondary/70"
          )} />
          <span className="font-medium">
            {formatDateRange(dateRange)}
          </span>
          {dateRange?.from && dateRange?.to && (
            <span className="text-xs bg-primary/20 text-secondary px-2 py-1 rounded-full font-medium">
              {getDaysDifference(dateRange)} days
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {dateRange?.from && !disabled && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <FiX className="w-3 h-3 text-gray-400" />
            </button>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiArrowRight className={cn(
              "w-4 h-4 rotate-90 transition-colors",
              disabled ? "text-gray-400" : "text-gray-500"
            )} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && !disabled && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 z-50 mt-2 shadow-2xl"
            >
              <Card className="border-0 shadow-2xl bg-white min-w-[600px]">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <CardTitle className="text-lg font-bold text-secondary flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-primary" />
                    Select Campaign Duration
                  </CardTitle>
                  <CardDescription className="text-sm text-secondary/70">
                    Choose start and end dates for your campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleSelect}
                    numberOfMonths={2}
                    className="p-0 border-0 shadow-none"
                    disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
                  />
                  
                  {/* Quick Select Options */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="text-sm font-semibold text-secondary mb-3 flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-primary" />
                      Quick Select:
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {quickSelectOptions.map((option) => (
                        <Button
                          key={option.days}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelect(getQuickSelectDate(option.days))}
                          className="text-sm h-10 px-4 justify-start gap-2 hover:bg-primary/10 hover:border-primary"
                        >
                          <option.icon className="w-3 h-3" />
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-sm"
                    >
                      Cancel
                    </Button>
                    <div className="text-sm text-secondary/60 font-medium">
                      {dateRange?.from && dateRange?.to 
                        ? `${getDaysDifference(dateRange)} days selected`
                        : "Select start and end dates"
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateRangePicker;