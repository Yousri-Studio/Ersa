
'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useHydration } from '@/hooks/useHydration';
import toast from 'react-hot-toast';
import { contentAdminApi, type AdminContentSection } from '@/lib/admin-content-api';
import { Icon } from '@/components/ui/icon';

export default function ContentManagementPage() {
  const [sections, setSections] = useState<AdminContentSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<AdminContentSection | null>(null);
  const [selectedPageKey, setSelectedPageKey] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sections');
  const { isHydrated } = useHydration();
  const locale = useLocale();

  useEffect(() => {
    if (isHydrated) {
      loadContentSections();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const initializeSampleData = async () => {
    try {
      setIsLoading(true);
      const response = await contentAdminApi.initializeSampleData();
      toast.success('Sample data initialized successfully');
      await loadContentSections();
    } catch (error) {
      console.error('Error initializing sample data:', error);
      toast.error('Failed to initialize sample data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadContentSections = async () => {
    try {
      const response = await contentAdminApi.getContentSections();
      const adminSections: AdminContentSection[] = response.data.map((section: any) => ({
        id: section.id,
        name: section.name,
        type: section.type,
        pageKey: section.pageKey || 'unknown',
        pageName: section.pageName || 'Unknown Page',
        content: section.content,
        isActive: section.isActive,
        lastModified: section.lastModified
      }));
      setSections(adminSections);
      setIsLoading(false);
      return;
    } catch (error) {
      console.error('Error loading content sections:', error);
      if (sections.length === 0) {
        toast.error('No content sections found. Initialize sample data to get started.');
      }
    }

    const mockSections: AdminContentSection[] = [
      {
        id: 'hero',
        name: 'Hero Section',
        type: 'hero',
        pageKey: 'home',
        pageName: 'Home Page',
        content: {
          title: 'Welcome to Ersa Training',
          subtitle: 'Professional Training & Consultancy Services',
          description: 'Empowering individuals and organizations with world-class training solutions'
        },
        isActive: true,
        lastModified: '2024-01-15'
      }
    ];

    toast.error('Failed to load content sections, using mock data');
    setSections(mockSections);
    setIsLoading(false);
  };

  const handleSave = async (sectionId: string, content: any) => {
    try {
      const response = await contentAdminApi.updateContentSection(sectionId, content);
      toast.success('Content saved successfully');
      setIsEditing(false);
      await loadContentSections();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    }
  };

  const renderContentEditor = (section: AdminContentSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={section.content.title}
                  onChange={(e) => {
                    const newContent = { ...section.content, title: e.target.value };
                    setSelectedSection({ ...section, content: newContent });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Subtitle</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={section.content.subtitle}
                  onChange={(e) => {
                    const newContent = { ...section.content, subtitle: e.target.value };
                    setSelectedSection({ ...section, content: newContent });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={section.content.description}
                  onChange={(e) => {
                    const newContent = { ...section.content, description: e.target.value };
                    setSelectedSection({ ...section, content: newContent });
                  }}
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={section.content.title}
                onChange={(e) => {
                  const newContent = { ...section.content, title: e.target.value };
                  setSelectedSection({ ...section, content: newContent });
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={section.content.description}
                onChange={(e) => {
                  const newContent = { ...section.content, description: e.target.value };
                  setSelectedSection({ ...section, content: newContent });
                }}
              />
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage and edit your website content</p>
        </div>
        <button
          onClick={initializeSampleData}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Icon name="plus" className="h-4 w-4 mr-2" />
          Initialize Data
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                activeTab === 'sections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content Sections
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                activeTab === 'pages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pages
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'sections' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sections List */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Content Sections</h3>
                  {sections.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Icon name="edit" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Content Sections</h3>
                      <p className="text-gray-500 mb-6">Initialize sample data to get started with content management</p>
                      <button
                        onClick={initializeSampleData}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                      >
                        {isLoading ? 'Initializing...' : 'Initialize Sample Data'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => setSelectedSection(section)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            selectedSection?.id === section.id
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{section.name}</h4>
                              <p className="text-sm text-gray-500 mt-1">{section.pageName}</p>
                              <p className="text-xs text-gray-400 mt-1">Updated: {section.lastModified}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`w-3 h-3 rounded-full ${
                                section.isActive ? 'bg-green-500' : 'bg-gray-300'
                              }`}></span>
                              <Icon name="chevron-right" className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Content Editor */}
              <div className="lg:col-span-2">
                {selectedSection ? (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedSection.name}</h3>
                        <p className="text-gray-600 mt-1">Edit content for this section</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSave(selectedSection.id, selectedSection.content)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              Save Changes
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            <Icon name="edit" className="h-4 w-4 mr-2" />
                            Edit Content
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6">
                      {isEditing ? (
                        renderContentEditor(selectedSection)
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Current Content</h4>
                            <div className="bg-gray-100 p-4 rounded-lg">
                              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
                                {JSON.stringify(selectedSection.content, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-12 text-center">
                    <Icon name="edit" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Section</h3>
                    <p className="text-gray-500">Choose a content section from the list to start editing</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Page Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Home Page', path: '/', sections: 9, icon: 'home' },
                  { name: 'Courses', path: '/courses', sections: 3, icon: 'book-open' },
                  { name: 'Contact', path: '/contact', sections: 2, icon: 'envelope' },
                  { name: 'FAQ', path: '/faq', sections: 1, icon: 'question-circle' },
                  { name: 'Consultation', path: '/consultation', sections: 2, icon: 'handshake' },
                  { name: 'About Us', path: '/about', sections: 4, icon: 'info-circle' }
                ].map((page) => (
                  <div key={page.path} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon name={page.icon} className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{page.name}</h4>
                        <p className="text-sm text-gray-500">{page.sections} content sections</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const pageKey = page.path.substring(1) || 'home';
                        setSelectedPageKey(pageKey);
                        setActiveTab('sections');
                      }}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors duration-200"
                    >
                      Manage Content
                      <Icon name="arrow-right" className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
