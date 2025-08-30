import { api } from './api';

export interface ContentPage {
  id: string;
  pageKey: string;
  pageName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sections: ContentSection[];
}

export interface ContentSection {
  id: string;
  contentPageId: string;
  sectionKey: string;
  sectionName: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  blocks: ContentBlock[];
}

export interface ContentBlock {
  id: string;
  contentSectionId: string;
  blockKey: string;
  blockName: string;
  blockType: string;
  contentEn?: string;
  contentAr?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentVersion {
  id: string;
  contentPageId: string;
  versionName: string;
  contentData?: string;
  isPublished: boolean;
  createdAt: string;
  createdBy: string;
}

export interface CreateContentPage {
  pageKey: string;
  pageName: string;
  description?: string;
}

export interface UpdateContentPage {
  pageName: string;
  description?: string;
  isActive: boolean;
}

export interface CreateContentSection {
  sectionKey: string;
  sectionName: string;
  description?: string;
  sortOrder: number;
}

export interface UpdateContentSection {
  sectionName: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateContentBlock {
  blockKey: string;
  blockName: string;
  blockType: string;
  contentEn?: string;
  contentAr?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  sortOrder: number;
}

export interface UpdateContentBlock {
  blockName: string;
  contentEn?: string;
  contentAr?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateContentVersion {
  versionName: string;
  contentData?: string;
  isPublished: boolean;
}

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

export interface PageContent {
  pageKey: string;
  pageName: string;
  sections: SectionContent[];
}

export interface SectionContent {
  sectionKey: string;
  sectionName: string;
  sortOrder: number;
  blocks: BlockContent[];
}

export interface BlockContent {
  blockKey: string;
  blockName: string;
  blockType: string;
  contentEn?: string;
  contentAr?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  sortOrder: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  activeCourses: number;
  totalOrders: number;
  totalRevenue: number;
  recentUsers: UserSummary[];
  recentOrders: OrderSummary[];
  userGeographics: UserGeographic[];
}

export interface UserGeographic {
  country: string;
  users: number;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  status: string;
}

export interface OrderSummary {
  id: string;
  userName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  locale: string;
  createdAt: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  lastLoginAt?: string;
  status?: string;
}

export interface AdminCourse {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  id: string;
  userId: string;
  userName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateUserStatusRequest {
  status: string;
  adminNotes?: string;
}

export interface UpdateAdminRoleRequest {
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phone?: string;
  locale: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export interface AdminCreateCourseRequest {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  isActive: boolean;
}

export interface AdminUpdateCourseRequest {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  isActive: boolean;
}

export const adminApi = {
  // Dashboard
  getDashboardStats: () => {
    console.log('Making API call to /admin/dashboard-stats');
    return api.get<DashboardStats>('/admin/dashboard-stats')
      .then(response => {
        console.log('API response received:', response);
        return response;
      })
      .catch(error => {
        console.error('API error:', error);
        throw error;
      });
  },

  // Users
  getUsers: (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }) => api.get<PagedResult<AdminUser>>('/admin/users', { params }),

  updateUserStatus: (userId: string, data: UpdateUserStatusRequest) =>
    api.put(`/admin/users/${userId}/status`, data),

  updateAdminRole: (userId: string, data: UpdateAdminRoleRequest) =>
    api.put(`/admin/users/${userId}/admin-role`, data),

  createUser: (data: CreateUserRequest) =>
    api.post<AdminUser>('/admin/users', data),

  // Courses
  getCourses: (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }) => api.get<PagedResult<AdminCourse>>('/admin/courses', { params }),

  createCourse: (data: AdminCreateCourseRequest) =>
    api.post<AdminCourse>('/admin/courses', data),

  updateCourse: (courseId: string, data: AdminUpdateCourseRequest) =>
    api.put<AdminCourse>(`/admin/courses/${courseId}`, data),

  deleteCourse: (courseId: string) =>
    api.delete(`/admin/courses/${courseId}`),

  // Orders
  getOrders: (params: {
    page?: number;
    pageSize?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) => api.get<PagedResult<AdminOrder>>('/admin/orders', { params }),

  updateOrderStatus: (orderId: string, data: UpdateOrderStatusRequest) =>
    api.put(`/admin/orders/${orderId}/status`, data),
    
  // Content Management
  getContentPages: () => api.get<ContentPage[]>('/content/pages'),

  getContentPage: (id: string) =>
    api.get<ContentPage>(`/content/pages/${id}`),

  createContentPage: (data: CreateContentPage) =>
    api.post<ContentPage>('/content/pages', data),

  updateContentPage: (id: string, data: UpdateContentPage) =>
    api.put<ContentPage>(`/content/pages/${id}`, data),

  deleteContentPage: (id: string) =>
    api.delete(`/content/pages/${id}`),

  createContentSection: (pageId: string, data: CreateContentSection) =>
    api.post<ContentSection>(`/content/pages/${pageId}/sections`, data),

  updateContentSection: (pageId: string, sectionId: string, data: UpdateContentSection) =>
    api.put<ContentSection>(`/content/pages/${pageId}/sections/${sectionId}`, data),

  deleteContentSection: (pageId: string, sectionId: string) =>
    api.delete(`/content/pages/${pageId}/sections/${sectionId}`),

  createContentBlock: (pageId: string, sectionId: string, data: CreateContentBlock) =>
    api.post<ContentBlock>(`/content/pages/${pageId}/sections/${sectionId}/blocks`, data),

  updateContentBlock: (pageId: string, sectionId: string, blockId: string, data: UpdateContentBlock) =>
    api.put<ContentBlock>(`/content/pages/${pageId}/sections/${sectionId}/blocks/${blockId}`, data),

  deleteContentBlock: (pageId: string, sectionId: string, blockId: string) =>
    api.delete(`/content/pages/${pageId}/sections/${sectionId}/blocks/${blockId}`),

  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<FileUploadResponse>('/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getPageContent: (pageKey: string) =>
    api.get<PageContent>(`/content/pages/key/${pageKey}`),

  getContentVersions: (pageId: string) =>
    api.get<ContentVersion[]>(`/content/pages/${pageId}/versions`),

  createContentVersion: (pageId: string, data: CreateContentVersion) =>
    api.post<ContentVersion>(`/content/pages/${pageId}/versions`, data),

  publishContentVersion: (pageId: string, versionId: string) =>
    api.post(`/content/pages/${pageId}/versions/${versionId}/publish`),
};
