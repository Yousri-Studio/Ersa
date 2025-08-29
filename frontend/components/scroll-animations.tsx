'use client';

import { useEffect } from 'react';

export function ScrollAnimations() {
  useEffect(() => {
    // Create intersection observer for scroll animations
    const observer = new IntersectionObserver(
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
    scrollItems.forEach((item) => observer.observe(item));

    // Cleanup
    return () => {
      scrollItems.forEach((item) => observer.unobserve(item));
    };
  }, []);

  return null; // This component doesn't render anything
}
