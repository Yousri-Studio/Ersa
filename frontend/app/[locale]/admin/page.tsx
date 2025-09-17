'use client';

import { useEffect, useState } from 'react';
import { adminApi, DashboardStats, OrderSummary } from '@/lib/admin-api';
import { useHydration } from '@/hooks/useHydration';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '' });
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

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string | number) => {
    // Handle enum values from backend
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'bg-gray-100 text-gray-800'; // New
        case 1: return 'bg-yellow-100 text-yellow-800'; // Pending Payment
        case 2: return 'bg-green-100 text-green-800'; // Paid
        case 3: return 'bg-blue-100 text-blue-800'; // Under Process
        case 4: return 'bg-green-100 text-green-800'; // Processed
        case 5: return 'bg-orange-100 text-orange-800'; // Expired
        case 6: return 'bg-red-100 text-red-800'; // Failed
        case 7: return 'bg-purple-100 text-purple-800'; // Refunded
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Handle string values
    const statusStr = String(status || '').toLowerCase();
    switch (statusStr) {
      case 'new': return 'bg-gray-100 text-gray-800';
      case 'pendingpayment': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'underprocess': return 'bg-blue-100 text-blue-800';
      case 'under process': return 'bg-blue-100 text-blue-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string | number) => {
    // Handle enum values from backend
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'New';
        case 1: return 'Pending Payment';
        case 2: return 'Paid';
        case 3: return 'Under Process';
        case 4: return 'Processed';
        case 5: return 'Expired';
        case 6: return 'Failed';
        case 7: return 'Refunded';
        default: return 'Unknown';
      }
    }
    
    // Handle string values
    const statusStr = status.toString().toLowerCase();
    switch (statusStr) {
      case 'new': return 'New';
      case 'pendingpayment': return 'Pending Payment';
      case 'paid': return 'Paid';
      case 'underprocess': return 'Under Process';
      case 'under process': return 'Under Process';
      case 'processed': return 'Processed';
      case 'expired': return 'Expired';
      case 'failed': return 'Failed';
      case 'refunded': return 'Refunded';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await adminApi.updateOrderStatus(selectedOrder.id, statusForm);
      toast.success('Order status updated successfully');
      setShowStatusModal(false);
      setSelectedOrder(null);
      // Refresh dashboard stats
      const response = await adminApi.getDashboardStats();
      setStats(response.data);
    } catch (error: any) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  const openStatusModal = (order: OrderSummary) => {
    setSelectedOrder(order);
    setStatusForm({
      status: String(order.status),
    });
    setShowStatusModal(true);
  };

  // Use real data from API
  const recentOrders = dashboardStats.recentOrders || [];

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
                        {order.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.courseName || (locale === 'ar' ? 'دورة غير محددة' : 'Course not specified')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.courseType || (locale === 'ar' ? 'أونلاين' : 'Online')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openStatusModal(order)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Update Status"
                          >
                            <Icon name="edit" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              router.push(`/${locale}/admin/orders/${order.id}`);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="View Details"
                          >
                            <Icon name="eye" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Implement download invoice
                              toast('Download invoice functionality coming soon');
                            }}
                            className="text-purple-600 hover:text-purple-900"
                            title="Download Invoice"
                          >
                            <Icon name="download" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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

          {/* Geographic Distribution Section - Hidden as requested */}
          {/* 
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
          */}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Order Status
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}