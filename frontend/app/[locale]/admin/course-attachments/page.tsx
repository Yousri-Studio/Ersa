'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { adminApi, AdminCourse, PagedResult } from '@/lib/admin-api';
import toast from 'react-hot-toast';
import { useHydration } from '@/hooks/useHydration';

export default function CourseAttachmentsManagementPage() {
  const locale = useLocale();
  const router = useRouter();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const isHydrated = useHydration();
  const isRTL = locale === 'ar';

  useEffect(() => {
    if (isHydrated) {
      fetchCourses();
    }
  }, [isHydrated]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getCourses({
        page: 1,
        pageSize: 1000, // Get all courses
        isActive: undefined,
        categoryId: undefined,
      });
      // Filter only PDF courses (type = 2)
      const pdfCourses = response.data.items.filter(course => course.type === 2);
      setCourses(pdfCourses);
    } catch (error: any) {
      toast.error('Failed to load courses');
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.titleEn.toLowerCase().includes(search.toLowerCase()) ||
    course.titleAr.includes(search)
  );

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isRTL ? 'إدارة مرفقات الدورات' : 'Course Attachments Management'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isRTL ? 'اختر دورة PDF لإدارة مرفقاتها' : 'Select a PDF course to manage its attachments'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {isRTL ? 'يتم عرض دورات PDF فقط - الدورات المباشرة لا تحتاج إلى مرفقات' : 'PDF courses only - Live courses do not need attachments'}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={isRTL ? 'ابحث عن دورة...' : 'Search for a course...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Icon name="search" className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Icon name="file-alt" className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {isRTL ? 'لا توجد دورات PDF' : 'No PDF courses found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isRTL ? 'جرب تغيير مصطلح البحث أو أضف دورة PDF جديدة' : 'Try changing your search term or create a new PDF course'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => router.push(`/${locale}/admin/courses/${course.id}/attachments`)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {isRTL ? course.titleAr : course.titleEn}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {!isRTL ? course.titleAr : course.titleEn}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Attachment Count Badge */}
                  {course.attachmentCount !== undefined && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.attachmentCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon name="file-alt" className="mr-1 h-3 w-3" />
                      {course.attachmentCount}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    course.type === 1 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {course.type === 1 ? (isRTL ? 'مباشر' : 'Live') : 'PDF'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Icon name="file-alt" className="mr-2" />
                  <span>{isRTL ? 'إدارة المرفقات' : 'Manage Attachments'}</span>
                </div>
                <Icon name={isRTL ? 'chevron-left' : 'chevron-right'} className="text-gray-400" />
              </div>

              {!course.isActive && (
                <div className="mt-3 flex items-center text-xs text-orange-600">
                  <Icon name="exclamation-circle" className="mr-1" />
                  {isRTL ? 'الدورة غير نشطة' : 'Course inactive'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

