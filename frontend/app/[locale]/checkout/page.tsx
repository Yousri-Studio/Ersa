'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { useHydration } from '@/hooks/useHydration';
import { ordersApi, paymentsApi } from '@/lib/api';
import { Icon } from '@/components/ui/icon';

export default function CheckoutPage() {
  const locale = useLocale();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items, total, currency, cartId, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const isHydrated = useHydration();
  const router = useRouter();

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!isHydrated) return;
    
    // Redirect to login if user is not authenticated
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?redirect=/${locale}/checkout`);
    }
  }, [isHydrated, isAuthenticated, router, locale]);

  const handleCheckout = async () => {
    if (!items || items.length === 0) {
      setError(t('checkout.errors.empty-cart'));
      return;
    }

    if (!cartId) {
      setError(t('checkout.errors.cart-id-missing'));
      return;
    }

    // Check if it's a local-only cart (not synced with backend)
    if (cartId.startsWith('local-cart-')) {
      setError(t('checkout.errors.local-cart'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Create the order
      console.log('🛒 Creating order with cartId:', cartId);
      const orderResponse = await ordersApi.createOrder(cartId);
      const { orderId } = orderResponse.data;
      console.log('✅ Order created:', orderId);

      // 2. Create the checkout session for payment
      const returnUrl = `${window.location.origin}/${locale}/checkout/success`;
      console.log('🔗 Payment return URL:', returnUrl);
      
      const checkoutResponse = await paymentsApi.createCheckout({ orderId, returnUrl });
      const { redirectUrl } = checkoutResponse.data;
      console.log('✅ Payment session created, redirecting to:', redirectUrl);

      // 3. Clear the local cart and redirect to payment gateway
      clearCart();
      window.location.href = redirectUrl;

    } catch (err: any) {
      console.error('❌ Checkout failed:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          t('checkout.errors.unexpected');
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Show redirect message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Icon name="spinner" className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{t('checkout.redirecting-to-login')}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 font-cairo">{t('checkout.title')}</h1>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 font-cairo">{t('checkout.order-summary')}</h2>
          
          {items && items.length > 0 ? (
            <div className="space-y-4">
              {items.map(item => {
                const title = typeof item.title === 'object' 
                  ? (locale === 'ar' ? item.title.ar : item.title.en)
                  : item.title;
                
                return (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium font-cairo">{title}</p>
                    </div>
                    <div className={`${locale === 'ar' ? 'ml-4' : 'mr-4'} text-right`}>
                      <p className="font-semibold">
                        {item.price.toFixed(2)} {item.currency}
                      </p>
                      {item.qty > 1 && (
                        <p className="text-sm text-gray-500">
                          x{item.qty}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              
              <hr className="my-4" />
              
              <div className="flex justify-between font-bold text-lg">
                <span className="font-cairo">{t('checkout.total')}</span>
                <span>{total.toFixed(2)} {currency}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 font-cairo">{t('checkout.empty-cart')}</p>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3 font-cairo">{t('checkout.billing-info')}</h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-700">
                <Icon name="user" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                <span className="font-cairo">{user?.fullName}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Icon name="envelope" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                <span className="font-cairo">{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center text-gray-700">
                  <Icon name="phone" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  <span className="font-cairo">{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start">
              <Icon name="exclamation-triangle" className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2 flex-shrink-0 mt-0.5" />
              <span className="font-cairo">{error}</span>
            </div>
          )}

          <button 
            onClick={handleCheckout} 
            disabled={isLoading || !items || items.length === 0}
            className="mt-6 w-full bg-teal-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-cairo text-base shadow-md hover:shadow-lg flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
               <span> <Icon name="spinner" className="h-5 w-5 animate-spin" />
                {t('checkout.processing')}</span>
              </>
            ) : (
              <>
                <span><Icon name="credit-card" className="h-5 w-5" />
                {t('checkout.proceed-to-payment')}</span>
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center text-sm text-gray-500 font-cairo">
            <span>{t('checkout.secure-payment')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

