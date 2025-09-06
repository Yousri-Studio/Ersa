import axios from 'axios';
import Cookies from 'js-cookie';

export interface ContentField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'rich-text' | 'image' | 'array' | 'object';
  value: any;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface ContentSection {
  id: string;
  title: string;
  description: string;
  fields: ContentField[];
  status: 'published' | 'draft' | 'archived';
  lastModified: string;
  pageKey: string;
}

export interface ContentPage {
  id: string;
  name: string;
  path: string;
  sections: ContentSection[];
  status: 'published' | 'draft' | 'archived';
  lastModified: string;
}

// Content API service
class ContentAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
    
    // Add axios interceptor for authentication
    axios.interceptors.request.use(
      (config) => {
        const token = Cookies.get('auth-token');
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Add axios interceptor for better error handling
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          console.warn('Network error detected, falling back to mock data');
          error.isMockFallback = true;
        }
        return Promise.reject(error);
      }
    );
  }

  // Get all content pages
  async getContentPages(): Promise<ContentPage[]> {
    try {
      const response = await axios.get(`${this.baseURL}/content/pages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching content pages:', error);
      // Return mock data for development
      return this.getMockContentPages();
    }
  }

  // Get content for a specific page
  async getPageContent(pageKey: string): Promise<ContentPage> {
    try {
      const response = await axios.get(`${this.baseURL}/content/pages/${pageKey}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching page content:', error);
      // Return mock data for development
      return this.getMockPageContent(pageKey);
    }
  }

  // Get content for a specific section
  async getSectionContent(sectionId: string): Promise<ContentSection> {
    try {
      const response = await axios.get(`${this.baseURL}/content/sections/${sectionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching section content:', error);
      throw error;
    }
  }

  // Update content section
  async updateSectionContent(sectionId: string, content: any): Promise<ContentSection> {
    try {
      const response = await axios.put(`${this.baseURL}/content/sections/${sectionId}/content`, { content }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating section content:', error);
      
      // If it's an authentication error, throw it
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Authentication required');
      }
      
      // For network errors or when backend is not available, simulate update
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.code === 'ECONNREFUSED' || error.isMockFallback) {
        console.log('Backend not available, using mock update for development');
        const templates = this.getMockContentTemplates();
        const section = templates[sectionId];
        
        if (!section) {
          throw new Error(`Section ${sectionId} not found`);
        }
        
        // Update the section with new content
        const updatedSection = {
          ...section,
          ...content,
          lastModified: new Date().toISOString()
        };
        
        return updatedSection;
      }
      
      // For development, simulate successful update with mock data
      console.log('Using mock update for development');
      const templates = this.getMockContentTemplates();
      const section = templates[sectionId];
      
      if (!section) {
        throw new Error(`Section ${sectionId} not found`);
      }
      
      // Update the section with new content
      const updatedSection = {
        ...section,
        ...content,
        lastModified: new Date().toISOString()
      };
      
      return updatedSection;
    }
  }

  // Publish content section
  async publishSection(sectionId: string): Promise<ContentSection> {
    try {
      const response = await axios.post(`${this.baseURL}/content/sections/${sectionId}/publish`);
      return response.data;
    } catch (error: any) {
      console.error('Error publishing section:', error);
      
      // If it's an authentication error, throw it
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Authentication required');
      }
      
      // For development, simulate successful publish with mock data
      console.log('Using mock publish for development');
      const templates = this.getMockContentTemplates();
      const section = templates[sectionId];
      
      if (!section) {
        throw new Error(`Section ${sectionId} not found`);
      }
      
      // Update the section status to published
      const publishedSection = {
        ...section,
        status: 'published' as const,
        lastModified: new Date().toISOString()
      };
      
      // In a real app, you'd update the database here
      // For now, we'll just return the updated section
      return publishedSection;
    }
  }

  // Create new content section
  async createSection(section: Omit<ContentSection, 'id' | 'lastModified'>): Promise<ContentSection> {
    try {
      const response = await axios.post(`${this.baseURL}/content/sections`, section);
      return response.data;
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  }

  // Delete content section
  async deleteSection(sectionId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/content/sections/${sectionId}`);
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  }

  // Get content templates
  async getContentTemplates(): Promise<Record<string, ContentSection>> {
    try {
      const response = await axios.get(`${this.baseURL}/content/templates`, {
        timeout: 5000, // 5 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Convert the backend response to match our frontend interface
      const templates: Record<string, ContentSection> = {};
      
      // The backend returns templates with section keys as keys
      // We need to convert them to match our ContentSection interface
      Object.entries(response.data).forEach(([sectionKey, templateData]: [string, any]) => {
        templates[sectionKey] = {
          id: templateData.id, // Use the actual GUID from backend
          title: templateData.title,
          description: templateData.description,
          fields: templateData.fields || [],
          status: templateData.status || 'published',
          lastModified: templateData.lastModified,
          pageKey: templateData.pageKey
        };
      });
      
      return templates;
    } catch (error: any) {
      console.error('Error fetching content templates:', error);
      
      // If it's an authentication error, don't return mock data
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Authentication required');
      }
      
      // For network errors or when backend is not available, use mock data
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.code === 'ECONNREFUSED' || error.isMockFallback) {
        console.log('Backend not available, using mock content templates for development');
        return this.getMockContentTemplates();
      }
      
      // Return mock templates for development
      console.log('Using mock content templates for development');
      return this.getMockContentTemplates();
    }
  }

  // Initialize page content
  async initializePageContent(pageKey: string): Promise<ContentPage> {
    try {
      const response = await axios.post(`${this.baseURL}/content/pages/${pageKey}/initialize`);
      return response.data;
    } catch (error) {
      console.error('Error initializing page content:', error);
      throw error;
    }
  }

  // Mock data for development
  private getMockContentPages(): ContentPage[] {
    return [
      {
        id: 'home',
        name: 'Home Page',
        path: '/',
        sections: [],
        status: 'published',
        lastModified: '2025-01-15T10:30:00Z'
      },
      {
        id: 'courses',
        name: 'Courses',
        path: '/courses',
        sections: [],
        status: 'published',
        lastModified: '2025-01-14T15:45:00Z'
      },
      {
        id: 'about',
        name: 'About Us',
        path: '/about',
        sections: [],
        status: 'published',
        lastModified: '2025-01-13T09:20:00Z'
      },
      {
        id: 'contact',
        name: 'Contact',
        path: '/contact',
        sections: [],
        status: 'published',
        lastModified: '2025-01-12T14:30:00Z'
      }
    ];
  }

  private getMockPageContent(pageKey: string): ContentPage {
    const mockPages = this.getMockContentPages();
    const page = mockPages.find(p => p.id === pageKey);
    
    if (!page) {
      throw new Error(`Page ${pageKey} not found`);
    }

    return page;
  }

  private getMockContentTemplates(): Record<string, ContentSection> {
    return {
      home: {
        id: 'home',
        title: 'Home Page',
        description: 'Main landing page content including hero, features, and testimonials',
        status: 'published',
        lastModified: '2025-01-15T10:30:00Z',
        pageKey: 'home',
        fields: [
          {
            id: 'hero-title',
            label: 'Hero Title',
            type: 'text',
            value: 'استكشف منصتنا التدريبية وارقى بمهاراتك لتحقيق أعلى إمكاناتك',
            required: true,
            placeholder: 'Enter main hero title'
          },
          {
            id: 'hero-subtitle',
            label: 'Hero Subtitle',
            type: 'textarea',
            value: 'منصة شاملة تجمع بين أحدث الطرق التدريبية والتقنيات المتطورة لتقديم تجربة تعليمية متميزة',
            required: true,
            placeholder: 'Enter hero subtitle'
          },
          {
            id: 'hero-cta-primary',
            label: 'Primary CTA Text',
            type: 'text',
            value: 'استكشف الدورات',
            required: true,
            placeholder: 'Enter primary button text'
          },
          {
            id: 'hero-cta-secondary',
            label: 'Secondary CTA Text',
            type: 'text',
            value: 'اطلب استشارة',
            required: false,
            placeholder: 'Enter secondary button text'
          },
          {
            id: 'features',
            label: 'Features',
            type: 'array',
            value: [
              { title: 'دورات متقدمة', description: 'أحدث التقنيات والمناهج' },
              { title: 'مدربون خبراء', description: 'خبرة واسعة في المجال' },
              { title: 'دعم متواصل', description: 'مساعدة على مدار الساعة' }
            ],
            required: true
          },
          {
            id: 'testimonials',
            label: 'Testimonials',
            type: 'array',
            value: [
              { name: 'أحمد علي', role: 'طالب', text: 'تجربة تدريبية ممتازة' },
              { name: 'سارة جونسون', role: 'مدير', text: 'مهني وفعال' }
            ],
            required: false
          }
        ]
      },
      courses: {
        id: 'courses',
        title: 'Course Management',
        description: 'Course descriptions, curriculum, and enrollment details',
        status: 'published',
        lastModified: '2025-01-14T15:45:00Z',
        pageKey: 'courses',
        fields: [
          {
            id: 'page-title',
            label: 'Page Title',
            type: 'text',
            value: 'دوراتنا',
            required: true,
            placeholder: 'Enter page title'
          },
          {
            id: 'page-description',
            label: 'Page Description',
            type: 'textarea',
            value: 'اكتشف مجموعتنا الشاملة من دورات التطوير المهني',
            required: true,
            placeholder: 'Enter page description'
          },
          {
            id: 'categories',
            label: 'Course Categories',
            type: 'array',
            value: [
              { name: 'التصميم الجرافيكي', description: 'دورات تصميم احترافية' },
              { name: 'تطوير الويب', description: 'مهارات تطوير حديثة' },
              { name: 'التسويق الرقمي', description: 'استراتيجيات وأدوات التسويق' }
            ],
            required: true
          }
        ]
      },
      about: {
        id: 'about',
        title: 'About Company',
        description: 'Company information, mission, vision, and team details',
        status: 'published',
        lastModified: '2025-01-13T09:20:00Z',
        pageKey: 'about',
        fields: [
          {
            id: 'company-name',
            label: 'Company Name',
            type: 'text',
            value: 'إرساء للتدريب',
            required: true,
            placeholder: 'Enter company name'
          },
          {
            id: 'mission',
            label: 'Mission Statement',
            type: 'textarea',
            value: 'تمكين الأفراد والمنظمات من خلال حلول تدريبية عالمية المستوى',
            required: true,
            placeholder: 'Enter company mission'
          },
          {
            id: 'vision',
            label: 'Vision Statement',
            type: 'textarea',
            value: 'أن نكون الشريك التدريبي المفضل في المنطقة',
            required: true,
            placeholder: 'Enter company vision'
          },
          {
            id: 'team',
            label: 'Team Members',
            type: 'array',
            value: [
              { name: 'أحمد محمد', position: 'المدير التنفيذي', bio: 'خبرة 15 عام في التدريب' },
              { name: 'فاطمة علي', position: 'مدير التدريب', bio: 'خبرة 10 أعوام في تطوير المناهج' }
            ],
            required: false
          }
        ]
      }
    };
  }
}

export const contentApi = new ContentAPI();
export default contentApi;


