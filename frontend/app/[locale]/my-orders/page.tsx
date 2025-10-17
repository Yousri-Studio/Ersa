'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/auth-store';
import { useHydration } from '@/hooks/useHydration';
import { ordersApi, paymentsApi } from '@/lib/api';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';

interface OrderItem {
  courseId: string;
  courseTitleEn: string;
  courseTitleAr: string;
  sessionId?: string;
  session?: {
    id: string;
    title: { ar: string; en: string };
    startAt: string;
    endAt: string;
  };
  price: number;
  currency: string;
  qty: number;
}

interface MyOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const isHydrated = useHydration();
  const isLoaded = usePageLoad(100);
  
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Track which button is loading

  useEffect(() => {
    if (!isHydrated) return;
    
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?redirect=/${locale}/my-orders`);
      return;
    }

    fetchOrders();
  }, [isHydrated, isAuthenticated, locale, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('📦 Fetching user orders...');
      const response = await ordersApi.getUserOrders();
      console.log('✅ Orders fetched:', response.data);
      setOrders((response.data as unknown as MyOrder[]) || []);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error fetching orders:', err);
      setError(err.response?.data?.error || t('orders.error.fetch-failed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePayOrder = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      console.log('💳 Resuming payment for order:', orderId);
      
      const returnUrl = `${window.location.origin}/${locale}/checkout/success`;
      const response = await paymentsApi.createCheckout({ orderId, returnUrl });
      
      console.log('✅ Payment session created, redirecting...');
      window.location.href = response.data.redirectUrl;
    } catch (err: any) {
      console.error('❌ Error creating payment:', err);
      alert(err.response?.data?.error || t('orders.error.payment-failed'));
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(t('orders.confirm.cancel'))) {
      return;
    }

    try {
      setActionLoading(orderId);
      console.log('🚫 Cancelling order:', orderId);
      
      await ordersApi.cancelOrder(orderId);
      
      console.log('✅ Order cancelled');
      // Refresh orders list
      await fetchOrders();
      setActionLoading(null);
    } catch (err: any) {
      console.error('❌ Error cancelling order:', err);
      alert(err.response?.data?.error || t('orders.error.cancel-failed'));
      setActionLoading(null);
    }
  };

  const handleViewInvoice = (orderId: string) => {
    console.log('📄 Opening invoice for order:', orderId);
    // Open invoice in new tab
    window.open(`/${locale}/orders/${orderId}/invoice`, '_blank');
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'paid':
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'pendingpayment':
      case 'new':
      case 'underprocess':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    return t(`orders.status.${statusLower}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      locale === 'ar' ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const canPay = (status: string) => {
    const statusLower = status.toLowerCase();
    return statusLower === 'pendingpayment' || statusLower === 'new' || statusLower === 'failed';
  };

  const canCancel = (status: string) => {
    const statusLower = status.toLowerCase();
    return statusLower === 'pendingpayment' || statusLower === 'new';
  };

  const canViewInvoice = (status: string) => {
    const statusLower = status.toLowerCase();
    return statusLower === 'paid' || statusLower === 'processed';
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-cairo">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen bg-gray-50 py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className={`mb-8 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-3xl font-bold text-gray-900 font-cairo">
              {t('orders.title')}
            </h1>
            <p className="mt-2 text-gray-600 font-cairo">
              {t('orders.subtitle')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <Icon name="exclamation-triangle" className="h-5 w-5 text-red-500 mr-2 rtl:mr-0 rtl:ml-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 font-cairo">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="mb-6">
                <Icon name="shopping-cart" className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 font-cairo mb-2">
                {t('orders.empty.title')}
              </h3>
              <p className="text-gray-600 font-cairo mb-6">
                {t('orders.empty.description')}
              </p>
              <Link
                href={`/${locale}/courses`}
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors font-cairo"
              >
                <Icon name="academic-cap" className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
                {t('orders.empty.browse-courses')}
              </Link>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-6">
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  className={`bg-white rounded-lg shadow-sm overflow-hidden ${isLoaded ? 'animate-slide-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 font-cairo">
                            {t('orders.order-id')}: #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 font-cairo mt-1">
                          {t('orders.placed-on')}: {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {order.amount.toFixed(2)} {order.currency}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4">
                    <h4 className="text-sm font-semibold text-gray-700 font-cairo mb-3">
                      {t('orders.items')}:
                    </h4>
                    <div className="space-y-3">
                      {order.items.map((item, itemIndex) => {
                        const courseTitle = locale === 'ar' ? item.courseTitleAr : item.courseTitleEn;
                        return (
                          <div key={itemIndex} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 font-cairo">
                                {courseTitle}
                              </p>
                              {item.session && (
                                <p className="text-sm text-gray-500 font-cairo mt-1">
                                  {t('orders.session')}: {new Date(item.session.startAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                </p>
                              )}
                              {item.qty > 1 && (
                                <p className="text-sm text-gray-500 font-cairo">
                                  {t('orders.quantity')}: {item.qty}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4 rtl:ml-0 rtl:mr-4">
                              <p className="font-semibold text-gray-900">
                                {item.price.toFixed(2)} {item.currency}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                      {/* Pay Button - for pending/failed orders */}
                      {canPay(order.status) && (
                        <button
                          onClick={() => handlePayOrder(order.id)}
                          disabled={actionLoading === order.id}
                          className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-cairo"
                        >
                          {actionLoading === order.id ? (
                            <>
                              <Icon name="spinner" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 animate-spin" />
                              {t('orders.actions.processing')}
                            </>
                          ) : (
                            <>
                              <Icon name="credit-card" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                              {t('orders.actions.pay-now')}
                            </>
                          )}
                        </button>
                      )}

                      {/* Cancel Button - for pending orders */}
                      {canCancel(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={actionLoading === order.id}
                          className="inline-flex items-center justify-center px-4 py-2 bg-white text-red-600 border border-red-600 font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-cairo"
                        >
                          {actionLoading === order.id ? (
                            <>
                              <Icon name="spinner" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 animate-spin" />
                              {t('orders.actions.processing')}
                            </>
                          ) : (
                            <>
                              <Icon name="times" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                              {t('orders.actions.cancel')}
                            </>
                          )}
                        </button>
                      )}

                      {/* View Invoice Button - for paid orders */}
                      {canViewInvoice(order.status) && (
                        <button
                          onClick={() => handleViewInvoice(order.id)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-white text-teal-600 border border-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors font-cairo"
                        >
                          <Icon name="file-text" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                          {t('orders.actions.view-invoice')}
                        </button>
                      )}

                      {/* View Details Link */}
                      <Link
                        href={`/${locale}/my-orders/${order.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition-colors font-cairo"
                      >
                        <Icon name="eye" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {t('orders.actions.view-details')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
