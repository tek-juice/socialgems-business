import React, { useState, useEffect } from "react";

const NumberInput = ({ 
  value, 
  onChange, 
  min, 
  placeholder, 
  label, 
  helperText, 
  className = "",
  onInfluencerChange // Special prop for influencer input to trigger budget calculation
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

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Allow empty string, numbers, and backspace
    if (inputValue === '' || /^\d+$/.test(inputValue)) {
      setDisplayValue(inputValue);
      setError("");
      
      if (inputValue === '') {
        // Don't call onChange for empty string, wait for blur
        return;
      }
      
      const numValue = parseInt(inputValue);
      if (numValue >= min) {
        onChange(numValue);
        if (onInfluencerChange) {
          onInfluencerChange(numValue);
        }
      }
    }
  };

  const handleBlur = () => {
    if (displayValue === '' || parseInt(displayValue) < min) {
      setError(`Minimum value is ${min}`);
      triggerShake();
      setDisplayValue(min.toString());
      onChange(min);
      if (onInfluencerChange) {
        onInfluencerChange(min);
      }
      
      // Clear error after 3 seconds
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleKeyDown = (e) => {
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
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
        onKeyDown={handleKeyDown}
        className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-scale-100 transition-all text-xs bg-gray-50 focus:bg-white ${
          error 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:border-primary-scale-400'
        } ${isShaking ? 'animate-shake' : ''} ${className}`}
        placeholder={placeholder}
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

export default NumberInput;