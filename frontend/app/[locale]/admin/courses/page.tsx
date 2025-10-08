'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { motion } from 'framer-motion';
import { adminApi, AdminCreateCourseRequest, AdminUpdateCourseRequest, AdminCourse } from '@/lib/admin-api';
import { useHydration } from '@/hooks/useHydration';
import { CourseForm } from '@/components/admin/course-form';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseForm, setCourseForm] = useState<AdminCreateCourseRequest>({
    slug: '',
    titleAr: '',
    titleEn: '',
    summaryAr: '',
    summaryEn: '',
    descriptionAr: '',
    descriptionEn: '',
    price: 0,
    currency: 'SAR',
    type: 1, // Live
    level: 1, // Beginner
    categoryId: null,
    subCategoryIds: [],
    videoUrl: '',
    duration: '',
    instructorNameAr: '',
    instructorNameEn: '',
    photo: [],
    tags: '',
    instructorsBioAr: '',
    instructorsBioEn: '',
    courseTopicsAr: '',
    courseTopicsEn: '',
    isActive: true,
    isFeatured: false,
  });
  const isHydrated = useHydration();
  const isRTL = locale === 'ar';

  useEffect(() => {
    if (isHydrated) {
      fetchCourses();
    }
  }, [isHydrated, pagination.page, filters]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getCourses({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: filters.search || undefined,
        isActive: filters.isActive !== '' ? filters.isActive === 'true' : undefined,
      });
      
      setCourses(response.data.items);
      setPagination(prev => ({
        ...prev,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
      }));

      if (response.isUsingFallback) {
        toast.error('Using demo data - API connection failed');
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = async (data: AdminCreateCourseRequest) => {
    try {
      // Ensure photo is properly formatted as number array or null
      const courseData = {
        ...data,
        photo: data.photo && Array.isArray(data.photo) && data.photo.length > 0 
          ? data.photo 
          : null
      };
      
      await adminApi.createCourse(courseData);
      toast.success('Course created successfully');
      setShowAddModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Create course error:', error);
      toast.error('Failed to create course');
    }
  };

  const handleEditCourse = async (data: AdminUpdateCourseRequest) => {
    if (!selectedCourse) return;
    try {
      // Ensure photo is properly formatted as number array or null
      const courseData = {
        ...data,
        photo: data.photo && Array.isArray(data.photo) && data.photo.length > 0 
          ? data.photo 
          : null
      };
      
      await adminApi.updateCourse(selectedCourse.id, courseData);
      toast.success('Course updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Update course error:', error);
      toast.error('Failed to update course');
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    try {
      await adminApi.deleteCourse(selectedCourse.id);
      toast.success('Course deleted successfully');
      setShowDeleteModal(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (course: AdminCourse) => {
    setSelectedCourse(course);
    setCourseForm({
      slug: course.slug || course.id,
      titleAr: course.titleAr,
      titleEn: course.titleEn,
      summaryAr: course.summaryAr || '',
      summaryEn: course.summaryEn || '',
      descriptionAr: course.descriptionAr || '',
      descriptionEn: course.descriptionEn || '',
      price: course.price,
      currency: course.currency || 'SAR',
      type: course.type || 1,
      level: course.level || 1,
      categoryId: course.categoryId || null,
      subCategoryIds: course.subCategories?.map(sc => sc.id) || [],
      videoUrl: course.videoUrl || '',
      duration: course.duration || '',
      instructorNameAr: course.instructorNameAr || '',
      instructorNameEn: course.instructorNameEn || '',
      photo: course.photo || [],
      tags: course.tags || '',
      instructorsBioAr: course.instructorsBioAr || '',
      instructorsBioEn: course.instructorsBioEn || '',
      courseTopicsAr: course.courseTopicsAr || '',
      courseTopicsEn: course.courseTopicsEn || '',
      isActive: course.isActive,
      isFeatured: course.isFeatured || false,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (course: AdminCourse) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setCourseForm({
      slug: '',
      titleAr: '',
      titleEn: '',
      summaryAr: '',
      summaryEn: '',
      descriptionAr: '',
      descriptionEn: '',
      price: 0,
      currency: 'SAR',
      type: 1,
      level: 1,
      categoryId: null,
      subCategoryIds: [],
      videoUrl: '',
      duration: '',
      instructorNameAr: '',
      instructorNameEn: '',
      photo: '',
      tags: '',
      instructorsBioAr: '',
      instructorsBioEn: '',
      courseTopicsAr: '',
      courseTopicsEn: '',
      isActive: true,
      isFeatured: false,
    });
  };

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6" style={{maxWidth: '90rem', paddingTop: '50px'}} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sidebar.manageCourses')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {locale === 'ar' ? 'عرض وإدارة جميع الدورات في المنصة' : 'View and manage all courses on the platform'}
          </p>
        </div>
        <div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Icon name="plus" className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {locale === 'ar' ? 'إضافة دورة' : 'Add Course'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'بحث' : 'Search'}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={locale === 'ar' ? 'البحث بالعنوان أو الوصف...' : 'Search by title or description...'}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className={`w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
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
                value={filters.isActive}
                onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{locale === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="true">{locale === 'ar' ? 'نشط' : 'Active'}</option>
                <option value="false">{locale === 'ar' ? 'غير نشط' : 'Inactive'}</option>
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

      {/* Courses Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {locale === 'ar' ? `الدورات (${pagination.totalCount.toLocaleString()})` : `Courses (${pagination.totalCount.toLocaleString()})`}
          </h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 admin-courses">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الصورة المصغرة' : 'Thumbnail'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الدورة' : 'Course'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'التصنيفات الفرعية' : 'Sub-Categories'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'السعر' : 'Price'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'تاريخ الإنشاء' : 'Created'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {locale === 'ar' ? 'تاريخ التحديث' : 'Updated'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>
                    {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex-shrink-0 h-16 w-16">
                        {course.photo && Array.isArray(course.photo) && course.photo.length > 0 ? (
                          <img 
                            src={`data:image/jpeg;base64,${btoa(String.fromCharCode(...course.photo))}`}
                            alt={course.titleEn}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-secondary-600 flex items-center justify-center">
                            <Icon name="graduation-cap" className="h-8 w-8 text-white" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`${isRTL ? 'mr-4' : 'ml-4'}`} style={locale === 'en' ? { marginLeft: '0rem' } : {}}>
                          <div className="text-sm font-medium text-gray-900">
                            {course.titleEn}
                          </div>
                          <div className="text-sm text-gray-500">
                            {course.titleAr}
                          </div>
                          {course.descriptionEn && (
                            <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {course.descriptionEn}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {course.subCategories && course.subCategories.length > 0 ? (
                        <div className="max-w-xs">
                          {course.subCategories.map(sc => {
                            // Handle both string and object formats for backward compatibility
                            const title = locale === 'ar' 
                              ? (typeof sc.titleAr === 'string' ? sc.titleAr : sc.titleAr || '')
                              : (typeof sc.titleEn === 'string' ? sc.titleEn : sc.titleEn || '');
                            return title;
                          }).join(', ')}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">{locale === 'ar' ? 'لا يوجد' : 'None'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                      {formatCurrency(course.price, course.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        course.isActive 
                          ? 'bg-primary-100 text-primary-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {course.isActive ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {formatDate(course.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {formatDate(course.updatedAt)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
                      <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                        <button
                          onClick={() => openEditModal(course)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                          title={locale === 'ar' ? 'تعديل الدورة' : 'Edit Course'}
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(course)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                          title={locale === 'ar' ? 'حذف الدورة' : 'Delete Course'}
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {locale === 'ar' ? 'السابق' : 'Previous'}
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className={`${isRTL ? 'mr-3' : 'ml-3'} relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50`}
              >
                {locale === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
            <div className="hidden sm:flex sm:items-center sm:justify-center w-full">
              <div className="flex flex-col items-center space-y-2">
                <p className="text-sm text-gray-700">
                  {locale === 'ar' ? 'عرض' : 'Showing'}{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span>
                  {' '}{locale === 'ar' ? 'إلى' : 'to'}{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
                  </span>
                  {' '}{locale === 'ar' ? 'من' : 'of'}{' '}
                  <span className="font-medium">{pagination.totalCount}</span>
                  {' '}{locale === 'ar' ? 'نتيجة' : 'results'}
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

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[800px] max-h-[90vh] overflow-y-auto shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{locale === 'ar' ? 'إضافة دورة جديدة' : 'Add New Course'}</h3>
              <CourseForm
                initialData={courseForm}
                onSubmit={handleAddCourse}
                onCancel={() => setShowAddModal(false)}
                isEdit={false}
                isLoading={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[800px] max-h-[90vh] overflow-y-auto shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{locale === 'ar' ? 'تعديل الدورة' : 'Edit Course'}</h3>
              <CourseForm
                initialData={courseForm}
                onSubmit={handleEditCourse}
                onCancel={() => setShowEditModal(false)}
                isEdit={true}
                isLoading={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Modal */}
      {showDeleteModal && selectedCourse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{locale === 'ar' ? 'حذف الدورة' : 'Delete Course'}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {locale === 'ar' 
                  ? `هل أنت متأكد من حذف الدورة "${selectedCourse.titleAr || selectedCourse.titleEn}"؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete the course "${selectedCourse.titleEn}"? This action cannot be undone.`
                }
              </p>
              <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteCourse}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  {locale === 'ar' ? 'حذف الدورة' : 'Delete Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
