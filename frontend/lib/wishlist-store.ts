import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { customStorage } from './custom-storage';

interface WishlistItem {
  id: string;
  courseId: string;
  title: {
    ar: string;
    en: string;
  };
  price: number;
  currency: string;
  imageUrl?: string;
  instructor?: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  
  addItem: (item: WishlistItem) => void;
  removeItem: (courseId: string) => void;
  clearWishlist: () => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  itemCount: () => number;
  hasItem: (courseId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item: WishlistItem) => {
        const { items } = get();
        const existingItem = items.find((i) => i.courseId === item.courseId);

        if (!existingItem) {
          set({ items: [...items, item] });
        }
      },

      removeItem: (courseId: string) => {
        const { items } = get();
        const newItems = items.filter((item) => item.courseId !== courseId);
        set({ items: newItems });
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
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
