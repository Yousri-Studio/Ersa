import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from './auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Disable credentials for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth-token');
  if (token) {
    // Use the set method to avoid modifying read-only properties
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const { logout } = useAuthStore.getState();
      logout();
      
      // Check if we're in admin area and redirect accordingly
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin')) {
        // If in admin area, redirect to admin login
        const locale = currentPath.split('/')[1]; // Get locale from URL
        window.location.href = `/${locale}/admin-login`;
      } else {
        // If in public area, redirect to public login
        const locale = currentPath.split('/')[1] || 'en'; // Get locale from URL or default to 'en'
        window.location.href = `/${locale}/auth/login`;
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  locale: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    locale: string;
    createdAt: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    lastLoginAt?: string;
  };
}

export interface RegisterResponse {
  message: string;
}

export type CourseCategory = 'Programming' | 'Business' | 'Design';

export interface Course {
  id: string;
  slug: string;
  title: {
    ar: string;
    en: string;
  };
  summary: {
    ar: string;
    en: string;
  };
  description?: {
    ar: string;
    en: string;
  };
  price: number;
  currency: string;
  type: number; // 0 = PDF, 1 = Live (from backend enum)
  level?: number; // Course level (from backend enum)
  category: number; // Course category (from backend enum)
  isActive: boolean;
  isFeatured?: boolean;
  rating?: number;
  createdAt?: string;
  imageUrl?: string;
  instructorName?: string;
  photo?: string; // Base64 encoded photo data from backend
  tags?: string;
  instructorsBio?: {
    ar: string;
    en: string;
  };
  videoUrl?: string;
  duration?: string;

  badge?: 'Bestseller' | 'New' | null;
  thumbnailUrl?: string; // Generated from photo data
  instructor?: {
    name: string;
    title?: string;
    avatar?: string;
  };
  sessions?: Session[];
  attachments?: Attachment[];
}

export interface Session {
  id: string;
  startAt: string;
  endAt: string;
  capacity?: number;
  availableSpots?: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  type: string;
}

export interface CartItem {
  id: string;
  courseId: string;
  sessionId?: string;
  title: {
    ar: string;
    en: string;
  };
  price: number;
  currency: string;
  qty: number;
  session?: Session;
  imageUrl?: string;
  sessionTitle?: string;
  instructor?: string;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  total: number;
  currency: string;
}

export interface Order {
  id: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  courseId: string;
  courseTitle: {
    ar: string;
    en: string;
  };
  sessionId?: string;
  session?: Session;
  price: number;
}

// Auth API
export const authApi = {
  login: (data: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/auth/login', data),

  register: (data: RegisterRequest): Promise<AxiosResponse<RegisterResponse>> =>
    api.post('/auth/register', data),

  verifyEmail: (data: VerifyEmailRequest): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/auth/verify-email', data),

  resendVerificationCode: (data: ResendVerificationRequest): Promise<AxiosResponse<{ message: string }>> =>
    api.post('/auth/resend-verification', data),

  refreshToken: (): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/auth/refresh-token'),
};

// Courses API
export const coursesApi = {
  getCourses: (type?: 'Live' | 'PDF'): Promise<AxiosResponse<Course[]>> =>
    api.get('/courses', { params: { type } }),

  getFeaturedCourses: (): Promise<AxiosResponse<Course[]>> =>
    api.get('/courses/featured'),

  getCourse: (slug: string): Promise<AxiosResponse<Course>> =>
    api.get(`/courses/${slug}`),

  getCourseSessions: (courseId: string): Promise<AxiosResponse<Session[]>> =>
    api.get(`/courses/${courseId}/sessions`),
};

// Cart API
export const cartApi = {
  initCart: (anonymousId?: string): Promise<AxiosResponse<{ cartId: string; anonymousId?: string }>> =>
    api.post('/cart/init', { anonymousId }),

  addToCart: (data: {
    cartId: string;
    courseId: string;
    sessionId?: string;
  }): Promise<AxiosResponse<Cart>> =>
    api.post('/cart/items', data),

  getCart: (cartId: string): Promise<AxiosResponse<Cart>> =>
    api.get('/cart', { params: { cartId } }),

  removeFromCart: (cartItemId: string): Promise<AxiosResponse<Cart>> =>
    api.delete(`/cart/items/${cartItemId}`),

  mergeCart: (anonymousId: string): Promise<AxiosResponse<Cart>> =>
    api.post('/cart/merge', { anonymousId }),
};

// Orders API
export const ordersApi = {
  createOrder: (cartId: string): Promise<AxiosResponse<{
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>> =>
    api.post('/orders', { cartId }),

  getOrders: (): Promise<AxiosResponse<Order[]>> =>
    api.get('/orders'),

  getOrder: (orderId: string): Promise<AxiosResponse<Order>> =>
    api.get(`/orders/${orderId}`),
};

// Payments API
export const paymentsApi = {
  createCheckout: (data: {
    orderId: string;
    returnUrl: string;
  }): Promise<AxiosResponse<{ redirectUrl: string }>> =>
    api.post('/payments/checkout', data),
};

// Enrollments API
export const enrollmentsApi = {
  getMyEnrollments: (): Promise<AxiosResponse<any[]>> =>
    api.get('/my/enrollments'),
};

// Wishlist API
export const wishlistApi = {
  getWishlist: (): Promise<AxiosResponse<any[]>> =>
    api.get('/wishlist/items'),

  addToWishlist: (courseId: string): Promise<AxiosResponse<any>> =>
    api.post('/wishlist/items', { courseId }),

  removeFromWishlist: (courseId: string): Promise<AxiosResponse<any>> =>
    api.delete(`/wishlist/items/${courseId}`),
};

// Contact API
export interface ContactFormRequest {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  locale: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  submittedAt: string;
}

export const contactApi = {
  submitContactForm: (data: ContactFormRequest): Promise<AxiosResponse<ContactFormResponse>> =>
    api.post('/contact', data),
};