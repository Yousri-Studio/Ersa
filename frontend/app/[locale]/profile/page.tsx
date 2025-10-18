'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { useAuthStore } from '@/lib/auth-store';
import { userProfileApi, type ChangePasswordRequest } from '@/lib/api';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';

export default function ProfilePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const isLoaded = usePageLoad(100);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?redirect=/profile`);
    }
  }, [isAuthenticated, locale, router]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await userProfileApi.updateProfile({
        fullName,
        phone: phone || undefined,
      });

      updateUser(response.data);
      setSuccess(t('profile.update-success'));
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || t('profile.update-error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError(t('profile.password-mismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('profile.password-too-short'));
      return;
    }

    setLoading(true);

    try {
      await userProfileApi.changePassword({
        currentPassword,
        newPassword,
      });

      setSuccess(t('profile.password-changed'));
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || t('profile.password-change-error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen bg-gray-50 py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className={`mb-8 ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <h1 className="text-3xl font-bold text-gray-900 font-cairo">
              {t('profile.title')}
            </h1>
            <p className="mt-2 text-gray-600 font-cairo">
              {t('profile.subtitle')}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-cairo">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg font-cairo">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <div className={`bg-white rounded-lg shadow-sm p-6 ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 font-cairo">
                    {t('profile.basic-info')}
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-primary-600 hover:text-primary-700 font-cairo inline-flex items-center"
                    >
                      <Icon name="edit" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('profile.edit')}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                        {t('profile.full-name')}
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-cairo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                        {t('profile.email')}
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-cairo"
                      />
                      <p className="mt-1 text-sm text-gray-500 font-cairo">
                        {t('profile.email-cannot-change')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                        {t('profile.phone')}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-cairo"
                      />
                    </div>

                    <div className="flex space-x-3 rtl:space-x-reverse">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 font-cairo"
                      >
                        {loading ? t('common.saving') : t('common.save')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFullName(user.fullName);
                          setPhone(user.phone || '');
                          setError('');
                        }}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 font-cairo"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1 font-cairo">
                        {t('profile.full-name')}
                      </label>
                      <p className="text-gray-900 font-cairo">{user.fullName}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1 font-cairo">
                        {t('profile.email')}
                      </label>
                      <p className="text-gray-900 font-cairo">{user.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1 font-cairo">
                        {t('profile.phone')}
                      </label>
                      <p className="text-gray-900 font-cairo">{user.phone || t('profile.not-provided')}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1 font-cairo">
                        {t('profile.member-since')}
                      </label>
                      <p className="text-gray-900 font-cairo">
                        {new Date(user.createdAt).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Change Password */}
              <div className={`bg-white rounded-lg shadow-sm p-6 ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 font-cairo">
                    {t('profile.change-password')}
                  </h2>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="text-primary-600 hover:text-primary-700 font-cairo inline-flex items-center"
                    >
                      <Icon name="lock" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('profile.change')}
                    </button>
                  )}
                </div>

                {isChangingPassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                        {t('profile.current-password')}
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-cairo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                        {t('profile.new-password')}
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-cairo"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                        {t('profile.confirm-password')}
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-cairo"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="flex space-x-3 rtl:space-x-reverse">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 font-cairo"
                      >
                        {loading ? t('common.saving') : t('profile.change-password')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setError('');
                        }}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 font-cairo"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-gray-600 font-cairo">
                    {t('profile.password-description')}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Links Sidebar */}
            <div className="space-y-6">
              {/* Quick Links */}
              <div className={`bg-white rounded-lg shadow-sm p-6 ${isLoaded ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 font-cairo">
                  {t('profile.quick-links')}
                </h2>
                <div className="space-y-3">
                  <Link
                    href={`/${locale}/profile/enrollments`}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
                        <Icon name="book" className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 font-cairo">
                          {t('profile.my-enrollments')}
                        </h3>
                        <p className="text-sm text-gray-600 font-cairo">
                          {t('profile.view-courses')}
                        </p>
                      </div>
                    </div>
                    <Icon name="chevron-right" className="h-5 w-5 text-gray-400 group-hover:text-gray-600 rtl:rotate-180" />
                  </Link>

                  <Link
                    href={`/${locale}/profile/orders`}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
                        <Icon name="receipt" className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 font-cairo">
                          {t('profile.my-orders')}
                        </h3>
                        <p className="text-sm text-gray-600 font-cairo">
                          {t('profile.view-orders')}
                        </p>
                      </div>
                    </div>
                    <Icon name="chevron-right" className="h-5 w-5 text-gray-400 group-hover:text-gray-600 rtl:rotate-180" />
                  </Link>

                  <Link
                    href={`/${locale}/profile/wishlist`}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-red-500 rounded-lg flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
                        <Icon name="heart" className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 font-cairo">
                          {t('profile.my-wishlist')}
                        </h3>
                        <p className="text-sm text-gray-600 font-cairo">
                          {t('profile.view-wishlist')}
                        </p>
                      </div>
                    </div>
                    <Icon name="chevron-right" className="h-5 w-5 text-gray-400 group-hover:text-gray-600 rtl:rotate-180" />
                  </Link>
                </div>
              </div>

              {/* Account Stats */}
              <div className={`bg-white rounded-lg shadow-sm p-6 ${isLoaded ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 font-cairo">
                  {t('profile.account-stats')}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-cairo">{t('profile.last-login')}</span>
                    <span className="text-gray-900 font-semibold font-cairo">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString(locale)
                        : t('profile.never')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-cairo">{t('profile.account-status')}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 font-cairo">
                      {t('profile.active')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

