'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { usePageLoad, useStaggeredAnimation } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';

// Mock wishlist data - in real app this would come from API/store
const mockWishlistItems = [
  {
    id: '1',
    courseId: 'course-1',
    title: 'دورة التصميم الجرافيكي المتقدمة',
    instructor: 'أحمد محمد',
    price: 299,
    originalPrice: 399,
    imageUrl: '/api/placeholder/300/200',
    rating: 4.8,
    studentsCount: 1250,
    duration: '12 ساعة',
    level: 'متقدم'
  },
  {
    id: '2', 
    courseId: 'course-2',
    title: 'تطوير المواقع بـ React و Next.js',
    instructor: 'سارة أحمد',
    price: 449,
    originalPrice: 599,
    imageUrl: '/api/placeholder/300/200',
    rating: 4.9,
    studentsCount: 890,
    duration: '18 ساعة',
    level: 'متوسط'
  }
];

export default function WishlistPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);
  const isLoaded = usePageLoad(100);
  const { visibleItems: wishlistVisible, setRef: setWishlistRef } = useStaggeredAnimation(wishlistItems, 150);
  
  // For demo purposes, show empty state when user is not authenticated
  const isEmpty = !isAuthenticated || wishlistItems.length === 0;

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(items => items.filter(item => item.id !== itemId));
  };

  const addToCart = (item: any) => {
    addItem({
      id: `cart-${item.courseId}`,
      courseId: item.courseId,
      title: item.title,
      price: item.price,
      currency: item.currency || 'SAR',
      imageUrl: item.imageUrl,
      instructor: item.instructor,
      qty: 1
    });
  };

  if (isEmpty) {
    return (
      <>
        <ScrollAnimations />
        <div className={`relative min-h-screen py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
          {/* Background that extends to top - same as hero section */}
          <div className="absolute inset-0 hero-background" style={{top: '-5rem'}}></div>
          
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Empty State - Matching the design */}
            <div className="p-16 text-center">
              {/* SVG Illustration */}
              <div className={`mx-auto mb-8 w-40 h-40 flex items-center justify-center ${isLoaded ? 'animate-bounce-in' : 'opacity-0'}`}>
                <img 
                  src="/images/Wishlist Empty State.svg" 
                  alt="Empty Wishlist"
                  className="w-full h-full"
                />
              </div>
            
            {/* Title */}
            <h2 className={`text-2xl font-bold text-gray-900 mb-4 font-cairo ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
              {t('wishlist.empty.title')}
            </h2>
            
            {/* Description */}
            <p className={`text-gray-600 mb-8 max-w-md mx-auto font-cairo text-lg ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
              {t('wishlist.empty.description')}
            </p>
            
            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${isLoaded ? 'animate-scale-in stagger-3' : 'opacity-0'}`}>
              {!isAuthenticated ? (
                <>
                  <Link
                    href={`/${locale}/auth/login`}
                    className="inline-flex items-center justify-center w-48 px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 btn-animate font-cairo text-lg"
                  >
                    {t('wishlist.empty.login-required')}
                  </Link>
                  <Link
                    href={`/${locale}`}
                    className="inline-flex items-center justify-center w-48 px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 btn-animate font-cairo text-lg"
                    style={{ backgroundColor: '#292561' }}
                  >
                    {t('wishlist.empty.go-to-home')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={`/${locale}/courses`}
                    className="inline-flex items-center justify-center w-48 px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 btn-animate font-cairo text-lg"
                  >
                    {t('wishlist.empty.browse-courses')}
                  </Link>
                  <Link
                    href={`/${locale}`}
                    className="inline-flex items-center justify-center w-48 px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 btn-animate font-cairo text-lg"
                    style={{ backgroundColor: '#292561' }}
                  >
                    {t('wishlist.empty.go-to-home')}
                  </Link>
                </>
              )}
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
          <div className="mb-8">
            <h1 className={`text-3xl font-bold text-gray-900 font-cairo ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
              {t('wishlist.title')}
            </h1>
            <p className={`mt-2 text-gray-600 font-cairo ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
              {t('wishlist.items-count', { count: wishlistItems.length })}
            </p>
          </div>

          {/* Wishlist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item, index) => (
              <div 
                key={item.id} 
                ref={setWishlistRef(index)}
                className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md scroll-item hover-lift card-animate ${
                  wishlistVisible.has(index) ? 'visible' : ''
                }`}
              >
              {/* Course Image */}
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={typeof item.title === 'string' ? item.title : ''}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                >
                  <Icon name="heart" className="h-4 w-4 text-red-500" />
                </button>
                {item.originalPrice > item.price && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold font-cairo">
                    {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% {t('common.off')}
                  </div>
                )}
              </div>
              
              {/* Course Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded font-cairo">
                    {item.level}
                  </span>
                  <div className="flex items-center">
                    <Icon name="star" className="h-4 w-4 mr-1" style={{ color: '#FB831D' }} />
                    <span className="text-sm text-gray-600 font-cairo mr-1">{item.rating}</span>
                    <span className="text-sm text-gray-400 font-cairo">({item.studentsCount})</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 font-cairo">
                  {typeof item.title === 'string' ? item.title : ''}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 font-cairo">
                  {t('common.by')} {item.instructor}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 font-cairo">{item.duration}</span>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {item.originalPrice > item.price && (
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
                    className="btn-primary flex-1 text-white py-2 px-4 rounded-lg font-semibold btn-animate font-cairo text-sm"
                  >
                    <Icon name="shopping-cart" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    {t('wishlist.add-to-cart')}
                  </button>
                  <Link
                    href={`/courses/${item.courseId}`}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 btn-animate"
                  >
                    <Icon name="eye" className="h-4 w-4 text-gray-600" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className={`mt-8 text-center scroll-item ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
          <Link
            href="/courses"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 btn-animate font-cairo"
          >
            {t('wishlist.continue-shopping')}
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
