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
    { id: 'dashboard', label: 'Dashboard', icon: 'chart-line', href: `/${locale}/admin` },
    { id: 'content', label: 'Content Management', icon: 'edit', href: `/${locale}/admin/content` },
    { id: 'users', label: 'Manage Users', icon: 'users', href: `/${locale}/admin/users` },
    { id: 'courses', label: 'Manage Courses', icon: 'graduation-cap', href: `/${locale}/admin/courses` },
    { id: 'orders', label: 'Orders', icon: 'shopping-cart', href: `/${locale}/admin/orders` },
  ];

  // Add super admin only items
  if (user?.isSuperAdmin) {
    menuItems.push(
      { id: 'settings', label: 'Settings', icon: 'cog', href: `/${locale}/admin/settings` }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:block lg:w-64 lg:fixed lg:inset-y-0 lg:overflow-y-auto`}>
          <div className="h-full flex flex-col bg-white border-r border-gray-200">
            {/* Logo Section */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Image
                    src="/Header Logo.svg"
                    alt="Ersa Training & Consultancy Services"
                    width={120}
                    height={46}
                    className="h-10 w-auto"
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon 
                    name={item.icon} 
                    className={`mr-3 h-5 w-5 ${
                      activeTab === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} 
                  />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              >
                <Icon name="power-off" className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex-1">
          {/* Mobile menu button */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <Icon name="bars" className="h-6 w-6" />
            </button>
          </div>
          
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
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
