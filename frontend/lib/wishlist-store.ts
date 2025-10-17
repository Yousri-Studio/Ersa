import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { customStorage } from './custom-storage';
import { wishlistApi } from './api';

interface WishlistItem {
  id: string;
  courseId: string;
  title: {
    ar: string;
    en: string;
  };
  description?: {
    ar: string;
    en: string;
  };
  price: number;
  originalPrice?: number;
  currency: string;
  imageUrl?: string;
  instructor?: string;
  rating?: number;
  studentsCount?: number;
  duration?: number;
  level?: string;
  categoryName?: {
    ar: string;
    en: string;
  };
  createdAt?: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  fetchWishlist: () => Promise<void>;
  addItem: (courseId: string) => Promise<boolean>;
  removeItem: (courseId: string) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  checkIfInWishlist: (courseId: string) => Promise<boolean>;
  
  // Computed
  itemCount: () => number;
  hasItem: (courseId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isInitialized: false,

      fetchWishlist: async () => {
        try {
          set({ isLoading: true });
          const response = await wishlistApi.getWishlist();
          const items = response.data.items.map((item: any) => ({
            id: item.id,
            courseId: item.courseId,
            title: item.title,
            description: item.description,
            price: item.price,
            originalPrice: item.originalPrice,
            currency: 'SAR',
            imageUrl: item.imageUrl,
            instructor: item.instructor,
            rating: item.rating,
            studentsCount: item.studentsCount,
            duration: item.duration,
            level: item.level,
            categoryName: item.categoryName,
            createdAt: item.createdAt,
          }));
          set({ items, isLoading: false, isInitialized: true });
        } catch (error: any) {
          console.error('Error fetching wishlist:', error);
          // If unauthorized, clear the wishlist
          if (error.response?.status === 401) {
            set({ items: [], isLoading: false, isInitialized: true });
          } else {
            set({ isLoading: false, isInitialized: true });
          }
        }
      },

      addItem: async (courseId: string) => {
        try {
          set({ isLoading: true });
          await wishlistApi.addToWishlist(courseId);
          // Refresh wishlist
          await get().fetchWishlist();
          return true;
        } catch (error: any) {
          console.error('Error adding to wishlist:', error);
          set({ isLoading: false });
          return false;
        }
      },

      removeItem: async (courseId: string) => {
        try {
          set({ isLoading: true });
          await wishlistApi.removeFromWishlist(courseId);
          // Update local state
          const { items } = get();
          const newItems = items.filter((item) => item.courseId !== courseId);
          set({ items: newItems, isLoading: false });
          return true;
        } catch (error: any) {
          console.error('Error removing from wishlist:', error);
          set({ isLoading: false });
          return false;
        }
      },

      clearWishlist: async () => {
        try {
          set({ isLoading: true });
          // The API doesn't have a clear endpoint, so we'll remove items one by one
          const { items } = get();
          for (const item of items) {
            await wishlistApi.removeFromWishlist(item.courseId);
          }
          set({ items: [], isLoading: false });
          return true;
        } catch (error: any) {
          console.error('Error clearing wishlist:', error);
          set({ isLoading: false });
          return false;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkIfInWishlist: async (courseId: string) => {
        try {
          // First check local state
          const { items } = get();
          const localCheck = items.some((item) => item.courseId === courseId);
          if (localCheck) return true;

          // If not in local state, check with API (for cases where store isn't initialized)
          const response = await wishlistApi.getWishlist();
          const apiCheck = response.data.items.some((item: any) => item.courseId === courseId);
          return apiCheck;
        } catch (error) {
          console.error('Error checking wishlist:', error);
          return false;
        }
      },

      // Computed
      itemCount: () => {
        const { items } = get();
        return items.length;
      },

      hasItem: (courseId: string) => {
        const { items } = get();
        return items.some((item) => item.courseId === courseId);
      },
    }),
    {
      name: 'wishlist-storage',
      storage: customStorage as any,
    }
  )
);
