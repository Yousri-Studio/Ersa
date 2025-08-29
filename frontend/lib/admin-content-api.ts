import { api } from './api';
import type { PageContent, Course, ContentSection } from './types/api';
import type { ContentApiResponse } from './types/api-common';
import type { LocaleString } from './common-types';

export const contentAdminApi = {
  // Get content sections
  getContentSections: () =>
    api.get<{ data: ContentSection[], success: boolean, message?: string }>('/api/admin/content/sections')
      .then(response => ({ 
        data: response.data.data, 
        success: response.data.success, 
        message: response.data.message 
      })),

  // Update content section
  updateContentSection: (sectionId: string, content: any) =>
    api.put(`/api/admin/content/sections/${sectionId}`, { content }),

  // Get page content for admin
  getPageContent: (pageKey: string) =>
    api.get<ContentApiResponse<PageContent>>(`/api/admin/content/pages/${pageKey}`),

  // Update page content
  updatePageContent: (pageKey: string, content: PageContent) =>
    api.put(`/api/admin/content/pages/${pageKey}`, content),

  // Update localized content
  updateLocalizedContent: (pageKey: string, locale: string, content: any) =>
    api.put(`/api/admin/content/pages/${pageKey}/locales/${locale}`, content),
};

// Types
export interface AdminContentResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
