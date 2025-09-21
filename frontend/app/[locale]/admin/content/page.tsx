'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { contentApi } from '@/lib/content-api';

interface ContentSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'published' | 'draft' | 'archived';
  lastModified: string;
  type: 'page' | 'section' | 'component';
}


export default function ContentManagement() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isRTL = locale === 'ar';

  // Fetch content sections from database
  useEffect(() => {
    const fetchContentSections = async () => {
      try {
        setLoading(true);
        setError(null);
        const templates = await contentApi.getContentTemplates();
        
        // Convert templates to ContentSection format
        const sections: ContentSection[] = Object.entries(templates).map(([key, template]) => ({
          id: key,
          title: template.title,
          description: template.description,
          icon: getSectionIcon(key),
          status: template.status as 'published' | 'draft' | 'archived',
          lastModified: template.lastModified,
          type: 'section' as const
        }));
        
        setContentSections(sections);
      } catch (error) {
        console.error('Error fetching content sections:', error);
        setError('Failed to load content sections');
        // Fallback to hardcoded data if API fails
        setContentSections(getDefaultSections());
      } finally {
        setLoading(false);
      }
    };

    fetchContentSections();
  }, []);

  const getSectionIcon = (sectionKey: string): string => {
    const iconMap: Record<string, string> = {
      hero: 'home',
      courses: 'graduation-cap',
      about: 'building',
      services: 'cogs',
      contact: 'envelope',
      faq: 'question-circle',
      consultation: 'users'
    };
    return iconMap[sectionKey] || 'file-text';
  };

  const getDefaultSections = (): ContentSection[] => [
    {
      id: 'hero',
      title: 'Hero Section',
      description: 'Main banner section with title, subtitle, and call-to-action buttons',
      icon: 'home',
      status: 'published',
      lastModified: '2025-01-15T10:30:00Z',
      type: 'section'
    },
    {
      id: 'courses',
      title: 'Course Management',
      description: 'Course descriptions, curriculum, pricing, and enrollment details',
      icon: 'graduation-cap',
      status: 'published',
      lastModified: '2025-01-14T15:45:00Z',
      type: 'section'
    },
    {
      id: 'about',
      title: 'About Company',
      description: 'Company information, mission, vision, team, and achievements',
      icon: 'building',
      status: 'published',
      lastModified: '2025-01-13T09:20:00Z',
      type: 'section'
    },
    {
      id: 'services',
      title: 'Services & Solutions',
      description: 'Consulting services, AI solutions, and service offerings',
      icon: 'cogs',
      status: 'published',
      lastModified: '2025-01-12T14:30:00Z',
      type: 'section'
    },
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'Contact details, office locations, and contact forms',
      icon: 'envelope',
      status: 'published',
      lastModified: '2025-01-11T11:15:00Z',
      type: 'section'
    },
    {
      id: 'faq',
      title: 'FAQ & Help',
      description: 'Frequently asked questions, help articles, and support content',
      icon: 'question-circle',
      status: 'published',
      lastModified: '2025-01-10T16:45:00Z',
      type: 'section'
    },
    {
      id: 'consultation',
      title: 'Consultation Services',
      description: 'Consultation offerings and service details',
      icon: 'users',
      status: 'published',
      lastModified: '2025-01-09T13:20:00Z',
      type: 'section'
    }
  ];

  const filteredSections = contentSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || section.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-primary-100 text-primary-800 border-primary-200';
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
        return t('published');
      case 'draft':
        return t('draft');
      case 'archived':
        return t('archived');
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
            <Icon name="edit" className="w-8 h-8 text-blue-600 mr-3 rtl:mr-0 rtl:ml-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t('contentManagement')}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {t('manageAllContent')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon name="search" className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 ${
                locale === 'ar' ? 'right-3' : 'left-3'
              }`} />
              <input
                type="text"
                placeholder={t('searchContent')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'
                }`}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="select-wrapper">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('allStatus')}</option>
                <option value="published">{t('published')}</option>
                <option value="draft">{t('draft')}</option>
                <option value="archived">{t('archived')}</option>
              </select>
            </div>
            {/* Add New Page button hidden as requested */}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 rtl:ml-0 rtl:mr-3 text-gray-600">
              {t('loading')}
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Icon name="alert-circle" className="w-5 h-5 text-red-600 mr-2 rtl:mr-0 rtl:ml-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Content Statistics */}
        {!loading && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 rtl:mr-0 rtl:ml-4">
                  <Icon name="file-text" className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('totalPages')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{contentSections.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4 rtl:mr-0 rtl:ml-4">
                  <Icon name="check-circle" className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('published')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {contentSections.filter(s => s.status === 'published').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4 rtl:mr-0 rtl:ml-4">
                  <Icon name="edit" className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('drafts')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {contentSections.filter(s => s.status === 'draft').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mr-4 rtl:mr-0 rtl:ml-4">
                  <Icon name="clock" className="w-6 h-6 text-secondary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('lastUpdated')}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {contentSections.length > 0 
                      ? formatDate(contentSections.reduce((latest, section) => 
                          new Date(section.lastModified) > new Date(latest.lastModified) ? section : latest
                        ).lastModified)
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        {!loading && (
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
        )}
      </div>
    </div>
  );
}
