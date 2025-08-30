'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useCartStore } from '@/lib/cart-store';

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Manually hydrate the stores on the client side
    useAuthStore.persist.rehydrate();
    useCartStore.persist.rehydrate();

    // Also initialize from cookie in case of page refresh
    setTimeout(async () => {
      useAuthStore.getState().initFromCookie();
      await useAuthStore.getState().validateToken();
    }, 100);

    setHasMounted(true);
  }, []);

  // Always render on server, but show loading state until hydrated
  if (!hasMounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return <>{children}</>;
}