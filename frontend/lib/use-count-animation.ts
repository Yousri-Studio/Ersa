import { useState, useEffect, useRef } from 'react';

interface UseCountAnimationProps {
  targetValue: number;
  duration?: number;
  delay?: number;
  startValue?: number;
}

export function useCountAnimation({ 
  targetValue, 
  duration = 2000, 
  delay = 0,
  startValue = 0 
}: UseCountAnimationProps) {
  const [count, setCount] = useState(startValue);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            
            // Start animation after delay
            setTimeout(() => {
              const startTime = performance.now();
              
              const animate = () => {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentCount = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
                
                setCount(currentCount);
                
                if (progress < 1) {
                  requestAnimationFrame(animate);
                } else {
                  setCount(targetValue);
                }
              };
              
              requestAnimationFrame(animate);
            }, delay);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [targetValue, duration, delay, hasAnimated, startValue]);

  return { count, elementRef };
}
