'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useClientOnly } from '@/hooks/use-client-only';

interface StaggeredChildrenProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  animationClass?: string;
}

export function StaggeredChildren({ 
  children, 
  className = '', 
  staggerDelay = 100,
  animationClass = 'stagger-child'
}: StaggeredChildrenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isClient = useClientOnly();

  useEffect(() => {
    if (!isClient) return;
    const container = containerRef.current;
    if (!container) return;

    // Wait for hydration to complete before starting intersection observer
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const children = entry.target.querySelectorAll(`.${animationClass}`);
              children.forEach((child, index) => {
                setTimeout(() => {
                  child.classList.add('visible');
                }, index * staggerDelay);
              });
            } else {
              // Reset animations when out of view
              const children = entry.target.querySelectorAll(`.${animationClass}`);
              children.forEach((child) => {
                child.classList.remove('visible');
              });
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '50px'
        }
      );

      observer.observe(container);

      return () => {
        observer.unobserve(container);
        observer.disconnect();
      };
    }, 150); // Wait for hydration to complete

    return () => {
      clearTimeout(timer);
    };
  }, [animationClass, staggerDelay, isClient]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
