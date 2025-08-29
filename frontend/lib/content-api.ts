import { api } from './api';
import type { 
  Course, 
  PageContent, 
  ContentSection, 
  Session,
  Category,
  HomeContent,
  AboutContent,
  FaqContent,
  SiteStats
} from './types/api';
import type { ContentApiResponse } from './types/api-common';

export const contentApi = {
  // Page Content
  getPageContent: (pageKey: string, locale: string) =>
    api.get<PageContent>(`/api/content/pages/key/${pageKey}`, {
      headers: { 'Accept-Language': locale }
    }),

  // Courses
  getCourses: (params?: { type?: 'Live' | 'PDF', featured?: boolean }) =>
    api.get<Course[]>('/api/courses', { params }),

  getCourse: (slug: string, locale: string) =>
    api.get<Course>(`/api/courses/${slug}`, {
      headers: { 'Accept-Language': locale }
    }),

  getCourseSessions: (courseId: string) =>
    api.get<Session[]>(`/api/courses/${courseId}/sessions`),

  getFeaturedCourses: () =>
    api.get<Course[]>('/api/courses/featured'),

  // Categories
  getCategories: (locale: string) =>
    api.get<Category[]>('/api/categories', {
      headers: { 'Accept-Language': locale }
    }),

  // Site Content (Home Page, About, etc.)
  getHomeContent: (locale: string) =>
    api.get<HomeContent>('/api/content/home', {
      headers: { 'Accept-Language': locale }
    }),

  getAboutContent: (locale: string) =>
    api.get<AboutContent>('/api/content/about', {
      headers: { 'Accept-Language': locale }
    }),

  getFaqContent: (locale: string) =>
    api.get<FaqContent>('/api/content/faq', {
      headers: { 'Accept-Language': locale }
    }),

  // Stats
  getSiteStats: () =>
    api.get<SiteStats>('/api/stats'),
};


