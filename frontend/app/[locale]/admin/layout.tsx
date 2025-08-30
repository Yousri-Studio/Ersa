'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/auth-store';
import { Icon } from '@/components/ui/icon';
import { useHydration } from '@/hooks/useHydration';
import { adminApi } from '@/lib/admin-api';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const isHydrated = useHydration();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('admin');
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Wait a bit for hydration to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Admin layout check:', { isAuthenticated, user });

      if (!isAuthenticated || !user) {
        console.log('Not authenticated, redirecting to admin login');
        router.push(`/${locale}/admin-login`);
        return;
      }

      if (!user.isAdmin && !user.isSuperAdmin) {
        toast.error('Access denied. Admin privileges required.');
        router.push(`/${locale}/`);
        return;
      }

      // Test admin API access
      try {
        await adminApi.getDashboardStats();
        setIsLoading(false);
      } catch (error: any) {
        console.log('API check failed, using mock mode...');
        // If API fails, we'll use mock data
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, user, locale, router, logout]);

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/admin-login`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: 'chart-line', href: `/${locale}/admin` },
    { id: 'content', label: t('sidebar.contentManagement'), icon: 'edit', href: `/${locale}/admin/content` },
    { id: 'users', label: t('sidebar.manageUsers'), icon: 'users', href: `/${locale}/admin/users` },
    { id: 'courses', label: t('sidebar.manageCourses'), icon: 'graduation-cap', href: `/${locale}/admin/courses` },
    { id: 'orders', label: t('sidebar.orders'), icon: 'shopping-cart', href: `/${locale}/admin/orders` },
  ];

  // Super admin items can be added here if needed in the future

  const isRTL = locale === 'ar';

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          isMenuOpen ? 'block' : 'hidden'
        } lg:block lg:w-64 lg:fixed lg:inset-y-0 lg:overflow-y-auto fixed inset-y-0 ${
          isRTL ? 'right-0' : 'left-0'
        } z-40 w-64 ${
          isMenuOpen
            ? 'translate-x-0'
            : isRTL
              ? 'translate-x-full'
              : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className={`h-full flex flex-col bg-white ${
            isRTL ? 'border-l' : 'border-r'
          } border-gray-200 shadow-lg lg:shadow-none`}>
            {/* Logo Section */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className={`flex items-center ${isRTL ? 'justify-end' : 'justify-between'}`}>
                <Image
                  src="/Header Logo.svg"
                  alt="Ersa Training"
                  width={100}
                  height={38}
                  priority
                  className={isRTL ? 'order-2' : 'order-1'}
                />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className={`lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 ${isRTL ? 'order-1' : 'order-2'}`}
                >
                  <Icon name="times" className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`group flex items-center px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    activeTab === item.id
                      ? `bg-blue-50 text-blue-700 ${isRTL ? 'border-l-2' : 'border-r-2'} border-blue-500`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    name={item.icon}
                    className={`${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                      activeTab === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Info */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-xs sm:text-sm">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                </div>
                <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate font-cairo">
                    {user?.fullName || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate font-cairo">
                    {user?.isSuperAdmin ? t('super-admin') : 'Admin'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              >
                <Icon name="power-off" className={`${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0`} />
                <span className="truncate">{t('sidebar.logout')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={`${isRTL ? 'lg:pr-64' : 'lg:pl-64'} flex-1 min-w-0`} dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Mobile menu button */}
          <div className={`lg:hidden fixed top-4 ${isRTL ? 'right-4' : 'left-4'} z-50`}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-white shadow-md"
            >
              <Icon name="bars" className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <main className={`${isRTL ? 'text-right' : 'text-left'}`}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}