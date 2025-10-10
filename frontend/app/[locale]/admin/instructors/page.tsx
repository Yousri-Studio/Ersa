'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { motion } from 'framer-motion';
import { adminApi, Instructor, CreateInstructorRequest, AdminCourse } from '@/lib/admin-api';
import { useHydration } from '@/hooks/useHydration';
import { InstructorForm } from '@/components/admin/instructor-form';
import toast from 'react-hot-toast';

export default function AdminInstructors() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [instructorForm, setInstructorForm] = useState<CreateInstructorRequest>({
    instructorNameEn: '',
    instructorNameAr: '',
    instructorBioEn: '',
    instructorBioAr: '',
    courseIds: [],
  });
  const [filters, setFilters] = useState({
    search: '',
  });
  const isHydrated = useHydration();
  const isRTL = locale === 'ar';

  useEffect(() => {
    if (isHydrated) {
      fetchInstructors();
      fetchCourses();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const fetchInstructors = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getInstructors();
      let filteredInstructors = response.data;
      
      // Apply search filter
      if (filters.search) {
        filteredInstructors = filteredInstructors.filter(instructor =>
          instructor.instructorNameEn.toLowerCase().includes(filters.search.toLowerCase()) ||
          instructor.instructorNameAr.includes(filters.search) ||
          (instructor.instructorBioEn && instructor.instructorBioEn.toLowerCase().includes(filters.search.toLowerCase())) ||
          (instructor.instructorBioAr && instructor.instructorBioAr.includes(filters.search))
        );
      }
      
      setInstructors(filteredInstructors);
    } catch (error: any) {
      console.error('Error fetching instructors:', error);
      toast.error(isRTL ? 'فشل تحميل المدربين' : 'Failed to load instructors');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await adminApi.getCourses({ page: 1, pageSize: 100 });
      // Filter out courses with invalid GUIDs
      const validGuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validCourses = response.data.items.filter(course => validGuidRegex.test(course.id));
      
      if (validCourses.length < response.data.items.length) {
        console.warn(`Filtered out ${response.data.items.length - validCourses.length} courses with invalid IDs`);
      }
      
      setCourses(validCourses);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleAddInstructor = async (data: CreateInstructorRequest) => {
    try {
      // Filter out any invalid GUIDs (validate format)
      const validGuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validCourseIds = data.courseIds?.filter(id => validGuidRegex.test(id)) || [];
      
      const payload = {
        ...data,
        courseIds: validCourseIds
      };
      
      await adminApi.createInstructor(payload);
      toast.success(isRTL ? 'تم إضافة المدرب بنجاح' : 'Instructor added successfully');
      setShowAddModal(false);
      fetchInstructors();
      resetForm();
    } catch (error: any) {
      console.error('Error adding instructor:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to add instructor';
      toast.error(isRTL ? `فشلت إضافة المدرب: ${errorMessage}` : `Failed to add instructor: ${errorMessage}`);
    }
  };

  const handleUpdateInstructor = async (data: CreateInstructorRequest) => {
    if (!selectedInstructor) return;
    
    try {
      // Filter out any invalid GUIDs (validate format)
      const validGuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validCourseIds = data.courseIds?.filter(id => validGuidRegex.test(id)) || [];
      
      const payload = {
        ...data,
        courseIds: validCourseIds
      };
      
      await adminApi.updateInstructor(selectedInstructor.id, payload);
      toast.success(isRTL ? 'تم تحديث المدرب بنجاح' : 'Instructor updated successfully');
      setShowEditModal(false);
      fetchInstructors();
      resetForm();
    } catch (error: any) {
      console.error('Error updating instructor:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to update instructor';
      toast.error(isRTL ? `فشل تحديث المدرب: ${errorMessage}` : `Failed to update instructor: ${errorMessage}`);
    }
  };

  const handleDeleteInstructor = async () => {
    if (!selectedInstructor) return;
    
    try {
      await adminApi.deleteInstructor(selectedInstructor.id);
      toast.success(isRTL ? 'تم حذف المدرب بنجاح' : 'Instructor deleted successfully');
      setShowDeleteModal(false);
      fetchInstructors();
    } catch (error: any) {
      console.error('Error deleting instructor:', error);
      toast.error(isRTL ? 'فشل حذف المدرب' : 'Failed to delete instructor');
    }
  };

  const resetForm = () => {
    setInstructorForm({
      instructorNameEn: '',
      instructorNameAr: '',
      instructorBioEn: '',
      instructorBioAr: '',
      courseIds: [],
    });
    setSelectedInstructor(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setInstructorForm({
      instructorNameEn: instructor.instructorNameEn,
      instructorNameAr: instructor.instructorNameAr,
      instructorBioEn: instructor.instructorBioEn || '',
      instructorBioAr: instructor.instructorBioAr || '',
      courseIds: instructor.courseIds || [],
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setShowDeleteModal(true);
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

  return (
    <div className="space-y-6" style={{maxWidth: '90rem', paddingTop: '50px'}} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRTL ? 'إدارة المدربين' : 'Instructors Management'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isRTL 
              ? 'إدارة معلومات المدربين والدورات المرتبطة' 
              : 'Manage instructor information and associated courses'
            }
          </p>
        </div>
        <div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Icon name="plus" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {isRTL ? 'إضافة مدرب' : 'Add Instructor'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRTL ? 'البحث' : 'Search'}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={isRTL ? 'البحث بالاسم أو السيرة الذاتية...' : 'Search by name or bio...'}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className={`w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
              <Icon name="search" className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchInstructors}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isRTL ? 'بحث' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Instructors Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isRTL ? 'المدربين' : 'Instructors'} ({instructors.length.toLocaleString()})
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
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    {isRTL ? 'المدرب' : 'Instructor'}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    {isRTL ? 'السيرة الذاتية' : 'Bio'}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    {isRTL ? 'تاريخ الإنشاء' : 'Created'}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {instructors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      {isRTL ? 'لا يوجد مدربين' : 'No instructors found'}
                    </td>
                  </tr>
                ) : (
                  instructors.map((instructor) => (
                    <tr key={instructor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Icon name="user" className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {isRTL ? instructor.instructorNameAr : instructor.instructorNameEn}
                            </div>
                            <div className="text-sm text-gray-500">
                              {isRTL ? instructor.instructorNameEn : instructor.instructorNameAr}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="truncate">
                            {isRTL ? (instructor.instructorBioAr || '') : (instructor.instructorBioEn || '')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                        {formatDate(instructor.createdAt)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                          <button
                            onClick={() => openEditModal(instructor)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Icon name="edit" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(instructor)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-4xl w-full shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {showAddModal
                    ? (isRTL ? 'إضافة مدرب جديد' : 'Add New Instructor')
                    : (isRTL ? 'تعديل المدرب' : 'Edit Instructor')}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Icon name="times" className="h-6 w-6" />
                </button>
              </div>

              <InstructorForm
                initialData={instructorForm}
                onSubmit={showAddModal ? handleAddInstructor : handleUpdateInstructor}
                onCancel={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                isEdit={showEditModal}
                isLoading={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInstructor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
              </h3>
              <p className="text-gray-600 mb-6">
                {isRTL
                  ? `هل أنت متأكد من حذف المدرب "${selectedInstructor.instructorNameAr}"؟`
                  : `Are you sure you want to delete instructor "${selectedInstructor.instructorNameEn}"?`}
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteInstructor}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {isRTL ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}