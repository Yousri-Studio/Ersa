'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { adminApi, AdminUser, PagedResult, CreateUserRequest } from '@/lib/admin-api';
import { useAuthStore } from '@/lib/auth-store';
import { useHydration } from '@/hooks/useHydration';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const locale = useLocale();
  const t = useTranslations('admin');
  const isRTL = locale === 'ar';
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: '',
    adminNotes: '',
  });
  const [roleForm, setRoleForm] = useState({
    isAdmin: false,
    isSuperAdmin: false,
  });
  const [addUserForm, setAddUserForm] = useState<CreateUserRequest>({
    fullName: '',
    email: '',
    phone: '',
    locale: locale as 'en' | 'ar',
    isAdmin: false,
    isSuperAdmin: false,
  });

  const { user: currentUser } = useAuthStore();
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) {
      fetchUsers();
    }
  }, [isHydrated, pagination.page, filters]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getUsers({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
      });
      
      setUsers(response.data.items);
      setPagination(prev => ({
        ...prev,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
      }));

      if (response.isUsingFallback) {
        toast.error('Using demo data - API connection failed');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedUser) return;

    if (!statusForm.status) {
      toast.error('Please select a status');
      return;
    }

    try {
      await adminApi.updateUserStatus(selectedUser.id, statusForm);
      toast.success('User status updated successfully');
      setShowStatusModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to update user status';
      toast.error(errorMessage);
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;

    try {
      await adminApi.updateAdminRole(selectedUser.id, roleForm);
      toast.success('User role updated successfully');
      setShowRoleModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to update user role');
      console.error('Error updating user role:', error);
    }
  };

  const openStatusModal = (user: AdminUser) => {
    setSelectedUser(user);
    setStatusForm({
      status: user.status || 'Active',
      adminNotes: '',
    });
    setShowStatusModal(true);
  };

  const openRoleModal = (user: AdminUser) => {
    setSelectedUser(user);
    setRoleForm({
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
    });
    setShowRoleModal(true);
  };

  const handleAddUser = async () => {
    try {
      const response = await adminApi.createUser(addUserForm);
      toast.success('User created successfully');
      setShowAddUserModal(false);
      setAddUserForm({
        fullName: '',
        email: '',
        phone: '',
        locale: 'en',
        isAdmin: false,
        isSuperAdmin: false,
      });
      fetchUsers();
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      locale === 'ar' ? 'ar-SA' : 'en-US', 
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const getStatusColor = (status: any) => {
    const statusStr = String(status || '').toLowerCase();
    switch (statusStr) {
      case 'active':
        return 'bg-primary-100 text-primary-800';
      case 'pendingemailverification':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return locale === 'ar' ? 'نشط' : 'Active';
      case 'pendingemailverification':
        return locale === 'ar' ? 'في انتظار التحقق' : 'Pending Verification';
      case 'inactive':
        return locale === 'ar' ? 'غير نشط' : 'Inactive';
      case 'suspended':
        return locale === 'ar' ? 'معلق' : 'Suspended';
      default:
        return locale === 'ar' ? 'غير معروف' : 'Unknown';
    }
  };

  return (
    <div className="space-y-6" style={{maxWidth: '90rem', paddingTop: '50px'}} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === 'ar' ? 'إدارة المستخدمين' : 'Users Management'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {locale === 'ar' 
              ? 'إدارة حسابات المستخدمين والحالة والصلاحيات' 
              : 'Manage user accounts, status, and permissions'
            }
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Icon name="plus" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {locale === 'ar' ? 'إضافة مستخدم' : 'Add User'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'البحث' : 'Search'}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={locale === 'ar' ? 'البحث بالاسم أو البريد الإلكتروني أو الهاتف...' : 'Search by name, email, or phone...'}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className={`w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
              <Icon name="search" className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'الحالة' : 'Status'}
            </label>
            <div className="select-wrapper w-full">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{locale === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="Active">{locale === 'ar' ? 'نشط' : 'Active'}</option>
                <option value="PendingEmailVerification">{locale === 'ar' ? 'في انتظار التحقق' : 'Pending Verification'}</option>
                <option value="Inactive">{locale === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                <option value="Suspended">{locale === 'ar' ? 'معلق' : 'Suspended'}</option>
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {locale === 'ar' ? 'بحث' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {locale === 'ar' ? 'المستخدمين' : 'Users'} ({pagination.totalCount.toLocaleString()})
          </h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 admin-users">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    {locale === 'ar' ? 'المستخدم' : 'User'}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    {locale === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    {locale === 'ar' ? 'الدور' : 'Role'}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    {locale === 'ar' ? 'تاريخ الإنشاء' : 'Created'}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    {locale === 'ar' ? 'آخر تسجيل دخول' : 'Last Login'}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Icon name="user" className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status || '')}`}>
                        {getStatusLabel(user.status || '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'} ${isRTL ? 'space-x-reverse' : ''} space-x-1`}>
                        {user.isSuperAdmin && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {locale === 'ar' ? 'مدير عام' : 'Super Admin'}
                          </span>
                        )}
                        {user.isAdmin && !user.isSuperAdmin && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {locale === 'ar' ? 'مدير' : 'Admin'}
                          </span>
                        )}
                        {!user.isAdmin && !user.isSuperAdmin && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {locale === 'ar' ? 'مستخدم' : 'User'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
                      <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                        <button
                          onClick={() => openStatusModal(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        {currentUser?.isSuperAdmin && (
                          <button
                            onClick={() => openRoleModal(user)}
                            className="text-secondary-600 hover:text-secondary-700"
                          >
                            <Icon name="user-shield" className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:items-center sm:justify-center w-full">
              <div className="flex flex-col items-center space-y-2">
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.totalCount}</span>
                  {' '}results
                </p>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Icon name={isRTL ? "chevron-right" : "chevron-left"} className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Icon name={isRTL ? "chevron-left" : "chevron-right"} className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update User Status
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="select-wrapper w-full">
                    <select
                      value={statusForm.status}
                      onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                        <option value="PendingEmailVerification">Pending Email Verification</option>
                      </select>
                    </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={statusForm.adminNotes}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional notes about this user..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Update Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update User Role
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={roleForm.isAdmin}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, isAdmin: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                    Admin
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isSuperAdmin"
                    checked={roleForm.isSuperAdmin}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, isSuperAdmin: e.target.checked }))}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isSuperAdmin" className="ml-2 block text-sm text-gray-900">
                    Super Admin
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-secondary-600 rounded-md hover:bg-secondary-700"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {locale === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={addUserForm.fullName}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={locale === 'ar' ? 'أدخل الاسم الكامل' : 'Enter full name'}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={addUserForm.email}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={locale === 'ar' ? 'أدخل عنوان البريد الإلكتروني' : 'Enter email address'}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar' ? 'رقم الجوال (اختياري)' : 'Phone (Optional)'}
                  </label>
                  <input
                    type="tel"
                    value={addUserForm.phone}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={locale === 'ar' ? 'أدخل رقم الجوال' : 'Enter phone number'}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar' ? 'اللغة' : 'Language'}
                  </label>
                  <select
                    value={addUserForm.locale}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, locale: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">{locale === 'ar' ? 'الإنجليزية' : 'English'}</option>
                    <option value="ar">{locale === 'ar' ? 'العربية' : 'Arabic'}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="addUserIsAdmin"
                      checked={addUserForm.isAdmin}
                      onChange={(e) => setAddUserForm(prev => ({ ...prev, isAdmin: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="addUserIsAdmin" className="ml-2 block text-sm text-gray-900">
                      {locale === 'ar' ? 'مدير' : 'Admin'}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="addUserIsSuperAdmin"
                      checked={addUserForm.isSuperAdmin}
                      onChange={(e) => setAddUserForm(prev => ({ ...prev, isSuperAdmin: e.target.checked }))}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="addUserIsSuperAdmin" className="ml-2 block text-sm text-gray-900">
                      {locale === 'ar' ? 'مدير النظام' : 'Super Admin'}
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  {locale === 'ar' ? 'إضافة مستخدم' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
