import { StateStorage } from 'zustand/middleware';

// SSR-safe storage for Zustand persist middleware
export const customStorage: StateStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(name, value);
      } catch (error) {
        console.warn('localStorage.setItem failed:', error);
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
