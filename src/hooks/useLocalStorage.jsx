import { useState, useEffect, useRef } from 'react';

const useLocalStorage = (key, defaultValue) => {
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
    if (!isUnmounting.current) {
      try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    }
  }, [key, value]);

  useEffect(() => {
    return () => {
      isUnmounting.current = true;
      try {
        window.sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing sessionStorage key "${key}":`, error);
      }
    };
  }, [key]);

  return [value, setValue];
};

export default useLocalStorage;