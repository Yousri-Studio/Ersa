'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { AdminCreateCourseRequest, AdminUpdateCourseRequest, adminApi, CourseCategory, CourseSubCategory, Instructor } from '@/lib/admin-api';
import { FileUpload } from '@/components/ui/file-upload';

interface CourseFormProps {
  initialData?: Partial<AdminCreateCourseRequest>;
  onSubmit: (data: AdminCreateCourseRequest | AdminUpdateCourseRequest) => void;
  onCancel: () => void;
  isEdit?: boolean;
  isLoading?: boolean;
}

export function CourseForm({ initialData, onSubmit, onCancel, isEdit = false, isLoading = false }: CourseFormProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [subCategories, setSubCategories] = useState<CourseSubCategory[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState<AdminCreateCourseRequest>({
    slug: initialData?.slug || '',
    titleAr: initialData?.titleAr || '',
    titleEn: initialData?.titleEn || '',
    summaryAr: initialData?.summaryAr || '',
    summaryEn: initialData?.summaryEn || '',
    descriptionAr: initialData?.descriptionAr || '',
    descriptionEn: initialData?.descriptionEn || '',
    price: initialData?.price || 0,
    currency: initialData?.currency || 'SAR',
    type: initialData?.type || 1, // Live by default
    level: initialData?.level || 1, // Beginner by default
    categoryId: initialData?.categoryId || null,
    subCategoryIds: initialData?.subCategoryIds || [],
    videoUrl: initialData?.videoUrl || '',
    durationEn: initialData?.durationEn || '',
    durationAr: initialData?.durationAr || '',
    from: initialData?.from || '',
    to: initialData?.to || '',
    sessionsNotesEn: initialData?.sessionsNotesEn || '',
    sessionsNotesAr: initialData?.sessionsNotesAr || '',
    instructorNameAr: initialData?.instructorNameAr || '',
    instructorNameEn: initialData?.instructorNameEn || '',
    instructorIds: initialData?.instructorIds || [],
    photo: initialData?.photo || [],
    tags: initialData?.tags || '',
    instructorsBioAr: initialData?.instructorsBioAr || '',
    instructorsBioEn: initialData?.instructorsBioEn || '',
    courseTopicsAr: initialData?.courseTopicsAr || '',
    courseTopicsEn: initialData?.courseTopicsEn || '',
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
  });

  useEffect(() => {
    fetchCategoriesAndSubCategories();
  }, []);

  const fetchCategoriesAndSubCategories = async () => {
    try {
      setLoadingData(true);
      const [categoriesRes, subCategoriesRes, instructorsRes] = await Promise.all([
        adminApi.getCourseCategories({ activeOnly: false }),
        adminApi.getCourseSubCategories({ activeOnly: false }),
        adminApi.getInstructors()
      ]);
      setCategories(categoriesRes.data || []);
      setSubCategories(subCategoriesRes.data || []);
      setInstructors(instructorsRes.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof AdminCreateCourseRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file: File | null, data: number[]) => {
    handleChange('photo', data);
  };

  const handleSubCategoryToggle = (subCategoryId: string) => {
    const currentIds = formData.subCategoryIds || [];
    if (currentIds.includes(subCategoryId)) {
      handleChange('subCategoryIds', currentIds.filter(id => id !== subCategoryId));
    } else {
      handleChange('subCategoryIds', [...currentIds, subCategoryId]);
    }
  };

  const handleInstructorToggle = (instructorId: string) => {
    const currentIds = formData.instructorIds || [];
    if (currentIds.includes(instructorId)) {
      handleChange('instructorIds', currentIds.filter(id => id !== instructorId));
    } else {
      handleChange('instructorIds', [...currentIds, instructorId]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
        </h4>
        
        {/* Slug */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale === 'ar' ? 'المعرف *' : 'Slug *'}
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={locale === 'ar' ? 'معرف الدورة (مناسب للرابط)' : 'course-slug (URL-friendly identifier)'}
            required
          />
        </div>

        {/* Title Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'العنوان (إنجليزي) *' : 'Title (English) *'}
            </label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => handleChange('titleEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'أدخل العنوان بالإنجليزية' : 'Enter English title'}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'العنوان (عربي) *' : 'Title (Arabic) *'}
            </label>
            <input
              type="text"
              value={formData.titleAr}
              onChange={(e) => handleChange('titleAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'أدخل العنوان بالعربية' : 'Enter Arabic title'}
              required
            />
          </div>
        </div>

        {/* Summary Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الملخص (إنجليزي)' : 'Summary (English)'}
            </label>
            <textarea
              rows={2}
              value={formData.summaryEn}
              onChange={(e) => handleChange('summaryEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'ملخص مختصر للدورة (حد أقصى 2000 حرف)' : 'Brief course summary (max 2000 characters)'}
              maxLength={2000}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الملخص (عربي)' : 'Summary (Arabic)'}
            </label>
            <textarea
              rows={2}
              value={formData.summaryAr}
              onChange={(e) => handleChange('summaryAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'ملخص مختصر للدورة (حد أقصى 2000 حرف)' : 'Brief course summary (max 2000 characters)'}
              maxLength={2000}
            />
          </div>
        </div>

        {/* Description Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
            </label>
            <textarea
              rows={4}
              value={formData.descriptionEn}
              onChange={(e) => handleChange('descriptionEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'وصف مفصل للدورة (حد أقصى 5000 حرف)' : 'Detailed course description (max 5000 characters)'}
              maxLength={5000}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
            </label>
            <textarea
              rows={4}
              value={formData.descriptionAr}
              onChange={(e) => handleChange('descriptionAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'وصف مفصل للدورة (حد أقصى 5000 حرف)' : 'Detailed course description (max 5000 characters)'}
              maxLength={5000}
            />
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {locale === 'ar' ? 'تفاصيل الدورة' : 'Course Details'}
        </h4>
        
        {/* Price, Currency, Type */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'السعر *' : 'Price *'}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'أدخل السعر' : 'Enter price'}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'العملة' : 'Currency'}
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SAR">SAR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'النوع *' : 'Type *'}
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={1}>Live</option>
              <option value={2}>PDF</option>
            </select>
          </div>
        </div>

        {/* Level, Category, Duration */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'المستوى' : 'Level'}
            </label>
            <select
              value={formData.level}
              onChange={(e) => handleChange('level', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Beginner</option>
              <option value={2}>Intermediate</option>
              <option value={3}>Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'التصنيف' : 'Category'}
            </label>
            <select
              value={formData.categoryId || ''}
              onChange={(e) => handleChange('categoryId', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingData}
            >
              <option value="">{locale === 'ar' ? 'لا يوجد' : 'None'}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === 'ar' ? cat.titleAr : cat.titleEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'المدة (الإنجليزية)' : 'Duration (English)'}
            </label>
            <input
              type="text"
              value={formData.durationEn}
              onChange={(e) => handleChange('durationEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 4 weeks, 20 hours"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'المدة (العربية)' : 'Duration (Arabic)'}
            </label>
            <input
              type="text"
              value={formData.durationAr}
              onChange={(e) => handleChange('durationAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: 4 أسابيع، 20 ساعة"
              maxLength={50}
            />
          </div>
        </div>

        {/* Course Dates */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'تاريخ البدء' : 'Start Date'}
            </label>
            <input
              type="date"
              value={formData.from ? new Date(formData.from).toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('from', e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
            </label>
            <input
              type="date"
              value={formData.to ? new Date(formData.to).toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('to', e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Session Notes */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'ملاحظات الجلسات (إنجليزي)' : 'Session Notes (English)'}
            </label>
            <input
              type="text"
              value={formData.sessionsNotesEn}
              onChange={(e) => handleChange('sessionsNotesEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'مثال: الحصص أيام الأحد والثلاثاء من 6-9 مساءً' : 'e.g., Classes on Sun & Tue from 6-9 PM'}
              maxLength={150}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'ملاحظات الجلسات (عربي)' : 'Session Notes (Arabic)'}
            </label>
            <input
              type="text"
              value={formData.sessionsNotesAr}
              onChange={(e) => handleChange('sessionsNotesAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'مثال: الحصص أيام الأحد والثلاثاء من 6-9 مساءً' : 'e.g., Classes on Sun & Tue from 6-9 PM'}
              maxLength={150}
              dir="rtl"
            />
          </div>
        </div>

        {/* Sub-Categories Multi-Select */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'التصنيفات الفرعية' : 'Sub-Categories'}
          </label>
          <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-white">
            {loadingData ? (
              <p className="text-gray-500 text-sm">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
            ) : subCategories.length === 0 ? (
              <p className="text-gray-500 text-sm">{locale === 'ar' ? 'لا توجد تصنيفات فرعية' : 'No sub-categories available'}</p>
            ) : (
              <div className="space-y-2">
                {subCategories.map((subCat) => (
                  <label key={subCat.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={(formData.subCategoryIds || []).includes(subCat.id)}
                      onChange={() => handleSubCategoryToggle(subCat.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className={`text-sm ${isRTL ? 'mr-2' : 'ml-2'}`}>
                      {locale === 'ar' ? subCat.titleAr : subCat.titleEn}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {(formData.subCategoryIds || []).length} {locale === 'ar' ? 'محددة' : 'selected'}
          </p>
        </div>

        {/* Instructor Name Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'اسم المدرب (إنجليزي) *' : 'Instructor Name (English) *'}
            </label>
            <input
              type="text"
              value={formData.instructorNameEn}
              onChange={(e) => handleChange('instructorNameEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'أدخل اسم المدرب بالإنجليزية' : 'Enter instructor name in English'}
              required
              maxLength={255}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'اسم المدرب (عربي) *' : 'Instructor Name (Arabic) *'}
            </label>
            <input
              type="text"
              value={formData.instructorNameAr}
              onChange={(e) => handleChange('instructorNameAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'أدخل اسم المدرب بالعربية' : 'Enter instructor name in Arabic'}
              required
              maxLength={255}
            />
          </div>
        </div>

        {/* Instructors Multi-Select */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'المدربون' : 'Instructors'}
          </label>
          <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-white">
            {loadingData ? (
              <p className="text-gray-500 text-sm">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
            ) : instructors.length === 0 ? (
              <p className="text-gray-500 text-sm">{locale === 'ar' ? 'لا يوجد مدربون' : 'No instructors available'}</p>
            ) : (
              <div className="space-y-2">
                {instructors.map((instructor) => (
                  <label key={instructor.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={(formData.instructorIds || []).includes(instructor.id)}
                      onChange={() => handleInstructorToggle(instructor.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className={`text-sm ${isRTL ? 'mr-2' : 'ml-2'}`}>
                      {locale === 'ar' ? instructor.instructorNameAr : instructor.instructorNameEn}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {(formData.instructorIds || []).length} {locale === 'ar' ? 'محدد' : 'selected'}
          </p>
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale === 'ar' ? 'رابط الفيديو' : 'Video URL'}
          </label>
          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) => handleChange('videoUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={locale === 'ar' ? 'رابط فيديو معاينة الدورة (حد أقصى 1000 حرف)' : 'Course preview video URL (max 1000 characters)'}
            maxLength={1000}
          />
        </div>
      </div>

      {/* Media & Content */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {locale === 'ar' ? 'الوسائط والمحتوى' : 'Media & Content'}
        </h4>
        
        {/* Photo Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale === 'ar' ? 'صورة الدورة' : 'Course Photo'}
          </label>
          <FileUpload
            value={formData.photo || []}
            onChange={handleFileUpload}
            accept="image/*"
            maxSize={5}
            placeholder={locale === 'ar' ? 'ارفع صورة الدورة أو اسحب وأفلت' : 'Upload course image or drag and drop'}
          />
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale === 'ar' ? 'العلامات' : 'Tags'}
          </label>
          <textarea
            rows={2}
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={locale === 'ar' ? 'علامات مفصولة بفاصلة (حد أقصى 2000 حرف)' : 'Comma-separated tags (max 2000 characters)'}
            maxLength={2000}
          />
          <p className="text-xs text-gray-500 mt-1">{(formData.tags || '').length}/2000 {locale === 'ar' ? 'حرف' : 'characters'}</p>
        </div>

        {/* Course Topics Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'مواضيع الدورة (إنجليزي)' : 'Course Topics (English)'}
            </label>
            <textarea
              rows={3}
              value={formData.courseTopicsEn}
              onChange={(e) => handleChange('courseTopicsEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'مواضيع الدورة بالإنجليزية' : 'Course topics in English'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'مواضيع الدورة (عربي)' : 'Course Topics (Arabic)'}
            </label>
            <textarea
              rows={3}
              value={formData.courseTopicsAr}
              onChange={(e) => handleChange('courseTopicsAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'مواضيع الدورة بالعربية' : 'Course topics in Arabic'}
              dir="rtl"
            />
          </div>
        </div>

        {/* Instructor Bio Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'السيرة الذاتية للمدرب (إنجليزي)' : 'Instructor Bio (English)'}
            </label>
            <textarea
              rows={4}
              value={formData.instructorsBioEn}
              onChange={(e) => handleChange('instructorsBioEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'السيرة الذاتية للمدرب (حد أقصى 2500 حرف)' : 'Instructor biography (max 2500 characters)'}
              maxLength={2500}
            />
            <p className="text-xs text-gray-500 mt-1">{(formData.instructorsBioEn || '').length}/2500 {locale === 'ar' ? 'حرف' : 'characters'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'السيرة الذاتية للمدرب (عربي)' : 'Instructor Bio (Arabic)'}
            </label>
            <textarea
              rows={4}
              value={formData.instructorsBioAr}
              onChange={(e) => handleChange('instructorsBioAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'السيرة الذاتية للمدرب (حد أقصى 2500 حرف)' : 'Instructor biography (max 2500 characters)'}
              maxLength={2500}
            />
            <p className="text-xs text-gray-500 mt-1">{(formData.instructorsBioAr || '').length}/2500 {locale === 'ar' ? 'حرف' : 'characters'}</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {locale === 'ar' ? 'الإعدادات' : 'Settings'}
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الحالة' : 'Status'}
            </label>
            <select
              value={formData.isActive.toString()}
              onChange={(e) => handleChange('isActive', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">{locale === 'ar' ? 'نشط' : 'Active'}</option>
              <option value="false">{locale === 'ar' ? 'غير نشط' : 'Inactive'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'مميز' : 'Featured'}
            </label>
            <select
              value={formData.isFeatured?.toString() || 'false'}
              onChange={(e) => handleChange('isFeatured', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">{locale === 'ar' ? 'نعم' : 'Yes'}</option>
              <option value="false">{locale === 'ar' ? 'لا' : 'No'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          disabled={isLoading}
        >
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
        <button
          type="submit"
          className={`px-6 py-2 text-sm font-medium text-white rounded-md ${
            isEdit 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-primary-600 hover:bg-primary-700'
          } disabled:opacity-50`}
          disabled={isLoading}
        >
          {isLoading 
            ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
            : (isEdit 
              ? (locale === 'ar' ? 'تحديث الدورة' : 'Update Course') 
              : (locale === 'ar' ? 'إضافة دورة' : 'Add Course')
            )
          }
        </button>
      </div>
    </form>
  );
}
