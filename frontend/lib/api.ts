import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from './auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:5000/api';

// Helper functions for auth token management (assuming these exist elsewhere)
const getStoredAuth = () => {
  // Replace with actual implementation to get auth tokens from cookies or local storage
  const token = Cookies.get('auth-token');
  if (token) {
    // Assuming token structure includes accessToken and refreshToken
    // This is a placeholder, actual implementation may vary
    return { accessToken: token, refreshToken: 'dummy_refresh_token' };
  }
  return null;
};

const setStoredAuth = ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => {
  // Replace with actual implementation to store auth tokens
  Cookies.set('auth-token', accessToken, { expires: 1, secure: true, sameSite: 'Lax' });
  // Store refresh token securely if needed, e.g., in HttpOnly cookie or secure storage
  console.log('Tokens updated:', { accessToken, refreshToken });
};

const clearStoredAuth = () => {
  // Replace with actual implementation to clear auth tokens
  Cookies.remove('auth-token');
  console.log('Auth tokens cleared');
};

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Disable credentials for CORS
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = getStoredAuth()?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.headers);
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getStoredAuth()?.refreshToken;
        if (refreshToken) {
          console.log('Attempting token refresh...');
          const response = await api.post('/auth/refresh-token', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          setStoredAuth({ accessToken, refreshToken: newRefreshToken });
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clearStoredAuth();
        // Only redirect to login for admin routes
        if (originalRequest.url?.includes('/admin/')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other 401 scenarios or general errors
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();

      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin')) {
        const locale = currentPath.split('/')[1];
        window.location.href = `/${locale}/admin-login`;
      } else {
        const locale = currentPath.split('/')[1] || 'en';
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
  price: number;
  currency: string;
  type: 'Live' | 'PDF';
  isActive: boolean;
  isFeatured?: boolean;
  rating?: number;
  createdAt?: string;
  category: CourseCategory;
  imageUrl?: string;
  instructorName?: string;

  badge?: 'Bestseller' | 'New' | null;
  thumbnailUrl?: string;
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