"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../../../lib/utils";

const SelectContext = React.createContext();

const Select = ({ children, value, onValueChange, defaultValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || "");
  const [selectedLabel, setSelectedLabel] = useState("");
  const selectRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleValueChange = (newValue, label) => {
    setSelectedValue(newValue);
    setSelectedLabel(label);
    setIsOpen(false);
    onValueChange?.(newValue);
  };

  return (
    <SelectContext.Provider value={{
      isOpen,
      setIsOpen,
      selectedValue,
      selectedLabel,
      handleValueChange,
      selectRef
    }}>
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, placeholder, ...props }, ref) => {
  const { isOpen, setIsOpen, selectedLabel } = React.useContext(SelectContext);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-secondary placeholder:text-secondary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        isOpen && "border-primary ring-2 ring-primary/20",
        className
      )}
      {...props}
    >
      <span className={cn("truncate", !selectedLabel && "text-secondary/50")}>
        {selectedLabel || placeholder || "Select option..."}
      </span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="h-4 w-4 opacity-50" />
      </motion.div>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }) => {
  const { selectedLabel } = React.useContext(SelectContext);
  return (
    <span className={cn("truncate", !selectedLabel && "text-secondary/50")}>
      {selectedLabel || placeholder || "Select option..."}
    </span>
  );
};

const SelectContent = ({ className, children, ...props }) => {
  const { isOpen } = React.useContext(SelectContext);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
            className
          )}
          {...props}
        >
          <div className="max-h-96 overflow-y-auto p-1">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { selectedValue, handleValueChange } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      ref={ref}
      onClick={() => handleValueChange(value, children)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-primary/10 hover:text-secondary focus:bg-primary/20 focus:text-secondary",
        isSelected && "bg-primary/20 text-secondary font-medium",
        className
      )}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4 text-primary" />
        </span>
      )}
      <span className="truncate">{children}</span>
    </div>
  );
});
SelectItem.displayName = "SelectItem";

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-secondary", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

const SelectGroup = ({ children }) => {
  return <div>{children}</div>;
};

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};