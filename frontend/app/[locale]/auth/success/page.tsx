'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/lib/auth-store';
import toast from 'react-hot-toast';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { login } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      if (error === 'google_auth_failed') {
        toast.error('فشل في تسجيل الدخول باستخدام Google');
      } else if (error === 'apple_auth_failed') {
        toast.error('فشل في تسجيل الدخول باستخدام Apple');
      } else {
        toast.error('فشل في تسجيل الدخول');
      }
      router.push(`/${locale}/auth/login`);
      return;
    }

    if (token) {
      try {
        // Decode token to get user info (simplified - in production, validate on backend)
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: tokenPayload.nameid,
          fullName: tokenPayload.unique_name,
          email: tokenPayload.email,
          locale: tokenPayload.locale,
          createdAt: new Date().toISOString() // Add the required createdAt field
        };

        login(token, user);
        toast.success('تم تسجيل الدخول بنجاح!');
        router.push(`/${locale}/`);
      } catch (error) {
        console.error('Token parsing error:', error);
        toast.error('خطأ في معالجة تسجيل الدخول');
        router.push(`/${locale}/auth/login`);
      }
    } else {
      router.push(`/${locale}/auth/login`);
    }
  }, [searchParams, router, locale, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-cairo">جارٍ تسجيل الدخول...</p>
      </div>
    </div>
  );
}
