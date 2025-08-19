// utils/dateUtils.js

/**
 * Timezone-aware date utilities for handling server UTC dates and local display
 */

/**
 * Get user's timezone offset in minutes
 */
export const getTimezoneOffset = () => {
    return new Date().getTimezoneOffset();
  };
  
  /**
   * Get user's timezone (e.g., "America/New_York")
   */
  export const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };
  
  /**
   * Convert a local date to UTC date string (for server communication)
   * @param {string} localDateString - Date in YYYY-MM-DD format
   * @returns {string} UTC date string in YYYY-MM-DD format
   */
  export const localDateToUTC = (localDateString) => {
    if (!localDateString) return '';
    
    // Create date in local timezone at start of day
    const localDate = new Date(localDateString + 'T00:00:00');
    
    // Convert to UTC and format as YYYY-MM-DD
    const utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
    return utcDate.toISOString().split('T')[0];
  };
  
  /**
   * Convert UTC date string to local date string (for display)
   * @param {string} utcDateString - UTC date in YYYY-MM-DD format
   * @returns {string} Local date string in YYYY-MM-DD format
   */
  export const utcDateToLocal = (utcDateString) => {
    if (!utcDateString) return '';
    
    // Create UTC date
    const utcDate = new Date(utcDateString + 'T00:00:00Z');
    
    // Convert to local date
    const localDate = new Date(utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000));
    
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Create a date in local timezone at start of day
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @returns {Date} Date object in local timezone
   */
  export const createLocalDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString + 'T00:00:00');
  };
  
  /**
   * Create a date in UTC timezone at start of day
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @returns {Date} Date object in UTC timezone
   */
  export const createUTCDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString + 'T00:00:00Z');
  };
  
  /**
   * Format date for display in user's locale
   * @param {string|Date} date - Date string or Date object
   * @param {string} locale - Locale (default: 'en-US')
   * @returns {string} Formatted date string
   */
  export const formatDisplayDate = (date, locale = 'en-US') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? createLocalDate(date) : date;
    if (!dateObj) return '';
    
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  /**
   * Get minimum date (X days from today in local timezone)
   * @param {number} daysFromToday - Number of days to add to today
   * @returns {Date} Date object
   */
  export const getMinimumDate = (daysFromToday = 4) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + daysFromToday);
    return today;
  };
  
  /**
   * Check if a date is disabled based on min/max constraints
   * @param {Date} date - Date to check
   * @param {Date|string} minDate - Minimum allowed date
   * @param {Date|string} maxDate - Maximum allowed date
   * @returns {boolean} True if date is disabled
   */
  export const isDateDisabled = (date, minDate, maxDate) => {
    if (!date) return true;
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    if (minDate) {
      const minDateTime = typeof minDate === 'string' 
        ? createLocalDate(minDate) 
        : new Date(minDate);
      minDateTime.setHours(0, 0, 0, 0);
      if (checkDate < minDateTime) return true;
    }
    
    if (maxDate) {
      const maxDateTime = typeof maxDate === 'string' 
        ? createLocalDate(maxDate) 
        : new Date(maxDate);
      maxDateTime.setHours(0, 0, 0, 0);
      if (checkDate > maxDateTime) return true;
    }
    
    return false;
  };
  
  /**
   * Check if date is today in local timezone
   * @param {Date} date - Date to check
   * @returns {boolean} True if date is today
   */
  export const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  /**
   * Format date as YYYY-MM-DD string
   * @param {Date} date - Date object
   * @returns {string} Date string in YYYY-MM-DD format
   */
  export const formatDateString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Validate date range (start must be before end, minimum duration)
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @param {number} minDays - Minimum duration in days
   * @returns {object} Validation result with errors
   */
  export const validateDateRange = (startDate, endDate, minDays = 4) => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    if (startDate) {
      const start = createLocalDate(startDate);
      const minStartDate = getMinimumDate(4);
  
      if (start < minStartDate) {
        errors.startDate = 'Campaign start date must be at least 3 days from today';
      }
    }
  
    if (endDate && startDate) {
      const start = createLocalDate(startDate);
      const end = createLocalDate(endDate);
  
      if (end <= start) {
        errors.endDate = 'End date must be after start date';
      } else {
        const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
        if (daysDiff < minDays) {
          errors.endDate = `Campaign must run for at least ${minDays} days`;
        }
      }
    }
  
    return { isValid: Object.keys(errors).length === 0, errors };
  };