'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/cart-store';
import { useHydration } from '@/lib/use-hydration';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { usePageLoad, useStaggeredAnimation } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { items, total, currency, removeItem, updateItemQuantity, clearCart } = useCartStore();
  const isHydrated = useHydration();
  const isLoaded = usePageLoad(100);
  const { visibleItems: cartItemsVisible, setRef: setCartItemRef } = useStaggeredAnimation(items, 150);
  
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <>
        <ScrollAnimations />
        <div className={`relative min-h-screen py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
          {/* Background that extends to top - same as hero section */}
          <div className="absolute inset-0 hero-background" style={{top: '-5rem'}}></div>
          
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Empty State - Matching the wishlist design */}
            <div className="p-16 text-center">
              {/* SVG Illustration */}
              <div className={`mx-auto mb-8 w-40 h-40 flex items-center justify-center ${isLoaded ? 'animate-bounce-in' : 'opacity-0'}`}>
                <img 
                  src="/images/search empty state.svg" 
                  alt="Empty Cart"
                  className="w-full h-full"
                />
              </div>
            
            {/* Title */}
            <h2 className={`text-2xl font-bold text-gray-900 mb-4 font-cairo ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
              {t('cart.empty.title')}
            </h2>
            
            {/* Description */}
            <p className={`text-gray-600 mb-8 max-w-md mx-auto font-cairo text-lg ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
              {t('cart.empty.description')}
            </p>
            
            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${isLoaded ? 'animate-scale-in stagger-3' : 'opacity-0'}`}>
              <Link
                href={`/${locale}/courses`}
                className="inline-flex items-center justify-center w-52 min-w-52 px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 btn-animate font-cairo text-lg"
              >
                {t('cart.empty.browse-courses')}
              </Link>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center justify-center w-52 min-w-52 px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 btn-animate font-cairo text-lg"
                style={{ backgroundColor: '#292561' }}
              >
                {t('cart.empty.go-to-home')}
              </Link>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen bg-gray-50 py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold text-gray-900 font-cairo ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
                {t('cart.title')}
              </h1>
              <p className={`mt-2 text-gray-600 font-cairo ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
                {t('cart.items-count', { count: items.reduce((sum, item) => sum + item.qty, 0) })}
              </p>
            </div>
            <button
              onClick={clearCart}
              className={`text-red-600 hover:text-red-700 font-cairo text-sm btn-animate ${isLoaded ? 'animate-slide-in-left stagger-2' : 'opacity-0'}`}
            >
              {t('cart.clear-all')}
            </button>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className={`lg:col-span-2 ${isLoaded ? 'animate-slide-in-right stagger-3' : 'opacity-0'}`}>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 font-cairo">
                  {t('cart.items')}
                </h2>
                
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <div 
                      key={item.id} 
                      ref={setCartItemRef(index)}
                      className={`flex items-center space-x-4 rtl:space-x-reverse border-b border-gray-200 pb-6 last:border-b-0 last:pb-0 scroll-item hover-lift ${
                        cartItemsVisible.has(index) ? 'visible' : ''
                      }`}
                    >
                      {/* Course Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.imageUrl || '/api/placeholder/120/80'}
                          alt={typeof item.title === 'object' ? (locale === 'ar' ? item.title.ar : item.title.en) : item.title}
                          className="h-20 w-30 object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate font-cairo">
                          {typeof item.title === 'object' ? (locale === 'ar' ? item.title.ar : item.title.en) : item.title}
                        </h3>
                        {item.sessionTitle && (
                          <p className="text-sm text-gray-600 font-cairo">
                            {t('cart.session')}: {item.sessionTitle}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 font-cairo">
                          {t('cart.instructor')}: {item.instructor}
                        </p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <button
                          onClick={() => updateItemQuantity(item.id, Math.max(1, item.qty - 1))}
                          className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <Icon name="minus" className="h-3 w-3 text-gray-600" />
                        </button>
                        <span className="text-lg font-semibold text-gray-900 w-8 text-center font-cairo">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.qty + 1)}
                          className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <Icon name="plus" className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 font-cairo">
                          {item.price * item.qty} {currency}
                        </p>
                        {item.qty > 1 && (
                          <p className="text-sm text-gray-500 font-cairo">
                            {item.price} {currency} {t('cart.each')}
                          </p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title={t('cart.remove')}
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-400 hover:text-red-500 p-2"
                          title={t('cart.move-to-wishlist')}
                        >
                          <Icon name="heart" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={`lg:col-span-1 ${isLoaded ? 'animate-slide-in-left stagger-4' : 'opacity-0'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8 hover-lift">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 font-cairo">
                {t('cart.order-summary')}
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600 font-cairo">
                  <span>{t('cart.subtotal')}</span>
                  <span>{total} {currency}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-cairo">
                  <span>{t('cart.tax')}</span>
                  <span>{t('cart.included')}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900 font-cairo">
                    <span>{t('cart.total')}</span>
                    <span>{total} {currency}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <Link
                  href={`/${locale}/checkout`}
                  className="btn-primary w-full text-white py-3 px-4 rounded-lg font-semibold text-center block btn-animate font-cairo"
                >
                  {t('cart.proceed-to-checkout')}
                </Link>
                <Link
                  href={`/${locale}/courses`}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold text-center block hover:bg-gray-200 btn-animate font-cairo"
                >
                  {t('cart.continue-shopping')}
                </Link>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
