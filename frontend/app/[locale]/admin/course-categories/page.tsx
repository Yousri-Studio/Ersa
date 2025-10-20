'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { adminApi, CourseCategory, CreateCourseCategoryRequest } from '@/lib/admin-api';
import { useHydration } from '@/hooks/useHydration';
import toast from 'react-hot-toast';

export default function CourseCategoriesPage() {
  const t = useTranslations('courseCategories');
  const locale = useLocale();
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null);
  const [formData, setFormData] = useState<CreateCourseCategoryRequest>({
    titleAr: '',
    titleEn: '',
    subtitleAr: '',
    subtitleEn: '',
    displayOrder: 0,
    isActive: true,
  });
  const isHydrated = useHydration();
  const isRTL = locale === 'ar';

  useEffect(() => {
    if (isHydrated) {
      fetchCategories();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getCourseCategories();
      setCategories(response.data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error(t('errorCreating'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await adminApi.createCourseCategory(formData);
      toast.success(t('categoryCreated'));
      setShowAddModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Create category error:', error);
      toast.error(t('errorCreating'));
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;
    try {
      await adminApi.updateCourseCategory(selectedCategory.id, formData);
      toast.success(t('categoryUpdated'));
      setShowEditModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Update category error:', error);
      toast.error(t('errorUpdating'));
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await adminApi.deleteCourseCategory(selectedCategory.id);
      toast.success(t('categoryDeleted'));
      setShowDeleteModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('errorDeleting'));
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (category: CourseCategory) => {
    setSelectedCategory(category);
    setFormData({
      titleAr: category.titleAr,
      titleEn: category.titleEn,
      subtitleAr: category.subtitleAr || '',
      subtitleEn: category.subtitleEn || '',
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category: CourseCategory) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      titleAr: '',
      titleEn: '',
      subtitleAr: '',
      subtitleEn: '',
      displayOrder: 0,
      isActive: true,
    });
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6" style={{maxWidth: '90rem', paddingTop: '50px'}} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
        </div>
        <div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 inline-flex items-center"
          >
            <Icon name="plus" className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('addCategory')}
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Icon name="list" className="h-16 w-16 mb-4 text-gray-300" />
            <p>{t('noCategories')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('titleEnglish')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('titleArabic')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('displayOrder')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('status')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.sort((a, b) => a.displayOrder - b.displayOrder).map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.titleEn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.titleAr}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.displayOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
                      <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                        <button
                          onClick={() => openEditModal(category)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                          title={t('editCategory')}
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                          title={t('deleteCategory')}
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('addCategory')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('titleEnglish')}</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({...formData, titleEn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('titleArabic')}</label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({...formData, titleAr: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle (English)</label>
                  <textarea
                    value={formData.subtitleEn || ''}
                    onChange={(e) => setFormData({...formData, subtitleEn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    maxLength={500}
                    placeholder="Optional subtitle in English (max 500 characters)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان الفرعي (عربي)</label>
                  <textarea
                    value={formData.subtitleAr || ''}
                    onChange={(e) => setFormData({...formData, subtitleAr: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    maxLength={500}
                    placeholder="عنوان فرعي اختياري بالعربية (بحد أقصى 500 حرف)"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('displayOrder')}</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className={`${isRTL ? 'mr-2' : 'ml-2'} block text-sm text-gray-900`}>
                    {t('active')}
                  </label>
                </div>
              </div>
              <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} ${isRTL ? 'space-x-reverse' : ''} space-x-3 mt-6`}>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  disabled={!formData.titleAr || !formData.titleEn}
                >
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('editCategory')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('titleEnglish')}</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({...formData, titleEn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('titleArabic')}</label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({...formData, titleAr: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle (English)</label>
                  <textarea
                    value={formData.subtitleEn || ''}
                    onChange={(e) => setFormData({...formData, subtitleEn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    maxLength={500}
                    placeholder="Optional subtitle in English (max 500 characters)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان الفرعي (عربي)</label>
                  <textarea
                    value={formData.subtitleAr || ''}
                    onChange={(e) => setFormData({...formData, subtitleAr: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    maxLength={500}
                    placeholder="عنوان فرعي اختياري بالعربية (بحد أقصى 500 حرف)"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('displayOrder')}</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActiveEdit"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActiveEdit" className={`${isRTL ? 'mr-2' : 'ml-2'} block text-sm text-gray-900`}>
                    {t('active')}
                  </label>
                </div>
              </div>
              <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} ${isRTL ? 'space-x-reverse' : ''} space-x-3 mt-6`}>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  disabled={!formData.titleAr || !formData.titleEn}
                >
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('deleteCategory')}</h3>
              <p className="text-sm text-gray-500 mb-4">{t('confirmDelete')}</p>
              <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

