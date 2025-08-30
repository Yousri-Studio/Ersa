
'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useHydration } from '@/hooks/useHydration';
import { adminApi, DashboardStats } from '@/lib/admin-api';
import { Icon } from '@/components/ui/icon';
import toast from 'react-hot-toast';

// Fallback stats for demo purposes
const fallbackStats: DashboardStats = {
  totalUsers: 247,
  activeUsers: 189,
  totalCourses: 24,
  activeCourses: 18,
  totalOrders: 156,
  totalRevenue: 45230,
  recentUsers: [
    { id: '1', firstName: 'Ahmed', lastName: 'Ali', email: 'ahmed@example.com', joinedDate: '2024-01-15' },
    { id: '2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com', joinedDate: '2024-01-14' },
    { id: '3', firstName: 'Mohammed', lastName: 'Hassan', email: 'mohammed@example.com', joinedDate: '2024-01-13' },
  ],
  recentOrders: [
    { id: '1', courseName: 'React Development', customerName: 'Ahmed Ali', amount: 299, status: 'Completed', createdAt: '2024-01-15' },
    { id: '2', courseName: 'UI/UX Design', customerName: 'Sarah Johnson', amount: 199, status: 'Processing', createdAt: '2024-01-14' },
    { id: '3', courseName: 'Digital Marketing', customerName: 'Mohammed Hassan', amount: 149, status: 'Completed', createdAt: '2024-01-13' },
  ],
  userGeographics: [
    { country: 'Saudi Arabia', count: 120 },
    { country: 'UAE', count: 68 },
    { country: 'Egypt', count: 45 },
    { country: 'Jordan', count: 14 },
  ]
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isHydrated } = useHydration();
  const locale = useLocale();
  const t = useTranslations('admin');

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
        
        // Only use fallback data if there's a network error, otherwise show the error
        if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
          setStats(fallbackStats);
          toast.error('Network error - Using demo data');
        } else {
          // For authentication or other API errors, don't use fallback data
          toast.error('Failed to load dashboard data: ' + (error.response?.data?.error || error.message));
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isHydrated) {
      fetchStats();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '0',
      change: '+12%',
      changeType: 'positive' as const,
      icon: 'users',
      color: 'blue',
    },
    {
      title: 'Active Courses',
      value: stats?.activeCourses?.toString() || '0',
      change: '+8%',
      changeType: 'positive' as const,
      icon: 'book-open',
      color: 'green',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders?.toLocaleString() || '0',
      change: '+23%',
      changeType: 'positive' as const,
      icon: 'shopping-cart',
      color: 'purple',
    },
    {
      title: 'Revenue',
      value: `${stats?.totalRevenue?.toLocaleString() || '0'} SAR`,
      change: '+15%',
      changeType: 'positive' as const,
      icon: 'dollar-sign',
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Icon name="download" className="h-4 w-4 mr-2" />
            Export Data
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Icon name="plus" className="h-4 w-4 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                card.color === 'blue' ? 'bg-blue-100' :
                card.color === 'green' ? 'bg-green-100' :
                card.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
              }`}>
                <Icon name={card.icon} className={`h-6 w-6 ${
                  card.color === 'blue' ? 'text-blue-600' :
                  card.color === 'green' ? 'text-green-600' :
                  card.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <a href={`/${locale}/admin/orders`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </a>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats?.recentOrders?.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon name="shopping-cart" className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.courseName}</p>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.amount} SAR</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                )) || []}
              </div>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            </div>
            <div className="p-6">
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Icon name="chart-bar" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chart will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                <a href={`/${locale}/admin/users`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </a>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats?.recentUsers?.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon name="user" className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </div>
                  </div>
                )) || []}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <a
                  href={`/${locale}/admin/courses`}
                  className="flex items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <Icon name="plus" className="h-4 w-4 mr-3 text-blue-600" />
                  Add New Course
                </a>
                <a
                  href={`/${locale}/admin/users`}
                  className="flex items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <Icon name="user-plus" className="h-4 w-4 mr-3 text-green-600" />
                  Manage Users
                </a>
                <a
                  href={`/${locale}/admin/content`}
                  className="flex items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <Icon name="edit" className="h-4 w-4 mr-3 text-purple-600" />
                  Edit Content
                </a>
                <a
                  href={`/${locale}/admin/orders`}
                  className="flex items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <Icon name="chart-line" className="h-4 w-4 mr-3 text-orange-600" />
                  View Reports
                </a>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">API Server</span>
                  </div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Database</span>
                  </div>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Email Service</span>
                  </div>
                  <span className="text-sm text-yellow-600">Warning</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">File Storage</span>
                  </div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
