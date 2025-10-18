import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';

interface BackendStatus {
  isAvailable: boolean;
  isAuthenticated: boolean;
  lastChecked: number;
}

class BackendConnectionManager {
  private static instance: BackendConnectionManager;
  private status: BackendStatus = {
    isAvailable: false,
    isAuthenticated: false,
    lastChecked: 0
  };
  private checkInterval = 30000; // Check every 30 seconds
  private checkTimeout = 5000; // 5 second timeout for health checks

  static getInstance(): BackendConnectionManager {
    if (!BackendConnectionManager.instance) {
      BackendConnectionManager.instance = new BackendConnectionManager();
    }
    return BackendConnectionManager.instance;
  }

  async checkBackendStatus(): Promise<BackendStatus> {
    const now = Date.now();
    
    // If we checked recently, return cached result
    if (now - this.status.lastChecked < this.checkInterval) {
      return this.status;
    }

    try {
      // Check if backend is reachable by trying the dashboard stats endpoint with auth
      const token = Cookies.get('auth-token');
      
      console.log('🔍 Backend Check - Token exists:', !!token);
      console.log('🔍 Backend Check - API URL:', API_BASE_URL);
      
      if (!token) {
        console.warn('❌ No auth token found');
        this.status.isAvailable = false;
        this.status.isAuthenticated = false;
        this.status.lastChecked = now;
        return this.status;
      }

      const response = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`, {
        timeout: this.checkTimeout,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Backend Check - Response status:', response.status);

      if (response.status === 200) {
        this.status.isAvailable = true;
        this.status.isAuthenticated = true;
        console.log('✅ Backend is available and authenticated');
      } else {
        this.status.isAvailable = false;
        this.status.isAuthenticated = false;
        console.warn('❌ Backend responded but not OK:', response.status);
      }
    } catch (error: any) {
      console.error('❌ Backend connection check failed:', error.message);
      console.error('Error details:', {
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // If it's a 401/403, backend is available but not authenticated
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.status.isAvailable = true;
        this.status.isAuthenticated = false;
        console.warn('⚠️ Backend available but not authenticated');
      } else {
        this.status.isAvailable = false;
        this.status.isAuthenticated = false;
        console.error('❌ Backend not available');
      }
    }

    this.status.lastChecked = now;
    return this.status;
  }

  async isBackendAvailable(): Promise<boolean> {
    const status = await this.checkBackendStatus();
    return status.isAvailable;
  }

  async isAuthenticated(): Promise<boolean> {
    const status = await this.checkBackendStatus();
    return status.isAuthenticated;
  }

  getLastStatus(): BackendStatus {
    return { ...this.status };
  }

  // Force a fresh check
  async forceCheck(): Promise<BackendStatus> {
    this.status.lastChecked = 0;
    return this.checkBackendStatus();
  }
}

export const backendConnection = BackendConnectionManager.getInstance();

// Utility function to make API calls with fallback
export async function apiCallWithFallback<T>(
  apiCall: () => Promise<{ data: T }>,
  fallbackData: T,
  options?: {
    showFallbackNotification?: boolean;
    fallbackMessage?: string;
  }
): Promise<{ data: T; isUsingFallback: boolean }> {
  try {
    // Check if backend is available first
    const isAvailable = await backendConnection.isBackendAvailable();
    
    if (!isAvailable) {
      console.warn(options?.fallbackMessage || 'Backend not available, using fallback data');
      return { data: fallbackData, isUsingFallback: true };
    }

    // Try the API call
    const result = await apiCall();
    return { data: result.data, isUsingFallback: false };
  } catch (error: any) {
    console.error('API call failed:', error);
    
    // Check for specific error types that indicate we should use fallback
    const shouldUseFallback = 
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.message === 'Network Error' ||
      error.response?.status >= 500 ||
      error.response?.status === 404;

    if (shouldUseFallback) {
      console.warn(options?.fallbackMessage || 'API error, using fallback data');
      return { data: fallbackData, isUsingFallback: true };
    }

    // For authentication errors or other client errors, throw the error
    throw error;
  }
}

// Hook to use backend connection status in React components
export function useBackendConnection() {
  const [status, setStatus] = useState<BackendStatus>({
    isAvailable: false,
    isAuthenticated: false,
    lastChecked: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      try {
        const newStatus = await backendConnection.checkBackendStatus();
        if (mounted) {
          setStatus(newStatus);
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setStatus({
            isAvailable: false,
            isAuthenticated: false,
            lastChecked: Date.now()
          });
          setIsLoading(false);
        }
      }
    };

    checkStatus();

    // Set up periodic checks
    const interval = setInterval(checkStatus, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { status, isLoading, refresh: () => backendConnection.forceCheck() };
}
