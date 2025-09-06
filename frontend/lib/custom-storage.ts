import { StateStorage } from 'zustand/middleware';

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
        // Validate JSON before storing
        JSON.parse(value);
        localStorage.setItem(name, value);
      } catch (error) {
        console.warn('localStorage.setItem failed or invalid JSON:', error);
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
