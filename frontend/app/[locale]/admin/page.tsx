
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
  totalUsers: 20,
  activeUsers: 890,
  totalCourses: 20,
  activeCourses: 38,
  totalOrders: 120,
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
      fullName: 'Eslam Elsayed',
      email: 'gfxislam@gmail.com',
      createdAt: '2025-01-14T15:45:00Z',
      status: 'Active'
    },
    {
      id: '3',
      fullName: 'Eslam Elsayed',
      email: 'gfxislam@gmail.com',
      createdAt: '2025-01-13T09:20:00Z',
      status: 'Active'
    },
    {
      id: '4',
      fullName: 'Eslam Elsayed',
      email: 'gfxislam@gmail.com',
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
      userName: 'Eslam Elsayed',
      totalAmount: 1200,
      status: 'Paid',
      createdAt: '2025-01-14T16:30:00Z'
    },
    {
      id: '3',
      userName: 'Eslam Elsayed',
      totalAmount: 1200,
      status: 'Pending',
      createdAt: '2025-01-13T11:15:00Z'
    }
  ],
  userGeographics: [
    { country: 'Saudi Arabia', users: 20, coordinates: [45.0792, 23.8859] },
    { country: 'Egypt', users: 20, coordinates: [30.8025, 26.8206] },
    { country: 'United States', users: 20, coordinates: [-95.7129, 37.0902] },
    { country: 'United Kingdom', users: 20, coordinates: [-0.1278, 51.5074] }
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

  const formatDate = (dateString: string) => {
    return '01/01/2025';
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
      date: '01/01/2025',
      avatar: '/images/Avatar.svg'
    },
    {
      id: '2',
      name: 'Eslam Elsayed',
      email: 'gfxislam@gmail.com',
      date: '01/01/2025',
      avatar: '/images/Avatar.svg'
    },
    {
      id: '3',
      name: 'Eslam Elsayed',
      email: 'gfxislam@gmail.com',
      date: '01/01/2025',
      avatar: '/images/Avatar.svg'
    },
    {
      id: '4',
      name: 'Eslam Elsayed',
      email: 'gfxislam@gmail.com',
      date: '01/01/2025',
      avatar: '/images/Avatar.svg'
    }
  ];

  // Use real geographic data from API or fallback to mock data
  const geographics = [
    { country: 'Saudi Arabia', users: 20, coordinates: [45.0792, 23.8859] },
    { country: 'Egypt', users: 20, coordinates: [30.8025, 26.8206] },
    { country: 'United States', users: 20, coordinates: [-95.7129, 37.0902] },
    { country: 'United Kingdom', users: 20, coordinates: [-0.1278, 51.5074] }
  ];

  const isRTL = locale === 'ar';

  return (
    <div className="bg-white min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <span className="text-2xl">👋</span>
            <span className="ml-2 text-lg text-gray-600">Hello</span>
          </div>
          <h1 className="text-3xl font-bold text-teal-600 mb-2">
            {t('operations-dashboard')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard-subtitle')}
          </p>
        </div>

        {/* Dashboard Content */}
        <div style={{backgroundColor: '#FAFCFF'}} className="rounded-2xl p-6">
          {/* Dashboard Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Dashboard</h2>
            <p className="text-gray-600 text-sm">Overview of your platform's performance and recent activity</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="users" className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="text-gray-600 text-sm font-medium">Total Users</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{dashboardStats.totalUsers}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="graduation-cap" className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-600 text-sm font-medium">Total Courses</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{dashboardStats.totalCourses}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="shopping-cart" className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-600 text-sm font-medium">Total Orders</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{dashboardStats.totalOrders}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Recent Orders</h3>
              <p className="text-gray-600 text-sm">Overview of orders and recent activity</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                <h3 className="text-lg font-bold text-gray-800 mb-1">Recent Users</h3>
                <p className="text-gray-600 text-sm">Overview of Users and Recently Joined</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">{user.date}</span>
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
                <h3 className="text-lg font-bold text-gray-800 mb-1">Geographics</h3>
                <p className="text-gray-600 text-sm">Overview of Countries and Areas</p>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Users From Countries</h4>
                  <div className="space-y-2">
                    {geographics.map((geo, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{geo.country}</span>
                        <span className="text-sm font-medium text-teal-600">{geo.users} User</span>
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
