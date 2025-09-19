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
    console.log('=== CONTENT PAGE USEEFFECT START ===');
    console.log('Auth state:', { isHydrated, isAuthenticated, user: user ? { id: user.id, fullName: user.fullName, isAdmin: user.isAdmin, isSuperAdmin: user.isSuperAdmin } : null });
    console.log('Params:', params);
    
    // Check authentication first
    if (isHydrated && !isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      toast.error(locale === 'ar' ? 'يجب تسجيل الدخول للوصول لهذه الصفحة' : 'You must be logged in to access this page');
      router.push(`/${locale}/admin-login`);
      return;
    }

    // Check if user has admin privileges
    if (isHydrated && isAuthenticated && user && !user.isAdmin && !user.isSuperAdmin) {
      console.log('❌ User lacks admin privileges');
      toast.error(locale === 'ar' ? 'ليس لديك صلاحيات للوصول لهذه الصفحة' : 'You do not have permission to access this page');
      router.push(`/${locale}/`);
      return;
    }

    // Load section content
    console.log('✅ Auth checks passed, proceeding with content loading');
    
    if (isHydrated && isAuthenticated && params?.section) {
      const sectionId = params.section as string;
      const loadSection = async () => {
        try {
          setIsLoading(true);
          console.log('Making API call to get content templates...');
          const templates = await contentApi.getContentTemplates();
          console.log('Content templates received:', templates);
          console.log('Looking for section:', sectionId);
          console.log('Available sections:', Object.keys(templates));
          
          console.log('🔍 Available templates:', Object.keys(templates));
          console.log('🔍 Looking for section:', sectionId);
          console.log('🔍 Template exists?', !!templates[sectionId]);
          
          if (templates[sectionId]) {
            console.log('Found section:', templates[sectionId]);
            
            // Debug: Log team field specifically for about section
            if (sectionId === 'about') {
              const teamField = templates[sectionId].fields.find(f => f.id === 'team' || f.id === 'team-members');
              console.log('🔍 Team field found:', teamField);
              if (teamField) {
                console.log('🔍 Team field value:', teamField.value);
                console.log('🔍 First team member:', teamField.value[0]);
                if (teamField.value[0]) {
                  console.log('🔍 First team member name:', teamField.value[0].name);
                  console.log('🔍 Is name bilingual?', typeof teamField.value[0].name === 'object' && teamField.value[0].name.en !== undefined);
                  
                  // Check if transformation worked
                  if (typeof teamField.value[0].name === 'object' && teamField.value[0].name.en !== undefined) {
                    console.log('✅ Team data is properly bilingual!');
                    console.log('🔍 English name:', teamField.value[0].name.en);
                    console.log('🔍 Arabic name:', teamField.value[0].name.ar);
                  } else {
                    console.log('❌ Team data is still not bilingual');
                  }
                }
              }
            }
            
            // Debug: Log FAQ fields specifically for FAQ section
            if (sectionId === 'faq') {
              console.log('🔍 FAQ section fields:', templates[sectionId].fields);
              const faqItemsField = templates[sectionId].fields.find(f => f.id.includes('faq-items'));
              console.log('🔍 FAQ items field found:', faqItemsField);
              if (faqItemsField) {
                console.log('🔍 FAQ field ID:', faqItemsField.id);
                console.log('🔍 FAQ field value:', faqItemsField.value);
                console.log('🔍 First FAQ item:', faqItemsField.value[0]);
              }
              
              // Check for old FAQ structure
              const oldFaqField = templates[sectionId].fields.find(f => f.id === 'faq-items');
              if (oldFaqField) {
                console.log('🔍 Old FAQ field found:', oldFaqField);
                console.log('🔍 Old FAQ value:', oldFaqField.value);
              }
            }
            
            // Debug: Log consultation fields specifically for consultation section
            if (sectionId === 'consultation') {
              console.log('🔍 Consultation section fields:', templates[sectionId].fields);
              console.log('🔍 Consultation section data:', templates[sectionId]);
            }
            
            setSection(templates[sectionId]);
          } else {
            console.log('❌ Section not found, available sections:', Object.keys(templates));
            
            // Special fallback for consultation section
            if (sectionId === 'consultation') {
              console.log('🔄 Creating fallback consultation section...');
              const fallbackConsultation = {
                id: 'consultation',
                title: 'Consultation Services',
                description: 'Consultation offerings and service details',
                status: 'published' as const,
                lastModified: new Date().toISOString(),
                pageKey: 'home',
                fields: [
                  {
                    id: 'consultation-title-en',
                    label: 'Consultation Title (English)',
                    type: 'text' as const,
                    value: 'Consultation Services',
                    required: true,
                    placeholder: 'Enter consultation title in English'
                  },
                  {
                    id: 'consultation-title-ar',
                    label: 'Consultation Title (Arabic)',
                    type: 'text' as const,
                    value: 'خدمات الاستشارة',
                    required: true,
                    placeholder: 'Enter consultation title in Arabic'
                  },
                  {
                    id: 'consultation-description-en',
                    label: 'Consultation Description (English)',
                    type: 'textarea' as const,
                    value: 'Professional consultation services tailored to your needs',
                    required: true,
                    placeholder: 'Enter consultation description in English'
                  },
                  {
                    id: 'consultation-description-ar',
                    label: 'Consultation Description (Arabic)',
                    type: 'textarea' as const,
                    value: 'خدمات استشارية مهنية مصممة خصيصاً لاحتياجاتك',
                    required: true,
                    placeholder: 'Enter consultation description in Arabic'
                  }
                ]
              };
              setSection(fallbackConsultation);
              console.log('✅ Fallback consultation section created');
              return;
            }
            // If no templates exist, try to initialize sample data
            if (Object.keys(templates).length === 0) {
              console.log('No templates found, trying to initialize sample data...');
              try {
                await contentApi.initializeSampleData();
                console.log('Sample data initialized, retrying...');
                const newTemplates = await contentApi.getContentTemplates();
                console.log('New templates after initialization:', newTemplates);
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
            // Redirect to login after a short delay
            setTimeout(() => {
              router.push(`/${locale}/admin-login`);
            }, 2000);
          } else if (error.message.includes('API Error:')) {
            errorMessage = error.message;
            setError(errorMessage);
            toast.error(errorMessage);
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

  // Add periodic authentication check to prevent logout
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const authCheckInterval = setInterval(() => {
      // This will trigger a re-render and check authentication status
      if (!isAuthenticated) {
        toast.error(locale === 'ar' ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى' : 'Session expired. Please login again');
        router.push(`/${locale}/admin-login`);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(authCheckInterval);
  }, [isAuthenticated, user, locale, router]);

  // Debug authentication state
  useEffect(() => {
    console.log('Content Editor Auth State:', {
      isHydrated,
      isAuthenticated,
      user: user ? { id: user.id, fullName: user.fullName, isAdmin: user.isAdmin } : null
    });
  }, [isHydrated, isAuthenticated, user]);

  // Clear error when section changes
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

    let newItem: any = {};
    
    // Special handling for different field types with bilingual structure
    if (fieldId === 'faq-items') {
      newItem = { 
        questionEn: '', 
        questionAr: '', 
        answerEn: '', 
        answerAr: '' 
      };
    } else if (fieldId === 'features') {
      newItem = { 
        titleEn: '', 
        titleAr: '', 
        descriptionEn: '', 
        descriptionAr: '' 
      };
    } else if (fieldId === 'testimonials') {
      newItem = { 
        nameEn: '', 
        nameAr: '', 
        roleEn: '', 
        roleAr: '', 
        textEn: '', 
        textAr: '' 
      };
    } else if (field.value.length > 0) {
      // Create new item based on the structure of existing items
      const firstItem = field.value[0];
      Object.keys(firstItem).forEach(key => {
        newItem[key] = '';
      });
    } else {
      // Default structure if no items exist
      newItem = { titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '' };
    }

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
      
      // Update the local state with the updated section
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
      } else if (error.message.includes('not found')) {
        errorMessage = locale === 'ar' ? 'الصفحة غير موجودة' : 'Page not found';
      } else if (error.message.includes('Network Error')) {
        errorMessage = locale === 'ar' ? 'خطأ في الاتصال. تحقق من اتصالك بالإنترنت' : 'Network error. Please check your internet connection';
      } else if (error.message.includes('Bad Request')) {
        errorMessage = locale === 'ar' ? 'خطأ في البيانات المرسلة' : 'Invalid data sent to server';
      } else {
        // Use the specific error message from the API
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!section) return;

    setIsSaving(true);
    try {
      const publishedSection = await contentApi.publishSection(section.id);
      
      // Update the local state with the published section
      setSection(publishedSection);
      toast.success(locale === 'ar' ? 'تم نشر المحتوى بنجاح' : 'Content published successfully');
      setHasChanges(false);
    } catch (error: any) {
      console.error('Publish error:', error);
      
      let errorMessage = locale === 'ar' ? 'فشل في نشر المحتوى' : 'Failed to publish content';
      
      if (error.message === 'Authentication required') {
        errorMessage = locale === 'ar' ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى' : 'Session expired. Please login again';
        router.push(`/${locale}/admin-login`);
      } else if (error.message.includes('not found')) {
        errorMessage = locale === 'ar' ? 'الصفحة غير موجودة' : 'Page not found';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading while checking authentication and hydration
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

  // Show loading if not authenticated
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

  // Show error if there's an error
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

  // Show error if no section loaded
  if (!section) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="alert-circle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {locale === 'ar' ? 'خطأ في تحميل المحتوى' : 'Error Loading Content'}
          </h3>
          <p className="text-sm text-gray-600">
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
    // Check if field has bilingual structure
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
        // Special handling for FAQ items to improve layout
        const isFAQItems = field.id.includes('faq-items');
        
        if (isFAQItems) {
          return (
            <div className="space-y-4">
              {field.value.map((item: any, index: number) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      {locale === 'ar' ? `السؤال ${index + 1}` : `Question ${index + 1}`}
                    </h4>
                    {isEditing && (
                      <button
                        onClick={() => removeArrayItem(field.id, index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Question (English)
                      </label>
                      <input
                        type="text"
                        value={item.questionEn || ''}
                        onChange={(e) => handleArrayItemChange(field.id, index, 'questionEn', e.target.value)}
                        placeholder="Enter question in English"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Question (Arabic)
                      </label>
                      <input
                        type="text"
                        value={item.questionAr || ''}
                        onChange={(e) => handleArrayItemChange(field.id, index, 'questionAr', e.target.value)}
                        placeholder="أدخل السؤال بالعربية"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Answer (English)
                      </label>
                      <textarea
                        value={item.answerEn || ''}
                        onChange={(e) => handleArrayItemChange(field.id, index, 'answerEn', e.target.value)}
                        placeholder="Enter answer in English"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Answer (Arabic)
                      </label>
                      <textarea
                        value={item.answerAr || ''}
                        onChange={(e) => handleArrayItemChange(field.id, index, 'answerAr', e.target.value)}
                        placeholder="أدخل الإجابة بالعربية"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={() => addArrayItem(field.id)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                >
                  <Icon name="plus" className="w-4 h-4 inline mr-2" />
                  {locale === 'ar' ? 'إضافة سؤال جديد' : 'Add New Question'}
                </button>
              )}
            </div>
          );
        }
        
        // Default array rendering with proper bilingual field labels
        return (
          <div className="space-y-4">
            {field.value.map((item: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    {field.label} {index + 1}
                  </h4>
                  {isEditing && (
                    <button
                      onClick={() => removeArrayItem(field.id, index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(item).map((key) => {
                    // Create proper labels for bilingual fields
                    let label = key.charAt(0).toUpperCase() + key.slice(1);
                    if (key.endsWith('En')) {
                      label = key.slice(0, -2).charAt(0).toUpperCase() + key.slice(1, -2) + ' (English)';
                    } else if (key.endsWith('Ar')) {
                      label = key.slice(0, -2).charAt(0).toUpperCase() + key.slice(1, -2) + ' (Arabic)';
                    }
                    
                    const isTextArea = key.includes('description') || key.includes('answer') || key.includes('text');
                    
                    return (
                      <div key={key} className="space-y-1">
                        <label className="block text-xs font-medium text-gray-600">
                          {label}
                        </label>
                        {isTextArea ? (
                          <textarea
                            value={item[key] || ''}
                            onChange={(e) => handleArrayItemChange(field.id, index, key, e.target.value)}
                            placeholder={`Enter ${label.toLowerCase()}`}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            disabled={!isEditing}
                          />
                        ) : (
                          <input
                            type="text"
                            value={item[key] || ''}
                            onChange={(e) => handleArrayItemChange(field.id, index, key, e.target.value)}
                            placeholder={`Enter ${label.toLowerCase()}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!isEditing}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {isEditing && (
              <button
                onClick={() => addArrayItem(field.id)}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                <Icon name="plus" className="w-4 h-4 inline mr-2" />
                {locale === 'ar' ? `إضافة ${field.label} جديد` : `Add New ${field.label.slice(0, -1)}`}
              </button>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={field.value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isEditing}
          />
        );
    }
  };

  // Check if any fields have bilingual structure
  const hasBilingualFields = section?.fields?.some(field => 
    field.value && typeof field.value === 'object' && field.value.en !== undefined && field.value.ar !== undefined
  ) || false;

  return (
    <div className="bg-white min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{maxWidth: '90rem', paddingTop: '50px'}}>
        {/* Header */}
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
              {/* User Info */}
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
              
              {/* Status Badge */}
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
                      // Reset to original values from API
                      const resetSection = async () => {
                        try {
                          const templates = await contentApi.getContentTemplates();
                          if (templates[section.id]) {
                            setSection(templates[section.id]);
                          }
                        } catch (error) {
                          console.error('Error resetting content:', error);
                          // If reset fails, just close editing mode
                          toast.error(locale === 'ar' ? 'فشل في إعادة تعيين المحتوى' : 'Failed to reset content');
                        }
                      };
                      resetSection();
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
                  <button
                    onClick={handlePublish}
                    disabled={isSaving}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {locale === 'ar' ? 'نشر' : 'Publish'}
                  </button>
                </div>
              )}
              
              {/* Reinitialize Data Button - for debugging */}
              <button
                onClick={async () => {
                  try {
                    console.log('🔄 Reinitializing sample data...');
                    await contentApi.reinitializeSampleData();
                    toast.success(locale === 'ar' ? 'تم إعادة تهيئة البيانات بنجاح' : 'Data reinitialized successfully');
                    // Reload the section
                    const templates = await contentApi.getContentTemplates();
                    if (templates[section.id]) {
                      setSection(templates[section.id]);
                    }
                  } catch (error) {
                    console.error('Error reinitializing data:', error);
                    toast.error(locale === 'ar' ? 'فشل في إعادة تهيئة البيانات' : 'Failed to reinitialize data');
                  }
                }}
                className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
              >
                {locale === 'ar' ? 'إعادة تهيئة البيانات' : 'Reinit Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
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
              
              {/* Data Refresh Button */}
              {(section.id === 'about' || section.id === 'faq' || section.id === 'hero' || section.id === 'consultation') && (
                <button
                  onClick={async () => {
                    try {
                      console.log('🔄 Refreshing content data...');
                      setIsLoading(true);
                      
                      // Try to reinitialize sample data first
                      try {
                        await contentApi.reinitializeSampleData();
                        console.log('✅ Sample data reinitialized');
                      } catch (reinitError) {
                        console.log('⚠️ Reinit failed, continuing with refresh:', reinitError);
                      }
                      
                      // Get fresh templates
                      const templates = await contentApi.getContentTemplates();
                      if (templates[section.id]) {
                        setSection(templates[section.id]);
                        toast.success(locale === 'ar' ? 'تم تحديث البيانات بنجاح' : 'Data refreshed successfully');
                      }
                    } catch (error) {
                      console.error('Error refreshing data:', error);
                      toast.error(locale === 'ar' ? 'فشل في تحديث البيانات' : 'Failed to refresh data');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <Icon name="refresh" className="w-4 h-4 inline mr-2" />
                  {locale === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
          {/* Language Switcher - Only show if there are bilingual fields */}
          {hasBilingualFields && (
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
          )}
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

            {/* Content Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {locale === 'ar' ? 'معاينة المحتوى' : 'Content Preview'}
              </h3>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap overflow-auto max-h-96">
                {JSON.stringify({
                  id: section.id,
                  title: section.title,
                  fields: section.fields.map(field => ({
                    id: field.id,
                    label: field.label,
                    type: field.type,
                    value: field.value,
                    required: field.required
                  }))
                }, null, 2)}
              </pre>
            </div>

      </div>
    </div>
  );
}
