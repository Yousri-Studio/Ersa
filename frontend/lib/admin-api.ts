import { api } from './api';
import { apiCallWithFallback } from './backend-connection';

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
  totalUsers: number; // Only public users (excluding admin users)
  activeUsers: number;
  totalCourses: number;
  activeCourses: number;
  totalOrders: number;
  totalRevenue: number; // Only from paid and completed/under process orders
  recentUsers: UserSummary[]; // Only public users
  recentOrders: OrderSummary[]; // Latest orders with full details
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
  userId: string;
  userName: string;
  totalAmount: number;
  status: string | number;
  createdAt: string;
  updatedAt: string;
  courseName?: string; // For display in dashboard
  courseType?: string; // Online/Offline
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

export interface CourseCategory {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr?: string;
  subtitleEn?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSubCategory {
  id: string;
  titleAr: string;
  titleEn: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCourse {
  id: string;
  slug?: string;
  titleAr: string;
  titleEn: string;
  summaryAr?: string;
  summaryEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  currency?: string;
  type?: number;
  level?: number;
  categoryId?: string | null;
  category?: CourseCategory | null;
  subCategories?: CourseSubCategory[];
  videoUrl?: string;
  durationEn?: string;
  durationAr?: string;
  from?: string;
  to?: string;
  sessionsNotesEn?: string;
  sessionsNotesAr?: string;
  instructorNameAr?: string;
  instructorNameEn?: string;
  instructors?: Instructor[];
  photo?: number[] | string;
  tags?: string;
  instructorsBioAr?: string;
  instructorsBioEn?: string;
  courseTopicsAr?: string;
  courseTopicsEn?: string;
  isActive: boolean;
  isFeatured?: boolean;
  attachmentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  id: string;
  userId: string;
  userName: string;
  totalAmount: number;
  status: string | number; // Can be enum number from backend or string
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderDetail {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string | number; // Can be enum number from backend or string
  createdAt: string;
  updatedAt: string;
  customer: AdminOrderCustomer;
  items: AdminOrderItem[];
  payments: AdminOrderPayment[];
}

export interface AdminOrderCustomer {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  locale: string;
  createdAt: string;
}

export interface AdminOrderItem {
  id: string;
  courseId: string;
  sessionId?: string;
  courseTitleEn: string;
  courseTitleAr: string;
  price: number;
  currency: string;
  qty: number;
  createdAt: string;
}

export interface AdminOrderPayment {
  id: string;
  provider: string;
  providerRef?: string;
  status: string;
  capturedAt?: string;
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
  slug: string;
  titleAr: string;
  titleEn: string;
  summaryAr?: string;
  summaryEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  currency: string;
  type: number; // CourseType enum
  level?: number; // CourseLevel enum
  categoryId?: string | null;
  subCategoryIds?: string[];
  videoUrl?: string;
  durationEn?: string;
  durationAr?: string;
  from?: string;
  to?: string;
  sessionsNotesEn?: string;
  sessionsNotesAr?: string;
  instructorIds?: string[];
  photo?: number[] | string | null;
  tags?: string;
  courseTopicsAr?: string;
  courseTopicsEn?: string;
  isActive: boolean;
  isFeatured?: boolean;
}

export type AdminUpdateCourseRequest = AdminCreateCourseRequest;

export interface CreateCourseCategoryRequest {
  titleAr: string;
  titleEn: string;
  subtitleAr?: string;
  subtitleEn?: string;
  displayOrder: number;
  isActive: boolean;
}

export type UpdateCourseCategoryRequest = CreateCourseCategoryRequest;

export interface CreateCourseSubCategoryRequest {
  titleAr: string;
  titleEn: string;
  displayOrder: number;
  isActive: boolean;
}

export type UpdateCourseSubCategoryRequest = CreateCourseSubCategoryRequest;

// Instructor interfaces
export interface Instructor {
  id: string;
  instructorNameEn: string;
  instructorNameAr: string;
  instructorBioEn?: string;
  instructorBioAr?: string;
  createdAt: string;
  updatedAt: string;
  courseIds: string[];
}

export interface CreateInstructorRequest {
  instructorNameEn: string;
  instructorNameAr: string;
  instructorBioEn?: string;
  instructorBioAr?: string;
  courseIds?: string[];
}

export type UpdateInstructorRequest = CreateInstructorRequest;

// Role Management
export interface UserWithRoles {
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

export interface RoleInfo {
  id: string;
  name: string;
  normalizedName?: string;
}

// Order Fulfillment
export interface AttachmentDto {
  id: string;
  fileName: string;
  type: number; // AttachmentType enum: PDF=1, Video=2, Document=3
}

export interface SecureLinkDto {
  id: string;
  attachmentFileName: string;
  token: string;
  isRevoked: boolean;
  createdAt: string;
}

export interface SessionDto {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  startAt: string;
  endAt: string;
  teamsLink?: string;
  capacity?: number;
  availableSpots?: number;
}

export interface OrderEnrollmentDto {
  id: string;
  courseId: string;
  courseType: number; // CourseType enum: Live=1, PDF=2
  courseTitle: {
    ar: string;
    en: string;
  };
  sessionId?: string;
  session?: SessionDto;
  courseSessions: SessionDto[]; // All sessions for this course
  status: number; // EnrollmentStatus enum
  courseAttachments: AttachmentDto[];
  secureLinks: SecureLinkDto[];
}

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: InvoiceCustomerDto;
  items: InvoiceItemDto[];
  payments: InvoicePaymentDto[];
}

export interface InvoiceCustomerDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  locale?: string;
  createdAt: string;
}

export interface InvoiceItemDto {
  id: string;
  courseId: string;
  sessionId?: string;
  courseTitleEn: string;
  courseTitleAr: string;
  price: number;
  currency: string;
  qty: number;
}

export interface InvoicePaymentDto {
  id: string;
  provider: string;
  providerRef?: string;
  status: string;
  capturedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSecureLinksRequest {
  attachmentIds: string[];
  sendEmail: boolean;
}

export interface CreateEnrollmentSessionRequest {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  startAt: string;
  endAt: string;
  teamsLink: string;
  sendEmail: boolean;
}

export interface UpdateEnrollmentSessionRequest {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  startAt: string;
  endAt: string;
  teamsLink: string;
  sendEmail: boolean;
}

export interface CancelEnrollmentSessionRequest {
  cancellationReasonEn: string;
  cancellationReasonAr: string;
  sendEmail: boolean;
}

// Fallback data for when backend is not available
const fallbackDashboardStats: DashboardStats = {
  totalUsers: 11, // Only public users (excluding admin users)
  activeUsers: 11,
  totalCourses: 12,
  activeCourses: 12,
  totalOrders: 17,
  totalRevenue: 199.99, // Only from paid and completed/under process orders
  recentUsers: [
    {
      id: '1',
      fullName: 'أحمد محمد علي',
      email: 'ahmed.mohamed@example.com',
      createdAt: '2025-01-15T10:30:00Z',
      status: 'Active'
    },
    {
      id: '2', 
      fullName: 'فاطمة سعد النور',
      email: 'fatima.saad@example.com',
      createdAt: '2025-01-14T15:45:00Z',
      status: 'Active'
    },
    {
      id: '3',
      fullName: 'محمد عبدالله الخالد',
      email: 'mohamed.abdullah@example.com',
      createdAt: '2025-01-13T09:20:00Z',
      status: 'Active'
    },
    {
      id: '4',
      fullName: 'سارة أحمد المطيري',
      email: 'sarah.ahmed@example.com',
      createdAt: '2025-01-12T14:15:00Z',
      status: 'Active'
    }
  ],
  recentOrders: [
    {
      id: '1',
      userId: '1',
      userName: 'أحمد محمد علي',
      totalAmount: 1200,
      status: 'Paid',
      createdAt: '2025-01-15T12:00:00Z',
      updatedAt: '2025-01-15T12:05:00Z',
      courseName: 'دورة التصميم الجرافيكي المتقدمة',
      courseType: 'أونلاين'
    },
    {
      id: '2',
      userId: '3',
      userName: 'فاطمة سعد النور',
      totalAmount: 850,
      status: 'Paid',
      createdAt: '2025-01-14T16:30:00Z',
      updatedAt: '2025-01-14T16:35:00Z',
      courseName: 'أساسيات تطوير المواقع',
      courseType: 'أونلاين'
    },
    {
      id: '3',
      userId: '4',
      userName: 'محمد عبدالله الخالد',
      totalAmount: 1500,
      status: 'Under Process',
      createdAt: '2025-01-13T11:15:00Z',
      updatedAt: '2025-01-13T11:20:00Z',
      courseName: 'دورة التسويق الرقمي',
      courseType: 'أونلاين'
    }
  ],
  userGeographics: [
    { country: 'Saudi Arabia', users: 89, coordinates: [45.0792, 23.8859] },
    { country: 'Egypt', users: 34, coordinates: [30.8025, 26.8206] },
    { country: 'United Arab Emirates', users: 21, coordinates: [54.3773, 24.2533] },
    { country: 'Kuwait', users: 12, coordinates: [47.4818, 29.3117] }
  ]
};

const fallbackUsers: PagedResult<AdminUser> = {
  items: [
    {
      id: '1',
      fullName: 'أحمد محمد علي',
      email: 'ahmed.mohamed@example.com',
      phone: '+966501234567',
      locale: 'ar',
      createdAt: '2025-01-15T10:30:00Z',
      isAdmin: false,
      isSuperAdmin: false,
      lastLoginAt: '2025-01-16T08:15:00Z',
      status: 'Active'
    },
    {
      id: '2',
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1234567890',
      locale: 'en',
      createdAt: '2025-01-14T15:45:00Z',
      isAdmin: true,
      isSuperAdmin: false,
      lastLoginAt: '2025-01-16T09:30:00Z',
      status: 'Active'
    },
    {
      id: '3',
      fullName: 'فاطمة سعد النور',
      email: 'fatima.saad@example.com',
      phone: '+966502345678',
      locale: 'ar',
      createdAt: '2025-01-13T09:20:00Z',
      isAdmin: false,
      isSuperAdmin: false,
      lastLoginAt: '2025-01-15T16:45:00Z',
      status: 'Active'
    }
  ],
  totalCount: 156,
  page: 1,
  pageSize: 20,
  totalPages: 8
};

const fallbackCourses: PagedResult<AdminCourse> = {
  items: [
    {
      id: '1',
      slug: 'advanced-graphic-design',
      titleAr: 'دورة التصميم الجرافيكي المتقدمة',
      titleEn: 'Advanced Graphic Design Course',
      summaryAr: 'تعلم أحدث تقنيات التصميم الجرافيكي',
      summaryEn: 'Learn the latest graphic design techniques',
      price: 1200,
      currency: 'SAR',
      type: 1,
      level: 2,
      category: null,
      instructorNameAr: 'أحمد المصمم',
      instructorNameEn: 'Ahmed Al-Musamim',
      isActive: true,
      isFeatured: true,
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-15T14:30:00Z'
    },
    {
      id: '2',
      slug: 'web-development-fundamentals',
      titleAr: 'أساسيات تطوير المواقع',
      titleEn: 'Web Development Fundamentals',
      summaryAr: 'تعلم أساسيات تطوير المواقع الإلكترونية',
      summaryEn: 'Learn web development basics',
      price: 950,
      currency: 'SAR',
      type: 0,
      level: 1,
      category: null,
      instructorNameAr: 'محمد المطور',
      instructorNameEn: 'Mohammed Al-Mutawir',
      isActive: true,
      isFeatured: false,
      createdAt: '2025-01-08T09:00:00Z',
      updatedAt: '2025-01-12T11:20:00Z'
    }
  ],
  totalCount: 28,
  page: 1,
  pageSize: 20,
  totalPages: 2
};

const fallbackOrders: PagedResult<AdminOrder> = {
  items: [
    {
      id: '1',
      userId: '1',
      userName: 'أحمد محمد علي',
      totalAmount: 1200,
      status: 'Paid',
      createdAt: '2025-01-15T12:00:00Z',
      updatedAt: '2025-01-15T12:05:00Z'
    },
    {
      id: '2',
      userId: '3',
      userName: 'فاطمة سعد النور',
      totalAmount: 850,
      status: 'Paid',
      createdAt: '2025-01-14T16:30:00Z',
      updatedAt: '2025-01-14T16:35:00Z'
    },
    {
      id: '3',
      userId: '2',
      userName: 'Sarah Johnson',
      totalAmount: 1500,
      status: 'Pending',
      createdAt: '2025-01-13T11:15:00Z',
      updatedAt: '2025-01-13T11:15:00Z'
    }
  ],
  totalCount: 89,
  page: 1,
  pageSize: 20,
  totalPages: 5
};

export const adminApi = {
  // Dashboard - with fallback support
  getDashboardStats: async () => {
    const result = await apiCallWithFallback(
      () => api.get<DashboardStats>('/admin/dashboard-stats'),
      fallbackDashboardStats,
      { fallbackMessage: 'Backend not available, using demo dashboard data' }
    );
    return { data: result.data, isUsingFallback: result.isUsingFallback };
  },

  // Users - with fallback support
  getUsers: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }) => {
    const result = await apiCallWithFallback(
      () => api.get<PagedResult<AdminUser>>('/admin/users', { params: { ...params } }),
      fallbackUsers,
      { fallbackMessage: 'Backend not available, using demo user data' }
    );
    return { data: result.data, isUsingFallback: result.isUsingFallback };
  },

  updateUserStatus: (userId: string, data: UpdateUserStatusRequest) =>
    api.put(`/admin/users/${userId}/status`, data),

  updateAdminRole: (userId: string, data: UpdateAdminRoleRequest) =>
    api.put(`/admin/users/${userId}/admin-role`, data),

  createUser: (data: CreateUserRequest) =>
    api.post<AdminUser>('/admin/users', data),

  // Courses - with fallback support
  getCourses: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
    categoryId?: string;
  }) => {
    const result = await apiCallWithFallback(
      () => api.get<PagedResult<AdminCourse>>('/admin/courses', { params: { ...params } }),
      fallbackCourses,
      { fallbackMessage: 'Backend not available, using demo course data' }
    );
    return { data: result.data, isUsingFallback: result.isUsingFallback };
  },

  createCourse: (data: AdminCreateCourseRequest) => {
    // Convert photo number array to base64 string for proper serialization
    const requestData = {
      ...data,
      photo: data.photo && Array.isArray(data.photo) && data.photo.length > 0
        ? btoa(new Uint8Array(data.photo).reduce((acc, byte) => acc + String.fromCharCode(byte), ''))
        : null
    };
    return api.post<AdminCourse>('/admin/courses', requestData);
  },

  updateCourse: (courseId: string, data: AdminUpdateCourseRequest) => {
    // Convert photo number array to base64 string for proper serialization
    const requestData = {
      ...data,
      photo: data.photo && Array.isArray(data.photo) && data.photo.length > 0
        ? btoa(new Uint8Array(data.photo).reduce((acc, byte) => acc + String.fromCharCode(byte), ''))
        : null
    };
    return api.put<AdminCourse>(`/admin/courses/${courseId}`, requestData);
  },

  deleteCourse: (courseId: string) =>
    api.delete(`/admin/courses/${courseId}`),

  // Course Categories
  getCourseCategories: async (params?: {
    activeOnly?: boolean;
  }) => {
    return api.get<CourseCategory[]>('/admin/course-categories', { params: { ...params } });
  },

  getCourseCategory: (categoryId: string) =>
    api.get<CourseCategory>(`/admin/course-categories/${categoryId}`),

  createCourseCategory: (data: CreateCourseCategoryRequest) =>
    api.post<CourseCategory>('/admin/course-categories', data),

  updateCourseCategory: (categoryId: string, data: UpdateCourseCategoryRequest) =>
    api.put<CourseCategory>(`/admin/course-categories/${categoryId}`, data),

  deleteCourseCategory: (categoryId: string) =>
    api.delete(`/admin/course-categories/${categoryId}`),

  // Course SubCategories
  getCourseSubCategories: async (params?: {
    activeOnly?: boolean;
  }) => {
    return api.get<CourseSubCategory[]>('/admin/course-subcategories', { params: { ...params } });
  },

  getCourseSubCategory: (subCategoryId: string) =>
    api.get<CourseSubCategory>(`/admin/course-subcategories/${subCategoryId}`),

  createCourseSubCategory: (data: CreateCourseSubCategoryRequest) =>
    api.post<CourseSubCategory>('/admin/course-subcategories', data),

  updateCourseSubCategory: (subCategoryId: string, data: UpdateCourseSubCategoryRequest) =>
    api.put<CourseSubCategory>(`/admin/course-subcategories/${subCategoryId}`, data),

  deleteCourseSubCategory: (subCategoryId: string) =>
    api.delete(`/admin/course-subcategories/${subCategoryId}`),

  // Orders - with fallback support
  getOrders: async (params: {
    page?: number;
    pageSize?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const result = await apiCallWithFallback(
      () => api.get<PagedResult<AdminOrder>>('/admin/orders', { params: { ...params } }),
      fallbackOrders,
      { fallbackMessage: 'Backend not available, using demo order data' }
    );
    return { data: result.data, isUsingFallback: result.isUsingFallback };
  },

  updateOrderStatus: (orderId: string, data: UpdateOrderStatusRequest) =>
    api.put(`/admin/orders/${orderId}/status`, data),

  getOrderDetail: async (orderId: string) => {
    const fallbackOrderDetail: AdminOrderDetail = {
      id: orderId,
      userId: '1',
      amount: 1500,
      currency: 'SAR',
      status: 'Paid',
      createdAt: '2025-01-15T12:00:00Z',
      updatedAt: '2025-01-15T12:05:00Z',
      customer: {
        id: '1',
        fullName: 'أحمد محمد علي',
        email: 'ahmed.hassan@email.com',
        phone: '+966501234567',
        country: 'Saudi Arabia',
        locale: 'ar',
        createdAt: '2024-12-01T10:00:00Z'
      },
      items: [
        {
          id: '1',
          courseId: 'course-1',
          courseTitleEn: 'Web Development Fundamentals',
          courseTitleAr: 'أساسيات تطوير المواقع',
          price: 1500,
          currency: 'SAR',
          qty: 1,
          createdAt: '2025-01-15T12:00:00Z'
        }
      ],
      payments: [
        {
          id: '1',
          provider: 'HyperPay',
          providerRef: 'HP_REF_001234567',
          status: 'Completed',
          capturedAt: '2025-01-15T12:05:00Z',
          createdAt: '2025-01-15T12:00:00Z',
          updatedAt: '2025-01-15T12:05:00Z'
        }
      ]
    };

    const result = await apiCallWithFallback(
      () => api.get<AdminOrderDetail>(`/admin/orders/${orderId}`),
      fallbackOrderDetail,
      { fallbackMessage: 'Backend not available, using demo order detail data' }
    );
    return { data: result.data, isUsingFallback: result.isUsingFallback };
  },
    
  // Instructors
  getInstructors: () => api.get<Instructor[]>('/admin/instructors'),

  getInstructor: (id: string) => api.get<Instructor>(`/admin/instructors/${id}`),

  createInstructor: (data: CreateInstructorRequest) =>
    api.post<Instructor>('/admin/instructors', data),

  updateInstructor: (id: string, data: UpdateInstructorRequest) =>
    api.put<Instructor>(`/admin/instructors/${id}`, data),

  deleteInstructor: (id: string) => api.delete(`/admin/instructors/${id}`),

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

  // Role Management (SuperAdmin only)
  getUsersWithRoles: () =>
    api.get<UserWithRoles[]>('/admin/users-with-roles'),

  assignRoleToUser: (email: string, roleName: string) =>
    api.post(`/admin/users/${encodeURIComponent(email)}/roles/${roleName}`),

  removeRoleFromUser: (email: string, roleName: string) =>
    api.delete(`/admin/users/${encodeURIComponent(email)}/roles/${roleName}`),

  getAllRoles: () =>
    api.get<RoleInfo[]>('/role/roles'),

  getUserRoles: (email: string) =>
    api.get<string[]>(`/role/user/${encodeURIComponent(email)}/roles`),

  // Course Attachments
  uploadCourseAttachment: async (courseId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // For file uploads, we need to delete the Content-Type header so axios sets it with boundary
    const response = await api.post<AttachmentDto>(
      `/admin/courses/${courseId}/attachments`, 
      formData,
      {
        headers: {
          'Content-Type': false as any, // Tell axios to NOT set content-type, let browser do it
        },
      }
    );
    return response;
  },

  getCourseAttachments: (courseId: string) =>
    api.get<AttachmentDto[]>(`/admin/courses/${courseId}/attachments`),

  deleteCourseAttachment: (attachmentId: string) =>
    api.delete(`/admin/attachments/${attachmentId}`),

  // Order Fulfillment
  getOrderEnrollments: (orderId: string) =>
    api.get<OrderEnrollmentDto[]>(`/admin/orders/${orderId}/enrollments`),

  getOrderInvoice: (orderId: string) =>
    api.get<InvoiceDto>(`/admin/orders/${orderId}/invoice`),

  createSecureLinks: (enrollmentId: string, data: CreateSecureLinksRequest) =>
    api.post<SecureLinkDto[]>(`/admin/enrollments/${enrollmentId}/secure-links`, data),

  createEnrollmentSession: (enrollmentId: string, data: CreateEnrollmentSessionRequest) =>
    api.post<SessionDto>(`/admin/enrollments/${enrollmentId}/session`, data),

  updateEnrollmentSession: (enrollmentId: string, data: UpdateEnrollmentSessionRequest) =>
    api.put<SessionDto>(`/admin/enrollments/${enrollmentId}/session`, data),

  cancelEnrollmentSession: (enrollmentId: string, data: CancelEnrollmentSessionRequest) =>
    api.post(`/admin/enrollments/${enrollmentId}/session/cancel`, data),

  resendSessionNotification: (enrollmentId: string) =>
    api.post(`/admin/enrollments/${enrollmentId}/session/resend-notification`),

  completeEnrollment: (enrollmentId: string) =>
    api.put(`/admin/enrollments/${enrollmentId}/complete`),
};


