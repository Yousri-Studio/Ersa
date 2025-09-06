'use client';

import { useEffect, useState } from 'react';
import { adminApi, DashboardStats } from '@/lib/admin-api';
import { useHydration } from '@/hooks/useHydration';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Icon } from '@/components/ui/icon';
import WorldMap from '@/components/ui/world-map';
import { useAuthStore } from '@/lib/auth-store';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBackendConnection } from '@/lib/backend-connection';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const t = useTranslations('admin');
  const locale = useLocale();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const isHydrated = useHydration();
  const { status: backendStatus } = useBackendConnection();

  // Animation variants for cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching dashboard stats...');
        const response = await adminApi.getDashboardStats();
        console.log('Dashboard stats received:', response);
        setStats(response.data);
        setIsUsingFallback(response.isUsingFallback);
        setError(null);
        
        if (response.isUsingFallback) {
          toast.error(t('using-demo-data'));
        }
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        setError(error.message || 'Failed to load dashboard statistics');
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (isHydrated) {
      fetchStats();
    }
  }, [isHydrated, t]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Use the stats directly since they include fallback data when needed
  const dashboardStats = stats;
  
  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Extract recent users and geographics data
  const recentUsers = dashboardStats.recentUsers || [];
  const geographics = dashboardStats.userGeographics || [];

  const formatDate = (dateString: string) => {
    // This function seems to be unused, but kept for potential future use.
    // If it's intended to format dates from the API, it should be implemented.
    return '01/01/2025';
  };

  // Mock data for demonstration - replace with real data from API
  const recentOrders = [
    {
      id: '1',
      studentName: 'Eslam Elsayed',
      courseName: locale === 'ar' ? 'دورة التصميم الجرافيكي المتقدمة' : 'Advanced Graphic Design Course',
      orderDate: '2025/01/01',
      courseType: locale === 'ar' ? 'أونلاين' : 'Online',
      coursePrice: locale === 'ar' ? '1200 ر.س' : '1200 SAR'
    },
    {
      id: '2',
      studentName: 'Eslam Elsayed',
      courseName: locale === 'ar' ? 'دورة التصميم الجرافيكي المتقدمة' : 'Advanced Graphic Design Course',
      orderDate: '2025/01/01',
      courseType: locale === 'ar' ? 'أونلاين' : 'Online',
      coursePrice: locale === 'ar' ? '1200 ر.س' : '1200 SAR'
    },
    {
      id: '3',
      studentName: 'Eslam Elsayed',
      courseName: locale === 'ar' ? 'دورة التصميم الجرافيكي المتقدمة' : 'Advanced Graphic Design Course',
      orderDate: '2025/01/01',
      courseType: locale === 'ar' ? 'أونلاين' : 'Online',
      coursePrice: locale === 'ar' ? '1200 ر.س' : '1200 SAR'
    }
  ];

  const isRTL = locale === 'ar';

  return (
    <div className="bg-white min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{maxWidth: '90rem', paddingTop: '50px'}}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">👋</span>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('hello')} {user?.fullName || t('admin')} 👋
            </h1>
          </div>
          <p className="text-gray-600 text-base">
            {user?.isSuperAdmin ? t('super-admin') : t('admin')} • {t('operations-dashboard')}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {t('dashboard-subtitle')}
          </p>
          <div className="mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
              isUsingFallback 
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                : backendStatus.isAvailable 
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                isUsingFallback 
                  ? 'bg-yellow-400' 
                  : backendStatus.isAvailable 
                    ? 'bg-green-400'
                    : 'bg-red-400'
              }`}></span>
              {isUsingFallback 
                ? t('using-demo-data')
                : backendStatus.isAvailable 
                  ? t('connected-to-backend')
                  : t('backend-unavailable')
              }
            </span>
          </div>
        </div>

        {/* Dashboard Content */}
        <div style={{backgroundColor: '#FAFCFF'}} className="rounded-2xl p-6">
          {/* Dashboard Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">{t('dashboard.title')}</h2>
            <p className="text-gray-600 text-sm">{t('dashboard.overview-platform')}</p>
          </div>

          {/* Statistics Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="users" className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="text-gray-600 text-sm font-medium">{t('total-users')}</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{dashboardStats.totalUsers}</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="graduation-cap" className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-600 text-sm font-medium">{t('total-courses')}</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{dashboardStats.totalCourses}</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="shopping-cart" className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-600 text-sm font-medium">{t('total-orders')}</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{dashboardStats.totalOrders}</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="dollar-sign" className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-600 text-sm font-medium">{t('total-revenue')}</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {locale === 'ar' ? `${dashboardStats.totalRevenue.toLocaleString()} ر.س` : `SAR ${dashboardStats.totalRevenue.toLocaleString()}`}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{t('recent-orders')}</h3>
              <p className="text-gray-600 text-sm">{t('recent-orders-subtitle')}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('student-name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('course-name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('order-date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('course-type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('course-price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.courseName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.courseType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.coursePrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('status-completed')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <Icon name="ellipsis-v" className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Grid - Recent Users and Geographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Users */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{t('recent-users')}</h3>
                <p className="text-gray-600 text-sm">{t('recent-users-subtitle')}</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                          <div className="h-full w-full bg-gradient-to-r from-blue-500 to-teal-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US') : ''}</span>
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <Icon name="ellipsis-v" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Geographics */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{t('geographics')}</h3>
                <p className="text-gray-600 text-sm">{t('geographics-subtitle')}</p>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">{t('users-from-countries')}</h4>
                  <div className="space-y-2">
                    {geographics.map((geo, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{geo.country}</span>
                        <span className="text-sm font-medium text-teal-600">{geo.users} {t('user')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-40">
                  <WorldMap data={geographics} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}