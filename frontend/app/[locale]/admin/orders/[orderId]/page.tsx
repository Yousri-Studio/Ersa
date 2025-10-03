'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { adminApi } from '@/lib/admin-api';
import type { AdminOrderDetail } from '@/lib/admin-api';
import { useHydration } from '@/hooks/useHydration';
import toast from 'react-hot-toast';

export default function AdminOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string | undefined;
  const [orderDetail, setOrderDetail] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated && orderId) {
      fetchOrderDetail();
    }
  }, [isHydrated, orderId]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const fetchOrderDetail = async () => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await adminApi.getOrderDetail(orderId);
      setOrderDetail(response.data);

      if (response.isUsingFallback) {
        toast.error('Using demo data - API connection failed');
      }
    } catch (error: any) {
      toast.error('Failed to load order details');
      console.error('Error fetching order detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
        case 2: return 'bg-primary-100 text-primary-800'; // Paid
        case 3: return 'bg-blue-100 text-blue-800'; // Under Process
        case 4: return 'bg-primary-100 text-primary-800'; // Processed
        case 5: return 'bg-orange-100 text-orange-800'; // Expired
        case 6: return 'bg-red-100 text-red-800'; // Failed
        case 7: return 'bg-secondary-100 text-secondary-800'; // Refunded
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Handle string values
    const statusStr = String(status || '').toLowerCase();
    switch (statusStr) {
      case 'new': return 'bg-gray-100 text-gray-800';
      case 'pendingpayment': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-primary-100 text-primary-800';
      case 'underprocess': return 'bg-blue-100 text-blue-800';
      case 'processed': return 'bg-primary-100 text-primary-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-secondary-100 text-secondary-800';
      case 'completed': return 'bg-primary-100 text-primary-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
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
      case 'processed': return 'Processed';
      case 'expired': return 'Expired';
      case 'failed': return 'Failed';
      case 'refunded': return 'Refunded';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'cancelled': return 'Cancelled';
      case 'unpaid': return 'Unpaid';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Order not found</h2>
        <p className="text-gray-500 mt-2">The order you're looking for doesn't exist.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{maxWidth: '90rem', paddingTop: '50px'}}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <Icon name="arrow-left" className="h-5 w-5 mr-2" />
            Back to Orders
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetail.status)}`}>
            {getStatusLabel(orderDetail.status)}
          </span>
        </div>
      </div>

      {/* Order Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{orderDetail.id.slice(0, 8)}
          </h1>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(orderDetail.amount)}
            </div>
            <div className="text-sm text-gray-500">
              {orderDetail.currency}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Order ID</h3>
            <p className="text-sm text-gray-900 font-mono">{orderDetail.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
            <p className="text-sm text-gray-900">{formatDate(orderDetail.createdAt)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
            <p className="text-sm text-gray-900">{formatDate(orderDetail.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Full Name</h3>
            <p className="text-sm text-gray-900">{orderDetail.customer.fullName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
            <p className="text-sm text-gray-900">{orderDetail.customer.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Phone</h3>
            <p className="text-sm text-gray-900">{orderDetail.customer.phone || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Country</h3>
            <p className="text-sm text-gray-900">{orderDetail.customer.country || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Language</h3>
            <p className="text-sm text-gray-900">{orderDetail.customer.locale === 'ar' ? 'Arabic' : 'English'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Since</h3>
            <p className="text-sm text-gray-900">{formatDate(orderDetail.customer.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderDetail.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.courseTitleEn}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.courseTitleAr}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.qty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.price * item.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-end">
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Amount</div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(orderDetail.amount)}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
        {orderDetail.payments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No payment information available</p>
        ) : (
          <div className="space-y-4">
            {orderDetail.payments.map((payment) => (
              <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Icon name="credit-card" className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.provider}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.providerRef || 'No reference'}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {getStatusLabel(payment.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <div className="font-medium">{formatDate(payment.createdAt)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Updated:</span>
                    <div className="font-medium">{formatDate(payment.updatedAt)}</div>
                  </div>
                  {payment.capturedAt && (
                    <div>
                      <span className="text-gray-500">Captured:</span>
                      <div className="font-medium">{formatDate(payment.capturedAt)}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
