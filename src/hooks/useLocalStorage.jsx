import { useState, useEffect, useRef } from 'react';

const useLocalStorage = (key, defaultValue) => {
  // Use sessionStorage instead of localStorage for temporary persistence
  const [value, setValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const isUnmounting = useRef(false);

  useEffect(() => {
    // Only save to sessionStorage if component is not unmounting
    if (!isUnmounting.current) {
      try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    }
  }, [key, value]);

  // Cleanup when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      isUnmounting.current = true;
      try {
        // Clear the sessionStorage when user navigates away from the page
        window.sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing sessionStorage key "${key}":`, error);
      }
    };
  }, [key]);

  return [value, setValue];
};

export default useLocalStorage;