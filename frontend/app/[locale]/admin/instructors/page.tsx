'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { motion } from 'framer-motion';
import { adminApi, Instructor, CreateInstructorRequest, AdminCourse } from '@/lib/admin-api';
import { useHydration } from '@/hooks/useHydration';
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
      setInstructors(response.data);
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
      setCourses(response.data.items);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleAddInstructor = async () => {
    try {
      await adminApi.createInstructor(instructorForm);
      toast.success(isRTL ? 'تم إضافة المدرب بنجاح' : 'Instructor added successfully');
      setShowAddModal(false);
      fetchInstructors();
      resetForm();
    } catch (error: any) {
      console.error('Error adding instructor:', error);
      toast.error(isRTL ? 'فشلت إضافة المدرب' : 'Failed to add instructor');
    }
  };

  const handleUpdateInstructor = async () => {
    if (!selectedInstructor) return;
    
    try {
      await adminApi.updateInstructor(selectedInstructor.id, instructorForm);
      toast.success(isRTL ? 'تم تحديث المدرب بنجاح' : 'Instructor updated successfully');
      setShowEditModal(false);
      fetchInstructors();
      resetForm();
    } catch (error: any) {
      console.error('Error updating instructor:', error);
      toast.error(isRTL ? 'فشل تحديث المدرب' : 'Failed to update instructor');
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
      courseIds: [],
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setShowDeleteModal(true);
  };

  const toggleCourse = (courseId: string) => {
    setInstructorForm(prev => ({
      ...prev,
      courseIds: prev.courseIds?.includes(courseId)
        ? prev.courseIds.filter(id => id !== courseId)
        : [...(prev.courseIds || []), courseId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 style={{
          background: 'linear-gradient(270deg, #27E8B1 31.94%, #693EB0 59.68%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          fontFamily: '"The Year of Handicrafts"',
          fontSize: '44px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: 'normal',
        }}>
          {isRTL ? 'إدارة المدربين' : 'Instructors Management'}
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Icon name="plus" />
          {isRTL ? 'إضافة مدرب' : 'Add Instructor'}
        </button>
      </div>

      {/* Instructors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isRTL ? 'تاريخ الإنشاء' : 'Created At'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isRTL ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                </td>
              </tr>
            ) : instructors.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  {isRTL ? 'لا يوجد مدربين' : 'No instructors found'}
                </td>
              </tr>
            ) : (
              instructors.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {instructor.instructorNameAr}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {instructor.instructorNameEn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(instructor.createdAt).toLocaleDateString(locale)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(instructor)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(instructor)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Icon name="trash" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {showAddModal
                  ? (isRTL ? 'إضافة مدرب جديد' : 'Add New Instructor')
                  : (isRTL ? 'تعديل المدرب' : 'Edit Instructor')}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <Icon name="times" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name English */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? 'الاسم (إنجليزي) *' : 'Name (English) *'}
                </label>
                <input
                  type="text"
                  value={instructorForm.instructorNameEn}
                  onChange={(e) => setInstructorForm({ ...instructorForm, instructorNameEn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Name Arabic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? 'الاسم (عربي) *' : 'Name (Arabic) *'}
                </label>
                <input
                  type="text"
                  value={instructorForm.instructorNameAr}
                  onChange={(e) => setInstructorForm({ ...instructorForm, instructorNameAr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  dir="rtl"
                />
              </div>

              {/* Bio English */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? 'السيرة الذاتية (إنجليزي)' : 'Bio (English)'}
                </label>
                <textarea
                  value={instructorForm.instructorBioEn}
                  onChange={(e) => setInstructorForm({ ...instructorForm, instructorBioEn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  maxLength={2500}
                />
              </div>

              {/* Bio Arabic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? 'السيرة الذاتية (عربي)' : 'Bio (Arabic)'}
                </label>
                <textarea
                  value={instructorForm.instructorBioAr}
                  onChange={(e) => setInstructorForm({ ...instructorForm, instructorBioAr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  maxLength={2500}
                  dir="rtl"
                />
              </div>

              {/* Courses Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? 'الدورات' : 'Courses'}
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                  {courses.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      {isRTL ? 'لا توجد دورات متاحة' : 'No courses available'}
                    </p>
                  ) : (
                    courses.map((course) => (
                      <label key={course.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={instructorForm.courseIds?.includes(course.id) || false}
                          onChange={() => toggleCourse(course.id)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">
                          {locale === 'ar' ? course.titleAr : course.titleEn}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={showAddModal ? handleAddInstructor : handleUpdateInstructor}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-lg hover:opacity-90"
                >
                  {showAddModal ? (isRTL ? 'إضافة' : 'Add') : (isRTL ? 'تحديث' : 'Update')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold mb-4">
              {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
            </h2>
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
          </motion.div>
        </div>
      )}
    </div>
  );
}

