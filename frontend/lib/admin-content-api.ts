import { api } from './api';
import type { PageContent, Course, ContentSection } from './types/api';
import type { ContentApiResponse } from './types/api-common';
import type { LocaleString } from './common-types';

export const contentAdminApi = {
  // Get content sections
  getContentSections: async () => {
    try {
      const response = await api.get('/content/admin/sections');
      return { 
        data: response.data.data || [], 
        success: response.data.success || true, 
        message: response.data.message 
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Update content section
  updateContentSection: (sectionId: string, content: any) =>
    api.put(`/content/admin/sections/${sectionId}`, { content }),

  // Get page content for admin
  getPageContent: (pageKey: string) =>
    api.get<ContentApiResponse<PageContent>>(`/content/admin/pages/${pageKey}/content`),

  // Update page content
  updatePageContent: (pageKey: string, content: PageContent) =>
    api.put(`/content/pages/${pageKey}`, content),

  // Initialize page content
  initializePageContent: (pageKey: string) =>
    api.post(`/content/admin/pages/${pageKey}/initialize`, {}),

  // Update localized content
  updateLocalizedContent: (pageKey: string, locale: string, content: any) =>
    api.put(`/content/pages/${pageKey}/locales/${locale}`, content),

  // Initialize sample data
  initializeSampleData: () =>
    api.post('/content/admin/initialize-sample-data', {}),
};

// Types
export interface AdminContentResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface AdminContentSection {
  id: string;
  name: string;
  type: string;
  pageKey: string;
  pageName: string;
  content: any;
  isActive: boolean;
  lastModified: string;
}

export interface AdminPageContent {
  pageKey: string;
  pageName: string;
  sections: AdminContentSection[];
}
