'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import toast from 'react-hot-toast';
import { usePageLoad } from '@/lib/use-animations';

export default function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const isLoaded = usePageLoad(100);
  
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    if (!searchParams) {
      router.push(`/${locale}/auth/register`);
      return;
    }
    
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Redirect to register if no email provided
      router.push(`/${locale}/auth/register`);
    }
  }, [searchParams, router, locale]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast.error(t('auth.verify.enter-complete-code'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyEmail({ email, code });
      const { token, user } = response.data;
      
      // Login user after successful verification
      login(token, user);
      
      toast.success(t('auth.verify.success'));
      router.push(`/${locale}/auth/success`);
    } catch (error: any) {
      const message = error.response?.data?.error || t('auth.verify.invalid-code');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await authApi.resendVerificationCode({ email });
      toast.success(t('auth.verify.code-sent'));
    } catch (error: any) {
      const message = error.response?.data?.error || t('auth.verify.resend-failed');
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email ? `${email.substring(0, 2)}****@${email.split('@')[1]}` : '';

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className={`mx-auto h-20 w-20 bg-teal-100 rounded-full flex items-center justify-center mb-6 ${isLoaded ? 'animate-bounce-in' : 'opacity-0'}`}>
            <Icon name="envelope" className="h-10 w-10 text-teal-600" />
          </div>
          <h2 className={`text-3xl font-bold text-gray-900 mb-2 ${isLoaded ? 'animate-fade-in-down stagger-1' : 'opacity-0'}`}>
            {t('auth.verify.title')}
          </h2>
          <p className={`text-gray-600 mb-6 ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            {t('auth.verify.subtitle')} {maskedEmail}
          </p>
        </div>

        <div className={`space-y-6 ${isLoaded ? 'animate-scale-in stagger-3' : 'opacity-0'}`}>
          {/* Verification Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              {t('auth.verify.code-label')}
            </label>
            <div className="flex justify-center space-x-3 rtl:space-x-reverse">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || verificationCode.join('').length !== 6}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed btn-animate"
            style={{ fontFamily: 'Cairo, sans-serif' }}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="spinner mr-2" />
                {t('auth.verify.verifying')}
              </div>
            ) : (
              t('auth.verify.verify-button')
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              {t('auth.verify.resend-question')}
            </p>
            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm font-medium text-teal-600 hover:text-teal-500 disabled:opacity-50"
              style={{ fontFamily: 'Cairo, sans-serif' }}
            >
              {isResending 
                ? t('auth.verify.sending')
                : t('auth.verify.resend-button')
              }
            </button>
          </div>

          {/* Back to Register */}
          <div className="text-center">
            <button
              onClick={() => router.push(`/${locale}/auth/register`)}
              className="text-sm text-gray-500 hover:text-gray-700"
              style={{ fontFamily: 'Cairo, sans-serif' }}
            >
              {t('auth.verify.back-to-register')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
