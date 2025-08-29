'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { useCartStore } from '@/lib/cart-store';
import { usePageLoad, useStaggeredAnimation } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';

// Mock course data - in real app this would come from API
const mockCourseData = {
  id: '1',
  title: {
    ar: 'دورة التصميم الجرافيكي المتقدمة',
    en: 'Advanced Graphic Design Course'
  },
  subtitle: 'تعلم أساسيات وتقنيات التصميم الجرافيكي الحديث باستخدام أدوات احترافية',
  instructor: {
    name: 'أحمد محمد',
    title: 'مصمم جرافيك محترف',
    avatar: '/api/placeholder/60/60',
    rating: 4.9,
    studentsCount: 15000,
    coursesCount: 12
  },
  price: 299,
  originalPrice: 399,
  currency: 'SAR',
  rating: 4.8,
  reviewsCount: 1250,
  studentsCount: 5430,
  duration: '12 ساعة',
  lessons: 24,
  level: 'متقدم',
  language: 'العربية',
  imageUrl: '/api/placeholder/800/450',
  videoPreviewUrl: '/api/placeholder/video',
  lastUpdated: '2024-01-15',
  features: [
    'وصول مدى الحياة',
    'شهادة إتمام',
    'دعم المدرب',
    'مشاريع عملية',
    'ملفات قابلة للتحميل'
  ],
  description: 'هذه الدورة مصممة لتعليمك أساسيات وتقنيات التصميم الجرافيكي الحديث. ستتعلم كيفية استخدام الأدوات الاحترافية لإنشاء تصاميم مبتكرة وجذابة. تشمل الدورة مشاريع عملية ستساعدك على تطبيق ما تعلمته.',
  requirements: [
    'معرفة أساسية بالحاسوب',
    'برنامج Adobe Photoshop أو Illustrator',
    'الرغبة في التعلم والإبداع'
  ],
  curriculum: [
    {
      id: 1,
      title: 'مقدمة في التصميم الجرافيكي',
      lessons: 4,
      duration: '45 دقيقة',
      isPreview: true
    },
    {
      id: 2,
      title: 'أساسيات الألوان والطباعة',
      lessons: 6,
      duration: '1.5 ساعة',
      isPreview: false
    },
    {
      id: 3,
      title: 'تقنيات التصميم المتقدمة',
      lessons: 8,
      duration: '2 ساعة',
      isPreview: false
    },
    {
      id: 4,
      title: 'مشاريع عملية وتطبيقية',
      lessons: 6,
      duration: '1.5 ساعة',
      isPreview: false
    }
  ]
};

