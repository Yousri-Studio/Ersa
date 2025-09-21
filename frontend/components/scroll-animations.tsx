'use client';

import { useEffect, useRef } from 'react';
import { useClientOnly } from '@/hooks/use-client-only';

export function ScrollAnimations() {
  const isClient = useClientOnly();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isClient || isInitializedRef.current) return;
    
    // Wait for hydration to complete before starting intersection observer
    // This prevents hydration mismatches by ensuring the observer only runs
    // after React has fully hydrated the DOM
    const timer = setTimeout(() => {
      // Create intersection observer for scroll animations
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            } else {
              // Remove visible class when element is out of view to allow re-animation
              entry.target.classList.remove('visible');
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '100px' // Increased margin for earlier triggering
        }
      );

      // Observe all scroll animation elements
      const scrollItems = document.querySelectorAll('.scroll-item, .scroll-item-left, .scroll-item-right, .scroll-item-scale');
      scrollItems.forEach((item) => {
        if (observerRef.current) {
          observerRef.current.observe(item);
        }
      });

      isInitializedRef.current = true;
    }, 150); // Increased delay to ensure hydration is complete

    // Cleanup timer
    return () => {
      clearTimeout(timer);
    };
  }, [isClient]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []);

  // Don't render anything during SSR to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  return null; // This component doesn't render anything
}
