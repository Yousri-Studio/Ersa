import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { contentApi } from './content-api';
import { coursesApi, Course as BackendCourse } from './api';
import type { 
  Course as ApiCourse, 
  Category, 
  HomeContent, 
  SiteStats,
  AboutContent,
  PageContent
} from './types/api';
import type { Course } from './types';

export function usePageContent<T>(
  pageKey: string,
  fallback: T
): { data: T; loading: boolean; error: Error | null } {
  const locale = useLocale();
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await contentApi.getPageContentByKey(pageKey, locale);
        setData(response as T);
        setError(null);
      } catch (err) {
        console.error(`Error fetching content for ${pageKey}:`, err);
        setError(err instanceof Error ? err : new Error('Failed to fetch content'));
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [pageKey, locale]);

  return { data, loading, error };
}

// Transform API Course to extended Course type
function transformApiCourse(apiCourse: BackendCourse, locale: string = 'ar'): Course {
  const levelMap = { 1: 'مبتدئ', 2: 'متوسط', 3: 'متقدم' };
  const categoryMap = { 'Programming': 'البرمجة', 'Business': 'الأعمال', 'Design': 'التصميم' };
  
  // Keep the original photo array data for frontend processing
  const getImageUrl = (): string => {
    // Don't convert here - let the frontend components handle binary conversion
    // Just return placeholder and let page component handle the binary data
    return '/images/Course Place Holder Small.png';
  };
  
  return {
    ...apiCourse,
    // Keep the original localized title and summary objects from backend
    title: apiCourse.title,
    summary: apiCourse.summary,
    // IMPORTANT: Keep the raw photo array for binary conversion in components
    photo: apiCourse.photo,
    // Use blob image if available, otherwise fallback to placeholder
    thumbnailUrl: getImageUrl(),
    imageUrl: getImageUrl(),
    curriculum: apiCourse.sessions?.map((session, index) => ({
      id: index + 1,
      title: locale === 'ar' ? `الجلسة ${index + 1}` : `Session ${index + 1}`,
      lessons: 4,
      duration: locale === 'ar' ? '2 ساعة' : '2 hours',
      isPreview: index === 0
    })) || apiCourse.attachments?.map((attachment, index) => ({
      id: index + 1,
      title: `${attachment.fileName}`,
      lessons: 1,
      duration: locale === 'ar' ? 'ملف PDF' : 'PDF File',
      isPreview: index === 0
    })) || [
      {
        id: 1,
        title: locale === 'ar' ? 'مقدمة في الدورة' : 'Course Introduction',
        lessons: 4,
        duration: locale === 'ar' ? '2 ساعة' : '2 hours',
        isPreview: true
      }
    ],
    features: apiCourse.type === 1 
      ? (locale === 'ar' 
          ? ['جلسات مباشرة', 'شهادة إتمام', 'دعم المدرب', 'تسجيلات الجلسات', 'مواد تدريبية']
          : ['Live Sessions', 'Certificate of Completion', 'Instructor Support', 'Session Recordings', 'Training Materials'])
      : (locale === 'ar'
          ? ['وصول مدى الحياة', 'ملفات PDF', 'شهادة إتمام', 'دعم المدرب', 'ملفات قابلة للتحميل']
          : ['Lifetime Access', 'PDF Files', 'Certificate of Completion', 'Instructor Support', 'Downloadable Files']),
    requirements: locale === 'ar' 
      ? ['معرفة أساسية بالحاسوب', 'الرغبة في التعلم والإبداع']
      : ['Basic computer knowledge', 'Desire to learn and innovate'],
    topics: apiCourse.courseTopics ? 
      (locale === 'ar' ? 
        (apiCourse.courseTopics.ar ? apiCourse.courseTopics.ar.split(',').map(t => t.trim()) : []) :
        (apiCourse.courseTopics.en ? apiCourse.courseTopics.en.split(',').map(t => t.trim()) : [])) :
      [],
    description: typeof apiCourse.summary === 'object' 
      ? apiCourse.summary
      : {
          ar: apiCourse.summary || 'وصف الدورة',
          en: apiCourse.summary || 'Course description'
        },
    lessons: apiCourse.sessions?.length || apiCourse.attachments?.length || 1,
    instructor: {
      name: apiCourse.instructors && apiCourse.instructors.length > 0
        ? (locale === 'ar' ? apiCourse.instructors[0].instructorName.ar : apiCourse.instructors[0].instructorName.en)
        : (typeof apiCourse.instructorName === 'string' 
            ? apiCourse.instructorName 
            : (apiCourse.instructorName?.ar || apiCourse.instructor?.name || (locale === 'ar' ? 'مدرب محترف' : 'Professional Instructor'))),
      title: locale === 'ar' ? 'مدرب معتمد' : 'Certified Instructor',
      avatar: apiCourse.instructor?.avatar || '/api/placeholder/60/60',
      rating: 4.8,
      studentsCount: Math.floor(Math.random() * 5000) + 1000,
      coursesCount: Math.floor(Math.random() * 20) + 5
    },
    reviewsCount: Math.floor(Math.random() * 2000) + 500,
    studentsCount: Math.floor(Math.random() * 5000) + 1000,
    duration: apiCourse.duration ? 
      (locale === 'ar' ? apiCourse.duration.ar : apiCourse.duration.en) :
      (apiCourse.type === 1 
        ? (locale === 'ar' ? `${(apiCourse.sessions?.length || 1) * 2} ساعة` : `${(apiCourse.sessions?.length || 1) * 2} hours`)
        : (locale === 'ar' ? 'وصول مدى الحياة' : 'Lifetime Access')),
    level: apiCourse.level || 2,
    language: locale === 'ar' ? 'العربية' : 'English',
    originalPrice: Math.round(apiCourse.price * 1.3),
    lastUpdated: apiCourse.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    videoPreviewUrl: '/api/placeholder/video',
    subtitle: typeof apiCourse.summary === 'object' 
      ? (locale === 'ar' ? apiCourse.summary.ar : apiCourse.summary.en) || (locale === 'ar' ? apiCourse.summary.en : apiCourse.summary.ar)
      : apiCourse.summary,
    // Map additional backend fields - these are already in the spread operator above
  };
}