export default function CourseDetailsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = useLocale();
  const { addItem, hasItem } = useCartStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const isLoaded = usePageLoad(100);
  const { visibleItems: curriculumVisible, setRef: setCurriculumRef } = useStaggeredAnimation(mockCourseData.curriculum, 100);
  
  const course = mockCourseData; // In real app: fetch based on params.id
  const isInCart = hasItem(course.id);
  
  // Handle localized content
  const title = typeof course.title === 'object' 
    ? (locale === 'ar' ? course.title.ar : course.title.en)
    : course.title;

  const addToCart = () => {
    addItem({
      id: `cart-${course.id}`,
      courseId: course.id,
      title: typeof course.title === 'object' ? course.title : { ar: course.title, en: course.title },
      price: course.price,
      currency: course.currency,
      imageUrl: course.imageUrl,
      instructor: course.instructor.name,
      qty: 1
    });
  };

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
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
                  <Link href="/courses" className="hover:text-primary-600">
                    {t('courses.title')}
                  </Link>
                  <span>›</span>
                  <span>{title}</span>
                </div>
                
                <h1 className={`text-3xl font-bold text-gray-900 mb-4 font-cairo ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
                  {title}
                </h1>
                
                <p className={`text-lg text-gray-600 mb-6 font-cairo ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
                  {course.subtitle}
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
                
                {/* Instructor */}
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
                  </div>
                </div>
              </div>
            </div>
            
            {/* Course Preview & Purchase */}
            <div className="lg:col-span-1">
              <div className={`bg-white rounded-lg shadow-lg overflow-hidden sticky top-8 hover-lift ${isLoaded ? 'animate-scale-in stagger-4' : 'opacity-0'}`}>
                {/* Video Preview */}
                <div className="relative">
                  <img
                    src={course.imageUrl}
                    alt={title}
                    className="w-full h-48 object-cover"
                  />
                  <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all duration-200">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">
                                             <Icon name="play" className="h-6 w-6 text-gray-800 ml-1" />
                    </div>
                  </button>
                </div>
                
                {/* Pricing */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {course.originalPrice > course.price && (
                        <span className="text-lg text-gray-400 line-through font-cairo">
                          {course.originalPrice} {course.currency}
                        </span>
                      )}
                      <div className="text-3xl font-bold text-gray-900 font-cairo">
                        {course.price} {course.currency}
                      </div>
                    </div>
                    {course.originalPrice > course.price && (
                      <div className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold font-cairo">
                        {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% {t('common.off')}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {isInCart ? (
                      <Link
                        href="/cart"
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
                        isInWishlist
                          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                                             <Icon 
                          name="heart" 
                          className={`h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 ${isInWishlist ? 'text-red-500' : ''}`}  
                      />
                      {isInWishlist ? t('course.remove-from-wishlist') : t('course.add-to-wishlist')}
                    </button>
                  </div>
                  
                  {/* Course Features */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 font-cairo">
                      {t('course.includes')}
                    </h3>
                    <ul className="space-y-2">
                      {course.features.map((feature, index) => (
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
                    { id: 'curriculum', label: t('course.tabs.curriculum') },
                    { id: 'instructor', label: t('course.tabs.instructor') },
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
                      <p className="text-gray-600 leading-relaxed font-cairo">
                        {course.description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 font-cairo">
                        {t('course.requirements')}
                      </h3>
                      <ul className="space-y-2">
                        {course.requirements.map((req, index) => (
                          <li key={index} className="flex items-start space-x-2 rtl:space-x-reverse text-gray-600">
                            <span className="text-primary-500 mt-1">•</span>
                            <span className="font-cairo">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 font-cairo">
                      {t('course.curriculum')}
                    </h2>
                    <div className="space-y-4">
                      {course.curriculum.map((section, index) => (
                        <div 
                          key={section.id} 
                          ref={setCurriculumRef(index)}
                          className={`border border-gray-200 rounded-lg scroll-item hover-lift ${
                            curriculumVisible.has(index) ? 'visible' : ''
                          }`}
                        >
                          <button
                            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                            className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              <span className="text-lg font-semibold text-gray-900 font-cairo">
                                {section.title}
                              </span>
                              {section.isPreview && (
                                <span className="text-xs font-semibold px-2 py-1 rounded font-cairo course-badge">
                                  {t('course.preview')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                              <span className="text-sm text-gray-500 font-cairo">
                                {section.lessons} {t('course.lessons')} • {section.duration}
                              </span>
                                                             <Icon 
                                 name={expandedSection === section.id ? 'chevron-up' : 'chevron-down'} 
                                 className="h-4 w-4 text-gray-400" 
                               />
                            </div>
                          </button>
                          
                          {expandedSection === section.id && (
                            <div className="px-4 pb-4">
                              <div className="space-y-2">
                                {Array.from({ length: section.lessons }).map((_, index) => (
                                  <div key={index} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                                             <Icon name="play" className="h-3 w-3 text-gray-400" />
                                      <span className="text-sm text-gray-700 font-cairo">
                                        {t('course.lesson')} {index + 1}: {t('course.lesson-title')} {index + 1}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-cairo">5:30</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Instructor Tab */}
                {activeTab === 'instructor' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 font-cairo">
                      {t('course.instructor-info')}
                    </h2>
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
                      </div>
                    </div>
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
                  <span className="text-gray-600 font-cairo">{t('course.level')}:</span>
                  <span className="font-semibold text-gray-900 font-cairo">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-cairo">{t('course.duration')}:</span>
                  <span className="font-semibold text-gray-900 font-cairo">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-cairo">{t('course.lessons')}:</span>
                  <span className="font-semibold text-gray-900 font-cairo">{course.lessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-cairo">{t('course.language')}:</span>
                  <span className="font-semibold text-gray-900 font-cairo">{course.language}</span>
                </div>
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
    </>
  );
}
