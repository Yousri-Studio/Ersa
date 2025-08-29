'use client';

import { useEffect, useState } from 'react';
import { adminApi, DashboardStats } from '@/lib/admin-api';
import { useHydration } from '@/hooks/useHydration';
import toast from 'react-hot-toast';
import { Icon } from '@/components/ui/icon';
import WorldMap from '@/components/ui/world-map';

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isHydrated } = useHydration();

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
        toast.error('Using demo data - API connection failed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
      courseType: 'Online',
      coursePrice: '1200 SAR'
    },
    {
      id: '2',
      studentName: 'Eslam Elsayed',
      courseName: 'Advanced Graphic Design Course',
      orderDate: '01 / 01 / 2025',
      courseType: 'Online',
      coursePrice: '1200 SAR'
    },
    {
      id: '3',
      studentName: 'Eslam Elsayed',
      courseName: 'Advanced Graphic Design Course',
      orderDate: '01 / 01 / 2025',
      courseType: 'Online',
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

  return (
    <div className="space-y-6">
      {/* Error message if API failed */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <Icon name="exclamation-triangle" className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              {error} - Using demo data for display
            </p>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hello 👋
            </h1>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Super Admin
            </h2>
            <p className="text-gray-600">
              from here you can manage all content, orders and everything
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="users" className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalCourses}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="graduation-cap" className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="shopping-cart" className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardStats.totalRevenue)}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="chart-line" className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-600">Overview of orders and recent activity</p>
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
                    <button className="text-gray-400 hover:text-gray-600">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <p className="text-sm text-gray-600">Overview of Users and Recently Joined</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Icon name="user" className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">{user.date}</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Icon name="ellipsis-v" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Geographics</h3>
            <p className="text-sm text-gray-600">Overview of Countries and Areas</p>
          </div>
          <div className="p-6">
            <div className="flex items-start space-x-6">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Users From Countries</h4>
                <div className="space-y-2">
                  {geographics.map((geo, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{geo.country}</span>
                      <span className="text-sm font-medium text-gray-900">{geo.users} User</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="h-48">
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
