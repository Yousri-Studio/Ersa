'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/auth-store';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';
import { useHydration } from '@/hooks/useHydration';

export default function CheckoutFailedPage() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const isHydrated = useHydration();
  const isLoaded = usePageLoad(100);

  const orderId = searchParams?.get('orderId') || null;

  useEffect(() => {
    // Wait for hydration before checking authentication
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }
  }, [isHydrated, isAuthenticated, locale, router]);

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Failed Header */}
          <div className="text-center mb-8">
            <div className={`mb-6 ${isLoaded ? 'animate-bounce-in' : 'opacity-0'}`}>
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="times-circle" className="h-10 w-10 text-red-600" />
              </div>
            </div>
            
            <h1 className={`text-3xl font-bold text-gray-900 font-cairo mb-4 ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
              {locale === 'ar' ? 'فشلت عملية الدفع' : 'Payment Failed'}
            </h1>
            
            <p className={`text-gray-600 font-cairo text-lg ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
              {locale === 'ar' 
                ? 'عذراً، لم نتمكن من معالجة عملية الدفع. لم يتم خصم أي مبلغ من حسابك.'
                : 'Sorry, we were unable to process your payment. No charges have been made to your account.'}
            </p>
          </div>

          {/* Order ID if available */}
          {orderId && (
            <div className={`bg-white rounded-lg shadow-sm p-6 mb-8 ${isLoaded ? 'animate-slide-in-up stagger-3' : 'opacity-0'}`}>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-cairo">
                  {locale === 'ar' ? 'رقم الطلب' : 'Order ID'}
                </span>
                <span className="font-semibold font-cairo text-gray-900">{orderId}</span>
              </div>
            </div>
          )}

          {/* Possible Reasons */}
          <div className={`bg-yellow-50 rounded-lg p-6 mb-8 ${isLoaded ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
            <h3 className="text-lg font-semibold text-yellow-900 mb-3 font-cairo">
              {locale === 'ar' ? 'الأسباب المحتملة' : 'Possible Reasons'}
            </h3>
            <ul className="space-y-2 text-yellow-800 font-cairo">
              <li className="flex items-start">
                <Icon name="exclamation-triangle" className="h-5 w-5 mr-2 ml-2 mt-0.5 flex-shrink-0" />
                {locale === 'ar' 
                  ? 'رصيد غير كافٍ في البطاقة'
                  : 'Insufficient funds in your card'}
              </li>
              <li className="flex items-start">
                <Icon name="exclamation-triangle" className="h-5 w-5 mr-2 ml-2 mt-0.5 flex-shrink-0" />
                {locale === 'ar' 
                  ? 'معلومات البطاقة غير صحيحة'
                  : 'Incorrect card information'}
              </li>
              <li className="flex items-start">
                <Icon name="exclamation-triangle" className="h-5 w-5 mr-2 ml-2 mt-0.5 flex-shrink-0" />
                {locale === 'ar' 
                  ? 'البطاقة منتهية الصلاحية'
                  : 'Card has expired'}
              </li>
              <li className="flex items-start">
                <Icon name="exclamation-triangle" className="h-5 w-5 mr-2 ml-2 mt-0.5 flex-shrink-0" />
                {locale === 'ar' 
                  ? 'تم رفض المعاملة من قبل البنك'
                  : 'Transaction declined by your bank'}
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isLoaded ? 'animate-scale-in stagger-5' : 'opacity-0'}`}>
            <Link
              href={`/${locale}/cart`}
              className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors font-cairo"
            >
              <Icon name="shopping-cart" className="h-5 w-5 mr-2 ml-2" />
              {locale === 'ar' ? 'العودة إلى السلة' : 'Back to Cart'}
            </Link>
            
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors font-cairo"
            >
              <Icon name="graduation-cap" className="h-5 w-5 mr-2 ml-2" />
              {locale === 'ar' ? 'تصفح الدورات' : 'Browse Courses'}
            </Link>
          </div>

          {/* Contact Support */}
          <div className={`mt-8 text-center ${isLoaded ? 'animate-fade-in-up stagger-6' : 'opacity-0'}`}>
            <p className="text-gray-600 font-cairo mb-4">
              {locale === 'ar' 
                ? 'هل تحتاج إلى مساعدة؟'
                : 'Need help?'}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="text-teal-600 hover:text-teal-700 font-semibold font-cairo"
            >
              {locale === 'ar' ? 'اتصل بالدعم الفني' : 'Contact Support'}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

