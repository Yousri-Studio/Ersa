'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import toast from 'react-hot-toast';
import { contentApi } from '@/lib/content-api';
import { useAuthStore } from '@/lib/auth-store';
import { useHydration } from '@/hooks/useHydration';

export default function ContentTestPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, isAuthenticated, token } = useAuthStore();
  const { isHydrated } = useHydration();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (test: string, status: 'success' | 'error' | 'info', message: string, data?: any) => {
    setTestResults(prev => [...prev, { test, status, message, data, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Check authentication
    addTestResult('Authentication', 'info', `Hydrated: ${isHydrated}, Authenticated: ${isAuthenticated}`);
    addTestResult('User Info', 'info', `User: ${user?.fullName || 'None'}, Admin: ${user?.isAdmin}, Token: ${token ? 'Present' : 'Missing'}`);

    if (!isAuthenticated) {
      addTestResult('Authentication', 'error', 'User is not authenticated');
      setIsRunning(false);
      return;
    }

    // Test 2: Test content templates API
    try {
      addTestResult('Content Templates API', 'info', 'Testing /api/content/templates...');
      const templates = await contentApi.getContentTemplates();
      addTestResult('Content Templates API', 'success', `Retrieved ${Object.keys(templates).length} templates`, templates);
    } catch (error: any) {
      addTestResult('Content Templates API', 'error', `Failed: ${error.message}`, error);
    }

    // Test 3: Test sample data initialization
    try {
      addTestResult('Sample Data Init', 'info', 'Testing sample data initialization...');
      await contentApi.initializeSampleData();
      addTestResult('Sample Data Init', 'success', 'Sample data initialized successfully');
    } catch (error: any) {
      addTestResult('Sample Data Init', 'error', `Failed: ${error.message}`, error);
    }

    // Test 4: Test content templates again after initialization
    try {
      addTestResult('Content Templates API (After Init)', 'info', 'Testing templates after initialization...');
      const templates = await contentApi.getContentTemplates();
      addTestResult('Content Templates API (After Init)', 'success', `Retrieved ${Object.keys(templates).length} templates`, templates);
    } catch (error: any) {
      addTestResult('Content Templates API (After Init)', 'error', `Failed: ${error.message}`, error);
    }

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{maxWidth: '90rem', paddingTop: '50px'}}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-400 hover:text-gray-600 mr-3 rtl:mr-0 rtl:ml-3"
                >
                  <Icon name="arrow-left" className="w-5 h-5" />
                </button>
                <Icon name="bug" className="w-8 h-8 text-blue-600 mr-3 rtl:mr-0 rtl:ml-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Content Management Test
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Diagnostic tool for content management system
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={runTests}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isRunning ? 'Running Tests...' : 'Run Tests'}
              </button>
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
            <p className="text-sm text-gray-600">
              {testResults.length} tests completed
            </p>
          </div>
          
          <div className="p-6">
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon name="play" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Click "Run Tests" to start diagnostics</p>
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.status === 'success'
                        ? 'bg-primary-50 border-primary-200'
                        : result.status === 'error'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <Icon
                        name={
                          result.status === 'success'
                            ? 'check-circle'
                            : result.status === 'error'
                            ? 'x-circle'
                            : 'info'
                        }
                        className={`w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3 mt-0.5 ${
                          result.status === 'success'
                            ? 'text-primary-600'
                            : result.status === 'error'
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{result.test}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                              Show Details
                            </summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current State */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current State</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">Authentication</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Hydrated:</span> {isHydrated ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">Authenticated:</span> {isAuthenticated ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">User:</span> {user?.fullName || 'None'}</p>
                <p><span className="font-medium">Admin:</span> {user?.isAdmin ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">Super Admin:</span> {user?.isSuperAdmin ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">Token:</span> {token ? 'Present' : 'Missing'}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">Environment</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Locale:</span> {locale}</p>
                <p><span className="font-medium">API Base URL:</span> {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api'}</p>
                <p><span className="font-medium">Frontend URL:</span> {window.location.origin}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
