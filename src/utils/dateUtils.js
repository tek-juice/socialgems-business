export const getTimezoneOffset = () => {
    return new Date().getTimezoneOffset();
  };
  
  export const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };
  
  /**
   * @param {string} localDateString
   * @returns {string} 
   */
  export const localDateToUTC = (localDateString) => {
    if (!localDateString) return '';
    
    const localDate = new Date(localDateString + 'T00:00:00');
    
    const utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
    return utcDate.toISOString().split('T')[0];
  };
  
  /**
   * @param {string} utcDateString
   * @returns {string}
   */
  export const utcDateToLocal = (utcDateString) => {
    if (!utcDateString) return '';
    
    const utcDate = new Date(utcDateString + 'T00:00:00Z');
    

    const localDate = new Date(utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000));
    
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  /**
   * @param {string} dateString
   * @returns {Date}
   */
  export const createLocalDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString + 'T00:00:00');
  };
  
  /**
   * @param {string} dateString
   * @returns {Date} 
   */
  export const createUTCDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString + 'T00:00:00Z');
  };
  
  /**
   * @param {string|Date} date 
   * @param {string} locale 
   * @returns {string} 
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
   * @param {number} daysFromToday
   * @returns {Date}
   */
  export const getMinimumDate = (daysFromToday = 4) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + daysFromToday);
    return today;
  };
  
  /**
   * @param {Date} date
   * @param {Date|string} minDate
   * @param {Date|string} maxDate
   * @returns {boolean}
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
   * @param {Date} date
   * @returns {boolean}
   */
  export const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  /**
   * @param {Date} date
   * @returns {string}
   */
  export const formatDateString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  /**
   * @param {string} startDate
   * @param {string} endDate
   * @param {number} minDays
   * @returns {object} 
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