'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { adminApi, UserWithRoles } from '@/lib/admin-api';
import { useHydration } from '@/hooks/useHydration';
import { useRoles } from '@/hooks/useRoles';
import { useAuthStore } from '@/lib/auth-store';
import { getRoleDisplayName, getRoleColor, getRoleDescription, UserRole } from '@/lib/roles';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AdminRoles() {
  const locale = useLocale();
  const router = useRouter();
  const isHydrated = useHydration();
  const { isSuperAdmin, isLoading: rolesLoading } = useRoles();
  const { user } = useAuthStore();
  const isRTL = locale === 'ar';

  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const availableRoles = [
    UserRole.SuperAdmin,
    UserRole.Admin,
    UserRole.Operation,
    UserRole.PublicUser
  ];

  useEffect(() => {
    if (isHydrated && !rolesLoading) {
      // Check both role system and boolean property for backward compatibility
      const hasSuperAdminAccess = isSuperAdmin || user?.isSuperAdmin;
      
      if (!hasSuperAdminAccess) {
        toast.error(locale === 'ar' ? 'غير مصرح لك بالوصول إلى هذه الصفحة' : 'You are not authorized to access this page');
        router.push(`/${locale}/admin`);
        return;
      }
      fetchUsers();
    }
  }, [isHydrated, isSuperAdmin, rolesLoading, locale, router, user]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching users with roles...');
      const response = await adminApi.getUsersWithRoles();
      console.log('Users response:', response);
      
      if (response.data && response.data.length > 0) {
        setUsers(response.data);
      } else {
        // Fallback data if API returns empty
        console.log('No users returned, using fallback data');
        setUsers([]);
        toast.info(locale === 'ar' ? 'لا توجد مستخدمين في النظام' : 'No users found in the system');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(locale === 'ar' ? 'فشل في تحميل المستخدمين' : 'Failed to load users');
      setUsers([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const openRoleModal = (user: UserWithRoles) => {
    setSelectedUser(user);
    setSelectedRole('');
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error(locale === 'ar' ? 'يرجى اختيار دور' : 'Please select a role');
      return;
    }

    try {
      await adminApi.assignRoleToUser(selectedUser.email, selectedRole);
      toast.success(locale === 'ar' ? 'تم تعيين الدور بنجاح' : 'Role assigned successfully');
      await fetchUsers();
      closeRoleModal();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast.error(error.response?.data?.error || (locale === 'ar' ? 'فشل في تعيين الدور' : 'Failed to assign role'));
    }
  };

  const handleRemoveRole = async (user: UserWithRoles, role: string) => {
    if (!confirm(locale === 'ar' ? `هل أنت متأكد من إزالة دور "${getRoleDisplayName(role, locale)}" من ${user.fullName}؟` : `Are you sure you want to remove "${getRoleDisplayName(role, locale)}" role from ${user.fullName}?`)) {
      return;
    }

    try {
      await adminApi.removeRoleFromUser(user.email, role);
      toast.success(locale === 'ar' ? 'تم إزالة الدور بنجاح' : 'Role removed successfully');
      await fetchUsers();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast.error(error.response?.data?.error || (locale === 'ar' ? 'فشل في إزالة الدور' : 'Failed to remove role'));
    }
  };

  if (!isHydrated || rolesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === 'ar' ? 'إدارة الأدوار' : 'Role Management'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {locale === 'ar' ? 'إدارة أدوار المستخدمين والصلاحيات' : 'Manage user roles and permissions'}
          </p>
        </div>
      </div>

      {/* Role Legend */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {locale === 'ar' ? 'الأدوار المتاحة' : 'Available Roles'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableRoles.map((role) => (
            <div key={role} className="border border-gray-200 rounded-lg p-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role)} border`}>
                {getRoleDisplayName(role, locale)}
              </span>
              <p className="mt-2 text-sm text-gray-600">
                {getRoleDescription(role, locale)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {locale === 'ar' ? `المستخدمون (${users.length})` : `Users (${users.length})`}
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'المستخدم' : 'User'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الأدوار' : 'Roles'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <span
                              key={role}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)} border group relative`}
                            >
                              {getRoleDisplayName(role, locale)}
                              <button
                                onClick={() => handleRemoveRole(user, role)}
                                className={`${isRTL ? 'mr-1' : 'ml-1'} text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity`}
                                title={locale === 'ar' ? 'إزالة الدور' : 'Remove role'}
                              >
                                <Icon name="times" className="h-3 w-3" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            {locale === 'ar' ? 'لا توجد أدوار' : 'No roles'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openRoleModal(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Icon name="plus" className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-md w-full shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {locale === 'ar' ? 'تعيين دور' : 'Assign Role'}
                </h3>
                <button
                  onClick={closeRoleModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Icon name="times" className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {locale === 'ar' ? 'المستخدم:' : 'User:'} <strong>{selectedUser.fullName}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {locale === 'ar' ? 'البريد الإلكتروني:' : 'Email:'} <strong>{selectedUser.email}</strong>
                </p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'اختر الدور' : 'Select Role'}
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{locale === 'ar' ? 'اختر دور...' : 'Select a role...'}</option>
                  {availableRoles
                    .filter((role) => !selectedUser.roles.includes(role))
                    .map((role) => (
                      <option key={role} value={role}>
                        {getRoleDisplayName(role, locale)}
                      </option>
                    ))}
                </select>
                {selectedRole && (
                  <p className="mt-2 text-sm text-gray-500">
                    {getRoleDescription(selectedRole, locale)}
                  </p>
                )}
              </div>

              <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                <button
                  type="button"
                  onClick={closeRoleModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleAssignRole}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  disabled={!selectedRole}
                >
                  {locale === 'ar' ? 'تعيين الدور' : 'Assign Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

