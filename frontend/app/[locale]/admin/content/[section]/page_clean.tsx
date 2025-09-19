'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { contentApi, ContentSection } from '@/lib/content-api';
import { useAuthStore } from '@/lib/auth-store';
import { useHydration } from '@/hooks/useHydration';

interface ContentField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'rich-text' | 'image' | 'array' | 'object';
  value: any;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface LocalContentSection {
  id: string;
  title: string;
  description: string;
  fields: ContentField[];
  status: 'published' | 'draft' | 'archived';
  lastModified: string;
}

export default function ContentEditor() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('admin');
  const locale = useLocale();
  const { user, isAuthenticated } = useAuthStore();
  const isHydrated = useHydration();
  const [section, setSection] = useState<LocalContentSection | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'ar'>(locale === 'ar' ? 'ar' : 'en');
  const [error, setError] = useState<string | null>(null);

  const isRTL = locale === 'ar';

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      toast.error(locale === 'ar' ? 'يجب تسجيل الدخول للوصول لهذه الصفحة' : 'You must be logged in to access this page');
      router.push(`/${locale}/admin-login`);
      return;
    }

    if (isHydrated && isAuthenticated && user && !user.isAdmin && !user.isSuperAdmin) {
      toast.error(locale === 'ar' ? 'ليس لديك صلاحيات للوصول لهذه الصفحة' : 'You do not have permission to access this page');
      router.push(`/${locale}/`);
      return;
    }

    if (isHydrated && isAuthenticated && params?.section) {
      const sectionId = params.section as string;
      const loadSection = async () => {
        try {
          setIsLoading(true);
          const templates = await contentApi.getContentTemplates();
          
          if (templates[sectionId]) {
            setSection(templates[sectionId]);
          } else {
            if (Object.keys(templates).length === 0) {
              try {
                await contentApi.initializeSampleData();
                const newTemplates = await contentApi.getContentTemplates();
                if (newTemplates[sectionId]) {
                  setSection(newTemplates[sectionId]);
                  return;
                }
              } catch (initError) {
                console.error('Failed to initialize sample data:', initError);
              }
            }
            toast.error(locale === 'ar' ? 'الصفحة غير موجودة' : 'Page not found');
            router.push(`/${locale}/admin/content`);
          }
        } catch (error: any) {
          console.error('Error loading content templates:', error);
          
          let errorMessage = locale === 'ar' ? 'فشل في تحميل قوالب المحتوى' : 'Failed to load content templates';
          
          if (error.message === 'Authentication required') {
            errorMessage = locale === 'ar' ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى' : 'Session expired. Please login again';
            setError(errorMessage);
            setTimeout(() => {
              router.push(`/${locale}/admin-login`);
            }, 2000);
          } else {
            setError(errorMessage);
            toast.error(errorMessage);
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      loadSection();
    }
  }, [params?.section, locale, isHydrated, isAuthenticated, user, router]);

  useEffect(() => {
    setError(null);
  }, [section?.id]);

  const handleFieldChange = (fieldId: string, value: any) => {
    if (!section) return;

    const updatedFields = section.fields.map(field => 
      field.id === fieldId ? { ...field, value } : field
    );

    setSection({ ...section, fields: updatedFields });
    setHasChanges(true);
  };

  const handleArrayItemChange = (fieldId: string, index: number, key: string, value: string) => {
    if (!section) return;

    const field = section.fields.find(f => f.id === fieldId);
    if (!field || field.type !== 'array') return;

    const updatedArray = [...field.value];
    updatedArray[index] = { ...updatedArray[index], [key]: value };

    handleFieldChange(fieldId, updatedArray);
  };

  const addArrayItem = (fieldId: string) => {
    if (!section) return;

    const field = section.fields.find(f => f.id === fieldId);
    if (!field || field.type !== 'array') return;

    const newItem = field.value.length > 0 
      ? Object.keys(field.value[0]).reduce((acc, key) => ({ ...acc, [key]: '' }), {})
      : { title: '', description: '' };

    const updatedArray = [...field.value, newItem];
    handleFieldChange(fieldId, updatedArray);
  };

  const removeArrayItem = (fieldId: string, index: number) => {
    if (!section) return;

    const field = section.fields.find(f => f.id === fieldId);
    if (!field || field.type !== 'array') return;

    const updatedArray = field.value.filter((_: any, i: number) => i !== index);
    handleFieldChange(fieldId, updatedArray);
  };

  const handleSave = async () => {
    if (!section) return;

    setIsSaving(true);
    try {
      const updatedSection = await contentApi.updateSectionContent(section.id, {
        fields: section.fields,
        status: section.status
      });
      
      setSection(updatedSection);
      setLastSaved(new Date().toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US'));
      toast.success(locale === 'ar' ? 'تم حفظ المحتوى بنجاح' : 'Content saved successfully');
      setIsEditing(false);
      setHasChanges(false);
    } catch (error: any) {
      console.error('Save error:', error);
      
      let errorMessage = locale === 'ar' ? 'فشل في حفظ المحتوى' : 'Failed to save content';
      
      if (error.message === 'Authentication required') {
        errorMessage = locale === 'ar' ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى' : 'Session expired. Please login again';
        router.push(`/${locale}/admin-login`);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">
          {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">
          {locale === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Checking permissions...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="alert-circle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {locale === 'ar' ? 'حدث خطأ' : 'An Error Occurred'}
          </h3>
          <p className="text-gray-500 mb-4 max-w-md">
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
            <button
              onClick={() => router.push(`/${locale}/admin/content`)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              {locale === 'ar' ? 'العودة لإدارة المحتوى' : 'Back to Content Management'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="alert-circle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {locale === 'ar' ? 'خطأ في تحميل المحتوى' : 'Error Loading Content'}
          </h3>
          <p className="text-gray-500 mb-4">
            {locale === 'ar' ? 'فشل في تحميل محتوى الصفحة' : 'Failed to load page content'}
          </p>
          <button
            onClick={() => router.push(`/${locale}/admin/content`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {locale === 'ar' ? 'العودة لإدارة المحتوى' : 'Back to Content Management'}
          </button>
        </div>
      </div>
    );
  }

  const renderField = (field: ContentField) => {
    const isBilingual = field.value && typeof field.value === 'object' && field.value.en !== undefined && field.value.ar !== undefined;
    const currentValue = isBilingual ? field.value[activeLang] : field.value;
    
    const handleChange = (newValue: string) => {
      if (isBilingual) {
        const updatedValue = { ...field.value, [activeLang]: newValue };
        handleFieldChange(field.id, updatedValue);
      } else {
        handleFieldChange(field.id, newValue);
      }
    };

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isEditing}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={currentValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isEditing}
          />
        );

      case 'array':
        return (
          <div className="space-y-3">
            {field.value.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
                {Object.keys(item).map((key) => (
                  <input
                    key={key}
                    type="text"
                    value={item[key]}
                    onChange={(e) => handleArrayItemChange(field.id, index, key, e.target.value)}
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!isEditing}
                  />
                ))}
                {isEditing && (
                  <button
                    onClick={() => removeArrayItem(field.id, index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                onClick={() => addArrayItem(field.id)}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                <Icon name="plus" className="w-4 h-4 inline mr-2" />
                {locale === 'ar' ? 'إضافة عنصر' : 'Add Item'}
              </button>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={currentValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isEditing}
          />
        );
    }
  };

  return (
    <div className="bg-white min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{maxWidth: '90rem', paddingTop: '50px'}}>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-400 hover:text-gray-600 mr-3"
                >
                  <Icon name="arrow-left" className="w-5 h-5" />
                </button>
                <Icon name="edit" className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  {section.title}
                </h1>
              </div>
              <p className="text-gray-600 text-lg">{section.description}</p>
              {lastSaved && (
                <p className="text-sm text-green-600 mt-1">
                  {locale === 'ar' ? 'آخر حفظ: ' : 'Last saved: '}
                  {lastSaved}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-semibold">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="text-sm text-blue-700 font-medium">
                  {user?.fullName || t('admin')}
                </span>
              </div>
              
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                section.status === 'published' 
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : section.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }`}>
                {section.status === 'published' 
                  ? (locale === 'ar' ? 'منشور' : 'Published')
                  : section.status === 'draft'
                  ? (locale === 'ar' ? 'مسودة' : 'Draft')
                  : (locale === 'ar' ? 'مؤرشف' : 'Archived')
                }
              </span>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {locale === 'ar' ? 'تعديل' : 'Edit'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setHasChanges(false);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving 
                      ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                      : (locale === 'ar' ? 'حفظ' : 'Save')
                    }
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {locale === 'ar' ? 'محرر المحتوى' : 'Content Editor'}
            </h3>
            <p className="text-sm text-gray-600">
              {locale === 'ar' 
                ? 'قم بتعديل محتوى هذه الصفحة حسب الحاجة' 
                : 'Edit the content of this page as needed'
              }
            </p>
          </div>
          
          <div className="p-6">
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveLang('en')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeLang === 'en'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveLang('ar')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeLang === 'ar'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Arabic
                </button>
              </nav>
            </div>

            <div className="space-y-6">
              {section.fields.map((field) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {field.placeholder && (
                    <p className="text-xs text-gray-500">{field.placeholder}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'معاينة المحتوى' : 'Content Preview'}
          </h3>
          <div className="bg-white p-4 rounded-lg border">
            <pre className="text-sm text-gray-700 overflow-auto">
              {JSON.stringify(section.fields.reduce((acc, field) => ({
                ...acc,
                [field.id]: field.value
              }), {}), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
