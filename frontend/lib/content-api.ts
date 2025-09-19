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
      console.log('🔄 ContentAPI: Updating section', sectionId, 'with content:', content);
      
      // Transform the content from fields array to flat object format expected by backend
      const transformedContent: any = {};
      
      if (content.fields && Array.isArray(content.fields)) {
        content.fields.forEach((field: any) => {
          if (field.id && field.value !== undefined) {
            transformedContent[field.id] = field.value;
          }
        });
      }
      
      // Copy other properties
      Object.keys(content).forEach(key => {
        if (key !== 'fields') {
          transformedContent[key] = content[key];
        }
      });
      
      console.log('🔄 ContentAPI: Transformed content:', transformedContent);
      
      const response = await axios.put(`${this.baseURL}/content/sections/${sectionId}/content`, { content: transformedContent }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ ContentAPI: Update successful:', response.status, response.data);
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
      console.log('🚀 ContentAPI: Making request to', `${this.baseURL}/content/templates`);
      const token = Cookies.get('auth-token');
      console.log('🔑 ContentAPI: Auth token present:', !!token);
      
      const response = await axios.get(`${this.baseURL}/content/templates`, {
        timeout: 10000, // Increase timeout to 10 seconds
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ ContentAPI: Response received:', response.status, response.data);
      
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
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // If it's an authentication error, throw it to be handled by the UI
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('Authentication error - user needs to login or lacks permissions');
        throw new Error('Authentication required');
      }
      
      // For other API errors, also throw them instead of falling back to mock data
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw new Error(`API Error: ${error.response?.data?.error || error.message}`);
      }
      
      // For network errors or when backend is not available, use mock data
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.code === 'ECONNREFUSED' || error.isMockFallback) {
        console.warn('Backend not available, using mock content templates for development');
        return this.getMockContentTemplates();
      }
      
      // For server errors, throw them
      if (error.response?.status >= 500) {
        throw new Error(`Server Error: ${error.response?.data?.error || error.message}`);
      }
      
      // Fallback to mock data only for unexpected errors
      console.warn('Unexpected error, using mock content templates for development');
      return this.getMockContentTemplates();
    }
  }

  // Initialize page content
  async initializePageContent(pageKey: string): Promise<ContentPage> {
    try {
      const response = await axios.post(`${this.baseURL}/content/admin/pages/${pageKey}/initialize`);
      return response.data;
    } catch (error) {
      console.error('Error initializing page content:', error);
      throw error;
    }
  }

  // Initialize sample data
  async initializeSampleData(): Promise<void> {
    try {
      const response = await axios.post(`${this.baseURL}/content/admin/initialize-sample-data`);
      return response.data;
    } catch (error) {
      console.error('Error initializing sample data:', error);
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
      hero: {
        id: 'hero',
        title: 'Hero Section',
        description: 'Main banner section with bilingual content',
        status: 'published',
        lastModified: '2025-01-15T10:30:00Z',
        pageKey: 'home',
        fields: [
          {
            id: 'hero-badge',
            label: 'Hero Badge',
            type: 'text',
            value: {
              en: 'Ersa with you for skill development',
              ar: 'إرساء معك لتطوير المهارات'
            },
            required: true,
            placeholder: 'Enter hero badge text'
          },
          {
            id: 'hero-title',
            label: 'Hero Title',
            type: 'text',
            value: {
              en: 'Explore our training platform and elevate your abilities to achieve your maximum potential',
              ar: 'استكشف منصتنا التدريبية وارتقي بقدراتك لتحقيق أقصى إمكاناتك'
            },
            required: true,
            placeholder: 'Enter main hero title'
          },
          {
            id: 'hero-description',
            label: 'Hero Description',
            type: 'textarea',
            value: {
              en: 'Build a promising future and lead your life with our interactive and comprehensive programs',
              ar: 'ابن مستقبلاً واعداً وقود حياتك مع برامجنا التفاعلية والمفهمة'
            },
            required: true,
            placeholder: 'Enter hero description'
          },
          {
            id: 'hero-cta-primary',
            label: 'Primary CTA Text',
            type: 'text',
            value: {
              en: 'Explore Courses',
              ar: 'استكشف الدورات'
            },
            required: true,
            placeholder: 'Enter primary button text'
          },
          {
            id: 'hero-cta-secondary',
            label: 'Secondary CTA Text',
            type: 'text',
            value: {
              en: 'Request Consultation',
              ar: 'طلب استشارة'
            },
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
        description: 'Course descriptions, curriculum, and enrollment details with bilingual content',
        status: 'published',
        lastModified: '2025-01-14T15:45:00Z',
        pageKey: 'courses',
        fields: [
          {
            id: 'page-title-en',
            label: 'Page Title (English)',
            type: 'text',
            value: 'Our Courses',
            required: true,
            placeholder: 'Enter page title in English'
          },
          {
            id: 'page-title-ar',
            label: 'Page Title (Arabic)',
            type: 'text',
            value: 'دوراتنا',
            required: true,
            placeholder: 'Enter page title in Arabic'
          },
          {
            id: 'page-description-en',
            label: 'Page Description (English)',
            type: 'textarea',
            value: 'Discover our comprehensive collection of professional development courses',
            required: true,
            placeholder: 'Enter page description in English'
          },
          {
            id: 'page-description-ar',
            label: 'Page Description (Arabic)',
            type: 'textarea',
            value: 'اكتشف مجموعتنا الشاملة من دورات التطوير المهني',
            required: true,
            placeholder: 'Enter page description in Arabic'
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
        description: 'Company information, mission, vision, and team details with bilingual content',
        status: 'published',
        lastModified: '2025-01-13T09:20:00Z',
        pageKey: 'about',
        fields: [
          {
            id: 'company-name-en',
            label: 'Company Name (English)',
            type: 'text',
            value: 'Ersa Training',
            required: true,
            placeholder: 'Enter company name in English'
          },
          {
            id: 'company-name-ar',
            label: 'Company Name (Arabic)',
            type: 'text',
            value: 'إرساء للتدريب',
            required: true,
            placeholder: 'Enter company name in Arabic'
          },
          {
            id: 'mission-en',
            label: 'Mission Statement (English)',
            type: 'textarea',
            value: 'Empowering individuals and organizations through world-class training solutions',
            required: true,
            placeholder: 'Enter company mission in English'
          },
          {
            id: 'mission-ar',
            label: 'Mission Statement (Arabic)',
            type: 'textarea',
            value: 'تمكين الأفراد والمنظمات من خلال حلول تدريبية عالمية المستوى',
            required: true,
            placeholder: 'Enter company mission in Arabic'
          },
          {
            id: 'vision-en',
            label: 'Vision Statement (English)',
            type: 'textarea',
            value: 'To be the preferred training partner in the region',
            required: true,
            placeholder: 'Enter company vision in English'
          },
          {
            id: 'vision-ar',
            label: 'Vision Statement (Arabic)',
            type: 'textarea',
            value: 'أن نكون الشريك التدريبي المفضل في المنطقة',
            required: true,
            placeholder: 'Enter company vision in Arabic'
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
      },
      services: {
        id: 'services',
        title: 'Services & Solutions',
        description: 'Consulting services, AI solutions, and service offerings',
        status: 'published',
        lastModified: '2025-01-12T14:30:00Z',
        pageKey: 'home',
        fields: [
          {
            id: 'title-en',
            label: 'Services Title (English)',
            type: 'text',
            value: 'Our Services',
            required: true,
            placeholder: 'Enter services title in English'
          },
          {
            id: 'title-ar',
            label: 'Services Title (Arabic)',
            type: 'text',
            value: 'خدماتنا',
            required: true,
            placeholder: 'Enter services title in Arabic'
          },
          {
            id: 'description-en',
            label: 'Services Description (English)',
            type: 'textarea',
            value: 'We offer comprehensive training and consultancy services',
            required: true,
            placeholder: 'Enter services description in English'
          },
          {
            id: 'description-ar',
            label: 'Services Description (Arabic)',
            type: 'textarea',
            value: 'نقدم خدمات تدريبية واستشارية شاملة',
            required: true,
            placeholder: 'Enter services description in Arabic'
          }
        ]
      },
      contact: {
        id: 'contact',
        title: 'Contact Information',
        description: 'Contact details and location with bilingual content',
        status: 'published',
        lastModified: '2025-01-13T09:20:00Z',
        pageKey: 'contact',
        fields: [
          {
            id: 'title-en',
            label: 'Contact Title (English)',
            type: 'text',
            value: 'Get in Touch',
            required: true,
            placeholder: 'Enter contact title in English'
          },
          {
            id: 'title-ar',
            label: 'Contact Title (Arabic)',
            type: 'text',
            value: 'تواصل معنا',
            required: true,
            placeholder: 'Enter contact title in Arabic'
          },
          {
            id: 'address-en',
            label: 'Address (English)',
            type: 'text',
            value: 'Riyadh, Saudi Arabia',
            required: true,
            placeholder: 'Enter address in English'
          },
          {
            id: 'address-ar',
            label: 'Address (Arabic)',
            type: 'text',
            value: 'الرياض، المملكة العربية السعودية',
            required: true,
            placeholder: 'Enter address in Arabic'
          },
          {
            id: 'phone',
            label: 'Phone Number',
            type: 'text',
            value: '+966 XX XXX XXXX',
            required: true,
            placeholder: 'Enter phone number'
          },
          {
            id: 'email',
            label: 'Email Address',
            type: 'text',
            value: 'info@ersatraining.com',
            required: true,
            placeholder: 'Enter email address'
          }
        ]
      },
      faq: {
        id: 'faq',
        title: 'FAQ Section',
        description: 'Frequently asked questions with bilingual content',
        status: 'published',
        lastModified: '2025-01-13T09:20:00Z',
        pageKey: 'faq',
        fields: [
          {
            id: 'faq-title-en',
            label: 'FAQ Title (English)',
            type: 'text',
            value: 'Frequently Asked Questions',
            required: true,
            placeholder: 'Enter FAQ title in English'
          },
          {
            id: 'faq-title-ar',
            label: 'FAQ Title (Arabic)',
            type: 'text',
            value: 'الأسئلة الشائعة',
            required: true,
            placeholder: 'Enter FAQ title in Arabic'
          },
          {
            id: 'faqs',
            label: 'FAQ Items',
            type: 'array',
            value: [
              { 
                question: 'How do I enroll in a course?', 
                answer: 'You can enroll through our website or contact us directly.',
                questionAr: 'كيف يمكنني التسجيل في دورة؟',
                answerAr: 'يمكنك التسجيل من خلال موقعنا الإلكتروني أو التواصل معنا مباشرة.'
              },
              { 
                question: 'What payment methods do you accept?', 
                answer: 'We accept credit cards, bank transfers, and online payments.',
                questionAr: 'ما هي طرق الدفع المقبولة؟',
                answerAr: 'نقبل بطاقات الائتمان والتحويلات البنكية والمدفوعات الإلكترونية.'
              },
              { 
                question: 'Do you offer certificates?', 
                answer: 'Yes, we provide certificates of completion for all our courses.',
                questionAr: 'هل تقدمون شهادات؟',
                answerAr: 'نعم، نقدم شهادات إتمام لجميع دوراتنا.'
              }
            ],
            required: true
          }
        ]
      },
      consultation: {
        id: 'consultation',
        title: 'Consultation Services',
        description: 'Consultation offerings and service details',
        status: 'published',
        lastModified: '2025-01-09T13:20:00Z',
        pageKey: 'home',
        fields: [
          {
            id: 'title-en',
            label: 'Consultation Title (English)',
            type: 'text',
            value: 'Consultation Services',
            required: true,
            placeholder: 'Enter consultation title in English'
          },
          {
            id: 'title-ar',
            label: 'Consultation Title (Arabic)',
            type: 'text',
            value: 'خدمات الاستشارة',
            required: true,
            placeholder: 'Enter consultation title in Arabic'
          },
          {
            id: 'description-en',
            label: 'Consultation Description (English)',
            type: 'textarea',
            value: 'Professional consultation services tailored to your needs',
            required: true,
            placeholder: 'Enter consultation description in English'
          },
          {
            id: 'description-ar',
            label: 'Consultation Description (Arabic)',
            type: 'textarea',
            value: 'خدمات استشارية مهنية مصممة خصيصاً لاحتياجاتك',
            required: true,
            placeholder: 'Enter consultation description in Arabic'
          }
        ]
      }
    };
  }
}

export const contentApi = new ContentAPI();
export default contentApi;


