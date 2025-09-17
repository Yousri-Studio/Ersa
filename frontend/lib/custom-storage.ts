import { StateStorage } from 'zustand/middleware';

// Utility function to clear corrupted storage
export const clearCorruptedStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      // Clear specific auth-related items that might be corrupted
      const keysToCheck = ['auth-storage', 'cart-store', 'auth-token'];
      keysToCheck.forEach(key => {
        const item = localStorage.getItem(key);
        if (item && (item === '[object Object]' || item.includes('[object Object]'))) {
          console.warn(`Clearing corrupted localStorage item: ${key}`);
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error clearing corrupted storage:', error);
    }
  }
};

// Utility function to completely clear all storage (for debugging)
export const clearAllStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      console.log('All storage cleared');
      window.location.reload();
    } catch (error) {
      console.warn('Error clearing all storage:', error);
    }
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAllStorage = clearAllStorage;
  (window as any).clearCorruptedStorage = clearCorruptedStorage;
}

// SSR-safe storage for Zustand persist middleware
export const customStorage: StateStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const item = localStorage.getItem(name);
      if (item) {
        // Validate that it's proper JSON before returning
        JSON.parse(item);
      }
      return item;
    } catch (error) {
      console.warn('localStorage.getItem failed or invalid JSON:', error);
      // Clear corrupted data
      try {
        localStorage.removeItem(name);
      } catch (removeError) {
        console.warn('Failed to remove corrupted localStorage item:', removeError);
      }
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (typeof window !== 'undefined') {
      try {
        // Check if value is already a string and valid JSON
        if (typeof value === 'string') {
          // Try to parse to validate it's proper JSON
          JSON.parse(value);
          localStorage.setItem(name, value);
        } else {
          // If it's not a string, stringify it first
          const jsonValue = JSON.stringify(value);
          localStorage.setItem(name, jsonValue);
        }
      } catch (error) {
        console.warn('localStorage.setItem failed or invalid JSON:', error);
        console.warn('Attempted to store value:', value);
        console.warn('Value type:', typeof value);
      }
    }
  },
  removeItem: (name: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.warn('localStorage.removeItem failed:', error);
      }
    }
  },
} as StateStorage;
