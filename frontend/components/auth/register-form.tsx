'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { authApi, RegisterRequest } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useCartStore } from '@/lib/cart-store';
import toast from 'react-hot-toast';

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { login } = useAuthStore();
  const { anonymousId } = useCartStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      locale: locale,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      const { confirmPassword, ...registerData } = data;
      const response = await authApi.register(registerData);
      
      // Registration successful, show message and redirect to verification
      const message = response.data?.message || 'Registration successful! Please check your email for verification code.';
      toast.success(message);
      router.push(`/${locale}/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            {t('auth.register.full-name')}
          </label>
          <input
            {...register('fullName', {
              required: t('auth.errors.required-field'),
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
            type="text"
            autoComplete="name"
            className="form-input mt-1"
            placeholder={t('auth.register.full-name')}
          />
          {errors.fullName && (
            <p className="form-error">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t('auth.register.email')}
          </label>
          <input
            {...register('email', {
              required: t('auth.errors.required-field'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            type="email"
            autoComplete="email"
            className="form-input mt-1"
            placeholder={t('auth.register.email')}
          />
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            {t('auth.register.phone')}
          </label>
          <div className="relative mt-1">
            <Icon 
              name="mobile-screen" 
              className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 ${
                locale === 'ar' ? 'right-3' : 'left-3'
              }`}
            />
            <input
              {...register('phone')}
              type="tel"
              autoComplete="tel"
              className={`form-input placeholder-text-right ${
                locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
              placeholder={t('auth.register.phone')}
            />
          </div>
          {errors.phone && (
            <p className="form-error">{errors.phone.message}</p>
          )}
        </div>

        {/* Language Preference */}
        <div>
          <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
            {t('auth.register.locale')}
          </label>
          <select
            {...register('locale', { required: t('auth.errors.required-field') })}
            className="form-input mt-1"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
          {errors.locale && (
            <p className="form-error">{errors.locale.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {t('auth.register.password')}
          </label>
          <div className="relative mt-1">
            <input
              {...register('password', {
                required: t('auth.errors.required-field'),
                minLength: {
                  value: 6,
                  message: t('auth.errors.weak-password'),
                },
              })}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="form-input pr-10"
              placeholder={t('auth.register.password')}
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
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            {t('auth.register.confirm-password')}
          </label>
          <div className="relative mt-1">
            <input
              {...register('confirmPassword', {
                required: t('auth.errors.required-field'),
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="form-input pr-10"
              placeholder={t('auth.register.confirm-password')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <Icon name="eye-slash" className="h-5 w-5 text-gray-400" />
              ) : (
                <Icon name="eye" className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Submit button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="spinner mr-2" />
              {t('common.loading')}
            </div>
          ) : (
            t('auth.register.submit')
          )}
        </button>
      </div>

      {/* Sign in link */}
      <div className="text-center">
        <span className="text-sm text-gray-600">
          {t('auth.register.have-account')}{' '}
          <Link
            href={`/${locale}/auth/login`}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {t('auth.register.sign-in')}
          </Link>
        </span>
      </div>
    </form>
  );
}