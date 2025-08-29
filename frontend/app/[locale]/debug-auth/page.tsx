'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { adminApi } from '@/lib/admin-api';
import Cookies from 'js-cookie';

export default function DebugAuthPage() {
  const { user, isAuthenticated, token } = useAuthStore();
  const [cookieToken, setCookieToken] = useState<string | undefined>();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCookieToken(Cookies.get('auth-token'));
  }, []);

  const testLogin = async () => {
    setLoading(true);
    setTestResult('Testing login...');
    
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@ersatraining.com',
          password: 'Admin123!'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ Login successful! Token: ${data.token.substring(0, 50)}...`);
        
        // Test admin API
        try {
          const adminResponse = await fetch('http://localhost:5001/api/admin/dashboard-stats', {
            headers: {
              'Authorization': `Bearer ${data.token}`,
              'Content-Type': 'application/json',
            }
          });
          
          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            setTestResult(prev => prev + `\n✅ Admin API works! Users: ${adminData.totalUsers}`);
          } else {
            setTestResult(prev => prev + `\n❌ Admin API failed: ${adminResponse.status}`);
          }
        } catch (error) {
          setTestResult(prev => prev + `\n❌ Admin API error: ${error}`);
        }
      } else {
        setTestResult(`❌ Login failed: ${data.error}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAdminAPI = async () => {
    setLoading(true);
    setTestResult('Testing admin API...');
    
    try {
      const response = await adminApi.getDashboardStats();
      setTestResult(`✅ Admin API works! Got ${response.data.totalUsers} users`);
    } catch (error: any) {
      setTestResult(`❌ Admin API failed: ${error.message}`);
      console.error('Admin API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testTokenValidation = async () => {
    setLoading(true);
    setTestResult('Testing token validation...');
    
    try {
      await useAuthStore.getState().validateToken();
      const currentState = useAuthStore.getState();
      setTestResult(`✅ Token validation completed. Auth: ${currentState.isAuthenticated}, User: ${currentState.user?.fullName || 'None'}`);
    } catch (error: any) {
      setTestResult(`❌ Token validation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    Cookies.remove('auth-token');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auth Store State */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Auth Store State</h2>
            <div className="space-y-2">
              <p><strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Has Token:</strong> {token ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User:</strong> {user ? `${user.fullName} (${user.email})` : '❌ No user'}</p>
              <p><strong>Is Admin:</strong> {user?.isAdmin ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Is Super Admin:</strong> {user?.isSuperAdmin ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>

          {/* Cookie State */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Cookie State</h2>
            <div className="space-y-2">
              <p><strong>Auth Token Cookie:</strong> {cookieToken ? '✅ Present' : '❌ Missing'}</p>
              {cookieToken && (
                <p><strong>Token Preview:</strong> {cookieToken.substring(0, 50)}...</p>
              )}
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          <div className="space-y-4">
            <button
              onClick={testLogin}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mr-4"
            >
              Test Login API
            </button>
            
            <button
              onClick={testAdminAPI}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 mr-4"
            >
              Test Admin API
            </button>
            
            <button
              onClick={testTokenValidation}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 mr-4"
            >
              Test Token Validation
            </button>
            
            <button
              onClick={clearAuth}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Auth
            </button>
          </div>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre className="whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({ 
              user, 
              isAuthenticated, 
              hasToken: !!token,
              cookieToken: !!cookieToken,
              apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api'
            }, null, 2)}
          </pre>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a href="/en/admin-login" className="block text-blue-600 hover:underline">
              → Admin Login Page
            </a>
            <a href="/en/admin" className="block text-blue-600 hover:underline">
              → Admin Dashboard
            </a>
            <a href="/en/auth/login" className="block text-blue-600 hover:underline">
              → Regular Login Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
