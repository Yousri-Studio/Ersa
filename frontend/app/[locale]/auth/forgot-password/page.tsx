'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { usePageLoad } from '@/lib/use-animations';
import { useForm } from 'react-hook-form';

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const isLoaded = usePageLoad(100);
  
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword({ email: data.email });
      toast.success(response.data.message || t('auth.forgot-password.success'));
      // Redirect to reset password page with email
      router.push(`/${locale}/auth/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      const message = error.response?.data?.error || t('auth.forgot-password.error');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className={`flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white page-enter ${isLoaded ? 'loaded' : ''}`}>
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className={`mb-8 ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
              <Link href={`/${locale}`} className="inline-block">
                <Image
                  src="/Header Logo.svg"
                  alt="إرساء"
                  width={120}
                  height={40}
                  className="mx-auto hover:opacity-80 transition-opacity duration-200"
                />
              </Link>
            </div>

            {/* Icon */}
            <div className={`mx-auto h-20 w-20 bg-gradient-to-br from-[#00AC96] to-[#292561] rounded-full flex items-center justify-center mb-6 ${isLoaded ? 'animate-bounce-in stagger-1' : 'opacity-0'}`}>
              <Icon name="lock" className="h-10 w-10 text-white" />
            </div>
            
            {/* Title */}
            <h1 
              className={`font-cairo font-bold mb-4 ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}
              style={{
                color: '#00AC96',
                fontSize: '28px',
                fontWeight: 700
              }}
            >
              {t('auth.forgot-password.title')}
            </h1>
            
            {/* Subtitle */}
            <p 
              className={`font-cairo mb-8 ${isLoaded ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}
              style={{
                color: '#6B7280',
                fontSize: '14px',
                fontWeight: 400
              }}
            >
              {t('auth.forgot-password.subtitle')}
            </p>
          </div>
          
          {/* Form */}
          <form className={`space-y-6 ${isLoaded ? 'animate-slide-in-right stagger-4' : 'opacity-0'}`} onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label 
                htmlFor="email" 
                className={`block font-cairo mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
              >
                {t('auth.forgot-password.email')}
              </label>
              <div className="relative">
                <input
                  {...register('email', {
                    required: t('auth.validation.email-required'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('auth.validation.email-invalid'),
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className={`w-full px-4 py-3 ${locale === 'ar' ? 'pr-10 text-right' : 'pl-10 text-left'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo`}
                  placeholder={t('auth.register.email-placeholder')}
                  style={{ fontSize: '14px', direction: locale === 'ar' ? 'rtl' : 'ltr' }}
                />
                <Icon 
                  name="envelope" 
                  className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4`}
                  style={{ color: '#00AC96' }} 
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 font-cairo">{errors.email.message}</p>
              )}
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
                    {t('auth.forgot-password.submitting')}
                  </div>
                ) : (
                  t('auth.forgot-password.submit')
                )}
              </button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href={`/${locale}/auth/login`}
                className="text-sm font-medium text-teal-600 hover:text-teal-500 font-cairo"
              >
                {t('auth.forgot-password.back-to-login')}
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className={`hidden lg:flex flex-1 relative bg-gray-50 ${isLoaded ? 'animate-slide-in-left stagger-5' : 'opacity-0'}`}>
        <Image
          src="/images/login image.png"
          alt={t('auth.forgot-password.title')}
          fill
          className="object-cover"
          style={{ borderRadius: '50px' }}
          priority
        />
      </div>
    </div>
  );
}

