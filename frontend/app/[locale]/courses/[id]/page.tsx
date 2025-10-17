'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { VideoModal } from '@/components/ui/video-modal';
import { useCartStore } from '@/lib/cart-store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { usePageLoad, useStaggeredAnimation } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';
import { useCourse } from '@/lib/content-hooks';
import { HtmlContent } from '@/components/ui/html-content';
import type { Course, CurriculumSection } from '@/lib/types';
import type { LocaleString } from '@/lib/common-types';


export default function CourseDetailsPage() {
  const t = useTranslations();
  const routeParams = useParams() as { id: string };
  const locale = useLocale();
  const { addItem, hasItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, hasItem: hasItemInWishlist, fetchWishlist } = useWishlistStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState<string | number | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const isLoaded = usePageLoad(100);
  const { course, loading: courseLoading, error: courseError } = useCourse(routeParams.id);
  
  // Fetch wishlist and check if course is in wishlist
  useEffect(() => {
    fetchWishlist();
  }, []);
  
  // Always call hooks in the same order - use empty array as fallback
  const { visibleItems: curriculumVisible, setRef: setCurriculumRef } = useStaggeredAnimation(
    course?.curriculum || [], 
    100
  );
  
  const isInCart = course ? hasItem(course.id) : false;

  // Show loading state
  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show error state
  if (courseError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Icon name="alert-circle" className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-medium text-gray-900 mb-2">
          {t('errors.load-failed')}
        </h1>
        <p className="text-gray-500">{courseError.message}</p>
      </div>
    );
  }

  // Show not found state
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Icon name="alert-circle" className="h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-xl font-medium text-gray-900 mb-2">
          {t('errors.course-not-found')}
        </h1>
        <p className="text-gray-500">{t('errors.course-not-found-message')}</p>
        <Link href={`/${locale}/courses`} className="mt-4 text-primary-600 hover:text-primary-700">
          {t('common.back-to-courses')}
        </Link>
      </div>
    );
  }
  
  // Handle localized content
  const title = typeof course.title === 'object' 
    ? (locale === 'ar' ? course.title.ar : course.title.en)
    : course.title;
  
  const summary = typeof course.summary === 'object'
    ? (locale === 'ar' ? course.summary.ar : course.summary.en)
    : course.summary;

  const addToCart = async () => {
    // Extract instructor name as string from instructors relationship
    const instructorName = course.instructors && course.instructors.length > 0
      ? (locale === 'ar' ? course.instructors[0].instructorName.ar : course.instructors[0].instructorName.en)
      : undefined;
    
    await addItem({
      id: `cart-${course.id}`,
      courseId: course.id,
      title: typeof course.title === 'object' ? course.title : { ar: course.title, en: course.title },
      price: course.price,
      currency: course.currency,
      imageUrl: course.imageUrl,
      instructor: instructorName,
      qty: 1
    });
  };

  const toggleWishlist = async () => {
    if (!course) return;
    
    const isInWishlist = hasItemInWishlist(course.id);
    if (isInWishlist) {
      await removeFromWishlist(course.id);
    } else {
      await addToWishlist(course.id);
    }
  };

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen bg-gray-50 page-enter ${isLoaded ? 'loaded' : ''}`}>
        {/* Course Header */}
        <div className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <div className={`flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500 mb-2 font-cairo ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
                  <Link href={`/${locale}/courses`} className="hover:text-primary-600">
                    {t('courses.title')}
                  </Link>
                  <span>›</span>
                  <span>{title}</span>
                </div>
                
                <h1 className={`text-3xl font-bold text-gray-900 mb-4 font-cairo ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
                  {title}
                </h1>
                
                <p className={`text-lg text-gray-600 mb-6 font-cairo ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
                  {summary}
                </p>
                
                {/* Course Stats */}
                <div className={`flex flex-wrap items-center gap-6 text-sm text-gray-600 ${isLoaded ? 'animate-slide-in-right stagger-3' : 'opacity-0'}`}>
                  <div className="flex items-center">
                    <Icon name="faStar" className="h-4 w-4 mr-1" style={{ color: '#FB831D' }} />
                    <span className="font-semibold font-cairo mr-1">{course.rating}</span>
                    <span className="font-cairo">({course.reviewsCount} {t('course.reviews')})</span>
                  </div>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Icon name="faUsers" className="h-4 w-4" />
                    <span className="font-cairo">{course.studentsCount} {t('course.students')}</span>
                  </div>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                         <Icon name="clock" className="h-4 w-4" />
                    <span className="font-cairo">{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Icon name="faGraduationCap" className="h-4 w-4" />
                    <span className="font-cairo">{course.level}</span>
                  </div>
                </div>
                
                {/* Category & Subcategories */}
                {(course.category || (course.subCategories && course.subCategories.length > 0)) && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2 font-cairo">
                      {locale === 'ar' ? 'التصنيفات' : 'Categories'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {course.category && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-cairo font-semibold">
                          {locale === 'ar' ? course.category.titleAr : course.category.titleEn}
                        </span>
                      )}
                      {course.subCategories && course.subCategories.map((subCat) => (
                        <span key={subCat.id} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-cairo">
                          {locale === 'ar' ? subCat.titleAr : subCat.titleEn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {course.tags && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2 font-cairo">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.split(',').map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-cairo">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Photo */}
                <div className="mt-6">
                  <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={(() => {
                        // Enhanced Debug: Check what we have
                        console.log('=== MAIN COURSE PHOTO DEBUG ===');
                        console.log('Course photo raw data type:', typeof course.photo);
                        console.log('Course photo length:', course.photo?.length);
                        console.log('First 50 chars:', course.photo?.substring(0, 50));
                        
                        // Handle base64 string data from backend (already encoded)
                        if (course.photo && typeof course.photo === 'string' && course.photo.length > 0) {
                          try {
                            console.log('Photo is a base64 string, creating data URL...');
                            // Backend already returns base64 string, just add the data URL prefix
                            const imageUrl = `data:image/png;base64,${course.photo}`;
                            console.log('Successfully created image URL, length:', imageUrl.length);
                            
                            return imageUrl;
                          } catch (error) {
                            console.error('Error creating data URL from base64 string:', error);
                            return '/images/Course Place Holder Small.png';
                          }
                        }
                        
                        // Handle binary array data (if backend changes format)
                        if (course.photo && Array.isArray(course.photo) && course.photo.length > 0) {
                          try {
                            console.log('Converting binary array data to base64...');
                            const uint8Array = new Uint8Array(course.photo);
                            const base64 = btoa(String.fromCharCode(...Array.from(uint8Array)));
                            const imageUrl = `data:image/jpeg;base64,${base64}`;
                            console.log('Successfully converted binary to base64');
                            return imageUrl;
                          } catch (error) {
                            console.error('Error converting binary array:', error);
                            return '/images/Course Place Holder Small.png';
                          }
                        }
                        
                        console.log('No valid photo data found, using fallback');
                        console.log('Available fallbacks - imageUrl:', course.imageUrl, 'thumbnailUrl:', course.thumbnailUrl);
                        // Fallback to processed URLs or placeholder
                        return course.imageUrl || course.thumbnailUrl || '/images/Course Place Holder Small.png';
                      })()}
                      alt={title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', e.currentTarget.src);
                        e.currentTarget.src = '/images/Course Place Holder Small.png';
                      }}
                    />
                  </div>
                </div>

                {/* Course Dates */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                    <Icon name="calendar" className="text-blue-600" />
                    <h4 className="font-semibold text-gray-900 font-cairo">
                      {locale === 'ar' ? 'مواعيد الدورة' : 'Course Schedule'}
                    </h4>
                  </div>
                  {(course.from || course.to) ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {course.from && (
                        <div>
                          <span className="text-gray-600 font-cairo">{locale === 'ar' ? 'تاريخ البدء:' : 'Start Date:'}</span>
                          <p className="text-gray-900 font-semibold font-cairo">
                            {new Date(course.from).toLocaleDateString(locale, { dateStyle: 'medium' })}
                          </p>
                        </div>
                      )}
                      {course.to && (
                        <div>
                          <span className="text-gray-600 font-cairo">{locale === 'ar' ? 'تاريخ الانتهاء:' : 'End Date:'}</span>
                          <p className="text-gray-900 font-semibold font-cairo">
                            {new Date(course.to).toLocaleDateString(locale, { dateStyle: 'medium' })}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 font-cairo italic">
                      {locale === 'ar' ? 'لم يتم تحديد مواعيد الدورة بعد' : 'Course dates not yet scheduled'}
                    </p>
                  )}
                  {course.sessionsNotes && (course.sessionsNotes.ar || course.sessionsNotes.en) && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 font-cairo">
                        {locale === 'ar' ? course.sessionsNotes.ar : course.sessionsNotes.en}
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructors */}
                {course.instructors && course.instructors.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-semibold text-gray-900 font-cairo">
                      {locale === 'ar' ? 'المدربون' : 'Instructors'}
                    </h4>
                    {course.instructors.map((instructor) => (
                      <div key={instructor.id} className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-semibold text-gray-900 font-cairo">
                          {locale === 'ar' ? instructor.instructorName.ar : instructor.instructorName.en}
                        </h5>
                        {instructor.instructorBio && (
                          <p className="text-sm text-gray-600 font-cairo mt-2">
                            {locale === 'ar' ? instructor.instructorBio.ar : instructor.instructorBio.en}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : course.instructor && (
                  <div className="flex items-center space-x-3 rtl:space-x-reverse mt-6 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 font-cairo">{course.instructor.name}</h3>
                      <p className="text-sm text-gray-600 font-cairo">{course.instructor.title}</p>
                      <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs text-gray-500 mt-1">
                        <span className="font-cairo">{course.instructor.rating} ⭐</span>
                        <span className="font-cairo">{course.instructor.studentsCount} {t('course.students')}</span>
                        <span className="font-cairo">{course.instructor.coursesCount} {t('course.courses')}</span>
                      </div>
                      {/* Instructor Bio */}
                      {course.instructors && course.instructors.length > 0 && course.instructors[0].instructorBio && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 font-cairo">
                            {locale === 'ar' ? course.instructors[0].instructorBio.ar : course.instructors[0].instructorBio.en}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Course Preview & Purchase */}
            <div className="lg:col-span-1">
              <div className={`bg-white rounded-lg shadow-lg overflow-hidden sticky top-8 hover-lift ${isLoaded ? 'animate-scale-in stagger-4' : 'opacity-0'}`}>
                {/* Video Preview */}
                <div className="relative">
                  <img
                    src={(() => {
                      // Handle binary blob data from database for sidebar preview
                      if (course.photo && Array.isArray(course.photo) && course.photo.length > 0) {
                        try {
                          // Convert number array to Uint8Array
                          const uint8Array = new Uint8Array(course.photo);
                          
                          // Convert to base64
                          let binary = '';
                          const len = uint8Array.byteLength;
                          for (let i = 0; i < len; i++) {
                            binary += String.fromCharCode(uint8Array[i]);
                          }
                          const base64 = btoa(binary);
                          
                          // Return as data URL
                          return `data:image/jpeg;base64,${base64}`;
                        } catch (error) {
                          console.error('Error converting photo array to data URL:', error);
                          return '/images/Course Place Holder Small.png';
                        }
                      }
                      
                      // Fallback to processed URLs or placeholder
                      return course.thumbnailUrl || course.imageUrl || '/images/Course Place Holder Small.png';
                    })()}
                    alt={title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/Course Place Holder Small.png';
                    }}
                  />
                  {course.videoUrl && (
                    <button 
                      onClick={() => setIsVideoModalOpen(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all duration-200"
                    >
                      <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">
                        <Icon name="play" className="h-6 w-6 text-gray-800 ml-1" />
                      </div>
                    </button>
                  )}
                </div>
                
                {/* Pricing */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {/* Discount hidden - Original Price */}
                      {/* {course.originalPrice > course.price && (
                        <span className="text-lg text-gray-400 line-through font-cairo">
                          {course.originalPrice} {course.currency}
                        </span>
                      )} */}
                      <div className="text-3xl font-bold text-gray-900 font-cairo">
                        {course.price} {course.currency}
                      </div>
                    </div>
                    {/* Discount Badge Hidden */}
                    {/* {course.originalPrice > course.price && (
                      <div className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold font-cairo">
                        {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% {t('common.off')}
                      </div>
                    )} */}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {isInCart ? (
                      <Link
                        href={`/${locale}/cart`}
                        className="w-full text-white py-3 px-4 rounded-lg font-semibold text-center block transition-colors duration-200 font-cairo course-enroll-btn"
                      >
                        {t('course.view-in-cart')}
                      </Link>
                    ) : (
                      <button
                        onClick={addToCart}
                        className="btn-primary w-full text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 font-cairo"
                      >
                                                 <Icon name="shopping-cart" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {t('course.add-to-cart')}
                      </button>
                    )}
                    
                    <button
                      onClick={toggleWishlist}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 font-cairo ${
                        hasItemInWishlist(course?.id || '')
                          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                                             <Icon 
                          name="heart" 
                          className={`h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 ${hasItemInWishlist(course?.id || '') ? 'text-red-500' : ''}`}  
                      />
                      {hasItemInWishlist(course?.id || '') ? t('course.remove-from-wishlist') : t('course.add-to-wishlist')}
                    </button>
                  </div>
                  
                  {/* Course Features */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 font-cairo">
                      {t('course.includes')}
                    </h3>
                    <ul className="space-y-2">
                      {course.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                                                     <Icon name="infinity" className="h-4 w-4 course-infinity-icon" />
                          <span className="font-cairo">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 rtl:space-x-reverse px-6">
                  {[
                    { id: 'overview', label: t('course.tabs.overview') },
                    { id: 'curriculum', label: t('course.tabs.topics') },
                    // Only show instructor tab if there's instructor data
                    ...((course.instructors && course.instructors.length > 0) || course.instructor 
                      ? [{ id: 'instructor', label: t('course.tabs.instructor') }] 
                      : []
                    ),
                    { id: 'reviews', label: t('course.tabs.reviews') }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm font-cairo transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 font-cairo">
                        {t('course.about')}
                      </h2>
                      <HtmlContent 
                        html={course.description ? (locale === 'ar' ? course.description.ar : course.description.en) : (locale === 'ar' ? course.summary.ar : course.summary.en)}
                        className="text-gray-600 leading-relaxed font-cairo"
                      />
                    </div>
                    

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 font-cairo">
                        {t('course.details')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg">
                          <Icon name="clock" className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 font-cairo">{t('course.duration')}</p>
                            <p className="text-sm text-gray-600 font-cairo">{course.duration}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg">
                          <Icon name="signal" className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 font-cairo">{t('course.level')}</p>
                            <p className="text-sm text-gray-600 font-cairo">
                              {course.level === 1 ? (locale === 'ar' ? 'مبتدئ' : 'Beginner') :
                               course.level === 2 ? (locale === 'ar' ? 'متوسط' : 'Intermediate') :
                               course.level === 3 ? (locale === 'ar' ? 'متقدم' : 'Advanced') :
                               course.level}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg">
                          <Icon name="monitor" className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 font-cairo">{t('course.type')}</p>
                            <p className="text-sm text-gray-600 font-cairo">
                              {course.type === 1 ? 
                                (locale === 'ar' ? 'جلسة مباشرة' : 'Live Session') : 
                                (locale === 'ar' ? 'التعلم الذاتي' : 'Self-Paced')
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg">
                          <Icon name="calendar" className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 font-cairo">
                              {locale === 'ar' ? 'ملاحظات الجلسة' : 'Session Notes'}
                            </p>
                            <div className="text-sm text-gray-600 font-cairo">
                              {course.sessionsNotes && (course.sessionsNotes.ar || course.sessionsNotes.en) ? (
                                <p className="mb-1">
                                  {locale === 'ar' ? course.sessionsNotes.ar : course.sessionsNotes.en}
                                </p>
                              ) : (
                                <p className="mb-1 text-gray-400 italic">
                                  {locale === 'ar' ? 'لا توجد ملاحظات للجلسة' : 'No session notes available'}
                                </p>
                              )}
                              {course.from && course.to && (
                                <p className="text-xs text-gray-500">
                                  {locale === 'ar' ? 'من:' : 'From:'} {new Date(course.from).toLocaleDateString(locale)} • 
                                  {locale === 'ar' ? 'إلى:' : 'To:'} {new Date(course.to).toLocaleDateString(locale)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Topics Tab */}
                {activeTab === 'curriculum' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 font-cairo">
                      {t('course.topics')}
                    </h2>
                    <div className="space-y-3">
                      {course.topics && course.topics.length > 0 ? (
                        <ul className="space-y-2">
                          {course.topics.map((topic: string, index: number) => (
                            <li key={index} className="flex items-start space-x-3 rtl:space-x-reverse text-gray-700">
                              <Icon name="check" className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                              <span className="font-cairo">{topic}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center text-gray-500 py-8 font-cairo">
                          {t('course.no-topics-available')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Instructor Tab */}
                {activeTab === 'instructor' && ((course.instructors && course.instructors.length > 0) || course.instructor) && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 font-cairo">
                      {t('course.instructor-info')}
                    </h2>
                    
                    {/* New Instructors Array Display */}
                    {course.instructors && course.instructors.length > 0 ? (
                      <div className="space-y-6">
                        {course.instructors.map((instructor) => (
                          <div key={instructor.id} className="p-6 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 font-cairo mb-2">
                              {locale === 'ar' ? instructor.instructorName.ar : instructor.instructorName.en}
                            </h3>
                            {instructor.instructorBio && (
                              <p className="text-gray-700 font-cairo leading-relaxed">
                                {locale === 'ar' ? instructor.instructorBio.ar : instructor.instructorBio.en}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : course.instructor && (
                      <div className="flex items-start space-x-4 rtl:space-x-reverse">
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="h-20 w-20 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 font-cairo">
                            {course.instructor.name}
                          </h3>
                          <p className="text-gray-600 mb-3 font-cairo">
                            {course.instructor.title}
                          </p>
                          <div className="flex items-center space-x-6 rtl:space-x-reverse text-sm text-gray-600">
                            <div className="flex items-center">
                              <Icon name="star" className="h-4 w-4 mr-1" style={{ color: '#FB831D' }} />
                              <span className="font-cairo">{course.instructor.rating}</span>
                            </div>
                            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                              <Icon name="users" className="h-4 w-4" />
                              <span className="font-cairo">{course.instructor.studentsCount}</span>
                            </div>
                            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                              <Icon name="graduation-cap" className="h-4 w-4" />
                              <span className="font-cairo">{course.instructor.coursesCount}</span>
                            </div>
                          </div>
                          {course.instructors && course.instructors.length > 0 && course.instructors[0].instructorBio && (
                            <div className="mt-4">
                              <p className="text-gray-700 font-cairo">
                                {locale === 'ar' ? course.instructors[0].instructorBio.ar : course.instructors[0].instructorBio.en}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 font-cairo">
                      {t('course.student-reviews')}
                    </h2>
                    <div className="text-center text-gray-500 py-8 font-cairo">
                      {t('course.reviews-coming-soon')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Course Details Sidebar */}
          <div className="lg:col-span-1">
            <div className={`bg-white rounded-lg shadow-sm p-6 scroll-item hover-lift ${isLoaded ? 'animate-slide-in-left stagger-5' : 'opacity-0'}`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-cairo">
                {t('course.details')}
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-cairo">{t('course.duration')}:</span>
                  <span className="font-semibold text-gray-900 font-cairo">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-cairo">
                    {locale === 'ar' ? 'ملاحظات الجلسة:' : 'Session Notes:'}
                  </span>
                  <span className="font-semibold text-gray-900 font-cairo text-right">
                    {course.sessionsNotes && (course.sessionsNotes.ar || course.sessionsNotes.en) ? (
                      <div>
                        <p className="text-xs">
                          {locale === 'ar' ? course.sessionsNotes.ar : course.sessionsNotes.en}
                        </p>
                        {course.from && course.to && (
                          <p className="text-xs text-gray-500 mt-1">
                            {locale === 'ar' ? 'من:' : 'From:'} {new Date(course.from).toLocaleDateString(locale)} - {locale === 'ar' ? 'إلى:' : 'To:'} {new Date(course.to).toLocaleDateString(locale)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">
                        {locale === 'ar' ? 'لا توجد ملاحظات' : 'No notes available'}
                      </span>
                    )}
                  </span>
                </div>
                {course.subCategories && course.subCategories.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-cairo">
                      {locale === 'ar' ? 'التصنيفات الفرعية:' : 'Subcategories:'}
                    </span>
                    <span className="font-semibold text-gray-900 font-cairo text-right">
                      {course.subCategories.map(sub => 
                        locale === 'ar' ? sub.titleAr : sub.titleEn
                      ).join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 font-cairo">{t('course.last-updated')}:</span>
                  <span className="font-semibold text-gray-900 font-cairo">{course.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Video Modal */}
    {course.videoUrl && (
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={course.videoUrl}
        title={title}
      />
    )}
    </>
  );
}
