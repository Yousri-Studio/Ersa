'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useCartStore } from '@/lib/cart-store';

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Manually hydrate the stores on the client side
    useAuthStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
    
    // Also initialize from cookie in case of page refresh
    setTimeout(async () => {
      useAuthStore.getState().initFromCookie();
      await useAuthStore.getState().validateToken();
    }, 100);
  }, []);

  return <>{children}</>;
}
