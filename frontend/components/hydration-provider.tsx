'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface HydrationContextType {
  isHydrated: boolean;
}

const HydrationContext = createContext<HydrationContextType>({
  isHydrated: false,
});

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated immediately when component mounts on client
    setIsHydrated(true);
  }, []);

  // Always render children but provide hydration state
  return (
    <HydrationContext.Provider value={{ isHydrated }}>
      <div suppressHydrationWarning={true}>
        {children}
      </div>
    </HydrationContext.Provider>
  );
}

export const useHydration = () => useContext(HydrationContext);