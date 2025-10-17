import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, cartApi } from './api';
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
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  initializeCart: () => Promise<void>;
  
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

      initializeCart: async () => {
        const { cartId } = get();
        if (cartId) return; // Cart already initialized
        
        try {
          const response = await cartApi.initCart();
          set({ 
            cartId: response.data.cartId,
            anonymousId: response.data.anonymousId 
          });
        } catch (error) {
          console.error('Failed to initialize cart:', error);
          // Fallback to local cart ID
          set({ cartId: `local-cart-${Date.now()}` });
        }
      },

      addItem: async (item: CartItem) => {
        console.log('🛒 addItem called with:', item);
        const { items, cartId, initializeCart } = get();
        console.log('🛒 Current cart state - items:', items, 'cartId:', cartId);
        
        const existingItem = items.find(
          (i) => i.courseId === item.courseId && i.sessionId === item.sessionId
        );

        if (existingItem) {
          console.log('🛒 Item already in cart, skipping');
          return; // Item already in cart
        }

        // Initialize cart if needed
        if (!cartId) {
          console.log('🛒 No cartId, initializing cart...');
          await initializeCart();
        }

        const newItems = [...items, item];
        const newTotal = newItems.reduce((sum, i) => sum + i.price * i.qty, 0);
        
        console.log('🛒 Setting new state - items:', newItems, 'total:', newTotal);
        // Update local state immediately for better UX
        set({ items: newItems, total: newTotal });

        // Verify the state was updated
        const updatedState = get();
        console.log('🛒 State after set - items:', updatedState.items, 'total:', updatedState.total);

        // Try to sync with backend if we have a valid cartId
        const currentCartId = get().cartId;
        if (currentCartId && !currentCartId.startsWith('local-cart-')) {
          try {
            console.log('🛒 Syncing with backend, cartId:', currentCartId);
            await cartApi.addToCart({
              cartId: currentCartId,
              courseId: item.courseId,
              sessionId: item.sessionId
            });
            console.log('🛒 Backend sync successful');
          } catch (error) {
            console.error('🛒 Failed to sync cart with backend:', error);
            // Keep local state even if backend sync fails
          }
        } else {
          console.log('🛒 Skipping backend sync - using local cart:', currentCartId);
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
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        cartId: state.cartId,
        anonymousId: state.anonymousId,
        items: state.items,
        total: state.total,
        currency: state.currency,
      }),
    }
  )
);