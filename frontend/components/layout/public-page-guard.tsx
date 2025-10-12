'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/lib/auth-store';
import toast from 'react-hot-toast';

/**
 * PublicPageGuard - Prevents admin users from accessing public pages
 * 
 * This component checks if the current user has admin privileges
 * and redirects them to the admin portal if they try to access public pages.
 */
export function PublicPageGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    // Only run this check on public pages (not auth pages or admin pages)
    const isAuthPage = pathname?.includes('/auth/') || pathname?.includes('/admin-login');
    const isAdminPage = pathname?.includes('/admin/') || pathname === `/${locale}/admin`;
    
    // Skip check for auth and admin pages
    if (isAuthPage || isAdminPage) {
      return;
    }

    // Check if user is authenticated and is an admin
    if (isAuthenticated && user && (user.isAdmin || user.isSuperAdmin)) {
      console.log('🚫 Admin user detected on public page. Logging out and redirecting to admin login.');
      
      // Show a message to the user
      toast.error(locale === 'ar' 
        ? 'لا يمكن لمستخدمي الإدارة الوصول إلى الموقع العام. يرجى استخدام لوحة الإدارة.'
        : 'Admin users cannot access the public site. Please use the admin dashboard.');
      
      // Log out the admin user
      logout();
      
      // Redirect to admin login
      setTimeout(() => {
        router.push(`/${locale}/admin-login`);
      }, 100);
    }
  }, [pathname, user, isAuthenticated, locale, router, logout]);

  // This component doesn't render anything
  return null;
}

