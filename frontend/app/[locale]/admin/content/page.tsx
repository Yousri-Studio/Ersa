'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useHydration } from '@/hooks/useHydration';
import toast from 'react-hot-toast';
import { Icon } from '@/components/ui/icon';

interface ContentSection {
  id: string;
  name: string;
  type: 'hero' | 'consultation' | 'training' | 'services' | 'ai' | 'testimonials' | 'join' | 'achievements' | 'faq';
  content: any;
  isActive: boolean;
  lastModified: string;
}

interface ContentBlock {
  id: string;
  title: string;
  content: string;
  language: 'en' | 'ar';
  section: string;
}

export default function ContentManagementPage() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<ContentSection | null>(null);
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

  const loadContentSections = async () => {
    try {
      // Mock data - replace with actual API call
      const mockSections: ContentSection[] = [
        {
          id: 'hero',
          name: 'Hero Section',
          type: 'hero',
          content: {
            title: 'Welcome to Ersa Training',
            subtitle: 'Professional Training & Consultancy Services',
            description: 'Empowering individuals and organizations with world-class training solutions'
          },
          isActive: true,
          lastModified: '2024-01-15'
        },
        {
          id: 'consultation',
          name: 'Consultation Section',
          type: 'consultation',
          content: {
            title: 'Get Professional Consultation',
            description: 'Our experts are here to help you achieve your goals'
          },
          isActive: true,
          lastModified: '2024-01-14'
        },
        {
          id: 'training',
          name: 'Training Categories',
          type: 'training',
          content: {
            categories: [
              { name: 'Graphic Design', description: 'Professional design courses' },
              { name: 'Web Development', description: 'Modern web development skills' },
              { name: 'Digital Marketing', description: 'Marketing strategies and tools' }
            ]
          },
          isActive: true,
          lastModified: '2024-01-13'
        },
        {
          id: 'services',
          name: 'Services Section',
          type: 'services',
          content: {
            services: [
              { title: 'Online Training', description: 'Flexible online learning' },
              { title: 'Corporate Training', description: 'Customized corporate solutions' },
              { title: 'Consultation', description: 'Expert advice and guidance' }
            ]
          },
          isActive: true,
          lastModified: '2024-01-12'
        },
        {
          id: 'ai',
          name: 'AI Consultation',
          type: 'ai',
          content: {
            title: 'AI-Powered Consultation',
            description: 'Get instant answers to your questions'
          },
          isActive: true,
          lastModified: '2024-01-11'
        },
        {
          id: 'testimonials',
          name: 'Testimonials',
          type: 'testimonials',
          content: {
            testimonials: [
              { name: 'Ahmed Ali', role: 'Student', text: 'Excellent training experience' },
              { name: 'Sarah Johnson', role: 'Manager', text: 'Professional and effective' }
            ]
          },
          isActive: true,
          lastModified: '2024-01-10'
        },
        {
          id: 'join',
          name: 'Join Us Section',
          type: 'join',
          content: {
            title: 'Join Our Community',
            description: 'Be part of our growing network of professionals'
          },
          isActive: true,
          lastModified: '2024-01-09'
        },
        {
          id: 'achievements',
          name: 'Achievements',
          type: 'achievements',
          content: {
            stats: [
              { number: '1000+', label: 'Students Trained' },
              { number: '50+', label: 'Courses Available' },
              { number: '95%', label: 'Success Rate' }
            ]
          },
          isActive: true,
          lastModified: '2024-01-08'
        },
        {
          id: 'faq',
          name: 'FAQ Section',
          type: 'faq',
          content: {
            faqs: [
              { question: 'How do I enroll in a course?', answer: 'You can enroll through our website or contact us directly.' },
              { question: 'What payment methods do you accept?', answer: 'We accept credit cards, bank transfers, and online payments.' }
            ]
          },
          isActive: true,
          lastModified: '2024-01-07'
        }
      ];

      setSections(mockSections);
      setIsLoading(false);
    } catch (error) {
      toast.error('Failed to load content sections');
      setIsLoading(false);
    }
  };

  const handleSave = async (sectionId: string, content: any) => {
    try {
      // Mock API call - replace with actual API
      console.log('Saving content for section:', sectionId, content);
      toast.success('Content saved successfully');
      setIsEditing(false);
      
      // Update local state
      setSections(prev => prev.map(section => 
        section.id === sectionId 
          ? { ...section, content, lastModified: new Date().toISOString().split('T')[0] }
          : section
      ));
    } catch (error) {
      toast.error('Failed to save content');
    }
  };

  const renderContentEditor = (section: ContentSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={section.content.title}
                onChange={(e) => {
                  const newContent = { ...section.content, title: e.target.value };
                  setSelectedSection({ ...section, content: newContent });
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={section.content.subtitle}
                onChange={(e) => {
                  const newContent = { ...section.content, subtitle: e.target.value };
                  setSelectedSection({ ...section, content: newContent });
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={section.content.description}
                onChange={(e) => {
                  const newContent = { ...section.content, description: e.target.value };
                  setSelectedSection({ ...section, content: newContent });
                }}
              />
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            {section.content.faqs.map((faq: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question {index + 1}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={faq.question}
                    onChange={(e) => {
                      const newFaqs = [...section.content.faqs];
                      newFaqs[index] = { ...faq, question: e.target.value };
                      const newContent = { ...section.content, faqs: newFaqs };
                      setSelectedSection({ ...section, content: newContent });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Answer {index + 1}</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={faq.answer}
                    onChange={(e) => {
                      const newFaqs = [...section.content.faqs];
                      newFaqs[index] = { ...faq, answer: e.target.value };
                      const newContent = { ...section.content, faqs: newFaqs };
                      setSelectedSection({ ...section, content: newContent });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={section.content.title}
                onChange={(e) => {
                  const newContent = { ...section.content, title: e.target.value };
                  setSelectedSection({ ...section, content: newContent });
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all content sections of your website
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('sections')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Content Sections
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pages
          </button>
        </nav>
      </div>

      {activeTab === 'sections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sections List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Content Sections</h3>
                <p className="text-sm text-gray-600">Select a section to edit</p>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedSection?.id === section.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{section.name}</h4>
                          <p className="text-sm text-gray-500">Last modified: {section.lastModified}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            section.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}></span>
                          <Icon name="chevron-right" className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="lg:col-span-2">
            {selectedSection ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedSection.name}</h3>
                      <p className="text-sm text-gray-600">Edit content for this section</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSave(selectedSection.id, selectedSection.content)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            Save Changes
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Edit Content
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    renderContentEditor(selectedSection)
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Current Content</h4>
                        <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                          {JSON.stringify(selectedSection.content, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Icon name="edit" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Section</h3>
                <p className="text-gray-500">Choose a content section from the list to start editing</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Page Management</h3>
            <p className="text-sm text-gray-600">Manage individual pages and their content</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Home Page', path: '/', sections: 9 },
                { name: 'Courses', path: '/courses', sections: 3 },
                { name: 'Contact', path: '/contact', sections: 2 },
                { name: 'FAQ', path: '/faq', sections: 1 },
                { name: 'Consultation', path: '/consultation', sections: 2 },
                { name: 'About Us', path: '/about', sections: 4 }
              ].map((page) => (
                <div key={page.path} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <h4 className="font-medium text-gray-900 mb-2">{page.name}</h4>
                  <p className="text-sm text-gray-500 mb-3">{page.sections} content sections</p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Manage Content →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
