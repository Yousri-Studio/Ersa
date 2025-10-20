'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { CourseCard } from '@/components/ui/course-card-new';
import { SearchEmptyState } from '@/components/ui/search-empty-state';
import { SearchBar } from '@/components/home/search-bar';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { NoSearchResults } from '@/components/ui/no-search-results';
import { courseToCardProps } from '@/lib/course-adapter';
import type { Course as ApiCourse } from '@/lib/api';
import type { Course } from '@/lib/types';
import { useCartStore } from '@/lib/cart-store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'react-hot-toast';
import { usePageLoad, useStaggeredAnimation } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';
import { useCourses } from '@/lib/content-hooks';
import { categoriesApi, CourseCategoryData } from '@/lib/api';

// Mock courses removed - using API data with proper transformation via useCourses hook
/*
const mockCourses: Partial<ApiCourse>[] = [
  {
    id: '1',
    slug: 'advanced-graphic-design',
    title: {
      ar: 'دورة التصميم الجرافيكي المتقدمة',
      en: 'Advanced Graphic Design Course'
    },
    summary: {
      ar: 'تعلم أساسيات وتقنيات التصميم الجرافيكي الحديث باستخدام أدوات احترافية',
      en: 'Learn fundamentals and modern graphic design techniques using professional tools'
    },
    imageUrl: '/images/Course Place Holder Small.png',
    type: 1, // 1 = Live
    price: 1200,
    currency: 'SAR',
    rating: 4.8,
    isActive: true,
    isFeatured: true,
    badge: 'Bestseller',
    level: 0, // 0 = Beginner
    category: null,
    instructorName: '',
    createdAt: ''
  },
  {
    id: '2',
    slug: 'digital-marketing-fundamentals',
    title: {
      ar: 'أساسيات التسويق الرقمي',
      en: 'Digital Marketing Fundamentals'
    },
    summary: {
      ar: 'دورة شاملة في أساسيات التسويق الرقمي ووسائل التواصل الاجتماعي',
      en: 'Comprehensive course in digital marketing fundamentals and social media'
    },
    imageUrl: '/images/Course Place Holder Small.png',
    type: 0, // 0 = PDF
    price: 899,
    currency: 'SAR',
    rating: 4.6,
    isActive: true,
    isFeatured: true,
    badge: 'Bestseller',
    level: 0, // 0 = Beginner
    category: null,
    instructorName: '',
    createdAt: ''
  },
  {
    id: '3',
    slug: 'project-management-professional',
    title: {
      ar: 'إدارة المشاريع الاحترافية',
      en: 'Professional Project Management'
    },
    summary: {
      ar: 'تعلم أحدث تقنيات وأساليب إدارة المشاريع الاحترافية',
      en: 'Learn the latest techniques and professional project management methods'
    },
    imageUrl: '/images/Course Place Holder Small.png',
    type: 1, // 1 = Live
    price: 1599,
    currency: 'SAR',
    rating: 4.9,
    isActive: true,
    isFeatured: false,
    badge: 'Bestseller',
    level: 1, // 1 = Intermediate
    category: null,
    instructorName: '',
    createdAt: ''
  },
  {
    id: '4',
    slug: 'data-analysis-excel',
    title: {
      ar: 'تحليل البيانات باستخدام Excel',
      en: 'Data Analysis with Excel'
    },
    summary: {
      ar: 'دورة متخصصة في تحليل البيانات والإحصاء باستخدام Microsoft Excel',
      en: 'Specialized course in data analysis and statistics using Microsoft Excel'
    },
    imageUrl: '/images/Course Place Holder Small.png',
    type: 0, // 0 = PDF
    price: 699,
    currency: 'SAR',
    rating: 4.4,
    isActive: true,
    isFeatured: false,
    badge: 'Bestseller',
    level: 0, // 0 = Beginner
    category: null,
    instructorName: '',
    createdAt: ''
  },
  {
    id: '5',
    slug: 'leadership-skills',
    title: {
      ar: 'مهارات القيادة والإدارة',
      en: 'Leadership and Management Skills'
    },
    summary: {
      ar: 'تطوير مهارات القيادة الفعالة وإدارة الفرق في بيئة العمل',
      en: 'Develop effective leadership skills and team management in workplace'
    },
    imageUrl: '/images/Course Place Holder Small.png',
    type: 1, // 1 = Live
    price: 1399,
    currency: 'SAR',
    rating: 4.7,
    isActive: true,
    isFeatured: true,
    badge: 'Bestseller',
    level: 1, // 1 = Intermediate
    category: null,
    instructorName: '',
    createdAt: ''
  },
  {
    id: '6',
    slug: 'web-development-basics',
    title: {
      ar: 'أساسيات تطوير المواقع الإلكترونية',
      en: 'Web Development Basics'
    },
    summary: {
      ar: 'تعلم أساسيات تطوير المواقع الإلكترونية باستخدام HTML وCSS وJavaScript',
      en: 'Learn web development basics using HTML, CSS, and JavaScript'
    },
    imageUrl: '/images/Course Place Holder Small.png',
    type: 0, // 0 = PDF
    price: 999,
    currency: 'SAR',
    rating: 4.5,
    isActive: true,
    isFeatured: false,
    badge: 'Bestseller',
    level: 0, // 0 = Beginner
    category: null,
    instructorName: '',
    createdAt: ''
  }
];
*/

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { addItem, hasItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, hasItem: hasItemInWishlist, fetchWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  const query = searchParams?.get('query') || '';
  const category = searchParams?.get('category') || '';

  console.log('Courses page - URL params:', { query, category });

  const { courses: apiCourses, loading: coursesLoading, error: coursesError } = useCourses({ 
    query: query || undefined,
    category: category || undefined 
  });
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(category);
  const [displayType, setDisplayType] = useState('grid');
  const [categories, setCategories] = useState<CourseCategoryData[]>([]);
  
  // Sync categoryFilter with URL parameter
  useEffect(() => {
    setCategoryFilter(category);
  }, [category]);
  
  // Handle categoryFilter change and update URL
  const handleCategoryFilterChange = (newCategory: string) => {
    setCategoryFilter(newCategory);
    
    const searchParams = new URLSearchParams();
    if (query.trim()) {
      searchParams.set('query', query.trim());
    }
    if (newCategory) {
      searchParams.set('category', newCategory);
    }
    
    const searchString = searchParams.toString();
    const url = `/${locale}/courses${searchString ? `?${searchString}` : ''}`;
    router.push(url);
  };

  // Animation hooks
  const isLoaded = usePageLoad(100);
  const { visibleItems: featuredVisible, setRef: setFeaturedRef } = useStaggeredAnimation(
    apiCourses?.filter((course: Course) => course.isFeatured)?.slice(-2) || [], 
    200
  );
  const { visibleItems: allCoursesVisible, setRef: setAllCoursesRef } = useStaggeredAnimation(
    filteredCourses || [], 
    100
  );

  // Update filtered courses when API courses change (backend now handles search/category filtering)
  useEffect(() => {
    if (apiCourses && apiCourses.length > 0) {
      let filtered = [...apiCourses];

      // Only apply frontend sorting since backend handles search and category filtering
      if (sortBy) {
        filtered = [...filtered].sort((a: Course, b: Course) => {
          switch (sortBy) {
            case 'newest':
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            case 'oldest':
              return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            case 'rating':
              return (b.rating || 0) - (a.rating || 0);
            case 'price-low':
              return a.price - b.price;
            case 'price-high':
              return b.price - a.price;
            default:
              return 0;
          }
        });
      }

      setFilteredCourses(filtered);
    } else if (!isLoading && (coursesError || !apiCourses)) {
      // No courses available when API fails
      console.log('No courses available - API failed or empty');
      setFilteredCourses([]);
    }
  }, [sortBy, apiCourses, isLoading, coursesError]);

  const handleToggleWishlist = async (courseId: string) => {
    if (!user) {
      router.push(`/${locale}/auth/login?redirect=/courses`);
      return;
    }
    
    const isInWishlist = hasItemInWishlist(courseId);
    
    try {
      if (isInWishlist) {
        await removeFromWishlist(courseId);
        toast.success(t('wishlist.item-removed'));
      } else {
        await addToWishlist(courseId);
        toast.success(t('wishlist.item-added'));
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(t('wishlist.error'));
    }
  };

  // Fetch wishlist on mount if user is authenticated
  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const handleAddToCart = (courseId: string) => {
    const course = apiCourses?.find((c: Course) => c.id === courseId);
    if (!course) return;

    if (hasItem(courseId)) {
      toast.success(t('cart.already-in-cart'));
      return;
    }

    addItem({
      id: `cart-${course.id}`,
      courseId: course.id,
      title: course.title,
      price: course.price,
      currency: course.currency,
      imageUrl: course.thumbnailUrl,
      instructor: course.instructor?.name || 'مدرب محترف',
      qty: 1
    });

    toast.success(t('cart.item-added'));
  };

  const handleCourseClick = (slug: string) => {
    router.push(`/${locale}/courses/${slug}`);
  };

  const hasSearchQuery = query.trim().length > 0;
  const hasResults = filteredCourses.length > 0;
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getCategories(true);
        setCategories(response.data || []);
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Use fallback categories if API fails
        setCategories([
          {
            id: 'general',
            titleAr: 'عام',
            titleEn: 'General',
            displayOrder: 1,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'business',
            titleAr: 'الأعمال',
            titleEn: 'Business',
            displayOrder: 2,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'technology',
            titleAr: 'التكنولوجيا',
            titleEn: 'Technology',
            displayOrder: 3,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      }
    };
    
    fetchCategories();
  }, []);

  // Update loading state based on API status
  useEffect(() => {
    setIsLoading(coursesLoading);
  }, [coursesLoading]);

  return (
    <>
      <ScrollAnimations />
      <div className={`relative min-h-screen pt-16 pb-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        {/* Background that extends to top */}
        <div className="absolute inset-0 hero-background" style={{top: '-100px'}}></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Intro Section */}
          <div className={`mb-16 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            {/* Tagline */}
            <div className={`mb-6 ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
              <div className="inline-flex items-center text-brand text-sm font-semibold font-cairo">
                🔥 {t('courses.badge')}
              </div>
            </div>
            
            {/* Main Title */}
            <h1 className={`font-cairo font-bold leading-tight mb-4 ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`} style={{
              color: 'var(--Primary, #292561)',
              textAlign: locale === 'ar' ? 'right' : 'left',
              fontFamily: 'Cairo',
              fontSize: '36px',
              fontStyle: 'normal',
              fontWeight: '700'
            }}>
              {t('courses.title')}
            </h1>
            
            {/* Description */}
            <p className={`text-lg text-gray-600 leading-relaxed font-cairo ${locale === 'ar' ? 'text-right' : 'text-left'} ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
              {t('courses.subtitle')}
            </p>
          </div>

        {/* Featured Courses Section - Always show */}
        <div className="mb-16 scroll-item">
          {/* Section Title */}
          <h2 className={`text-2xl font-bold mb-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`} style={{
            color: 'var(--Primary, #292561)',
            fontFamily: 'Cairo'
          }}>
            {locale === 'ar' ? 'الدورات المميزة' : 'Featured Courses'}
          </h2>
          
          {/* Featured Courses Grid - 1 column on mobile, 2 columns on desktop - Show last 2 featured courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {(() => {
              // Get featured courses from API, or fallback to mock courses if API fails/empty
              let featuredCourses: Course[] = [];
              
              if (apiCourses && apiCourses.length > 0) {
                const apiFeatured = apiCourses.filter((course: Course) => course.isFeatured);
                featuredCourses = apiFeatured.length > 0 ? apiFeatured.slice(-2) : apiCourses.slice(-2);
              } else {
                // No featured courses available when API fails
                featuredCourses = [];
              }
              
              console.log('API courses:', !!apiCourses, 'Count:', apiCourses?.length, 'Error:', !!coursesError, 'Loading:', isLoading, 'Displaying:', featuredCourses.length, 'featured courses');
              
              return featuredCourses.map((course: Course, index: number) => {
                console.log('Rendering featured course:', course.title, 'isFeatured:', course.isFeatured);
                const cardProps = courseToCardProps(course, locale as 'ar' | 'en', {
                  inWishlist: hasItemInWishlist(course.id),
                  inCart: hasItem(course.id),
                  onToggleWishlist: handleToggleWishlist,
                  onAddToCart: handleAddToCart,
                  onClick: handleCourseClick
                });
                
                return (
                  <div
                    key={course.id}
                    ref={setFeaturedRef(index)}
                    className={`scroll-item-scale hover-lift card-animate ${
                      featuredVisible.has(index) ? 'visible' : ''
                    }`}
                  >
                    <CourseCard {...cardProps} />
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && coursesError && (
          <div className="text-center py-12">
            <Icon name="alert-circle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('courses.errors.load-failed')}
            </h3>
            <p className="text-gray-500">{coursesError.message}</p>
          </div>
        )}

        {/* All Courses Section */}
        {!isLoading && !coursesError && (
          <div className="mb-16">
          {/* Search Results Info */}
          {(query.trim() || category) && (
            <div className="mb-6 scroll-item">
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Icon name="search" className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {locale === 'ar' ? 'نتائج البحث' : 'Search Results'}
                    </p>
                    <p className="text-sm text-blue-700">
                      {(() => {
                        const searchInfo = [];
                        if (query.trim()) {
                          searchInfo.push(`"${query}"`);
                        }
                        if (category) {
                          // Find category name from fetched categories
                          const categoryData = categories.find(cat => cat.id === category);
                          const categoryName = categoryData 
                            ? (locale === 'ar' ? categoryData.titleAr : categoryData.titleEn)
                            : category;
                          searchInfo.push(categoryName);
                        }
                        const searchText = searchInfo.join(' • ');
                        const resultsCount = filteredCourses.length;
                        const resultsText = locale === 'ar' ? 
                          `${resultsCount} ${resultsCount === 1 ? 'نتيجة' : 'نتائج'} في ${searchText}` :
                          `${resultsCount} ${resultsCount === 1 ? 'result' : 'results'} for ${searchText}`;
                        return resultsText;
                      })()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    router.push(`/${locale}/courses`);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 rtl:space-x-reverse"
                >
                  <Icon name="x" className="h-4 w-4" />
                  <span>{locale === 'ar' ? 'مسح البحث' : 'Clear Search'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Section Title */}
          <h2 className={`font-cairo font-bold leading-tight mb-8 scroll-item ${
            locale === 'ar' ? 'text-center' : 'text-center'
          }`} style={{
            color: 'var(--Primary, #292561)',
            textAlign: 'center',
            fontFamily: 'Cairo',
            fontSize: '36px',
            fontStyle: 'normal',
            fontWeight: '700'
          }}>
            {t('navigation.courses')}
          </h2>

          {/* Search and Filters */}
          <div className="mb-8">
            {/* Search Bar */}
            <div className={`mb-6 scroll-item max-w-5xl mx-auto ${isLoaded ? 'animate-slide-in-right stagger-3' : 'opacity-0'}`}>
              <div className="shadow-lg rounded-lg bg-white p-4">
                <SearchBar 
                  categories={categories.map(cat => {
                    // Generate slug from English title for consistency
                    const slug = cat.titleEn
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^\w\-]+/g, '');
                    
                    return {
                      id: cat.id,
                      name: { ar: cat.titleAr, en: cat.titleEn },
                      slug: slug // Use URL-friendly slug
                    };
                  })} 
                  compact={true}
                  enableLiveSearch={true}
                />
              </div>
            </div>

            {/* Filter Options - Mobile stacked, desktop 3 columns */}
            <div className={`w-full max-w-4xl mx-auto ${isLoaded ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`} style={{ position: 'relative', zIndex: 99999 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Display Type */}
                <div className="w-full">
                  <FilterDropdown
                    label={locale === 'ar' ? "عرض ك" : "Display As"}
                    options={[
                      { value: 'grid', label: locale === 'ar' ? 'شبكة' : 'Grid' },
                      { value: 'list', label: locale === 'ar' ? 'قائمة' : 'List' }
                    ]}
                    value={displayType}
                    onChange={setDisplayType}
                    placeholder={locale === 'ar' ? "اسم الاختيار" : "Choose display"}
                    icon="th-large"
                  />
                </div>

                {/* Category Filter */}
                <div className="w-full">
                  <FilterDropdown
                    label={locale === 'ar' ? "التصفية حسب" : "Filter By"}
                    options={categories.map(cat => {
                      // Generate slug from English title for consistency
                      const slug = cat.titleEn
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w\-]+/g, '');
                      
                      return {
                        value: slug,
                        label: locale === 'ar' ? cat.titleAr : cat.titleEn
                      };
                    })}
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    placeholder={locale === 'ar' ? "التصنيف حسب" : "Choose category"}
                    icon="sliders"
                  />
                </div>

                {/* Sort By */}
                <div className="w-full">
                  <FilterDropdown
                    label={locale === 'ar' ? "الترتيب حسب" : "Sort By"}
                    options={[
                      { value: 'newest', label: locale === 'ar' ? 'الأحدث' : 'Newest' },
                      { value: 'oldest', label: locale === 'ar' ? 'الأقدم' : 'Oldest' },
                      { value: 'rating', label: locale === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated' },
                      { value: 'price-low', label: locale === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High' },
                      { value: 'price-high', label: locale === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low' }
                    ]}
                    value={sortBy}
                    onChange={setSortBy}
                    placeholder={locale === 'ar' ? "الترتيب حسب" : "Choose order"}
                    icon="up-down"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* All Courses Grid or No Results */}
          {!isLoading && !coursesError && (
            <div>
              {filteredCourses.length === 0 && (query.trim() || sortBy || categoryFilter) ? (
                <div className="scroll-item">
                  <NoSearchResults />
                </div>
              ) : (
                <div 
                  className={`grid gap-6 ${displayType === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  {filteredCourses.map((course: Course, index: number) => {
                    const cardProps = courseToCardProps(course, locale as 'ar' | 'en', {
                      inWishlist: false,
                      inCart: hasItem(course.id),
                      onToggleWishlist: handleToggleWishlist,
                      onAddToCart: handleAddToCart,
                      onClick: handleCourseClick
                    });
                    
                    return (
                      <div
                        key={course.id}
                        ref={setAllCoursesRef(index)}
                        className={`scroll-item hover-lift card-animate ${allCoursesVisible.has(index) ? 'visible' : ''}`}
                      >
                        <CourseCard {...cardProps} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
    </>
  );
}
