'use client';

import React from 'react';
import { CourseCard, CourseCardProps } from '@/components/ui/course-card-new';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import toast from 'react-hot-toast';

// Sample data for development and testing
const sampleCourses: CourseCardProps[] = [
  {
    id: 'c1',
    slug: 'professional-training',
    title: { 
      ar: 'دورة التدريب المهني المتقدم', 
      en: 'Advanced Professional Training Course' 
    },
    summary: { 
      ar: 'وصف شامل للدورة التدريبية المهنية التي تهدف إلى تطوير المهارات الأساسية في بيئة العمل الحديثة', 
      en: 'A comprehensive description of the professional training course aimed at developing essential skills in the modern workplace' 
    },
    category: {
      ar: 'التدريب المهني',
      en: 'Professional Training'
    },
    thumbnailUrl: '/images/Course Place Holder Small.png',
    mode: 'onsite',
    badge: 'bestseller',
    durationLabel: { 
      ar: 'المدة: ٤ أيام', 
      en: 'Duration: 4 days' 
    },
    rating: 4.8,

    price: 1200,
    currency: 'SAR',
    locale: 'ar',
    inWishlist: false,
    inCart: false
  },
  {
    id: 'c2',
    slug: 'digital-marketing-fundamentals',
    title: { 
      ar: 'أساسيات التسويق الرقمي', 
      en: 'Digital Marketing Fundamentals' 
    },
    summary: { 
      ar: 'تعلم أحدث استراتيجيات التسويق الرقمي وكيفية تطبيقها بفعالية في السوق الحالي', 
      en: 'Learn the latest digital marketing strategies and how to apply them effectively in today\'s market' 
    },
    category: {
      ar: 'التسويق الرقمي',
      en: 'Digital Marketing'
    },
    mode: 'online',
    badge: 'new',
    durationLabel: { 
      ar: 'المدة: ٦ أسابيع', 
      en: 'Duration: 6 weeks' 
    },
    rating: 4.5,

    price: 899,
    currency: 'SAR',
    locale: 'ar',
    inWishlist: true,
    inCart: false
  },
  {
    id: 'c3',
    slug: 'project-management-certification',
    title: { 
      ar: 'شهادة إدارة المشاريع', 
      en: 'Project Management Certification' 
    },
    summary: { 
      ar: 'احصل على شهادة معتمدة في إدارة المشاريع واكتسب المهارات اللازمة لقيادة المشاريع بنجاح', 
      en: 'Get certified in project management and acquire the skills needed to lead projects successfully' 
    },
    category: {
      ar: 'إدارة المشاريع',
      en: 'Project Management'
    },
    mode: 'onsite',
    badge: null,
    durationLabel: { 
      ar: 'المدة: ٨ أسابيع', 
      en: 'Duration: 8 weeks' 
    },
    rating: 4.2,

    price: 1500,
    currency: 'SAR',
    locale: 'ar',
    inWishlist: false,
    inCart: true
  },
  {
    id: 'c4',
    slug: 'usd-course-example',
    title: { 
      ar: 'دورة بالدولار الأمريكي', 
      en: 'USD Course Example' 
    },
    summary: { 
      ar: 'مثال على دورة تستخدم الدولار الأمريكي كعملة', 
      en: 'Example of a course that uses USD as currency' 
    },
    category: {
      ar: 'مثال',
      en: 'Example'
    },
    mode: 'online',
    badge: null,
    durationLabel: { 
      ar: 'المدة: ٣ أسابيع', 
      en: 'Duration: 3 weeks' 
    },
    rating: 4.7,

    price: 299,
    currency: 'USD',
    locale: 'en',
    inWishlist: false,
    inCart: false
  }
];

// Example component showing how to use the CourseCard
export const CourseCardExample: React.FC = () => {
  const router = useRouter();
  const locale = useLocale();

  const handleToggleWishlist = (courseId: string) => {
    // Simulate API call
    console.log('Toggle wishlist for course:', courseId);
    toast.success('تم تحديث قائمة الأمنيات');
  };

  const handleAddToCart = (courseId: string) => {
    // Simulate API call
    console.log('Add to cart course:', courseId);
    toast.success('تم إضافة الدورة إلى السلة');
  };

  const handleCourseClick = (slug: string) => {
    router.push(`/${locale}/courses/${slug}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 gradient-text">
        Course Card Examples
      </h1>
      
      {/* Grid of course cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {sampleCourses.map((course) => (
          <CourseCard
            key={course.id}
            {...course}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onClick={handleCourseClick}
          />
        ))}
      </div>

      {/* Skeleton examples */}
      <h2 className="text-2xl font-bold text-center mb-6">Loading States</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CourseCard.Skeleton />
        <CourseCard.Skeleton />
        <CourseCard.Skeleton />
      </div>
    </div>
  );
};

export default CourseCardExample;