export function useCourses(params?: { type?: 'Live' | 'PDF'; featured?: boolean; query?: string; category?: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Prepare API parameters
        const apiParams: {
          type?: 'Live' | 'PDF';
          query?: string;
          category?: string;
          featured?: boolean;
        } = {};
        
        if (params?.type) apiParams.type = params.type;
        if (params?.query) apiParams.query = params.query;
        if (params?.category) apiParams.category = params.category;
        if (params?.featured) apiParams.featured = params.featured;
        
        console.log('Fetching courses with params:', apiParams);
        
        const response = await coursesApi.getCourses(apiParams);
        const filteredCourses = response.data;
        
        // Transform the courses
        const transformedCourses = filteredCourses.map(course => transformApiCourse(course));
        setCourses(transformedCourses);
        setError(null);
        
        console.log('Fetched courses:', transformedCourses.length, 'results');
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch courses'));
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [params?.type, params?.featured, params?.query, params?.category]);

  return { courses, loading, error };
}

export function useCourse(slug: string) {
  const locale = useLocale();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await coursesApi.getCourse(slug);
        const transformedCourse = transformApiCourse(response.data, locale);
        setCourse(transformedCourse);
        setError(null);
      } catch (err) {
        console.error(`Error fetching course ${slug}:`, err);
        setError(err instanceof Error ? err : new Error('Failed to fetch course'));
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug, locale]);

  return { course, loading, error };
}

export function useHomeContent() {
  const locale = useLocale();
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await contentApi.getContentTemplates();
        const heroSection = response.hero;
        // Transform ContentSection to HomeContent format
        const homeContent: HomeContent = {
          hero: {
            title: heroSection?.fields?.find(f => f.id === `hero-title-${locale}`)?.value || 'Welcome',
            subtitle: heroSection?.fields?.find(f => f.id === `hero-badge-${locale}`)?.value || 'Training Platform',
            description: heroSection?.fields?.find(f => f.id === `hero-description-${locale}`)?.value || 'Learn and grow',
            ctaText: heroSection?.fields?.find(f => f.id === `hero-cta-primary-${locale}`)?.value || 'Get Started'
          },
          features: heroSection?.fields?.find(f => f.id === 'features')?.value?.map((feature: any) => ({
            title: locale === 'ar' ? feature.titleAr : feature.titleEn,
            description: locale === 'ar' ? feature.descriptionAr : feature.descriptionEn,
            icon: 'star'
          })) || [],
          testimonials: heroSection?.fields?.find(f => f.id === 'testimonials')?.value?.map((testimonial: any) => ({
            name: locale === 'ar' ? testimonial.nameAr : testimonial.nameEn,
            role: locale === 'ar' ? testimonial.roleAr : testimonial.roleEn,
            company: 'Ersa Training',
            text: locale === 'ar' ? testimonial.textAr : testimonial.textEn
          })) || [],
          stats: [
            { label: locale === 'ar' ? 'طلاب' : 'Students', value: '1000+' },
            { label: locale === 'ar' ? 'دورات' : 'Courses', value: '50+' },
            { label: locale === 'ar' ? 'مدربون' : 'Instructors', value: '10+' },
            { label: locale === 'ar' ? 'تقييمات' : 'Reviews', value: '500+' }
          ]
        };
        setContent(homeContent);
        setError(null);
      } catch (err) {
        console.error('Error fetching home content:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch home content'));
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [locale]);

  return { content, loading, error };
}

export function useCategories() {
  const locale = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await contentApi.getContentTemplates();
        const coursesSection = response.courses;
        // Transform to categories format
        const categories: Category[] = coursesSection?.fields?.find(f => f.id === 'categories')?.value?.map((cat: any, index: number) => ({
          id: `cat-${index + 1}`,
          name: locale === 'ar' ? cat.nameAr : cat.nameEn,
          slug: cat.nameEn?.toLowerCase().replace(/\s+/g, '-') || `category-${index + 1}`,
          description: locale === 'ar' ? cat.descriptionAr : cat.descriptionEn,
          coursesCount: Math.floor(Math.random() * 20) + 5
        })) || [];
        setCategories(categories);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [locale]);

  return { categories, loading, error };
}

export function useSiteStats() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Mock site stats since API doesn't have this method
        const mockStats: SiteStats = {
          totalStudents: 1250,
          totalCourses: 48,
          totalInstructors: 12,
          totalReviews: 423,
          averageRating: 4.8,
          completionRate: 87
        };
        setStats(mockStats);
        setError(null);
      } catch (err) {
        console.error('Error fetching site stats:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch site stats'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
