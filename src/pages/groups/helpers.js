import { format, isToday, isYesterday, differenceInMinutes, isSameDay, parseISO } from 'date-fns';

export const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  const date = parseISO(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'dd/MM/yyyy');
  }
};

export const formatTimeOnly = (timestamp) => {
  if (!timestamp) return '';
  const date = parseISO(timestamp);
  return format(date, 'HH:mm');
};

export const formatDateSeparator = (timestamp) => {
  if (!timestamp) return '';
  const date = parseISO(timestamp);
  
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'EEEE, MMMM d, yyyy');
  }
};

export const needsDateSeparator = (currentMessage, previousMessage) => {
  if (!previousMessage) return true;
  
  const currentDate = parseISO(currentMessage.timestamp);
  const previousDate = parseISO(previousMessage.timestamp);
  
  return !isSameDay(currentDate, previousDate);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
};

export const shouldGroupMessages = (currentMessage, previousMessage) => {
  if (!previousMessage) return false;
  
  if (currentMessage.senderId !== previousMessage.senderId) return false;
  
  const currentTime = parseISO(currentMessage.timestamp);
  const previousTime = parseISO(previousMessage.timestamp);
  
  return differenceInMinutes(currentTime, previousTime) <= 5;
};

export const extractUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};