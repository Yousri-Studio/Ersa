'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { motion } from 'framer-motion';

interface ContentSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'published' | 'draft' | 'archived';
  lastModified: string;
  type: 'page' | 'section' | 'component';
}

const contentSections: ContentSection[] = [
  {
    id: 'home',
    title: 'Home Page',
    description: 'Hero section, features, testimonials, and main landing content',
    icon: 'home',
    status: 'published',
    lastModified: '2025-01-15T10:30:00Z',
    type: 'page'
  },
  {
    id: 'courses',
    title: 'Course Management',
    description: 'Course descriptions, curriculum, pricing, and enrollment details',
    icon: 'graduation-cap',
    status: 'published',
    lastModified: '2025-01-14T15:45:00Z',
    type: 'page'
  },
  {
    id: 'about',
    title: 'About Company',
    description: 'Company information, mission, vision, team, and achievements',
    icon: 'building',
    status: 'published',
    lastModified: '2025-01-13T09:20:00Z',
    type: 'page'
  },
  {
    id: 'services',
    title: 'Services & Solutions',
    description: 'Consulting services, AI solutions, and service offerings',
    icon: 'cogs',
    status: 'published',
    lastModified: '2025-01-12T14:30:00Z',
    type: 'page'
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Contact details, office locations, and contact forms',
    icon: 'envelope',
    status: 'published',
    lastModified: '2025-01-11T11:15:00Z',
    type: 'page'
  },
  {
    id: 'faq',
    title: 'FAQ & Help',
    description: 'Frequently asked questions, help articles, and support content',
    icon: 'question-circle',
    status: 'published',
    lastModified: '2025-01-10T16:45:00Z',
    type: 'page'
  },
  {
    id: 'legal',
    title: 'Legal & Policies',
    description: 'Terms of service, privacy policy, and legal documents',
    icon: 'file-contract',
    status: 'published',
    lastModified: '2025-01-09T13:20:00Z',
    type: 'page'
  },
  {
    id: 'blog',
    title: 'Blog & News',
    description: 'Company blog, industry news, and educational articles',
    icon: 'newspaper',
    status: 'draft',
    lastModified: '2025-01-08T10:00:00Z',
    type: 'page'
  }
];

export default function ContentManagement() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const isRTL = locale === 'ar';

  const filteredSections = contentSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || section.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return locale === 'ar' ? 'منشور' : 'Published';
      case 'draft':
        return locale === 'ar' ? 'مسودة' : 'Draft';
      case 'archived':
        return locale === 'ar' ? 'مؤرشف' : 'Archived';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      locale === 'ar' ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  };

  return (
    <div className="bg-white min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{maxWidth: '90rem', paddingTop: '50px'}}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Icon name="edit" className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t('contentManagement')}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {locale === 'ar' 
              ? 'إدارة جميع صفحات الموقع ومحتواها العام' 
              : 'Manage all website pages and their content'
            }
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={locale === 'ar' ? 'البحث في المحتوى...' : 'Search content...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{locale === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
              <option value="published">{locale === 'ar' ? 'منشور' : 'Published'}</option>
              <option value="draft">{locale === 'ar' ? 'مسودة' : 'Draft'}</option>
              <option value="archived">{locale === 'ar' ? 'مؤرشف' : 'Archived'}</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {locale === 'ar' ? 'إضافة صفحة جديدة' : 'Add New Page'}
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
                             className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => router.push(`/${locale}/admin/content/${section.id}`)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name={section.icon} className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(section.status)}`}>
                    {getStatusText(section.status)}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {section.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {section.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{section.type}</span>
                  <span>{formatDate(section.lastModified)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Icon name="plus" className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {locale === 'ar' ? 'إضافة صفحة' : 'Add Page'}
              </span>
            </button>
            <button className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <Icon name="upload" className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {locale === 'ar' ? 'رفع ملفات' : 'Upload Files'}
              </span>
            </button>
            <button className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <Icon name="copy" className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {locale === 'ar' ? 'نسخ محتوى' : 'Copy Content'}
              </span>
            </button>
            <button className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
              <Icon name="download" className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {locale === 'ar' ? 'تصدير' : 'Export'}
              </span>
            </button>
          </div>
        </div>

        {/* Content Statistics */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Icon name="file-text" className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ar' ? 'إجمالي الصفحات' : 'Total Pages'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{contentSections.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Icon name="check-circle" className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ar' ? 'منشور' : 'Published'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {contentSections.filter(s => s.status === 'published').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Icon name="edit" className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ar' ? 'مسودات' : 'Drafts'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {contentSections.filter(s => s.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Icon name="clock" className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ar' ? 'آخر تحديث' : 'Last Updated'}
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {formatDate(contentSections[0]?.lastModified || '')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
