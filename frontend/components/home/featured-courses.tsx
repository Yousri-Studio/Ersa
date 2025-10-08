'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { CourseCard } from '@/components/ui/course-card-new';
import { courseToCardProps } from '@/lib/course-adapter';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { useHydration } from '@/hooks/useHydration';
import { useCourses } from '@/lib/content-hooks';
import toast from 'react-hot-toast';

export function FeaturedCourses() {
  const isHydrated = useHydration();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { hasItem, addItem, items } = useCartStore();

  const { courses, loading: isLoading, error } = useCourses({ featured: true });

  // Handle wishlist toggle
  const handleToggleWishlist = (courseId: string) => {
    if (!isAuthenticated) {
      toast.error(t('auth.login-required') || 'Please login to add items to wishlist');
      router.push(`/${locale}/auth/login`);
      return;
    }
    
    // TODO: Implement actual wishlist API
    toast.success(t('wishlist.item-added') || 'Added to wishlist');
  };

  // Handle add to cart
  const handleAddToCart = (courseId: string) => {
    const course = courses?.find(c => c.id === courseId);
    if (!course) return;

    if (hasItem(courseId)) {
      toast.error(t('cart.item-already-in-cart') || 'Item already in cart');
      return;
    }

    const cartItem = {
      id: `${courseId}-${crypto.randomUUID()}`,
      courseId: courseId,
      sessionId: undefined,
      title: course.title, // This is already the correct format {ar, en}
      price: course.price,
      currency: course.currency,
      qty: 1,
    };

    addItem(cartItem);
    toast.success(t('cart.item-added') || 'Item added to cart');
  };

  // Handle course click
  const handleCourseClick = (slug: string) => {
    router.push(`/${locale}/courses/${slug}`);
  };

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 font-cairo">{t('common.error')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="gradient-text">
            {t('courses.title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {t('courses.subtitle')}
          </p>
        </div>

        {/* Courses Grid */}
        {isLoading || !isHydrated ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CourseCard.Skeleton />
            <CourseCard.Skeleton />
            <CourseCard.Skeleton />
            <CourseCard.Skeleton />
            <CourseCard.Skeleton />
            <CourseCard.Skeleton />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses?.map((course) => {
                const cardProps = courseToCardProps(course, locale as 'ar' | 'en', {
                  inWishlist: false, // TODO: Get from wishlist API
                  inCart: hasItem(course.id),
                  onToggleWishlist: handleToggleWishlist,
                  onAddToCart: handleAddToCart,
                  onClick: handleCourseClick
                });
                
                return (
                  <CourseCard key={course.id} {...cardProps} />
                );
              })}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <Link
                href={`/${locale}/courses`}
                className="group inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200"
              >
                {t('courses.view-all')}
                <Icon 
                  name={locale === 'ar' ? 'arrow-left' : 'arrow-right'} 
                  className={`transition-transform duration-200 ${
                    locale === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                  }`}
                  style={{ height: '1.0rem', width: '1.0rem' }}
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}