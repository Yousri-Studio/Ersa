'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { adminApi, AdminOrder, PagedResult } from '@/lib/admin-api';
import { useHydration } from '@/hooks/useHydration';
import toast from 'react-hot-toast';
import { InvoiceModal } from '@/components/invoice/invoice-modal';
import { InvoiceData } from '@/components/invoice/invoice-template';
import { convertOrderToInvoiceData } from '@/lib/invoice-utils';

export default function AdminOrders() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('admin');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    fromDate: '',
    toDate: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: '',
  });
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const isHydrated = useHydration();
  const isRTL = locale === 'ar';

  useEffect(() => {
    if (isHydrated) {
      fetchOrders();
    }
  }, [isHydrated, pagination.page, filters]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getOrders({
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: filters.status || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      });
      
      setOrders(response.data.items);
      setPagination(prev => ({
        ...prev,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
      }));

      if (response.isUsingFallback) {
        toast.error('Using demo data - API connection failed');
      }
    } catch (error: any) {
      toast.error('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await adminApi.updateOrderStatus(selectedOrder.id, statusForm);
      toast.success('Order status updated successfully');
      setShowStatusModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  const openStatusModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setStatusForm({
      status: String(order.status),
    });
    setShowStatusModal(true);
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string | number) => {
    // Debug logging to see what status values we're getting
    console.log('Status value:', status, 'Type:', typeof status, 'Locale:', locale);
    
    // Handle enum values from backend
    if (typeof status === 'number') {
      switch (status) {
        case 0: return locale === 'ar' ? 'جديد' : 'New';
        case 1: return locale === 'ar' ? 'في انتظار الدفع' : 'Pending Payment';
        case 2: return locale === 'ar' ? 'مدفوع' : 'Paid';
        case 3: return locale === 'ar' ? 'قيد المعالجة' : 'Under Process';
        case 4: return locale === 'ar' ? 'تم المعالجة' : 'Processed';
        case 5: return locale === 'ar' ? 'منتهي الصلاحية' : 'Expired';
        case 6: return locale === 'ar' ? 'فشل' : 'Failed';
        case 7: return locale === 'ar' ? 'مسترد' : 'Refunded';
        default: return locale === 'ar' ? 'غير معروف' : 'Unknown';
      }
    }
    
    // Handle string values
    const statusStr = status.toString().toLowerCase().replace(/\s+/g, '');
    switch (statusStr) {
      case 'new': return locale === 'ar' ? 'جديد' : 'New';
      case 'pendingpayment': return locale === 'ar' ? 'في انتظار الدفع' : 'Pending Payment';
      case 'paid': return locale === 'ar' ? 'مدفوع' : 'Paid';
      case 'underprocess': 
      case 'under_process': 
      case 'under process': return locale === 'ar' ? 'قيد المعالجة' : 'Under Process';
      case 'processed': return locale === 'ar' ? 'تم المعالجة' : 'Processed';
      case 'expired': return locale === 'ar' ? 'منتهي الصلاحية' : 'Expired';
      case 'failed': return locale === 'ar' ? 'فشل' : 'Failed';
      case 'refunded': return locale === 'ar' ? 'مسترد' : 'Refunded';
      case 'completed': return locale === 'ar' ? 'مكتمل' : 'Completed';
      case 'pending': return locale === 'ar' ? 'قيد الانتظار' : 'Pending';
      case 'processing': return locale === 'ar' ? 'قيد المعالجة' : 'Processing';
      case 'cancelled': return locale === 'ar' ? 'ملغي' : 'Cancelled';
      default: return locale === 'ar' ? 'غير معروف' : 'Unknown';
    }
  };

  const handleDownloadInvoice = async (order: AdminOrder) => {
    setIsLoadingInvoice(true);
    try {
      console.log('Fetching order details for order:', order.id);
      
      // Fetch detailed order information
      const orderDetailResponse = await adminApi.getOrderDetail(order.id);
      console.log('Order detail response:', orderDetailResponse);
      
      // Ensure we have the data property
      if (!orderDetailResponse.data) {
        throw new Error('No order data received from API');
      }
      
      // Convert to invoice data format
      const invoice = convertOrderToInvoiceData(orderDetailResponse.data);
      console.log('Generated invoice data:', invoice);
      
      // Show invoice modal
      setInvoiceData(invoice);
      setShowInvoiceModal(true);
    } catch (error: any) {
      console.error('Error fetching order details for invoice:', error);
      toast.error(
        locale === 'ar' 
          ? 'فشل في تحميل تفاصيل الطلب للفاتورة' 
          : 'Failed to load order details for invoice'
      );
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  return (
    <div className="space-y-6" style={{maxWidth: '90rem', paddingTop: '50px'}} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('sidebar.orders')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {locale === 'ar' ? 'عرض وإدارة جميع الطلبات في المنصة' : 'View and manage all orders on the platform'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'الحالة' : 'Status'}
            </label>
            <div className="select-wrapper w-full">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{locale === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="Pending">{locale === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                <option value="Processing">{locale === 'ar' ? 'قيد المعالجة' : 'Processing'}</option>
                <option value="Completed">{locale === 'ar' ? 'مكتمل' : 'Completed'}</option>
                <option value="Cancelled">{locale === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                <option value="Failed">{locale === 'ar' ? 'فشل' : 'Failed'}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'من تاريخ' : 'From Date'}
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'إلى تاريخ' : 'To Date'}
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Icon name="search" className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
              {locale === 'ar' ? 'بحث' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Orders ({pagination.totalCount.toLocaleString()})
          </h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 admin-orders">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'رقم الطلب' : 'Order ID'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'العميل' : 'Customer'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'تاريخ الإنشاء' : 'Created'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'تاريخ التحديث' : 'Updated'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>
                    {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Icon name="shopping-cart" className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id.slice(0, 8)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {order.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {order.userId.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {formatDate(order.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                      <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                        <button
                          onClick={() => openStatusModal(order)}
                          className="text-blue-600 hover:text-blue-900"
                          title={locale === 'ar' ? 'تحديث الحالة' : 'Update Status'}
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            router.push(`/${locale}/admin/orders/${order.id}`);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                          title={locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <Icon name="eye" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          disabled={isLoadingInvoice}
                          className="text-secondary-600 hover:text-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={locale === 'ar' ? 'تحميل الفاتورة' : 'Download Invoice'}
                        >
                          {isLoadingInvoice ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary-600"></div>
                          ) : (
                            <Icon name="download" className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {locale === 'ar' ? 'السابق' : 'Previous'}
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className={`${isRTL ? 'mr-3' : 'ml-3'} relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50`}
              >
                {locale === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
            <div className="hidden sm:flex sm:items-center sm:justify-center w-full">
              <div className="flex flex-col items-center space-y-2">
                <p className="text-sm text-gray-700">
                  {locale === 'ar' ? 'عرض' : 'Showing'}{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span>
                  {' '}{locale === 'ar' ? 'إلى' : 'to'}{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
                  </span>
                  {' '}{locale === 'ar' ? 'من' : 'of'}{' '}
                  <span className="font-medium">{pagination.totalCount}</span>
                  {' '}{locale === 'ar' ? 'نتيجة' : 'results'}
                </p>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Icon name={isRTL ? "chevron-right" : "chevron-left"} className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Icon name={isRTL ? "chevron-left" : "chevron-right"} className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {locale === 'ar' ? 'تحديث حالة الطلب' : 'Update Order Status'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <div className="select-wrapper w-full">
                    <select
                      value={statusForm.status}
                      onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pending">{locale === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                      <option value="Processing">{locale === 'ar' ? 'قيد المعالجة' : 'Processing'}</option>
                      <option value="Completed">{locale === 'ar' ? 'مكتمل' : 'Completed'}</option>
                      <option value="Cancelled">{locale === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                      <option value="Failed">{locale === 'ar' ? 'فشل' : 'Failed'}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} ${isRTL ? 'space-x-reverse' : ''} space-x-3 mt-6`}>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {locale === 'ar' ? 'تحديث الحالة' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceData && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false);
            setInvoiceData(null);
          }}
          invoiceData={invoiceData}
        />
      )}
    </div>
  );
}
