'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/auth-store';
import { useHydration } from '@/hooks/useHydration';
import { enrollmentsApi } from '@/lib/api';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';
import { usePageLoad, useStaggeredAnimation } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';

interface Enrollment {
  id: string;
  courseId: string;
  courseSlug: string;
  courseTitleEn: string;
  courseTitleAr: string;
  courseImage?: string;
  orderId: string;
  enrolledAt: string;
  status: string;
  progress?: number;
  category?: string;
}

export default function EnrollmentsPage() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, initFromCookie } = useAuthStore();
  const isHydrated = useHydration();
  const isLoaded = usePageLoad(100);
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'progress'>('date');

  const { visibleItems: enrollmentsVisible, setRef: setEnrollmentRef } = useStaggeredAnimation(filteredEnrollments, 150);

  // Initialize auth from cookie on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!isHydrated) return;
      
      console.log('🔐 Enrollments page: Initializing auth from cookie...');
      await initFromCookie();
      setAuthChecked(true);
      console.log('🔐 Enrollments page: Auth check complete');
    };
    
    initAuth();
  }, [isHydrated, initFromCookie]);

  // Check authentication and fetch enrollments
  useEffect(() => {
    if (!isHydrated || !authChecked) return;
    
    console.log('🔐 Enrollments page: Auth status:', { isAuthenticated, authChecked });
    
    if (!isAuthenticated) {
      console.log('🔐 Enrollments page: Not authenticated, redirecting to login');
      router.push(`/${locale}/auth/login?redirect=/${locale}/profile/enrollments`);
      return;
    }

    console.log('🔐 Enrollments page: Authenticated, fetching enrollments');
    fetchEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, authChecked, isAuthenticated, locale, router]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      console.log('📚 Fetching user enrollments...');
      const response = await enrollmentsApi.getMyEnrollments();
      console.log('✅ Enrollments fetched:', response.data);
      setEnrollments(response.data || []);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error fetching enrollments:', err);
      setError(err.response?.data?.error || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...enrollments];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(enrollment => {
        const title = locale === 'ar' ? enrollment.courseTitleAr : enrollment.courseTitleEn;
        return title.toLowerCase().includes(query);
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(enrollment => enrollment.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter(enrollment => enrollment.status === selectedStatus);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
        case 'name':
          const titleA = locale === 'ar' ? a.courseTitleAr : a.courseTitleEn;
          const titleB = locale === 'ar' ? b.courseTitleAr : b.courseTitleEn;
          return titleA.localeCompare(titleB);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        default:
          return 0;
      }
    });

    setFilteredEnrollments(result);
  }, [enrollments, searchQuery, selectedCategory, selectedStatus, sortBy, locale]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      locale === 'ar' ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  };

  // Get unique categories from enrollments
  const categories = Array.from(new Set(enrollments.map(e => e.category).filter(Boolean)));

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('date');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || sortBy !== 'date';

  if (!isHydrated || !authChecked || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-cairo">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen bg-gray-50 py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className={`mb-8 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 
              className="mx-auto max-w-4xl mb-6 font-cairo hero-heading">
              {locale === 'ar' ? 'دوراتي التدريبية' : 'My Enrollments'}
            </h1>
            <p className="mt-2 text-gray-600 font-cairo text-center text-lg">
              {locale === 'ar' 
                ? 'جميع الدورات التي قمت بالتسجيل فيها' 
                : 'All courses you have enrolled in'}
            </p>
          </div>

          {/* Search and Filters Section */}
          {enrollments.length > 0 && (
            <div className={`mb-8 bg-white rounded-lg shadow-sm p-6 ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Icon name="search" className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 ${locale === 'ar' ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text"
                    placeholder={locale === 'ar' ? 'ابحث عن دورة...' : 'Search for a course...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full ${locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute top-1/2 -translate-y-1/2 ${locale === 'ar' ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600`}
                    >
                      <Icon name="times" className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                {categories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-cairo mb-2">
                      {locale === 'ar' ? 'الفئة' : 'Category'}
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo"
                    >
                      <option value="all">{locale === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-cairo mb-2">
                    {locale === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo"
                  >
                    <option value="all">{locale === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                    <option value="active">{locale === 'ar' ? 'نشط' : 'Active'}</option>
                    <option value="completed">{locale === 'ar' ? 'مكتمل' : 'Completed'}</option>
                    <option value="in-progress">{locale === 'ar' ? 'قيد التقدم' : 'In Progress'}</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-cairo mb-2">
                    {locale === 'ar' ? 'ترتيب حسب' : 'Sort By'}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'progress')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo"
                  >
                    <option value="date">{locale === 'ar' ? 'التاريخ' : 'Date'}</option>
                    <option value="name">{locale === 'ar' ? 'الاسم' : 'Name'}</option>
                    <option value="progress">{locale === 'ar' ? 'التقدم' : 'Progress'}</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-cairo font-medium flex items-center justify-center"
                    >
                      <Icon name="times" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {locale === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                    </button>
                  </div>
                )}
              </div>

              {/* Results Count */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-cairo">
                  {locale === 'ar' 
                    ? `عرض ${filteredEnrollments.length} من ${enrollments.length} دورة`
                    : `Showing ${filteredEnrollments.length} of ${enrollments.length} courses`}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <Icon name="exclamation-triangle" className="h-5 w-5 text-red-500 mr-2 rtl:mr-0 rtl:ml-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 font-cairo">{error}</p>
            </div>
          )}

          {/* No Results After Filtering */}
          {enrollments.length > 0 && filteredEnrollments.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="mb-6">
                <Icon name="search" className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 font-cairo mb-2">
                {locale === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found'}
              </h3>
              <p className="text-gray-600 font-cairo mb-6">
                {locale === 'ar' 
                  ? 'حاول تغيير معايير البحث أو الفلاتر' 
                  : 'Try changing your search criteria or filters'}
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors font-cairo"
              >
                <Icon name="refresh" className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
                {locale === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
              </button>
            </div>
          )}

          {/* Empty State */}
          {enrollments.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="mb-6">
                <Icon name="graduation-cap" className="h-20 w-20 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 font-cairo mb-2">
                {locale === 'ar' ? 'لم تسجل في أي دورة بعد' : 'No enrollments yet'}
              </h3>
              <p className="text-gray-600 font-cairo mb-6 text-lg">
                {locale === 'ar' 
                  ? 'ابدأ رحلتك التعليمية الآن وسجل في الدورات المتاحة' 
                  : 'Start your learning journey by enrolling in available courses'}
              </p>
              <Link
                href={`/${locale}/courses`}
                className="inline-flex items-center px-8 py-3 text-white font-semibold rounded-lg btn-animate font-cairo"
                style={{
                  backgroundColor: '#00AC96',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                <Icon name="search" className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
                {locale === 'ar' ? 'تصفح الدورات' : 'Browse Courses'}
              </Link>
            </div>
          )}

          {/* Enrollments Grid */}
          {filteredEnrollments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrollments.map((enrollment, index) => {
                const courseTitle = locale === 'ar' ? enrollment.courseTitleAr : enrollment.courseTitleEn;
                const isVisible = enrollmentsVisible.has(index);
                
                return (
                  <div
                    key={enrollment.id}
                    ref={setEnrollmentRef(index)}
                    className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Course Image */}
                    {enrollment.courseImage ? (
                      <div className="h-48 bg-gradient-to-br from-teal-400 to-purple-600 relative overflow-hidden">
                        <img 
                          src={enrollment.courseImage} 
                          alt={courseTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-teal-400 to-purple-600 flex items-center justify-center">
                        <Icon name="graduation-cap" className="h-16 w-16 text-white opacity-80" />
                      </div>
                    )}

                    {/* Course Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 font-cairo mb-2 line-clamp-2">
                        {courseTitle}
                      </h3>
                      
                      <div className="flex items-center text-sm text-gray-500 font-cairo mb-4">
                        <Icon name="calendar" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        <span>
                          {locale === 'ar' ? 'تاريخ التسجيل: ' : 'Enrolled: '}
                          {formatDate(enrollment.enrolledAt)}
                        </span>
                      </div>

                      {/* Progress Bar (if available) */}
                      {typeof enrollment.progress === 'number' && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 font-cairo">
                              {locale === 'ar' ? 'التقدم' : 'Progress'}
                            </span>
                            <span className="text-sm font-medium text-teal-600">
                              {enrollment.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Icon name="check-circle" className="h-4 w-4 mr-1 rtl:mr-0 rtl:ml-1" />
                          {locale === 'ar' ? 'مسجل' : 'Enrolled'}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div>
                        <Link
                          href={`/${locale}/profile/orders/${enrollment.orderId}`}
                          className="w-full inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg btn-animate font-cairo"
                          style={{
                            backgroundColor: '#00AC96',
                            fontSize: '14px',
                            fontWeight: 600,
                          }}
                        >
                          <Icon name="eye" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                          {locale === 'ar' ? 'عرض تفاصيل الطلب' : 'View Order Details'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Link to All Orders */}
          {enrollments.length > 0 && (
            <div className={`mt-12 text-center ${isLoaded ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
              <Link
                href={`/${locale}/my-orders`}
                className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold font-cairo"
              >
                <Icon name="receipt" className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
                {locale === 'ar' ? 'عرض جميع الطلبات' : 'View All Orders'}
                <Icon name="arrow-right" className={`h-4 w-4 ${locale === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

