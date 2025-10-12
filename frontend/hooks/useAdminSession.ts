'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/lib/auth-store';
import toast from 'react-hot-toast';

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

export function useAdminSession() {
  const router = useRouter();
  const locale = useLocale();
  const { isAuthenticated, logout } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = () => {
    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Set warning timer (25 minutes)
    warningRef.current = setTimeout(() => {
      const message = locale === 'ar' 
        ? 'ستنتهي جلستك قريباً بسبب عدم النشاط. انقر في أي مكان للبقاء متصلاً.'
        : 'Your session will expire soon due to inactivity. Click anywhere to stay logged in.';
      toast(message, {
        duration: WARNING_TIME - 1000,
        icon: '⚠️',
        style: {
          background: '#FFA500',
          color: '#fff',
        },
      });
    }, IDLE_TIMEOUT - WARNING_TIME);

    // Set logout timer (30 minutes)
    timeoutRef.current = setTimeout(() => {
      logout();
      const message = locale === 'ar'
        ? 'انتهت صلاحية جلستك بسبب عدم النشاط. يرجى تسجيل الدخول مرة أخرى.'
        : 'Your session has expired due to inactivity. Please login again.';
      toast.error(message);
      router.push(`/${locale}/admin-login`);
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Activity event listeners
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [isAuthenticated, locale, router, logout]);

  return {
    resetTimer,
    lastActivity: lastActivityRef.current,
  };
}

