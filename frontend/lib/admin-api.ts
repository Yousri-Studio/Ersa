import { api } from './api';

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
  getDashboardStats: () => api.get<DashboardStats>('/admin/dashboard-stats'),

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
};
