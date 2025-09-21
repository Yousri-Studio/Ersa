'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/auth-store';
import { ordersApi } from '@/lib/api';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';

export default function CheckoutSuccessPage() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const isLoaded = usePageLoad(100);
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    if (!orderId) {
      setError(t('checkout.success.no-order-id'));
      setIsLoading(false);
      return;
    }

    fetchOrder();
  }, [isAuthenticated, orderId, locale, router, t]);

  const fetchOrder = async () => {
    try {
      const response = await ordersApi.getOrder(orderId!);
      setOrder(response.data);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      setError(t('checkout.success.order-not-found'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4" />
          <p className="text-gray-600 font-cairo">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <ScrollAnimations />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-8">
              <Icon name="exclamation-triangle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 font-cairo mb-2">
                {t('checkout.success.error-title')}
              </h1>
              <p className="text-gray-600 font-cairo">{error}</p>
            </div>
            <Link
              href={`/${locale}/my-orders`}
              className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors font-cairo"
            >
              {t('checkout.success.view-orders')}
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen bg-gray-50 py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className={`mb-6 ${isLoaded ? 'animate-bounce-in' : 'opacity-0'}`}>
              <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <Icon name="check" className="h-10 w-10 text-primary-600" />
              </div>
            </div>
            
            <h1 className={`text-3xl font-bold text-gray-900 font-cairo mb-4 ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
              {t('checkout.success.title')}
            </h1>
            
            <p className={`text-gray-600 font-cairo text-lg ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
              {t('checkout.success.message')}
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <div className={`bg-white rounded-lg shadow-sm p-6 mb-8 ${isLoaded ? 'animate-slide-in-up stagger-3' : 'opacity-0'}`}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 font-cairo">
                {t('checkout.success.order-details')}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-cairo">{t('checkout.success.order-id')}</span>
                  <span className="font-semibold font-cairo">{order.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 font-cairo">{t('checkout.success.amount')}</span>
                  <span className="font-semibold font-cairo">{order.amount} {order.currency}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 font-cairo">{t('checkout.success.status')}</span>
                  <span className={`font-semibold font-cairo ${
                    order.status === 'Paid' ? 'text-primary-600' : 
                    order.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {t(`checkout.success.status-${order.status.toLowerCase()}`)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 font-cairo">{t('checkout.success.date')}</span>
                  <span className="font-semibold font-cairo">
                    {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 font-cairo">
                    {t('checkout.success.courses')}
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900 font-cairo">
                            {typeof item.courseTitle === 'object' 
                              ? (locale === 'ar' ? item.courseTitle.ar : item.courseTitle.en)
                              : item.courseTitle
                            }
                          </p>
                          {item.session && (
                            <p className="text-sm text-gray-600 font-cairo">
                              {t('checkout.success.session')}: {new Date(item.session.startAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900 font-cairo">
                          {item.price} {order.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isLoaded ? 'animate-scale-in stagger-4' : 'opacity-0'}`}>
            <Link
              href={`/${locale}/my-orders`}
              className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors font-cairo"
            >
              <Icon name="list-bullet" className="h-5 w-5 mr-2" />
              {t('checkout.success.view-orders')}
            </Link>
            
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors font-cairo"
            >
              <Icon name="academic-cap" className="h-5 w-5 mr-2" />
              {t('checkout.success.browse-courses')}
            </Link>
          </div>

          {/* Next Steps */}
          <div className={`mt-8 bg-blue-50 rounded-lg p-6 ${isLoaded ? 'animate-fade-in-up stagger-5' : 'opacity-0'}`}>
            <h3 className="text-lg font-semibold text-blue-900 mb-3 font-cairo">
              {t('checkout.success.next-steps')}
            </h3>
            <ul className="space-y-2 text-blue-800 font-cairo">
              <li className="flex items-start">
                <Icon name="envelope" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                {t('checkout.success.email-confirmation')}
              </li>
              <li className="flex items-start">
                <Icon name="calendar" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                {t('checkout.success.course-access')}
              </li>
              <li className="flex items-start">
                <Icon name="question-mark-circle" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                {t('checkout.success.support-help')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
