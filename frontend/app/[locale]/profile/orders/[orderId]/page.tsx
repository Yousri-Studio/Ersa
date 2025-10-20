'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { ordersApi, type Order } from '@/lib/api';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';
import toast from 'react-hot-toast';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isLoaded = usePageLoad(100);
  const orderId = params?.orderId as string;

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getOrder(orderId);
      setOrder(response.data);
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      if (err.response?.status === 401) {
        setError(t('orders.unauthorized'));
      } else if (err.response?.status === 404) {
        setError(t('orders.not-found'));
      } else {
        setError(t('orders.fetch-error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pendingpayment':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return t('orders.status.paid');
      case 'completed':
        return t('orders.status.completed');
      case 'pending':
      case 'pendingpayment':
        return t('orders.status.pending');
      case 'cancelled':
      case 'canceled':
        return t('orders.status.cancelled');
      case 'failed':
        return t('orders.status.failed');
      default:
        return status;
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (!confirm(t('orders.confirm-cancel'))) {
      return;
    }

    try {
      // TODO: Implement cancel order API call
      toast.success(t('orders.order-cancelled'));
      fetchOrderDetails();
    } catch (error) {
      toast.error(t('orders.cancel-error'));
    }
  };

  const handleContinuePayment = () => {
    if (!order) return;
    // Redirect to checkout with order ID
    router.push(`/${locale}/checkout?orderId=${order.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <>
        <ScrollAnimations />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
              {error || t('orders.not-found')}
            </div>
            <Link
              href={`/${locale}/profile/orders`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-cairo"
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {t('orders.back-to-orders')}
            </Link>
          </div>
        </div>
      </>
    );
  }

  const isPending = order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'pendingpayment';
  const canCancel = isPending;
  const canContinuePayment = isPending;

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen bg-gray-50 py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className={`mb-8 ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <div className="flex items-center mb-4">
              <Link
                href={`/${locale}/profile/orders`}
                className="text-primary-600 hover:text-primary-700 mr-2 rtl:mr-0 rtl:ml-2"
              >
                <Icon name="arrow-left" className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 font-cairo">
                {t('orders.order-details')}
              </h1>
            </div>
          </div>

          {/* Order Details Card */}
          <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            {/* Order Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-cairo">
                    {t('orders.order-number')}
                  </p>
                  <p className="text-lg font-bold text-gray-900 font-cairo">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold font-cairo ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>

            {/* Order Information */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 font-cairo mb-1">
                    {t('orders.order-date')}
                  </p>
                  <p className="text-base font-semibold text-gray-900 font-cairo">
                    {new Date(order.createdAt).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-cairo mb-1">
                    {t('orders.total-amount')}
                  </p>
                  <p className="text-xl font-bold text-primary-600 font-cairo">
                    {order.amount} {order.currency}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-bold text-gray-900 font-cairo mb-4">
                  {t('orders.items')} ({order.items?.length || 0})
                </h2>
                <div className="space-y-4">
                  {order.items && order.items.map((item, index) => {
                    const courseTitle = locale === 'ar' 
                      ? (item.courseTitleAr || item.courseTitleEn || 'Course') 
                      : (item.courseTitleEn || item.courseTitleAr || 'Course');
                    
                    return (
                      <div key={index} className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 font-cairo mb-1">
                            {courseTitle}
                          </p>
                          {item.session && (
                            <p className="text-sm text-gray-600 font-cairo">
                              {t('orders.session')}: {new Date(item.session.startAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                          {item.qty > 1 && (
                            <p className="text-sm text-gray-600 font-cairo">
                              {t('orders.quantity')}: x{item.qty}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-6 rtl:ml-0 rtl:mr-6">
                          <p className="font-bold text-gray-900 font-cairo">
                            {item.price} {item.currency}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-4 mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900 font-cairo">
                    {t('orders.total')}
                  </p>
                  <p className="text-2xl font-bold text-primary-600 font-cairo">
                    {order.amount} {order.currency}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {(canCancel || canContinuePayment) && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  {canCancel && (
                    <button
                      onClick={handleCancelOrder}
                      className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 font-cairo"
                    >
                      <Icon name="times-circle" className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('orders.cancel-order')}
                    </button>
                  )}
                  {canContinuePayment && (
                    <button
                      onClick={handleContinuePayment}
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 font-cairo"
                    >
                      <Icon name="credit-card" className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('orders.continue-payment')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Back to Orders */}
          <div className={`mt-8 text-center ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            <Link
              href={`/${locale}/profile/orders`}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200 font-cairo"
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {t('orders.back-to-orders')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

