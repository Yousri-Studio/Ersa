'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { usePageLoad } from '@/lib/use-animations';
import { useForm } from 'react-hook-form';

interface ResetPasswordForm {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetCode, setResetCode] = useState(['', '', '', '', '', '']);
  const isLoaded = usePageLoad(100);
  
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordForm>();
  const newPassword = watch('newPassword');

  useEffect(() => {
    if (!searchParams) {
      router.push(`/${locale}/auth/forgot-password`);
      return;
    }
    
    const emailParam = searchParams?.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push(`/${locale}/auth/forgot-password`);
    }
  }, [searchParams, router, locale]);

  const handleCodeChange = (index: number, value: string) => {
    // Handle pasted content
    if (value.length > 1) {
      const pastedCode = value.replace(/\D/g, '').slice(0, 6);
      const newCode = [...resetCode];
      
      // Fill inputs with pasted digits
      for (let i = 0; i < pastedCode.length && index + i < 6; i++) {
        newCode[index + i] = pastedCode[i];
      }
      
      setResetCode(newCode);
      
      // Focus the next empty input or last input
      const nextIndex = Math.min(index + pastedCode.length, 5);
      const nextInput = document.getElementById(`reset-code-${nextIndex}`);
      nextInput?.focus();
      return;
    }

    // Handle single character input
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...resetCode];
      newCode[index] = value;
      setResetCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`reset-code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace navigation
    if (e.key === 'Backspace' && !resetCode[index] && index > 0) {
      const prevInput = document.getElementById(`reset-code-${index - 1}`);
      prevInput?.focus();
    }
    
    // Handle left arrow key
    if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`reset-code-${index - 1}`);
      prevInput?.focus();
    }
    
    // Handle right arrow key
    if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = document.getElementById(`reset-code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedCode = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (pastedCode.length > 0) {
      const newCode = pastedCode.split('').concat(['', '', '', '', '', '']).slice(0, 6);
      setResetCode(newCode);
      
      // Focus the last filled input or the 6th input
      const lastIndex = Math.min(pastedCode.length, 5);
      const lastInput = document.getElementById(`reset-code-${lastIndex}`);
      lastInput?.focus();
    }
  };

  const onSubmit = async (data: ResetPasswordForm) => {
    const code = resetCode.join('');
    if (code.length !== 6) {
      toast.error(t('auth.reset-password.code-invalid'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.resetPassword({
        email,
        code,
        newPassword: data.newPassword
      });
      toast.success(response.data.message || t('auth.reset-password.success'));
      // Redirect to login
      router.push(`/${locale}/auth/login`);
    } catch (error: any) {
      const message = error.response?.data?.error || t('auth.reset-password.error');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const maskedEmail = email ? `${email.substring(0, 2)}****@${email.split('@')[1]}` : '';

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
              <Icon name="key" className="h-10 w-10 text-white" />
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
              {t('auth.reset-password.title')}
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
              {t('auth.reset-password.subtitle')}
            </p>
            
            {email && (
              <p className={`font-cairo mb-6 text-sm ${isLoaded ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`} style={{ color: '#00AC96' }}>
                {maskedEmail}
              </p>
            )}
          </div>
          
          {/* Form */}
          <form className={`space-y-6 ${isLoaded ? 'animate-slide-in-right stagger-5' : 'opacity-0'}`} onSubmit={handleSubmit(onSubmit)}>
            {/* Reset Code */}
            <div>
              <label 
                className={`block font-cairo mb-4 text-center`}
                style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
              >
                {t('auth.reset-password.code')}
              </label>
              <div className="flex justify-center space-x-3 rtl:space-x-reverse mb-2">
                {resetCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`reset-code-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    style={{ fontFamily: 'Cairo, sans-serif' }}
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label 
                htmlFor="newPassword" 
                className={`block font-cairo mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
              >
                {t('auth.reset-password.new-password')}
              </label>
              <div className="relative">
                <input
                  {...register('newPassword', {
                    required: t('auth.validation.password-required'),
                    minLength: {
                      value: 6,
                      message: t('auth.validation.password-min-length'),
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo ${locale === 'ar' ? 'pl-10 pr-10 text-right' : 'pl-10 pr-10 text-left'}`}
                  placeholder={t('auth.register.password-placeholder')}
                  style={{ fontSize: '14px', direction: locale === 'ar' ? 'rtl' : 'ltr' }}
                />
                <Icon 
                  name="lock" 
                  className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4`}
                  style={{ color: '#00AC96' }} 
                />
                <button
                  type="button"
                  className={`absolute inset-y-0 ${locale === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Icon name="eye-slash" className="h-5 w-5" style={{ color: '#9797A8' }} />
                  ) : (
                    <Icon name="eye" className="h-5 w-5" style={{ color: '#9797A8' }} />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600 font-cairo">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className={`block font-cairo mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
              >
                {t('auth.reset-password.confirm-password')}
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: t('auth.validation.confirm-password-required'),
                    validate: (value) =>
                      value === newPassword || t('auth.validation.passwords-no-match'),
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo ${locale === 'ar' ? 'pl-10 pr-10 text-right' : 'pl-10 pr-10 text-left'}`}
                  placeholder={t('auth.register.password-placeholder')}
                  style={{ fontSize: '14px', direction: locale === 'ar' ? 'rtl' : 'ltr' }}
                />
                <Icon 
                  name="lock" 
                  className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4`}
                  style={{ color: '#00AC96' }} 
                />
                <button
                  type="button"
                  className={`absolute inset-y-0 ${locale === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <Icon name="eye-slash" className="h-5 w-5" style={{ color: '#9797A8' }} />
                  ) : (
                    <Icon name="eye" className="h-5 w-5" style={{ color: '#9797A8' }} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 font-cairo">{errors.confirmPassword.message}</p>
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
                    {t('auth.reset-password.submitting')}
                  </div>
                ) : (
                  t('auth.reset-password.submit')
                )}
              </button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href={`/${locale}/auth/login`}
                className="text-sm font-medium text-teal-600 hover:text-teal-500 font-cairo"
              >
                {t('auth.reset-password.back-to-login')}
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className={`hidden lg:flex flex-1 relative bg-gray-50 ${isLoaded ? 'animate-slide-in-left stagger-6' : 'opacity-0'}`}>
        <Image
          src="/images/login image.png"
          alt={t('auth.reset-password.title')}
          fill
          className="object-cover"
          style={{ borderRadius: '50px' }}
          priority
        />
      </div>
    </div>
  );
}

