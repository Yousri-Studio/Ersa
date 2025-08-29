import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { contentApi } from './content-api';
import type { 
  Course, 
  Category, 
  HomeContent, 
  SiteStats,
  AboutContent,
  PageContent
} from './types/api';

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

export function useCourses(params?: { type?: 'Live' | 'PDF'; featured?: boolean }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await contentApi.getCourses(params);
        setCourses(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch courses'));
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [params?.type, params?.featured]);

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
        setCourse(response.data);
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
