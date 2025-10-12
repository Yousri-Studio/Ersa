'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import Cookies from 'js-cookie';

export default function DebugSessionPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const authState = useAuthStore();

  useEffect(() => {
    const checkState = () => {
      const cookie = Cookies.get('auth-token');
      const localStorage = typeof window !== 'undefined' ? window.localStorage.getItem('auth-storage') : null;
      
      let parsedStorage = null;
      if (localStorage) {
        try {
          parsedStorage = JSON.parse(localStorage);
        } catch (e) {
          parsedStorage = { error: 'Failed to parse' };
        }
      }

      setDebugInfo({
        timestamp: new Date().toISOString(),
        cookie: {
          exists: !!cookie,
          length: cookie?.length || 0,
          preview: cookie ? `${cookie.substring(0, 30)}...` : null,
        },
        localStorage: {
          exists: !!localStorage,
          raw: localStorage?.substring(0, 100),
          parsed: parsedStorage,
        },
        zustandState: {
          isAuthenticated: authState.isAuthenticated,
          hasUser: !!authState.user,
          hasToken: !!authState.token,
          userEmail: authState.user?.email,
        },
      });
    };

    checkState();
    const interval = setInterval(checkState, 1000);
    return () => clearInterval(interval);
  }, [authState]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">🔍 Session Debug Page</h1>
        
        <div className="space-y-4">
          <div className="border p-4 rounded">
            <h2 className="font-bold mb-2">Cookie Status</h2>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo.cookie, null, 2)}
            </pre>
          </div>

          <div className="border p-4 rounded">
            <h2 className="font-bold mb-2">LocalStorage Status</h2>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo.localStorage, null, 2)}
            </pre>
          </div>

          <div className="border p-4 rounded">
            <h2 className="font-bold mb-2">Zustand State</h2>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo.zustandState, null, 2)}
            </pre>
          </div>

          <div className="border p-4 rounded bg-yellow-50">
            <h2 className="font-bold mb-2">Instructions</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Login to admin panel</li>
              <li>Come back to this page</li>
              <li>Check if cookie and localStorage exist</li>
              <li>Refresh this page</li>
              <li>Check if data persists</li>
              <li>Screenshot this page and share with developer</li>
            </ol>
          </div>

          <div className="border p-4 rounded">
            <h2 className="font-bold mb-2">Actions</h2>
            <div className="space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  document.cookie.split(";").forEach(c => {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                  });
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear All & Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

