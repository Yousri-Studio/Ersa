'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { authApi, LoginRequest, RegisterRequest } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useCartStore } from '@/lib/cart-store';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { usePageLoad } from '@/lib/use-animations';

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
}

type FormMode = 'login' | 'register';

interface AuthFormProps {
  defaultMode?: FormMode;
}

export function AuthForm({ defaultMode = 'login' }: AuthFormProps) {
  const [mode, setMode] = useState<FormMode>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isLoaded = usePageLoad(100);
  
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { login } = useAuthStore();
  const { anonymousId } = useCartStore();

  const loginForm = useForm<LoginRequest>();
  const registerForm = useForm<RegisterFormData>({
    defaultValues: {
      locale: 'ar', // Default to Arabic
    },
  });

  const password = registerForm.watch('password');

  const onLoginSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    
    try {
      // Use public-login endpoint which validates user is not an admin on backend
      const response = await authApi.publicLogin(data);
      const { token, user } = response.data;
      
      // The backend already validates this, but we keep this check for extra security
      if (user.isAdmin || user.isSuperAdmin) {
        toast.error(locale === 'ar' 
          ? 'لا يمكن لمستخدمي الإدارة تسجيل الدخول إلى الموقع العام. يرجى استخدام صفحة تسجيل دخول المسؤول.'
          : 'Admin users cannot log into the public site. Please use the admin login page.');
        setIsLoading(false);
        return;
      }
      
      login(token, user);
      toast.success(t('auth.login.success'));
      router.push(`/${locale}/`);
    } catch (error: any) {
      const message = error.response?.data?.error || t('auth.login.error');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      const { confirmPassword, ...registerData } = data;
      // Convert empty phone string to undefined for proper validation
      if (registerData.phone === '') {
        registerData.phone = undefined;
      }
      const response = await authApi.register(registerData);
      const message = response.data?.message || t('auth.register.success');
      
      toast.success(message);
      router.push(`/${locale}/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      const message = error.response?.data?.error || t('auth.register.error');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    loginForm.reset();
    registerForm.reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      console.log('Google authentication initiated');
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Redirect to Google OAuth endpoint
      window.location.href = `${apiUrl}/api/auth/google`;
    } catch (error) {
      console.error('Google authentication error:', error);
      toast.error(t('auth.social.google-error'));
      setIsLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    try {
      setIsLoading(true);
      console.log('Apple authentication initiated');
      
      // Apple Sign-In using client-side SDK
      if (typeof window !== 'undefined' && (window as any).AppleID) {
        const response = await (window as any).AppleID.auth.signIn();
        
        // Send the response to your backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const authResponse = await fetch(`${apiUrl}/api/auth/apple`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identityToken: response.authorization.id_token,
            user: response.user
          })
        });

        if (authResponse.ok) {
          const data = await authResponse.json();
          login(data.token, data.user);
          toast.success(t('auth.login.success'));
          router.push(`/${locale}/`);
        } else {
          throw new Error('Apple authentication failed');
        }
      } else {
        toast.error(t('auth.social.apple-unavailable'));
      }
    } catch (error) {
      console.error('Apple authentication error:', error);
      toast.error(t('auth.social.apple-error'));
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
            
            {/* Welcome Badge */}
            <div className={`mb-6 ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
              <span className="font-cairo" style={{ color: '#1A1928', fontSize: '16px', fontWeight: 700 }}>
                {t('auth.welcome')}
              </span>
            </div>
            
            {/* Toggle Buttons */}
            <div className={`mb-6 ${isLoaded ? 'animate-scale-in stagger-2' : 'opacity-0'}`}>
              <div className="flex p-1" style={{ borderRadius: '10px', backgroundColor: 'rgba(237, 252, 251, 1)' }}>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 px-4 font-cairo transition-all duration-200 ${
                    mode === 'login'
                      ? 'bg-white text-teal-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ 
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    height: '46px'
                  }}
                >
                  {t('auth.tab-login')}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 px-4 font-cairo transition-all duration-200 ${
                    mode === 'register'
                      ? 'bg-white text-teal-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ 
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    height: '46px'
                  }}
                >
                  {t('auth.tab-register')}
                </button>
              </div>
            </div>
            
            {/* Title */}
            <h1 
              className={`font-cairo font-bold mb-4 ${isLoaded ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}
              style={{
                color: '#00AC96',
                fontSize: '28px',
                fontWeight: 700
              }}
            >
              {mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
            </h1>
            
            {/* Subtitle */}
            <p 
              className={`font-cairo mb-8 ${isLoaded ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}
              style={{
                color: '#6B7280',
                fontSize: '14px',
                fontWeight: 400
              }}
            >
              {mode === 'login' ? t('auth.login.subtitle') : t('auth.register.subtitle')}
            </p>
          </div>
          
          {/* Login Form */}
          {mode === 'login' && (
            <form className={`space-y-6 ${isLoaded ? 'animate-slide-in-right stagger-5' : 'opacity-0'}`} onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label 
                    htmlFor="login-email" 
                    className={`block font-cairo mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                    style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                  >
                    {t('auth.login.email')}
                  </label>
                  <div className="relative">
                    <input
                      {...loginForm.register('email', {
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
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600 font-cairo">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label 
                    htmlFor="login-password" 
                    className={`block font-cairo mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                    style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                  >
                    {t('auth.login.password')}
                  </label>
                  <div className="relative">
                    <input
                      {...loginForm.register('password', {
                        required: t('auth.validation.password-required'),
                        minLength: {
                          value: 6,
                          message: t('auth.validation.password-min-length'),
                        },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
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
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600 font-cairo">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              {/* Remember me and Forgot password */}
              <div className={`flex items-center ${locale === 'ar' ? 'justify-between flex-row-reverse' : 'justify-between'}`}>
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className={`${locale === 'ar' ? 'mr-2' : 'ml-2'} block text-sm text-gray-900 font-cairo`}>
                    {t('auth.login.remember')}
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href={`/${locale}/auth/forgot-password`}
                    className="font-medium text-teal-600 hover:text-teal-500 font-cairo"
                  >
                    {t('auth.login.forgot')}
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
                      {t('auth.login.submitting')}
                    </div>
                  ) : (
                    t('auth.login.submit')
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-cairo">{t('auth.or')}</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="flex justify-center items-center space-x-4 rtl:space-x-reverse">
                <button 
                  type="button" 
                  className="hover:opacity-80 transition-opacity duration-200"
                  onClick={handleAppleAuth}
                  disabled={isLoading}
                >
                  <Image
                    src="/images/Apple Button.svg"
                    alt={t('auth.social.apple-alt')}
                    width={80}
                    height={80}
                    style={{ width: '4rem', height: '4rem' }}
                    unoptimized
                  />
                </button>
                <button 
                  type="button" 
                  className="hover:opacity-80 transition-opacity duration-200"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                >
                  <Image
                    src="/images/Google Button.svg"
                    alt={t('auth.social.google-alt')}
                    width={80}
                    height={80}
                    style={{ width: '4rem', height: '4rem' }}
                    unoptimized
                  />
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form className={`space-y-6 ${isLoaded ? 'animate-slide-in-right stagger-5' : 'opacity-0'}`} onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label 
                    htmlFor="fullName" 
                    className={`block font-cairo mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                    style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                  >
                    {t('auth.register.full-name')}
                  </label>
                  <div className="relative">
                    <input
                      {...registerForm.register('fullName', {
                        required: t('auth.validation.full-name-required'),
                        minLength: {
                          value: 2,
                          message: t('auth.validation.full-name-min-length'),
                        },
                      })}
                      type="text"
                      autoComplete="name"
                      className={`w-full px-4 py-3 ${locale === 'ar' ? 'pr-10 text-right' : 'pl-10 text-left'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo`}
                      placeholder={t('auth.register.full-name-placeholder')}
                      style={{ fontSize: '14px', direction: locale === 'ar' ? 'rtl' : 'ltr' }}
                    />
                    <Icon 
                      name="user" 
                      className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4`}
                      style={{ color: '#00AC96' }}
                    />
                  </div>
                  {registerForm.formState.errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 font-cairo">{registerForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label 
                    htmlFor="register-email" 
                    className={`block font-cairo mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                    style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                  >
                    {t('auth.register.email')}
                  </label>
                  <div className="relative">
                    <input
                      {...registerForm.register('email', {
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
                  {registerForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600 font-cairo">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label 
                    htmlFor="phone" 
                    className={`block font-cairo mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                    style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                  >
                    {t('auth.register.phone')}
                  </label>
                  <div className="relative">
                    <input
                      {...registerForm.register('phone')}
                      type="tel"
                      autoComplete="tel"
                      className={`w-full px-4 py-3 ${locale === 'ar' ? 'pr-10 pl-20 text-right' : 'pl-10 pr-20 text-left'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo`}
                      placeholder={t('auth.register.phone-placeholder')}
                      style={{ fontSize: '14px', direction: locale === 'ar' ? 'rtl' : 'ltr' }}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                      <select 
                        className="border-0 bg-transparent focus:outline-none font-cairo text-gray-600"
                        style={{ fontSize: '14px' }}
                        defaultValue="+966"
                      >
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+962">🇯🇴 +962</option>
                        <option value="+961">🇱🇧 +961</option>
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+212">🇲🇦 +212</option>
                        <option value="+216">🇹🇳 +216</option>
                        <option value="+213">🇩🇿 +213</option>
                        <option value="+964">🇮🇶 +964</option>
                        <option value="+963">🇸🇾 +963</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                      </select>
                    </div>
                    <Icon 
                      name="mobile-screen" 
                      className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4`}
                      style={{ color: '#00AC96' }}
                    />
                  </div>
                  {registerForm.formState.errors.phone && (
                    <p className="mt-1 text-sm text-red-600 font-cairo">{registerForm.formState.errors.phone.message}</p>
                  )}
                </div>



                {/* Password */}
                <div>
                  <label 
                    htmlFor="register-password" 
                    className={`block font-cairo mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                    style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                  >
                    {t('auth.register.password')}
                  </label>
                  <div className="relative">
                    <input
                      {...registerForm.register('password', {
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
                  {registerForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600 font-cairo">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label 
                    htmlFor="confirmPassword" 
                    className={`block font-cairo mb-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                    style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                  >
                    {t('auth.register.confirm-password')}
                  </label>
                  <div className="relative">
                    <input
                      {...registerForm.register('confirmPassword', {
                        required: t('auth.validation.confirm-password-required'),
                        validate: (value) =>
                          value === password || t('auth.validation.passwords-no-match'),
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
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 font-cairo">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
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
                      {t('auth.register.submitting')}
                    </div>
                  ) : (
                    t('auth.register.submit')
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-cairo">{t('auth.or')}</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="flex justify-center items-center space-x-4 rtl:space-x-reverse">
                <button 
                  type="button" 
                  className="hover:opacity-80 transition-opacity duration-200"
                  onClick={handleAppleAuth}
                  disabled={isLoading}
                >
                  <Image
                    src="/images/Apple Button.svg"
                    alt={t('auth.social.apple-alt')}
                    width={80}
                    height={80}
                    style={{ width: '4rem', height: '4rem' }}
                    unoptimized
                  />
                </button>
                <button 
                  type="button" 
                  className="hover:opacity-80 transition-opacity duration-200"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                >
                  <Image
                    src="/images/Google Button.svg"
                    alt={t('auth.social.google-alt')}
                    width={80}
                    height={80}
                    style={{ width: '4rem', height: '4rem' }}
                    unoptimized
                  />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Login Image */}
      <div className={`hidden lg:flex flex-1 relative bg-gray-50 ${isLoaded ? 'animate-slide-in-left stagger-6' : 'opacity-0'}`}>
        <Image
          src="/images/login image.png"
          alt={mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
          fill
          className="object-cover"
          style={{ borderRadius: '50px' }}
          priority
        />
      </div>
    </div>
  );
}