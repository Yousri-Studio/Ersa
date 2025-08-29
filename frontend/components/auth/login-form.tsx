'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { authApi, LoginRequest } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useCartStore } from '@/lib/cart-store';
import toast from 'react-hot-toast';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { login } = useAuthStore();
  const { anonymousId } = useCartStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    
    try {
      const response = await authApi.login(data);
      const { token, user } = response.data;
      
      // Login user
      login(token, user);
      
      toast.success('Login successful!');
      router.push(`/${locale}/`);
    } catch (error: any) {
      const message = error.response?.data?.error || t('auth.errors.invalid-credentials');
      
      // Check if the error is about email verification
      if (message.includes('verify your email') || message.includes('تفعيل البريد الإلكتروني')) {
        toast.error(message);
        // Redirect to verification page with the email
        router.push(`/${locale}/auth/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        {/* Email */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium font-cairo mb-2"
            style={{ color: '#374151' }}
          >
            البريد الإلكتروني
          </label>
          <input
            {...register('email', {
              required: 'البريد الإلكتروني مطلوب',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'عنوان بريد إلكتروني غير صحيح',
              },
            })}
            type="email"
            autoComplete="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo"
            placeholder="example@domain.com"
            style={{ fontSize: '14px' }}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 font-cairo">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium font-cairo mb-2"
            style={{ color: '#374151' }}
          >
            كلمة المرور
          </label>
          <div className="relative">
            <input
              {...register('password', {
                required: 'كلمة المرور مطلوبة',
                minLength: {
                  value: 6,
                  message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
                },
              })}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo pr-10"
              placeholder="••••••••"
              style={{ fontSize: '14px' }}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Icon name="eye-slash" className="h-5 w-5 text-gray-400" />
              ) : (
                <Icon name="eye" className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 font-cairo">{errors.password.message}</p>
          )}
        </div>
      </div>

      {/* Remember me and Forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label htmlFor="remember" className="mr-2 block text-sm text-gray-900 font-cairo">
            تذكرني
          </label>
        </div>

        <div className="text-sm">
          <Link
            href={`/${locale}/auth/forgot-password`}
            className="font-medium text-teal-600 hover:text-teal-500 font-cairo"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>
      </div>

      {/* Submit button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent text-white font-medium rounded-lg font-cairo transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: '#00AC96',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="spinner mr-2" />
              جارٍ تسجيل الدخول...
            </div>
          ) : (
            'تسجيل الدخول'
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500 font-cairo">أو</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200 font-cairo"
        >
          <Icon icon={['fab', 'google']} className="h-5 w-5 mr-3" />
          <span style={{ fontSize: '14px', color: '#374151' }}>المتابعة بحساب Google</span>
        </button>
      </div>

      {/* Sign up link */}
      <div className="text-center mt-8">
        <span className="text-sm text-gray-600 font-cairo">
          ليس لديك حساب؟{' '}
          <Link
            href={`/${locale}/auth/register`}
            className="font-medium text-teal-600 hover:text-teal-500"
          >
            إنشاء حساب جديد
          </Link>
        </span>
      </div>
    </form>
  );
}