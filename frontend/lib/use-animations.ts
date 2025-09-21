import { useState, useEffect, useRef } from 'react';

export function usePageLoad(delay = 100) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isLoaded;
}

export function useScrollAnimation() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Wait for hydration to complete before starting intersection observers
    const timer = setTimeout(() => {
      const observers = itemRefs.current.map((ref, index) => {
        if (!ref) return null;
        
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleItems(prev => {
                const newSet = new Set(prev);
                newSet.add(index);
                return newSet;
              });
            }
          },
          { 
            threshold: 0.1, 
            rootMargin: '50px' 
          }
        );
        
        observer.observe(ref);
        return observer;
      });

      return () => {
        observers.forEach(observer => observer?.disconnect());
      };
    }, 150); // Wait for hydration to complete

    return () => {
      clearTimeout(timer);
    };
  }, [itemRefs.current.length]);

  const setRef = (index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el;
  };

  return { visibleItems, setRef };
}

export function useStaggeredAnimation(items: any[], baseDelay = 0) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Wait for hydration to complete before starting intersection observers
    const timer = setTimeout(() => {
      const observers = itemRefs.current.map((ref, index) => {
        if (!ref) return null;
        
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                setVisibleItems(prev => {
                  const newSet = new Set(prev);
                  newSet.add(index);
                  return newSet;
                });
              }, baseDelay + (index * 100));
            }
          },
          { 
            threshold: 0.1, 
            rootMargin: '100px' 
          }
        );
        
        observer.observe(ref);
        return observer;
      });

      return () => {
        observers.forEach(observer => observer?.disconnect());
      };
    }, 150); // Wait for hydration to complete

    return () => {
      clearTimeout(timer);
    };
  }, [items.length, baseDelay]);

  const setRef = (index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el;
  };

  return { visibleItems, setRef };
}
