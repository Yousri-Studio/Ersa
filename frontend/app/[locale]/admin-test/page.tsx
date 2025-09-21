'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import WorldMap from '@/components/ui/world-map';
import Image from 'next/image';

// Mock data for testing
const mockStats = {
  totalUsers: 20,
  activeUsers: 18,
  totalCourses: 20,
  activeCourses: 18,
  totalOrders: 120,
  totalRevenue: 24000,
  recentUsers: [],
  recentOrders: [],
  userGeographics: [
    { country: 'Saudi Arabia', users: 20, coordinates: [45.0792, 23.8859] as [number, number] },
    { country: 'Egypt', users: 20, coordinates: [30.8025, 26.8206] as [number, number] },
    { country: 'United States', users: 20, coordinates: [-95.7129, 37.0902] as [number, number] },
    { country: 'United Kingdom', users: 20, coordinates: [-0.1278, 51.5074] as [number, number] }
  ]
};

export default function AdminTestDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Mock data for demonstration
  const recentOrders = [
    {
      id: '1',
      studentName: 'Eslam Elsayed',
      courseName: 'Advanced Graphic Design Course',
      orderDate: '01/01/2025',
      courseType: 'Online',
      coursePrice: '1200 SAR'
    },
    {
      id: '2',
      studentName: 'Eslam Elsayed',
      courseName: 'Advanced Graphic Design Course',
      orderDate: '01/01/2025',
      courseType: 'Online',
      coursePrice: '1200 SAR'
    },
    {
      id: '3',
      studentName: 'Eslam Elsayed',
      courseName: 'Advanced Graphic Design Course',
      orderDate: '01/01/2025',
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

  const geographics = mockStats.userGeographics;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 fixed inset-y-0 bg-white border-r border-gray-200">
          <div className="h-full flex flex-col">
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
              <div className="flex items-center px-3 py-3 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 border-r-2 border-blue-500">
                <Icon name="chart-line" className="mr-3 h-5 w-5 text-blue-600" />
                Dashboard
              </div>
              <div className="flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <Icon name="edit" className="mr-3 h-5 w-5 text-gray-400" />
                Content Management
              </div>
              <div className="flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <Icon name="users" className="mr-3 h-5 w-5 text-gray-400" />
                Manage Users
              </div>
              <div className="flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <Icon name="graduation-cap" className="mr-3 h-5 w-5 text-gray-400" />
                Manage Courses
              </div>
              <div className="flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <Icon name="shopping-cart" className="mr-3 h-5 w-5 text-gray-400" />
                Orders
              </div>
              <div className="flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <Icon name="cog" className="mr-3 h-5 w-5 text-gray-400" />
                Settings
              </div>
            </nav>

            {/* Logout Button */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors">
                <Icon name="power-off" className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="pl-64 flex-1">
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-6">
                {/* Welcome Header */}
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold text-gray-700 mb-1">
                    Hello 👋
                  </h1>
                  <h2 className="text-xl font-bold text-primary-600 mb-1">
                    Super Admin
                  </h2>
                  <p className="text-gray-600 text-sm">
                    from here you can manage all content, orders and everything
                  </p>
                </div>

                {/* Dashboard Overview Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Dashboard</h3>
                  <p className="text-gray-600 text-sm mb-6">Overview of your platform's performance and recent activity</p>
                  
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 mb-1">{mockStats.totalUsers}</p>
                          <p className="text-sm font-medium text-gray-600">Total Users</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200">
                          <Icon name="users" className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 mb-1">{mockStats.totalCourses}</p>
                          <p className="text-sm font-medium text-gray-600">Total Courses</p>
                        </div>
                        <div className="h-12 w-12 bg-primary-50 rounded-full flex items-center justify-center border-2 border-primary-200">
                          <Icon name="desktop" className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 mb-1">{mockStats.totalOrders}</p>
                          <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        </div>
                        <div className="h-12 w-12 bg-secondary-50 rounded-full flex items-center justify-center border-2 border-secondary-200">
                          <Icon name="shopping-cart" className="h-6 w-6 text-secondary-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(mockStats.totalRevenue)}</p>
                          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        </div>
                        <div className="h-12 w-12 bg-yellow-50 rounded-full flex items-center justify-center border-2 border-yellow-200">
                          <Icon name="chart-line" className="h-6 w-6 text-yellow-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-700 mb-1">Recent Orders</h3>
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
                      <h3 className="text-xl font-semibold text-gray-700 mb-1">Recent Users</h3>
                      <p className="text-gray-600 text-sm">Overview of Users and Recently Joined</p>
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
                      <h3 className="text-xl font-semibold text-gray-700 mb-1">Geographics</h3>
                      <p className="text-gray-600 text-sm">Overview of Countries and Areas</p>
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
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
