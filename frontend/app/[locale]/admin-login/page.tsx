'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Icon } from '@/components/ui/icon';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('superadmin@ersatraining.com');
  const [password, setPassword] = useState('SuperAdmin123!');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  // Account credentials for different roles
  const accountCredentials = {
    'system-manager': {
      email: 'superadmin@ersatraining.com',
      password: 'SuperAdmin123!',
      title: 'مدير النظام',
      description: 'صلاحيات كاملة لإدارة النظام'
    },
    'operations-manager': {
      email: 'operations@ersatraining.com',
      password: 'Operations123!',
      title: 'مسؤول التشغيل',
      description: 'صلاحيات محدودة لإدارة العمليات'
    }
  } as const;
  
  const [selectedRole, setSelectedRole] = useState<keyof typeof accountCredentials>('system-manager');
  
  const router = useRouter();
  const locale = useLocale();
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Starting login process...');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api');
      
      // Try real API first
      try {
        const response = await api.post('/auth/login', {
          email,
          password,
        });

        console.log('Login response:', response.data);
        const { token, user } = response.data;
        
        // Check if user is admin
        if (!user.isAdmin && !user.isSuperAdmin) {
          console.log('User is not admin:', user);
          toast.error('Access denied. Admin privileges required.');
          return;
        }

        // Check role-specific permissions
        if (selectedRole === 'system-manager' && !user.isSuperAdmin) {
          console.log('User is not super admin:', user);
          toast.error('Access denied. Super Admin privileges required for System Manager role.');
          return;
        }

        if (selectedRole === 'operations-manager' && !user.isAdmin) {
          console.log('User is not operations admin:', user);
          toast.error('Access denied. Operations Admin privileges required for Operations Manager role.');
          return;
        }

        console.log('User is admin, logging in...');
        
        // Login and redirect
        login(token, user);
        console.log('Login successful, redirecting...');
        toast.success('Login successful!');
        router.push(`/${locale}/admin`);
        return;
      } catch (apiError: any) {
        console.log('API login failed, trying mock login...');
        
        // Mock login for development
        if (email === 'superadmin@ersatraining.com' && password === 'SuperAdmin123!') {
          const mockUser = {
            id: '1',
            fullName: 'Super Admin',
            email: 'superadmin@ersatraining.com',
            phone: undefined,
            locale: 'en',
            createdAt: new Date().toISOString(),
            isAdmin: true,
            isSuperAdmin: true,
            lastLoginAt: new Date().toISOString()
          };
          
          const mockToken = 'mock-jwt-token-for-development';
          
          login(mockToken, mockUser);
          console.log('Mock login successful, redirecting...');
          toast.success('Login successful! (Mock Mode)');
          router.push(`/${locale}/admin`);
          return;
        }
        
        if (email === 'operations@ersatraining.com' && password === 'Operations123!') {
          const mockUser = {
            id: '2',
            fullName: 'Operations Manager',
            email: 'operations@ersatraining.com',
            phone: undefined,
            locale: 'en',
            createdAt: new Date().toISOString(),
            isAdmin: true,
            isSuperAdmin: false,
            lastLoginAt: new Date().toISOString()
          };
          
          const mockToken = 'mock-jwt-token-for-development';
          
          login(mockToken, mockUser);
          console.log('Mock login successful, redirecting...');
          toast.success('Login successful! (Mock Mode)');
          router.push(`/${locale}/admin`);
          return;
        }
        
        throw apiError;
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-background relative flex items-center justify-center px-4 py-8">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
          <div className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#00AC96] to-[#693EB0] opacity-10 hero-clip-path" />
        </div>
      </div>

      {/* Centered Form */}
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <Image
              src="/Header Logo.svg"
              alt="Ersa Training & Consultancy Services"
              width={120}
              height={46}
              priority
            />
          </div>
          
          {/* Welcome Badge */}
          <div className="mb-6">
            <span className="font-cairo" style={{ color: '#1A1928', fontSize: '16px', fontWeight: 700 }}>
              مرحباً بك عزيزي 👋
            </span>
          </div>
          
          {/* Role Selection */}
          <div className="mb-6">
            <div className="flex p-1" style={{ borderRadius: '10px', backgroundColor: 'rgba(237, 252, 251, 1)' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('operations-manager');
                  setEmail(accountCredentials['operations-manager'].email);
                  setPassword(accountCredentials['operations-manager'].password);
                }}
                className={`flex-1 px-4 font-cairo transition-all duration-200 ${
                  selectedRole === 'operations-manager'
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
                مسؤول التشغيل
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('system-manager');
                  setEmail(accountCredentials['system-manager'].email);
                  setPassword(accountCredentials['system-manager'].password);
                }}
                className={`flex-1 px-4 font-cairo transition-all duration-200 ${
                  selectedRole === 'system-manager'
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
                مدير النظام
              </button>
            </div>
          </div>
          
          {/* Title */}
          <h1 
            className="font-cairo font-bold mb-4"
            style={{
              color: '#00AC96',
              fontSize: '28px',
              fontWeight: 700
            }}
          >
            تسجيل الدخول
          </h1>
          
          {/* Subtitle */}
          <p 
            className="font-cairo mb-8"
            style={{
              color: '#6B7280',
              fontSize: '14px',
              fontWeight: 400
            }}
          >
            سجل الدخول للوصول إلى إدارة النظام بشكل كامل
          </p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block font-cairo mb-2 text-right"
                  style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                >
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo text-right"
                    placeholder="superadmin@ersatraining.com"
                    style={{ fontSize: '14px', direction: 'rtl' }}
                  />
                  <Icon 
                    name="envelope" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                    style={{ color: '#00AC96' }} 
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block font-cairo mb-2 text-right"
                  style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                >
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo text-right pl-10 pr-10"
                    placeholder="••••••••"
                    style={{ fontSize: '14px', direction: 'rtl' }}
                  />
                  <Icon 
                    name="lock" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                    style={{ color: '#00AC96' }} 
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  >
                    <Icon name="eye" className="h-5 w-5" style={{ color: '#9797A8' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-end">
              <label htmlFor="remember-me" className="block text-sm text-gray-900 font-cairo ml-5">
                تذكرني
              </label>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
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
          </form>

          {/* Default Credentials Info - Hidden for Security */}
          {/* 
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Icon name="question-circle" className="h-5 w-5 text-blue-400" />
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-blue-800 font-cairo">بيانات الدخول الافتراضية</h3>
                <div className="mt-2 text-sm text-blue-700 font-cairo">
                  <div className="mb-3">
                    <p className="font-semibold text-blue-800">{accountCredentials[selectedRole].title}</p>
                    <p className="text-xs text-blue-600 mb-1">{accountCredentials[selectedRole].description}</p>
                    <p><strong>البريد الإلكتروني:</strong> {accountCredentials[selectedRole].email}</p>
                    <p><strong>كلمة المرور:</strong> {accountCredentials[selectedRole].password}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          */}
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            جميع الحقوق محفوظة لمنصة إرساء © 2025
          </p>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-400">تصميم وتطوير</span>
            <a 
              href="https://kijoo.agency" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <Image
                src="/images/Kijoo Logo.svg"
                alt="Kijoo Agency"
                width={82}
                height={14}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
