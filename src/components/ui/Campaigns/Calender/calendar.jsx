"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { cn } from "../../../../lib/utils";

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Calendar = React.forwardRef(({ 
  className, 
  mode = "single", 
  selected, 
  onSelect, 
  disabled,
  numberOfMonths = 1,
  showOutsideDays = true,
  ...props 
}, ref) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const today = new Date();

  const isDateDisabled = (date) => {
    if (typeof disabled === 'function') {
      return disabled(date);
    }
    return false;
  };

  const isDateSelected = (date) => {
    if (mode === "single") {
      return selected && isSameDay(date, selected);
    }
    if (mode === "range") {
      if (!selected?.from) return false;
      if (!selected?.to) return isSameDay(date, selected.from);
      return isDateInRange(date, selected.from, selected.to);
    }
    return false;
  };

  const isDateInRange = (date, start, end) => {
    return date >= start && date <= end;
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date) => {
    return isSameDay(date, today);
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    if (mode === "single") {
      onSelect?.(date);
    } else if (mode === "range") {
      if (!selected?.from || (selected?.from && selected?.to)) {
        onSelect?.({ from: date, to: null });
      } else if (selected?.from && !selected?.to) {
        if (date < selected.from) {
          onSelect?.({ from: date, to: selected.from });
        } else {
          onSelect?.({ from: selected.from, to: date });
        }
      }
    }
  };

  const getDateClassName = (date) => {
    const baseClasses = "relative flex size-9 items-center justify-center whitespace-nowrap rounded-lg p-0 text-secondary outline-offset-2 transition-all duration-200 cursor-pointer select-none";
    
    let classes = [baseClasses];
    
    if (isDateDisabled(date)) {
      classes.push("pointer-events-none text-secondary/30 line-through cursor-not-allowed");
    } else {
      classes.push("hover:bg-primary/30 hover:text-secondary");
    }

    if (isDateSelected(date)) {
      if (mode === "range" && selected?.from && selected?.to) {
        if (isSameDay(date, selected.from)) {
          classes.push("bg-primary text-secondary font-semibold rounded-r-none");
        } else if (isSameDay(date, selected.to)) {
          classes.push("bg-primary text-secondary font-semibold rounded-l-none");
        } else {
          classes.push("bg-primary/50 text-secondary rounded-none");
        }
      } else {
        classes.push("bg-primary text-secondary font-semibold shadow-sm");
      }
    }

    if (isToday(date)) {
      classes.push("after:pointer-events-none after:absolute after:bottom-1 after:start-1/2 after:z-10 after:size-[3px] after:-translate-x-1/2 after:rounded-full after:bg-[#E8C547] after:transition-colors");
      if (isDateSelected(date)) {
        classes.push("[&]:after:bg-secondary");
      }
    }

    return cn(classes);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    if (showOutsideDays) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const date = new Date(year, month - 1, day);
        days.push({
          date,
          isCurrentMonth: false,
          day
        });
      }
    } else {
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        day
      });
    }

    if (showOutsideDays) {
      const remainingCells = 42 - days.length;
      for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day);
        days.push({
          date,
          isCurrentMonth: false,
          day
        });
      }
    }

    return days;
  };

  const renderMonth = (monthOffset = 0) => {
    const displayDate = new Date(currentDate);
    displayDate.setMonth(displayDate.getMonth() + monthOffset);
    const days = getDaysInMonth(displayDate);

    return (
      <div key={monthOffset} className="w-full min-w-[280px]">
        <div className="relative mx-10 mb-4 flex h-10 items-center justify-center">
          {monthOffset === 0 && (
            <>
              <button
                onClick={() => navigateMonth(-1)}
                className="absolute left-[-40px] size-8 bg-transparent p-0 text-secondary hover:bg-primary/20 hover:text-secondary rounded-lg transition-colors flex items-center justify-center"
                type="button"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="absolute right-[-40px] size-8 bg-transparent p-0 text-secondary hover:bg-primary/20 hover:text-secondary rounded-lg transition-colors flex items-center justify-center"
                type="button"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
          <div className="text-sm font-semibold text-secondary">
            {MONTHS[displayDate.getMonth()]} {displayDate.getFullYear()}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="size-9 p-0 text-xs font-medium text-secondary/70 flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((dayInfo, index) => {
            if (!dayInfo) {
              return <div key={index} className="size-9" />;
            }

            const { date, isCurrentMonth, day } = dayInfo;
            
            return (
              <div
                key={index}
                className={cn(
                  "size-9 bg-white flex items-center justify-center",
                  !isCurrentMonth && "text-secondary/40"
                )}
              >
                <button
                  onClick={() => handleDateClick(date)}
                  className={getDateClassName(date)}
                  type="button"
                  disabled={isDateDisabled(date)}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={cn(
        "w-fit bg-white rounded-xl border border-gray-200 p-4 shadow-sm",
        numberOfMonths > 1 && "flex gap-4",
        className
      )}
      {...props}
    >
      {Array.from({ length: numberOfMonths }, (_, i) => renderMonth(i))}
    </div>
  );
});

Calendar.displayName = "Calendar";

export { Calendar };