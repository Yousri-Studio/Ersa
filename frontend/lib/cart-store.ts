import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './api';
import { customStorage } from './custom-storage';

interface CartState {
  cartId: string | null;
  anonymousId: string | null;
  items: CartItem[];
  total: number;
  currency: string;
  isLoading: boolean;
  
  setCart: (cart: {
    cartId: string;
    items: CartItem[];
    total: number;
    currency: string;
  }) => void;
  
  setCartId: (cartId: string, anonymousId?: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  itemCount: () => number;
  hasItem: (courseId: string, sessionId?: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      anonymousId: null,
      items: [],
      total: 0,
      currency: 'SAR',
      isLoading: false,

      setCart: (cart) => {
        set({
          cartId: cart.cartId,
          items: cart.items,
          total: cart.total,
          currency: cart.currency,
        });
      },

      setCartId: (cartId: string, anonymousId?: string) => {
        set({ cartId, anonymousId });
      },

      addItem: (item: CartItem) => {
        const { items } = get();
        const existingItem = items.find(
          (i) => i.courseId === item.courseId && i.sessionId === item.sessionId
        );

        if (!existingItem) {
          const newItems = [...items, item];
          const newTotal = newItems.reduce((sum, i) => sum + i.price * i.qty, 0);
          set({ items: newItems, total: newTotal });
        }
      },

      removeItem: (itemId: string) => {
        const { items } = get();
        const newItems = items.filter((item) => item.id !== itemId);
        const newTotal = newItems.reduce((sum, item) => sum + item.price * item.qty, 0);
        set({ items: newItems, total: newTotal });
      },

      updateItemQuantity: (itemId: string, qty: number) => {
        const { items } = get();
        const newItems = items.map((item) =>
          item.id === itemId ? { ...item, qty } : item
        );
        const newTotal = newItems.reduce((sum, item) => sum + item.price * item.qty, 0);
        set({ items: newItems, total: newTotal });
      },

      clearCart: () => {
        set({
          cartId: null,
          anonymousId: null,
          items: [],
          total: 0,
          currency: 'SAR',
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Computed
      itemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.qty, 0);
      },

      hasItem: (courseId: string, sessionId?: string) => {
        const { items } = get();
        return items.some(
          (item) => item.courseId === courseId && item.sessionId === sessionId
        );
      },
    }),
    {
      name: 'cart-storage',
      storage: customStorage as any,
      skipHydration: true,
    }
  )
);