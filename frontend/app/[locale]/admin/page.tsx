'use client';

import { useEffect, useState } from 'react';
import { adminApi, DashboardStats } from '@/lib/admin-api';
import { useHydration } from '@/hooks/useHydration';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Icon } from '@/components/ui/icon';
import WorldMap from '@/components/ui/world-map';
import { useAuthStore } from '@/lib/auth-store';

// Fallback stats for when API is not available
const fallbackStats: DashboardStats = {
  totalUsers: 1250,
  activeUsers: 890,
  totalCourses: 45,
  activeCourses: 38,
  totalOrders: 567,
  totalRevenue: 125000,
  recentUsers: [
    {
      id: '1',
      fullName: 'Eslam Elsayed',
      email: 'gfxislam@gmail.com',
      createdAt: '2025-01-15T10:30:00Z',
      status: 'Active'
    },
    {
      id: '2',
      fullName: 'Ahmed Mohamed',
      email: 'ahmed@example.com',
      createdAt: '2025-01-14T15:45:00Z',
      status: 'Active'
    },
    {
      id: '3',
      fullName: 'Sarah Johnson',
      email: 'sarah@example.com',
      createdAt: '2025-01-13T09:20:00Z',
      status: 'Active'
    }
  ],
  recentOrders: [
    {
      id: '1',
      userName: 'Eslam Elsayed',
      totalAmount: 1200,
      status: 'Paid',
      createdAt: '2025-01-15T12:00:00Z'
    },
    {
      id: '2',
      userName: 'Ahmed Mohamed',
      totalAmount: 800,
      status: 'Paid',
      createdAt: '2025-01-14T16:30:00Z'
    },
    {
      id: '3',
      userName: 'Sarah Johnson',
      totalAmount: 1500,
      status: 'Pending',
      createdAt: '2025-01-13T11:15:00Z'
    }
  ],
  userGeographics: [
    { country: 'Saudi Arabia', users: 450, coordinates: [45.0792, 23.8859] },
    { country: 'Egypt', users: 320, coordinates: [30.8025, 26.8206] },
    { country: 'United States', users: 180, coordinates: [-95.7129, 37.0902] },
    { country: 'United Kingdom', users: 95, coordinates: [-0.1278, 51.5074] },
    { country: 'Canada', users: 75, coordinates: [-106.3468, 56.1304] }
  ]
};

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isHydrated } = useHydration();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching dashboard stats...');
        const response = await adminApi.getDashboardStats();
        console.log('Dashboard stats received:', response.data);
        setStats(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        setError(error.message || 'Failed to load dashboard statistics');
        // Use fallback data instead of showing error
        setStats(fallbackStats);
        toast.error(t('using-demo-data'));
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

  // Use fallback data if stats is null
  const dashboardStats = stats || fallbackStats;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, ' / ');
  };

  const getStatusColor = (status: any) => {
    const statusStr = String(status || '').toLowerCase();
    switch (statusStr) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock data for demonstration - replace with real data from API
  const recentOrders = [
    {
      id: '1',
      studentName: 'Eslam Elsayed',
      courseName: 'Advanced Graphic Design Course',
      orderDate: '01 / 01 / 2025',
      courseType: t('online'),
      coursePrice: '1200 SAR'
    },
    {
      id: '2',
      studentName: 'Eslam Elsayed',
      courseName: 'Advanced Graphic Design Course',
      orderDate: '01 / 01 / 2025',
      courseType: t('online'),
      coursePrice: '1200 SAR'
    },
    {
      id: '3',
      studentName: 'Eslam Elsayed',
      courseName: 'Advanced Graphic Design Course',
      orderDate: '01 / 01 / 2025',
      courseType: t('online'),
      coursePrice: '1200 SAR'
    }
  ];

  const recentUsers = [
    {
      id: '1',
      name: 'Eslam Elsayed',
      email: 'gfxislam@gmail.com',
      date: '01/01/2025'
    },
    {
      id: '2',
      name: 'Eslam Elsayed',
      email: 'gfxislam@gmail.com',
      date: '01/01/2025'
    },
    {
      id: '3',
      name: 'Eslam Elsayed',
      email: 'gfxislam@gmail.com',
      date: '01/01/2025'
    },
    {
      id: '4',
      name: 'Eslam Elsayed',
      email: 'gfxislam@gmail.com',
      date: '01/01/2025'
    }
  ];

  // Use real geographic data from API or fallback to mock data
  const geographics = dashboardStats.userGeographics || [
    { country: 'Saudi Arabia', users: 20, coordinates: [45.0792, 23.8859] },
    { country: 'Egypt', users: 20, coordinates: [30.8025, 26.8206] },
    { country: 'United States', users: 20, coordinates: [-95.7129, 37.0902] },
    { country: 'United Kingdom', users: 20, coordinates: [-0.1278, 51.5074] }
  ];

  const isRTL = locale === 'ar';

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Error message if API failed */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <Icon name="exclamation-triangle" className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              {error} - {t('using-demo-data')}
            </p>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className={`text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          {t('hello')}
        </h1>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mb-1 sm:mb-2">
          {t('super-admin')}
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          {t('dashboard-subtitle')}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{t('total-users')}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardStats.totalUsers}</p>
            </div>
            <div className={`h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>
              <Icon name="users" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{t('total-courses')}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardStats.totalCourses}</p>
            </div>
            <div className={`h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>
              <Icon name="graduation-cap" className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{t('total-orders')}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
            </div>
            <div className={`h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>
              <Icon name="shopping-cart" className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{t('total-revenue')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(dashboardStats.totalRevenue)}</p>
            </div>
            <div className={`h-10 w-10 sm:h-12 sm:w-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>
              <Icon name="chart-line" className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('recent-orders')}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('recent-orders-subtitle')}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('student-name')}
                </th>
                <th className={`px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('course-name')}
                </th>
                <th className={`px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('order-date')}
                </th>
                <th className={`px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('course-type')}
                </th>
                <th className={`px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('course-price')}
                </th>
                <th className={`px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className={`px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`truncate max-w-[120px] sm:max-w-none ${isRTL ? 'text-right' : 'text-left'}`}>
                      {order.studentName}
                    </div>
                    <div className={`sm:hidden text-xs text-gray-500 mt-1 truncate max-w-[120px] ${isRTL ? 'text-right' : 'text-left'}`}>
                      {order.courseName}
                    </div>
                  </td>
                  <td className={`px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`truncate max-w-[200px] ${isRTL ? 'text-right' : 'text-left'}`}>
                      {order.courseName}
                    </div>
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {order.orderDate}
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>
                    {order.courseType}
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`md:hidden text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {order.courseType}
                    </div>
                    {order.coursePrice}
                  </td>
                  <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <Icon name="ellipsis-v" className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid - Recent Users and Geographics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('recent-users')}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('recent-users-subtitle')}</p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className={`flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="user" className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-2 sm:space-x-3 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`text-xs sm:text-sm text-gray-500 ${isRTL ? '' : 'hidden sm:inline'}`}>{user.date}</span>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <Icon name="ellipsis-v" className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('geographics')}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('geographics-subtitle')}</p>
          </div>
          <div className="p-4 sm:p-6">
            <div className={`flex flex-col lg:flex-row lg:items-start lg:space-x-6 space-y-4 lg:space-y-0 ${isRTL ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">{t('users-from-countries')}</h4>
                <div className="space-y-1 sm:space-y-2">
                  {geographics.map((geo, index) => (
                    <div key={index} className={`flex justify-between items-center ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className={`text-xs sm:text-sm text-gray-600 truncate flex-1 mr-2 ${isRTL ? 'ml-2' : 'mr-2'}`}>{geo.country}</span>
                      <span className={`text-xs sm:text-sm font-medium text-gray-900 flex-shrink-0 ${isRTL ? 'text-left' : 'text-right'}`}>{geo.users} {t('user')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 lg:max-w-xs">
                <div className="h-32 sm:h-40 lg:h-48">
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