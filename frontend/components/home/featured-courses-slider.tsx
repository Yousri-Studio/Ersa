'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { coursesApi, Course } from '@/lib/api';
import { CourseCard } from '@/components/ui/course-card-new';
import { courseToCardProps } from '@/lib/course-adapter';
import { useCartStore } from '@/lib/cart-store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useAuthStore } from '@/lib/auth-store';
import { useHydration } from '@/hooks/useHydration';
import toast from 'react-hot-toast';

export function FeaturedCoursesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isHydrated = useHydration();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { hasItem, addItem } = useCartStore();
  const wishlistStore = useWishlistStore();
  const hasWishlistItem = wishlistStore.hasItem;
  const addWishlistItem = wishlistStore.addItem;
  const removeWishlistItem = wishlistStore.removeItem;

  const { data: apiCourses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['featured-courses', locale],
    queryFn: () => coursesApi.getCourses().then(res => res.data.filter(course => course.isFeatured).slice(0, 12)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry once
    retryDelay: 1000, // Wait 1 second before retry
  });

  // Handle query errors
  if (error) {
    console.warn('Failed to fetch featured courses from API, using mock data:', error.message);
  }

  // Mock data for development when API returns empty
  const mockCourses: Course[] = [
    {
      id: '1',
      slug: 'project-management-fundamentals',
      title: { 
        ar: 'أساسيات إدارة المشاريع', 
        en: 'Project Management Fundamentals' 
      },
      summary: { 
        ar: 'تعلم المبادئ الأساسية لإدارة المشاريع وتطبيق أفضل الممارسات في بيئة العمل',
        en: 'Learn the fundamental principles of project management and apply best practices in the workplace' 
      },
      price: 1200,
      currency: 'SAR',
      type: 1, // 1 = Live
      category: 1, // 1 = Business
      isActive: true,
      isFeatured: true,
      rating: 4.8,
      badge: 'Bestseller',
      thumbnailUrl: ''
    },
    {
      id: '2',
      slug: 'digital-marketing-strategy',
      title: { 
        ar: 'استراتيجية التسويق الرقمي', 
        en: 'Digital Marketing Strategy' 
      },
      summary: { 
        ar: 'اكتشف أحدث استراتيجيات التسويق الرقمي وطرق الوصول للعملاء المستهدفين',
        en: 'Discover the latest digital marketing strategies and ways to reach target customers' 
      },
      price: 950,
      currency: 'SAR',
      type: 0, // 0 = PDF
      category: 1, // 1 = Business
      isActive: true,
      isFeatured: true,
      rating: 4.6,
      badge: 'Bestseller',
      thumbnailUrl: ''
    },
    {
      id: '3',
      slug: 'leadership-development',
      title: { 
        ar: 'تطوير القيادة', 
        en: 'Leadership Development' 
      },
      summary: { 
        ar: 'طور مهاراتك القيادية وتعلم كيفية إدارة الفرق بفعالية وتحقيق النتائج المرجوة',
        en: 'Develop your leadership skills and learn how to manage teams effectively and achieve desired results' 
      },
      price: 1500,
      currency: 'SAR',
      type: 1, // 1 = Live
      category: 1, // 1 = Business
      isActive: true,
      isFeatured: true,
      rating: 4.9,
      badge: 'Bestseller',
      thumbnailUrl: ''
    },
    {
      id: '4',
      slug: 'data-analysis-excel',
      title: { 
        ar: 'تحليل البيانات باستخدام Excel', 
        en: 'Data Analysis with Excel' 
      },
      summary: { 
        ar: 'تعلم تحليل البيانات المتقدم باستخدام Excel وإنشاء التقارير التفاعلية',
        en: 'Learn advanced data analysis using Excel and create interactive reports' 
      },
      price: 800,
      currency: 'SAR',
      type: 0, // 0 = PDF
      category: 2, // 2 = Programming
      isActive: true,
      isFeatured: true,
      rating: 4.5,
      badge: 'Bestseller',
      thumbnailUrl: ''
    },
    {
      id: '5',
      slug: 'customer-service-excellence',
      title: { 
        ar: 'التميز في خدمة العملاء', 
        en: 'Customer Service Excellence' 
      },
      summary: { 
        ar: 'احترف فن التعامل مع العملاء وتقديم خدمة متميزة تفوق توقعاتهم',
        en: 'Master the art of dealing with customers and providing excellent service that exceeds their expectations' 
      },
      price: 700,
      currency: 'SAR',
      type: 1, // 1 = Live
      category: 1, // 1 = Business
      isActive: true,
      isFeatured: true,
      rating: 4.7,
      badge: 'Bestseller',
      thumbnailUrl: ''
    },
    {
      id: '6',
      slug: 'financial-planning-basics',
      title: { 
        ar: 'أساسيات التخطيط المالي', 
        en: 'Financial Planning Basics' 
      },
      summary: { 
        ar: 'تعلم أساسيات التخطيط المالي الشخصي والاستثمار الذكي لمستقبل مالي مستقر',
        en: 'Learn the basics of personal financial planning and smart investing for a stable financial future' 
      },
      price: 900,
      currency: 'SAR',
      type: 0, // 0 = PDF
      category: 1, // 1 = Business
      isActive: true,
      isFeatured: true,
      rating: 4.4,
      badge: 'Bestseller',
      thumbnailUrl: ''
    }
  ];

  // Use mock data if API fails, returns empty, or is loading
  // Always show mock courses to ensure featured section displays properly
  const courses: Course[] = (apiCourses && Array.isArray(apiCourses) && apiCourses.length > 0 && !error && !isLoading) ? 
    apiCourses : mockCourses;

  // Handler functions
  const handleToggleWishlist = (courseId: string) => {
    if (!isAuthenticated) {
      toast.error(t('auth.login-required') || 'Please login to add items to wishlist');
      router.push(`/${locale}/auth/login`);
      return;
    }
    
    const course = courses?.find((c: Course) => c.id === courseId);
    if (!course) return;

    if (hasWishlistItem(courseId)) {
      removeWishlistItem(courseId);
      toast.success(t('wishlist.item-removed') || 'Removed from wishlist');
    } else {
      const wishlistItem = {
        id: courseId,
        courseId: courseId,
        title: course.title,
        price: course.price,
        currency: course.currency,
        imageUrl: course.thumbnailUrl,
        instructor: course.instructor?.name
      };
      addWishlistItem(wishlistItem);
      toast.success(t('wishlist.item-added') || 'Added to wishlist');
    }
  };

  const handleAddToCart = (courseId: string) => {
    const course = courses?.find((c: Course) => c.id === courseId);
    if (!course) return;

    if (hasItem(courseId)) {
      toast.error(t('cart.item-already-in-cart') || 'Item already in cart');
      return;
    }

    const cartItem = {
      id: `${courseId}-${crypto.randomUUID()}`,
      courseId: courseId,
      sessionId: undefined,
      title: course.title,
      price: course.price,
      currency: course.currency,
      qty: 1,
    };

    addItem(cartItem);
    toast.success(t('cart.item-added') || 'Item added to cart');
  };

  const handleCourseClick = (slug: string) => {
    router.push(`/${locale}/courses/${slug}`);
  };

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  };

  // Calculate total slides based on screen size
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getItemsPerView = () => {
    if (isMobile) return itemsPerView.mobile;
    if (isTablet) return itemsPerView.tablet;
    return itemsPerView.desktop;
  };

  // Ensure multiple slides exist on mobile even if API returns few courses
  const sliderCourses: Course[] = (isMobile && courses && courses.length > 0 && courses.length < 4)
    ? Array.from({ length: Math.max(4, courses.length * 2) }, (_, i) => courses[i % courses.length])
    : courses;

  const totalSlides = sliderCourses ? Math.ceil(sliderCourses.length / getItemsPerView()) : 0;

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying || !courses || courses.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= totalSlides - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides, courses]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex <= 0 ? totalSlides - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex >= totalSlides - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  };

  // Handle drag/swipe
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Touch/swipe functionality for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Show mock data immediately instead of loading skeleton
  // if (isLoading) {
  //   return (
  //     <div className="w-full">
  //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  //         <CourseCard.Skeleton />
  //         <CourseCard.Skeleton />
  //         <CourseCard.Skeleton />
  //       </div>
  //     </div>
  //   );
  // }

  // Don't render until hydrated to prevent hydration mismatches
  if (!isHydrated) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard.Skeleton />
          <CourseCard.Skeleton />
          <CourseCard.Skeleton />
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return null;
  }

  // Apply grid/slider logic based on course count
  // console.log('Featured courses count:', courses.length, 'Showing:', courses.length <= 3 ? 'Grid' : 'Slider');
  
  // Always use slider for mobile, grid for desktop when 3 or fewer courses
  if (courses.length <= 3 && !isMobile) {
    // Static Grid for 3 or fewer courses on tablet/desktop
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const cardProps = courseToCardProps(course, locale as 'ar' | 'en', {
              inWishlist: hasWishlistItem(course.id),
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
      </div>
    );
  }

  return (
    <div className="relative w-full md:px-16">
      {/* Navigation Arrows - Locale-aware positioning - Hide on mobile */}
      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between pointer-events-none z-10">
        {/* Left Button */}
        <button
          onClick={locale === 'ar' ? goToNext : goToPrevious}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all duration-200 pointer-events-auto -ml-6"
          aria-label={locale === 'ar' ? 'Next courses' : 'Previous courses'}
        >
          <Icon name={locale === 'ar' ? 'chevron-right' : 'chevron-left'} className="h-5 w-5" />
        </button>

        {/* Right Button */}
        <button
          onClick={locale === 'ar' ? goToPrevious : goToNext}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all duration-200 pointer-events-auto -mr-6"
          aria-label={locale === 'ar' ? 'Previous courses' : 'Next courses'}
        >
          <Icon name={locale === 'ar' ? 'chevron-left' : 'chevron-right'} className="h-5 w-5" />
        </button>
      </div>

      {/* Slider Container - Using shadcn carousel approach */}
      <div 
        className="relative overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={sliderRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`
          }}
        >
          {[...Array(totalSlides)].map((_, slideIndex) => {
            const currentItemsPerView = getItemsPerView();
            return (
              <div 
                key={slideIndex} 
                className="w-full flex-shrink-0 px-4 md:px-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sliderCourses
                    .slice(slideIndex * currentItemsPerView, (slideIndex + 1) * currentItemsPerView)
                    .map((course, idx) => {
                      const cardProps = courseToCardProps(course, locale as 'ar' | 'en', {
                        inWishlist: hasWishlistItem(course.id),
                        inCart: hasItem(course.id),
                        onToggleWishlist: handleToggleWishlist,
                        onAddToCart: handleAddToCart,
                        onClick: handleCourseClick
                      });
                      
                      return (
                        <CourseCard key={`${course.id}-${slideIndex}-${idx}`} {...cardProps} />
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots Indicator */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {[...Array(totalSlides)].map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8'
                  : 'w-2 bg-gray-200 hover:bg-gray-300'
              }`}
              style={index === currentIndex ? { backgroundColor: '#00AC96' } : {}}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
