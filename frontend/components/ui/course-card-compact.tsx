'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { Course } from '@/lib/api';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { useHydration } from '@/lib/use-hydration';
import toast from 'react-hot-toast';

interface CourseCardCompactProps {
  course: Course;
  onAddToWishlist?: (courseId: string) => void;
  onAddToCart?: (courseId: string) => void;
}

export function CourseCardCompact({ course, onAddToWishlist, onAddToCart }: CourseCardCompactProps) {
  const locale = useLocale();
  const t = useTranslations();
  const { isAuthenticated } = useAuthStore();
  const { hasItem, addItem } = useCartStore();
  const isHydrated = useHydration();

  const title = locale === 'ar' ? course.title.ar : course.title.en;
  const summary = locale === 'ar' ? course.summary.ar : course.summary.en;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (hasItem(course.id)) {
      toast.error(isHydrated ? t('cart.item-already-in-cart') : 'Item already in cart');
      return;
    }

    const cartItem = {
      id: `${course.id}-${crypto.randomUUID()}`,
      courseId: course.id,
      sessionId: undefined,
      title: course.title,
      price: course.price,
      currency: course.currency,
      qty: 1,
    };

    addItem(cartItem);
    toast.success(isHydrated ? t('cart.item-added') : 'Item added to cart');
    
    if (onAddToCart) {
      onAddToCart(course.id);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error(isHydrated ? t('auth.login-required') : 'Please login to add items to wishlist');
      return;
    }

    toast.success(isHydrated ? t('wishlist.item-added') : 'Added to wishlist');
    
    if (onAddToWishlist) {
      onAddToWishlist(course.id);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <Link href={`/${locale}/courses/${course.slug}`}>
        {/* Badge */}
        {course.badge && (
          <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
            {isHydrated ? (course.badge === 'Bestseller' ? t('courses.bestseller') : course.badge === 'New' ? t('courses.new') : course.badge) : course.badge}
          </div>
        )}

        {/* Thumbnail */}
        <div className="relative aspect-video w-full bg-gradient-to-br from-blue-100 to-teal-100">
          <Image
            src={course.thumbnailUrl || "/images/Course Place Holder Small.png"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-brand transition-colors duration-200 font-cairo">
            {isHydrated ? title : (course.title.en || course.title.ar)}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
            {isHydrated ? summary : (course.summary.en || course.summary.ar)}
          </p>

          {/* Meta Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {/* Rating */}
              {course.rating && (
                <div className="flex items-center">
                  <Icon name="star" className="h-4 w-4 mr-1" style={{ color: '#FB831D' }} />
                  <span className="font-medium">{course.rating.toFixed(1)}</span>
                </div>
              )}


            </div>

            {/* Price */}
            <div className="text-lg font-bold text-brand font-cairo">
              {course.price} {course.currency}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Wishlist Button */}
            <button
              onClick={handleAddToWishlist}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              title={isHydrated ? t('courses.add-to-wishlist') : 'Add to Wishlist'}
            >
              <Icon icon={['far', 'heart']} className="h-5 w-5" />
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isHydrated && hasItem(course.id)}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isHydrated && hasItem(course.id)
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'btn-primary text-white shadow-md hover:shadow-lg'
              }`}
            >
              <Icon name="shopping-cart" className="h-4 w-4" />
              {isHydrated && hasItem(course.id) ? t('courses.enrolled') : (isHydrated ? t('courses.add-to-cart') : 'Add to Cart')}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
