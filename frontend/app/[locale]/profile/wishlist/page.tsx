'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { useCartStore } from '@/lib/cart-store';

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
  const { addItem } = useCartStore();
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);
  const locale = 'ar'; // Default locale for mock data
  
  const isEmpty = wishlistItems.length === 0;

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

          {/* Empty State */}
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
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 font-cairo"
            >
              {t('wishlist.empty.browse-courses')}
            </Link>
          </div>
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

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
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
                    className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 font-cairo text-sm"
                  >
                    <Icon name="shopping-cart" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    {t('wishlist.add-to-cart')}
                  </button>
                  <Link
                    href={`/courses/${item.courseId}`}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Icon name="eye" className="h-4 w-4 text-gray-600" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            href="/courses"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200 font-cairo"
          >
            {t('wishlist.continue-shopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
