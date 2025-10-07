export const createLocalDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString + 'T00:00:00');
};

export const createUTCDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString + 'T00:00:00Z');
};

export const formatDateString = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const localDateToUTC = (localDateString) => {
  if (!localDateString) return '';
  const localDate = new Date(localDateString + 'T00:00:00');
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const utcDateToLocal = (utcDateString) => {
  if (!utcDateString) return '';

  if (utcDateString.includes('T')) {
    return utcDateString.split('T')[0];
  }

  return utcDateString;
};

export const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  const date = createLocalDate(dateString);
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getMinimumDate = (daysFromToday = 4) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + daysFromToday);
  return minDate;
};

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

export const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const validateDateRange = (startDate, endDate, minDays = 2) => {
  const errors = {};

  if (startDate) {
    const start = createLocalDate(startDate);
    const minStartDate = getMinimumDate(4);

    if (start < minStartDate) {
      errors.start_date = 'Campaign start date must be at least 3 days from today';
    }
  }

  if (endDate && startDate) {
    const start = createLocalDate(startDate);
    const end = createLocalDate(endDate);

    if (end <= start) {
      errors.end_date = 'End date must be after start date';
    } else {
      const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
      if (daysDiff < 2) {
        errors.end_date = `Campaign must run for at least 1 day`;
      }
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const generateRequestId = () => {
  const timestamp = Date.now().toString(16);
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const combined = (timestamp + randomHex).substring(0, 32);
  return `cp${combined}`;
};

export const countWords = (text) => {
  return text
    ? text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
    : 0;
};

export const safeToNumber = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

export const safeToFixed = (value, decimals = 2, fallback = 0) => {
  const num = safeToNumber(value, fallback);
  return num.toFixed(decimals);
};

// export const INFLUENCER_BASE_RATE = 15;
// export const PLATFORM_FEE = 50;
// export const MIN_BUDGET_PER_INFLUENCER = 65;

// export const calculateMinimumBudget = (numberOfInfluencers) => {
//   return (numberOfInfluencers * INFLUENCER_BASE_RATE) + PLATFORM_FEE;
// };

// This is based on the nendpoint for settings (Not to be chnaged but had to comment the other just to keep it intact )
export const calculateMinimumBudget = (numberOfInfluencers, settings) => {
  if (!settings) return numberOfInfluencers * 20;
  
  const baseRate = settings.min_amount || 20;
  const creationFee = settings.creation_fee || 5;
  const feeType = settings.creation_fee_type || 'percentage';
  
  const subtotal = numberOfInfluencers * baseRate;
  const fee = feeType === 'percentage' 
    ? (subtotal * creationFee) / 100 
    : creationFee;
  
  return subtotal + fee;
};

// Minimum influnecer fee and the rest must also not be chnaged for now 
export const getMinBudgetPerInfluencer = (settings) => {
  return settings?.min_amount || 20;
};

export const calculatePlatformFee = (subtotal, settings) => {
  if (!settings) return 0;
  
  const creationFee = settings.creation_fee || 5;
  const feeType = settings.creation_fee_type || 'percentage';
  
  return feeType === 'percentage' 
    ? (subtotal * creationFee) / 100 
    : creationFee;
};