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
    // Add a small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Prevent hydration mismatches by not rendering interactive content until hydrated
  if (!isHydrated) {
    return (
      <HydrationContext.Provider value={{ isHydrated: false }}>
        <div suppressHydrationWarning={true}>
          {children}
        </div>
      </HydrationContext.Provider>
    );
  }

  return (
    <HydrationContext.Provider value={{ isHydrated }}>
      {children}
    </HydrationContext.Provider>
  );
}

export const useHydration = () => useContext(HydrationContext);