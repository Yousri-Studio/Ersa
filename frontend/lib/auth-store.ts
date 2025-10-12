import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { customStorage, clearCorruptedStorage } from './custom-storage';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  locale: string;
  createdAt: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  role?: 'user' | 'admin' | 'operation' | 'super_admin';
  lastLoginAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  initFromCookie: () => void;
  validateToken: () => Promise<void>;
  canPurchaseCourses: () => boolean;
  getUserRole: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        console.log('🔐 LOGIN: Setting auth token and user');
        
        // Set cookie
        Cookies.set('auth-token', token, { 
          expires: 7, 
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/'
        });
        
        // Set state - this should trigger Zustand persist
        set({ user, token, isAuthenticated: true });
        
        // Force persist to localStorage immediately
        if (typeof window !== 'undefined') {
          const stateToSave = {
            state: { user, token, isAuthenticated: true },
            version: 0
          };
          localStorage.setItem('auth-storage', JSON.stringify(stateToSave));
          console.log('🔐 Forced localStorage save');
        }
      },

      logout: () => {
        Cookies.remove('auth-token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      initFromCookie: async () => {
        console.log('🔄 INIT FROM COOKIE: Starting...');
        const token = Cookies.get('auth-token');
        const currentState = get();
        
        console.log('🔄 Current state:', {
          isAuthenticated: currentState.isAuthenticated,
          hasUser: !!currentState.user,
          hasToken: !!currentState.token,
          cookieExists: !!token
        });
        
        // If already authenticated with user data, no need to validate again
        if (currentState.isAuthenticated && currentState.user && token) {
          console.log('✅ Already authenticated from storage, skipping validation');
          console.log('✅ User:', currentState.user.email);
          return;
        }
        
        // No token in cookie
        if (!token || token.trim() === '') {
          console.warn('⚠️ No token cookie found');
          // Clear any stale state if no cookie exists
          if (currentState.isAuthenticated || currentState.user) {
            console.warn('⚠️ State exists but no cookie, clearing state');
            set({ user: null, token: null, isAuthenticated: false });
          }
          return;
        }
        
        // Basic JWT format validation (should have 3 parts separated by dots)
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.warn('Invalid token format in cookie, clearing');
          Cookies.remove('auth-token');
          set({ user: null, token: null, isAuthenticated: false });
          return;
        }
        
        // We have a token but no user data - restore from localStorage instead of validating
        console.log('Found token in cookie, checking localStorage...');
        
        // Try to restore from localStorage first
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('auth-storage');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.state?.user && parsed.state?.isAuthenticated) {
                console.log('✅ Restoring session from localStorage');
                set({ 
                  user: parsed.state.user, 
                  token: parsed.state.token || token, 
                  isAuthenticated: true 
                });
                return;
              }
            } catch (e) {
              console.warn('Failed to parse localStorage');
            }
          }
        }
        
        // If no localStorage data, we need to validate token
        console.log('No localStorage data, validating token...');
        set({ token }); // Set token in state
        
        try {
          // Validate token and get user data
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
          const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            set({ user: data.user, token: data.token, isAuthenticated: true });
            console.log('✅ Session restored from token validation');
          } else {
            // Token is invalid, clear everything
            console.warn('Token validation failed, clearing session');
            Cookies.remove('auth-token');
            set({ user: null, token: null, isAuthenticated: false });
          }
        } catch (error) {
          // Network or other error during validation
          console.error('Error validating token:', error);
          Cookies.remove('auth-token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      // Validate token and get user info
      validateToken: async () => {
        const token = Cookies.get('auth-token');
        
        // Only validate if we have a token AND don't already have user data
        if (!token || token.trim() === '' || get().user) {
          return;
        }
        
        // Basic JWT format validation
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.warn('Invalid token format, clearing');
          Cookies.remove('auth-token');
          set({ user: null, token: null, isAuthenticated: false });
          return;
        }
        
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
          const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            set({ user: data.user, token: data.token, isAuthenticated: true });
            console.log('Token validated successfully');
          } else {
            // Token is invalid, clear it silently
            Cookies.remove('auth-token');
            set({ user: null, token: null, isAuthenticated: false });
          }
        } catch (error) {
          // Silent fail - this is normal for expired/invalid tokens
          Cookies.remove('auth-token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      canPurchaseCourses: () => {
        const user = get().user;
        return user ? (user.role === 'user' || user.role === 'admin' || user.role === 'operation') : false;
      },

      getUserRole: () => {
        const user = get().user;
        return user?.role || null;
      },

      // Force rehydrate from storage
      rehydrate: () => {
        useAuthStore.persist.rehydrate();
      },
    }),
    {
      name: 'auth-storage',
      storage: customStorage as any,
    }
  )
);