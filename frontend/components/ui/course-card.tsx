'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { Course } from '@/lib/api';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { useHydration } from '@/lib/use-hydration';
import toast from 'react-hot-toast';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const locale = useLocale();
  const t = useTranslations();
  const { isAuthenticated } = useAuthStore();
  const { hasItem, addItem } = useCartStore();
  const isHydrated = useHydration();

  const title = locale === 'ar' ? course.title.ar : course.title.en;
  const summary = locale === 'ar' ? course.summary.ar : course.summary.en;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (hasItem(course.id)) {
      toast.error(isHydrated ? t('cart.item-already-in-cart') : 'Item already in cart');
      return;
    }

    // For live courses, we might need to select a session
    // For now, we'll add without a session
    const cartItem = {
      id: `${course.id}-${crypto.randomUUID()}`, // Use crypto.randomUUID for consistent IDs
      courseId: course.id,
      sessionId: undefined,
      title: course.title,
      price: course.price,
      currency: course.currency,
      qty: 1,
    };

    addItem(cartItem);
    toast.success(isHydrated ? t('cart.item-added') : 'Item added to cart');
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error(isHydrated ? t('auth.login-required') : 'Please login to add items to wishlist');
      return;
    }

    // TODO: Implement wishlist functionality
    toast.success(isHydrated ? t('wishlist.item-added') : 'Added to wishlist');
  };

  return (
    <div className="relative group perspective-1000">
      <div className="relative transform transition-all duration-300 group-hover:scale-105 preserve-3d">
        {/* 3D Card Container */}
        <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl overflow-hidden">
          {/* 3D Effect Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 transform translate-x-2 translate-y-2 rounded-2xl -z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-400 transform translate-x-4 translate-y-4 rounded-2xl -z-20"></div>

          <Link href={`/${locale}/courses/${course.slug}`} className="block">
            {/* Course Icon/Image */}
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                {course.photo || course.thumbnailUrl ? (
                  <img
                    src={course.photo || course.thumbnailUrl}
                    alt={title}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <img
                    src="/images/Course Place Holder Small.png"
                    alt={title}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                )}
              </div>
              
              {/* Course Type Badge */}
              <span className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full mb-4">
                {isHydrated ? (course.type === 1 ? t('courses.live') : t('courses.pdf')) : (course.type === 1 ? 'Live' : 'PDF')}
              </span>

              {/* Course Title */}
              <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                {isHydrated ? title : (course.title.en || course.title.ar)}
              </h3>

              {/* Course Summary */}
              <p className="text-blue-100 text-sm mb-6 line-clamp-2 leading-relaxed">
                {isHydrated ? summary : (course.summary.en || course.summary.ar)}
              </p>

              {/* Course Meta */}
              <div className="flex items-center justify-center gap-4 mb-6 text-blue-100 text-sm">
                {course.type === 1 && course.sessions && course.sessions.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Icon name="clock" className="h-4 w-4" />
                    <span>
                      {new Date(course.sessions[0].startAt).toLocaleDateString(locale)}
                    </span>
                  </div>
                )}
                

              </div>

              {/* Price */}
              <div className="text-2xl font-bold text-white mb-6">
                {course.price} {isHydrated ? t('courses.price') : course.currency}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleAddToCart}
                  disabled={isHydrated && hasItem(course.id)}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isHydrated && hasItem(course.id)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  <Icon name="shopping-cart" className="h-4 w-4" />
                  {isHydrated && hasItem(course.id) ? t('courses.enrolled') : (isHydrated ? t('courses.add-to-cart') : 'Add to Cart')}
                </button>

                <button
                  onClick={handleAddToWishlist}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-white/20 text-white hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
                >
                  <Icon icon={['far', 'heart']} className="h-4 w-4" />
                  {isHydrated ? t('courses.add-to-wishlist') : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </Link>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-4 w-6 h-6 bg-white/10 rounded-full transform -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
}