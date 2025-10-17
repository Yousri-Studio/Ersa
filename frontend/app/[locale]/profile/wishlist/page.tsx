'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { useCartStore } from '@/lib/cart-store';
import { useWishlistStore } from '@/lib/wishlist-store';

export default function WishlistPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { addItem } = useCartStore();
  const { items: wishlistItems, isLoading, fetchWishlist, removeItem: removeFromWishlistStore } = useWishlistStore();
  
  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, []);
  
  const isEmpty = wishlistItems.length === 0;

  const removeFromWishlist = async (courseId: string) => {
    await removeFromWishlistStore(courseId);
  };

  const addToCart = (item: any) => {
    const title = typeof item.title === 'string' ? item.title : (locale === 'ar' ? item.title?.ar : item.title?.en) || '';
    addItem({
      id: `cart-${item.courseId}`,
      courseId: item.courseId,
      title: title,
      price: item.price,
      currency: item.currency || 'SAR',
      imageUrl: item.imageUrl,
      instructor: item.instructor,
      qty: 1
    });
  };

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-cairo">
              {t('wishlist.title')}
            </h1>
            <p className="mt-2 text-gray-600 font-cairo">
              {t('wishlist.subtitle')}
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="heart" className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-cairo">
                {t('wishlist.empty.title')}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto font-cairo">
                {t('wishlist.empty.description')}
              </p>
              <Link
                href={`/${locale}/courses`}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 font-cairo"
              >
                {t('wishlist.empty.browse-courses')}
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-cairo">
            {t('wishlist.title')}
          </h1>
          <p className="mt-2 text-gray-600 font-cairo">
            {t('wishlist.items-count', { count: wishlistItems.length })}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Wishlist Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const title = typeof item.title === 'string' ? item.title : (locale === 'ar' ? item.title?.ar : item.title?.en) || '';
              const hasDiscount = item.originalPrice && item.originalPrice > item.price;
              
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {/* Course Image */}
                  <div className="relative">
                    <img
                      src={item.imageUrl || '/api/placeholder/300/200'}
                      alt={title}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => removeFromWishlist(item.courseId)}
                      className="absolute top-3 right-3 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                      disabled={isLoading}
                    >
                      <Icon name="heart" className="h-4 w-4 text-red-500" />
                    </button>
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold font-cairo">
                        {Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)}% {t('common.off')}
                      </div>
                    )}
                  </div>
                  
                  {/* Course Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded font-cairo">
                        {item.level || 'Beginner'}
                      </span>
                      {item.rating && (
                        <div className="flex items-center">
                          <Icon name="star" className="h-4 w-4 mr-1" style={{ color: '#FB831D' }} />
                          <span className="text-sm text-gray-600 font-cairo mr-1">{item.rating}</span>
                          <span className="text-sm text-gray-400 font-cairo">({item.studentsCount || 0})</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 font-cairo">
                      {title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 font-cairo">
                      {t('common.by')} {item.instructor || 'Unknown'}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      {item.duration && (
                        <span className="text-sm text-gray-500 font-cairo">{item.duration} {t('common.hours')}</span>
                      )}
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {hasDiscount && (
                          <span className="text-sm text-gray-400 line-through font-cairo">
                            {item.originalPrice} {t('common.currency')}
                          </span>
                        )}
                        <span className="text-lg font-bold text-gray-900 font-cairo">
                          {item.price} {t('common.currency')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => addToCart(item)}
                        className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 font-cairo text-sm inline-flex items-center justify-center"
                        disabled={isLoading}
                      >
                        <Icon name="shopping-cart" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {t('wishlist.add-to-cart')}
                      </button>
                      <Link
                        href={`/${locale}/courses/${item.courseId}`}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 inline-flex items-center justify-center"
                      >
                        <Icon name="eye" className="h-4 w-4 text-gray-600" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Continue Shopping */}
        {!isLoading && (
          <div className="mt-8 text-center">
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200 font-cairo"
            >
              {t('wishlist.continue-shopping')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
