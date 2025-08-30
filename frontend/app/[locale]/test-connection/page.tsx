'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function TestConnectionPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing connection...');
    
    try {
      console.log('Testing connection to:', API_BASE_URL);
      
      // Test 1: Health check
      console.log('Making GET request to /health...');
      const healthResponse = await api.get('/health');
      console.log('Health response:', healthResponse.data);
      
      // Test 2: Demo data
      console.log('Making GET request to /health/demo...');
      const demoResponse = await api.get('/health/demo');
      console.log('Demo response:', demoResponse.data);
      
      // Test 3: Courses
      console.log('Making GET request to /courses...');
      const coursesResponse = await api.get('/courses');
      console.log('Courses response:', coursesResponse.data);
      
      // Test 2: Login request
      console.log('Making POST request to /auth/login...');
      const loginResponse = await api.post('/auth/login', {
        email: 'superadmin@ersatraining.com',
        password: 'SuperAdmin123!'
      });
      console.log('Login response:', loginResponse.data);
      
      setTestResult('✅ Connection successful! Both GET and POST requests work.');
    } catch (error: any) {
      console.error('Connection test failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request
      });
      setTestResult(`❌ Connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testFetchConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing fetch connection...');
    
    try {
      console.log('Testing fetch connection to:', `${API_BASE_URL}/health`);
      
      // Test with native fetch
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetch response:', data);
        setTestResult('✅ Fetch connection successful!');
      } else {
        setTestResult(`❌ Fetch failed: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Fetch test failed:', error);
      setTestResult(`❌ Fetch failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Frontend-Backend Connection Test</h1>
        
        <div className="space-y-3">
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Axios Connection'}
          </button>
          
          <button
            onClick={testFetchConnection}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Fetch Connection'}
          </button>
        </div>
        
        {testResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <p className="text-sm">{testResult}</p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Frontend URL: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
          <p>API Base URL: {API_BASE_URL}</p>
        </div>
      </div>
    </div>
  );
}
