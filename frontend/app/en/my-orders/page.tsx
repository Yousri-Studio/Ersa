'use client';

import { useEffect, useState } from 'react';
import { ordersApi, Order } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useLocale } from 'next-intl';

// Helper to get a user-friendly status display
const getStatusAppearance = (status: Order['status']) => {
  switch (status) {
    case 'New':
    case 'PendingPayment':
      return { text: 'Pending Payment', color: 'bg-yellow-200 text-yellow-800' };
    case 'Paid':
    case 'UnderProcess':
      return { text: 'In Process', color: 'bg-blue-200 text-blue-800' };
    case 'Processed':
      return { text: 'Completed', color: 'bg-green-200 text-green-800' };
    case 'Expired':
    case 'Failed':
      return { text: 'Failed', color: 'bg-red-200 text-red-800' };
    case 'Refunded':
      return { text: 'Refunded', color: 'bg-gray-200 text-gray-800' };
    default:
      return { text: 'Unknown', color: 'bg-gray-200 text-gray-800' };
  }
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const locale = useLocale();

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await ordersApi.getOrders();
        setOrders(response.data);
      } catch (err) {
        setError('Failed to load your orders. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading your orders...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  if (!isAuthenticated) {
    return <div className="container mx-auto px-4 py-8 text-center">Please log in to see your orders.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        
        {orders.length === 0 ? (
          <p>You haven't placed any orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusAppearance(order.status);
              return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Order #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                       <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
                         {statusInfo.text}
                       </span>
                       <p className="font-bold text-lg mt-1">{order.amount.toFixed(2)} {order.currency}</p>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Items</h3>
                    <ul className="space-y-2">
                      {order.items.map((item) => (
                        <li key={item.courseId} className="flex justify-between items-center">
                          <span>{item.title[locale as 'ar' | 'en']} (x{item.qty})</span>
                          <span className="font-medium">{(item.price * item.qty).toFixed(2)} {item.currency}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
