"use client";
// Hook para persistir estado en localStorage y reaccionar a cambios entre pestañas.

import { useState, useEffect, useCallback } from 'react';

// Sincroniza el estado local con localStorage y con cambios realizados desde otras pestañas.
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if(hasMounted) {
      try {
        const item = window.localStorage.getItem(key);
        setStoredValue(item ? JSON.parse(item) : initialValue);
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        setStoredValue(initialValue);
      }
    }
  }, [hasMounted, key]);


  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
        console.warn(`Tried setting localStorage key “${key}” even though environment is not a client`);
    }

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new StorageEvent('storage', { key }));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          const item = window.localStorage.getItem(key);
          setStoredValue(item ? JSON.parse(item) : initialValue);
        } catch (error) {
          console.error(`Error parsing stored value for key "${key}":`, error);
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);


  return [storedValue, setValue];
}

export default useLocalStorage;
