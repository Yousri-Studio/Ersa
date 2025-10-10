'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { adminApi, CreateInstructorRequest, AdminCourse } from '@/lib/admin-api';

interface InstructorFormProps {
  initialData?: CreateInstructorRequest;
  onSubmit: (data: CreateInstructorRequest) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  isLoading?: boolean;
}

export function InstructorForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEdit = false, 
  isLoading = false 
}: InstructorFormProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  const [formData, setFormData] = useState<CreateInstructorRequest>({
    instructorNameEn: initialData?.instructorNameEn || '',
    instructorNameAr: initialData?.instructorNameAr || '',
    instructorBioEn: initialData?.instructorBioEn || '',
    instructorBioAr: initialData?.instructorBioAr || '',
    courseIds: initialData?.courseIds || [],
  });
  
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        instructorNameEn: initialData.instructorNameEn || '',
        instructorNameAr: initialData.instructorNameAr || '',
        instructorBioEn: initialData.instructorBioEn || '',
        instructorBioAr: initialData.instructorBioAr || '',
        courseIds: initialData.courseIds || [],
      });
    }
  }, [initialData, isEdit]);

  const fetchCourses = async () => {
    try {
      setLoadingData(true);
      const coursesRes = await adminApi.getCourses({ page: 1, pageSize: 1000 });
      setCourses(coursesRes.data?.items || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CreateInstructorRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleCourse = (courseId: string) => {
    const currentIds = formData.courseIds || [];
    if (currentIds.includes(courseId)) {
      handleChange('courseIds', currentIds.filter(id => id !== courseId));
    } else {
      handleChange('courseIds', [...currentIds, courseId]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
        </h4>
        
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الاسم (إنجليزي) *' : 'Name (English) *'}
            </label>
            <input
              type="text"
              value={formData.instructorNameEn}
              onChange={(e) => handleChange('instructorNameEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={255}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الاسم (عربي) *' : 'Name (Arabic) *'}
            </label>
            <input
              type="text"
              value={formData.instructorNameAr}
              onChange={(e) => handleChange('instructorNameAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={255}
              dir="rtl"
            />
          </div>
        </div>

        {/* Bio Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'السيرة الذاتية (إنجليزي)' : 'Bio (English)'}
            </label>
            <textarea
              value={formData.instructorBioEn}
              onChange={(e) => handleChange('instructorBioEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              maxLength={2500}
              placeholder={locale === 'ar' ? 'اكتب السيرة الذاتية بالإنجليزية...' : 'Write bio in English...'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'السيرة الذاتية (عربي)' : 'Bio (Arabic)'}
            </label>
            <textarea
              value={formData.instructorBioAr}
              onChange={(e) => handleChange('instructorBioAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              maxLength={2500}
              placeholder={locale === 'ar' ? 'اكتب السيرة الذاتية بالعربية...' : 'اكتب السيرة الذاتية بالعربية...'}
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Course Assignment */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {locale === 'ar' ? 'تعيين الدورات' : 'Course Assignment'}
        </h4>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'الدورات' : 'Courses'}
          </label>
          <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto bg-white">
            {loadingData ? (
              <p className="text-gray-500 text-sm">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
            ) : courses.length === 0 ? (
              <p className="text-gray-500 text-sm">{locale === 'ar' ? 'لا توجد دورات متاحة' : 'No courses available'}</p>
            ) : (
              <div className="space-y-2">
                {courses.map((course) => (
                  <label key={course.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={(formData.courseIds || []).includes(course.id)}
                      onChange={() => toggleCourse(course.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className={`text-sm ${isRTL ? 'mr-2' : 'ml-2'}`}>
                      {locale === 'ar' ? course.titleAr : course.titleEn}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {(formData.courseIds || []).length} {locale === 'ar' ? 'محدد' : 'selected'}
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} ${isRTL ? 'space-x-reverse' : ''} space-x-3 pt-4 border-t border-gray-200`}>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={isLoading}
        >
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading 
            ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
            : (isEdit 
              ? (locale === 'ar' ? 'تحديث المدرب' : 'Update Instructor') 
              : (locale === 'ar' ? 'إضافة مدرب' : 'Add Instructor')
            )
          }
        </button>
      </div>
    </form>
  );
}
