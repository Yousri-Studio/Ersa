'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { ordersApi, paymentsApi } from '@/lib/api';

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items, total, currency, cartId, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [isAuthenticated, router]);

  const handleCheckout = async () => {
    if (!items || items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!cartId) {
      setError('Cart ID is missing.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Create the order
      const orderResponse = await ordersApi.createOrder(cartId);
      const { orderId } = orderResponse.data;

      // 2. Create the checkout session for payment
      const returnUrl = `${window.location.origin}/checkout/success`;
      const checkoutResponse = await paymentsApi.createCheckout({ orderId, returnUrl });
      const { redirectUrl } = checkoutResponse.data;

      // 3. Clear the local cart and redirect to payment gateway
      clearCart();
      window.location.href = redirectUrl;

    } catch (err: any) {
      console.error('Checkout failed:', err);
      setError(err.response?.data?.error || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="container mx-auto px-4 py-8 text-center">Redirecting to login...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          {items && items.length > 0 ? (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.title.en} x{item.qty}</span>
                  <span>{item.price.toFixed(2)} {item.currency}</span>
                </div>
              ))}
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{total.toFixed(2)} {currency}</span>
              </div>
            </div>
          ) : (
            <p>Your cart is empty.</p>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold">Billing Information</h3>
            <p className="text-gray-600">{user?.fullName}</p>
            <p className="text-gray-600">{user?.email}</p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded">
              {error}
            </div>
          )}

          <button 
            onClick={handleCheckout} 
            disabled={isLoading || !items || items.length === 0}
            className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
