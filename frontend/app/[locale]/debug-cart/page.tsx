'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cart-store';

export default function DebugCartPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const cartState = useCartStore();

  useEffect(() => {
    const checkState = () => {
      const localStorage = typeof window !== 'undefined' ? window.localStorage.getItem('cart-storage') : null;
      
      let parsedStorage = null;
      if (localStorage) {
        try {
          parsedStorage = JSON.parse(localStorage);
        } catch (e) {
          parsedStorage = { error: 'Failed to parse', raw: localStorage };
        }
      }

      setDebugInfo({
        timestamp: new Date().toISOString(),
        localStorage: {
          exists: !!localStorage,
          raw: localStorage?.substring(0, 200),
          parsed: parsedStorage,
        },
        zustandState: {
          cartId: cartState.cartId,
          anonymousId: cartState.anonymousId,
          itemCount: cartState.items.length,
          items: cartState.items,
          total: cartState.total,
          currency: cartState.currency,
        },
      });
    };

    checkState();
    const interval = setInterval(checkState, 1000);
    return () => clearInterval(interval);
  }, [cartState]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cart Debug Info</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => {
                cartState.addItem({
                  id: 'test-' + Date.now(),
                  courseId: 'test-course',
                  title: { ar: 'دورة تجريبية', en: 'Test Course' },
                  price: 1000,
                  currency: 'SAR',
                  qty: 1,
                });
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Test Item
            </button>
            <button
              onClick={() => cartState.clearCart()}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear Cart
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.localStorage.clear();
                  window.location.reload();
                }
              }}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Clear LocalStorage & Reload
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

