'use client';

import { useEffect, useState } from 'react';

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

// Hook to safely use stores that persist to localStorage
export function useStoreHydration<T>(store: () => T, fallback: T): T {
  const isHydrated = useHydration();
  
  if (isHydrated) {
    return store();
  }
  
  return fallback;
}
