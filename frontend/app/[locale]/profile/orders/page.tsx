'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { ordersApi, type Order } from '@/lib/api';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';

export default function OrdersPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isLoaded = usePageLoad(100);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getUserOrders();
      setOrders(response.data);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      if (err.response?.status === 401) {
        setError(t('orders.unauthorized'));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isEmpty = orders.length === 0;

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen bg-gray-50 py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className={`mb-8 ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <div className="flex items-center mb-4">
              <Link
                href={`/${locale}/profile`}
                className="text-primary-600 hover:text-primary-700 mr-2 rtl:mr-0 rtl:ml-2"
              >
                <Icon name="arrow-left" className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 font-cairo">
                {t('orders.title')}
              </h1>
            </div>
            <p className="text-gray-600 font-cairo">
              {t('orders.subtitle')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-cairo">
              {error}
            </div>
          )}

          {/* Empty State */}
          {isEmpty && !error ? (
            <div className={`bg-white rounded-lg shadow-sm p-12 text-center ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="shopping-bag" className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-cairo">
                {t('orders.empty.title')}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto font-cairo">
                {t('orders.empty.description')}
              </p>
              <Link
                href={`/${locale}/courses`}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 font-cairo"
              >
                {t('orders.empty.browse-courses')}
              </Link>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 ${
                    isLoaded ? `animate-fade-in-up stagger-${index % 3 + 1}` : 'opacity-0'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 font-cairo">
                          {t('orders.order-number', { number: order.id.substring(0, 8).toUpperCase() })}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold font-cairo ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-cairo">
                        {t('orders.placed-on', {
                          date: new Date(order.createdAt).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                        })}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 text-left md:text-right">
                      <p className="text-2xl font-bold text-gray-900 font-cairo">
                        {order.amount} {order.currency}
                      </p>
                      <p className="text-sm text-gray-600 font-cairo">
                        {order.items?.length || 0} {t('orders.items')}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="space-y-3">
                        {order.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 font-cairo">
                                {locale === 'ar' ? item.title.ar : item.title.en}
                              </p>
                              {item.session && (
                                <p className="text-sm text-gray-600 font-cairo">
                                  {t('orders.session')}: {new Date(item.session.startAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4 rtl:ml-0 rtl:mr-4">
                              <p className="font-semibold text-gray-900 font-cairo">
                                {item.price} {item.currency}
                              </p>
                              {item.qty > 1 && (
                                <p className="text-sm text-gray-600 font-cairo">
                                  x{item.qty}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t border-gray-200 pt-4 mt-4 flex justify-end space-x-3 rtl:space-x-reverse">
                    <Link
                      href={`/${locale}/profile/orders/${order.id}`}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-cairo font-semibold"
                    >
                      <Icon name="eye" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('orders.view-details')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Back to Profile */}
          {!isEmpty && (
            <div className={`mt-8 text-center ${isLoaded ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
              <Link
                href={`/${locale}/profile`}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200 font-cairo"
              >
                <Icon name="arrow-left" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {t('orders.back-to-profile')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

