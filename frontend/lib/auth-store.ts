import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  locale: string;
  createdAt: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        Cookies.set('auth-token', token, { 
          expires: 7, 
          secure: process.env.NODE_ENV === 'production', 
          sameSite: 'lax' 
        });
        set({ user, token, isAuthenticated: true });
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

      initFromCookie: () => {
        const token = Cookies.get('auth-token');
        if (token && !get().isAuthenticated) {
          // We have a token but not authenticated, need to validate it
          // For now, just set the token and let the API calls handle validation
          set({ token, isAuthenticated: true });
          // Trigger token validation to get user data
          get().validateToken();
        }
      },

      // Validate token and get user info
      validateToken: async () => {
        const token = Cookies.get('auth-token');
        if (token && !get().user) {
          try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
            const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              set({ user: data.user, token: data.token, isAuthenticated: true });
            } else {
              // Token is invalid, clear it
              Cookies.remove('auth-token');
              set({ user: null, token: null, isAuthenticated: false });
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            Cookies.remove('auth-token');
            set({ user: null, token: null, isAuthenticated: false });
          }
        }
      },

      // Force rehydrate from storage
      rehydrate: () => {
        useAuthStore.persist.rehydrate();
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: true,
    }
  )
);