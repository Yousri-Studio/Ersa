import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { contentApi } from './content-api';
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
        const response = await contentApi.getPageContent(pageKey, locale);
        setData(response.data as T);
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
function transformApiCourse(apiCourse: ApiCourse, locale: string = 'ar'): Course {
  const levelMap = { 'Biginner': 'مبتدئ', 'Intermediate': 'متوسط', 'Advanced': 'متقدم' };
  const categoryMap = { 'Programming': 'البرمجة', 'Business': 'الأعمال', 'Design': 'التصميم' };
  
  return {
    ...apiCourse,
    // Keep the original localized title and summary objects from backend
    title: apiCourse.title,
    summary: apiCourse.summary,
    curriculum: apiCourse.sessions?.map((session, index) => ({
      id: index + 1,
      title: `الجلسة ${index + 1}`,
      lessons: 4,
      duration: '2 ساعة',
      isPreview: index === 0
    })) || apiCourse.attachments?.map((attachment, index) => ({
      id: index + 1,
      title: `${attachment.fileName}`,
      lessons: 1,
      duration: 'ملف PDF',
      isPreview: index === 0
    })) || [
      {
        id: 1,
        title: 'مقدمة في الدورة',
        lessons: 4,
        duration: '2 ساعة',
        isPreview: true
      }
    ],
    features: apiCourse.type === 'Live' 
      ? ['جلسات مباشرة', 'شهادة إتمام', 'دعم المدرب', 'تسجيلات الجلسات', 'مواد تدريبية']
      : ['وصول مدى الحياة', 'ملفات PDF', 'شهادة إتمام', 'دعم المدرب', 'ملفات قابلة للتحميل'],
    requirements: ['معرفة أساسية بالحاسوب', 'الرغبة في التعلم والإبداع'],
    description: typeof apiCourse.summary === 'object' 
      ? (locale === 'ar' ? apiCourse.summary.ar : apiCourse.summary.en) || (locale === 'ar' ? apiCourse.summary.en : apiCourse.summary.ar)
      : apiCourse.summary,
    lessons: apiCourse.sessions?.length || apiCourse.attachments?.length || 1,
    instructor: {
      name: apiCourse.instructorName,
      title: apiCourse.instructor?.title || 'مدرب معتمد',
      avatar: apiCourse.instructor?.avatar || '/api/placeholder/60/60',
      rating: 4.8,
      studentsCount: Math.floor(Math.random() * 5000) + 1000,
      coursesCount: Math.floor(Math.random() * 20) + 5
    },
    reviewsCount: Math.floor(Math.random() * 2000) + 500,
    studentsCount: Math.floor(Math.random() * 5000) + 1000,
    duration: apiCourse.type === 'Live' 
      ? `${(apiCourse.sessions?.length || 1) * 2} ساعة` 
      : 'وصول مدى الحياة',
    level: levelMap[apiCourse.level] || apiCourse.level || 'متوسط',
    language: 'العربية',
    originalPrice: Math.round(apiCourse.price * 1.3),
    lastUpdated: apiCourse.updatedAt?.split('T')[0] || apiCourse.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
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
        const response = await contentApi.getCourses(params);
        const transformedCourses = response.data.map(course => transformApiCourse(course));
        setCourses(transformedCourses);
        setError(null);
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
        const response = await contentApi.getCourse(slug, locale);
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
        const response = await contentApi.getHomeContent(locale);
        setContent(response.data);
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
        const response = await contentApi.getCategories(locale);
        setCategories(response.data);
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
        const response = await contentApi.getSiteStats();
        setStats(response.data);
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
