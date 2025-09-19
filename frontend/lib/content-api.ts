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
            // Handle bilingual fields - flatten the structure for backend
            if (field.value && typeof field.value === 'object' && field.value.en !== undefined && field.value.ar !== undefined) {
              // For bilingual fields, store both languages
              transformedContent[field.id] = field.value;
            } else {
              // For regular fields, store as-is
              transformedContent[field.id] = field.value;
            }
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
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ ContentAPI: Update successful:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating section content:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // If it's an authentication error, throw it
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Authentication required');
      }
      
      // If it's a bad request, throw the specific error
      if (error.response?.status === 400) {
        throw new Error(`Bad Request: ${error.response?.data?.error || error.message}`);
      }
      
      // If section not found
      if (error.response?.status === 404) {
        throw new Error(`Section not found: ${sectionId}`);
      }
      
      // For server errors, throw them
      if (error.response?.status >= 500) {
        throw new Error(`Server Error: ${error.response?.data?.error || error.message}`);
      }
      
      // For network errors, throw them instead of falling back to mock
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.code === 'ECONNREFUSED') {
        throw new Error('Network Error: Unable to connect to server. Please check your connection and try again.');
      }
      
      // For any other error, throw it
      throw new Error(`Update failed: ${error.message}`);
    }
  }

  // Publish content section
  async publishSection(sectionId: string): Promise<ContentSection> {
    try {
      const response = await axios.post(`${this.baseURL}/content/sections/${sectionId}/publish`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error publishing section:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // If it's an authentication error, throw it
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Authentication required');
      }
      
      // If it's a bad request, throw the specific error
      if (error.response?.status === 400) {
        throw new Error(`Bad Request: ${error.response?.data?.error || error.message}`);
      }
      
      // If section not found
      if (error.response?.status === 404) {
        throw new Error(`Section not found: ${sectionId}`);
      }
      
      // For server errors, throw them
      if (error.response?.status >= 500) {
        throw new Error(`Server Error: ${error.response?.data?.error || error.message}`);
      }
      
      // For network errors, throw them
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.code === 'ECONNREFUSED') {
        throw new Error('Network Error: Unable to connect to server. Please check your connection and try again.');
      }
      
      // For any other error, throw it
      throw new Error(`Publish failed: ${error.message}`);
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
        const processedFields = this.transformFieldsToOptimizedStructure(templateData.fields || [], sectionKey);
        
        templates[sectionKey] = {
          id: templateData.id, // Use the actual GUID from backend
          title: templateData.title,
          description: templateData.description,
          fields: processedFields,
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
      console.log('🔄 ContentAPI: Initializing sample data...');
      const response = await axios.post(`${this.baseURL}/content/admin/initialize-sample-data`, {}, {
        timeout: 30000, // 30 seconds timeout for initialization
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ ContentAPI: Sample data initialized successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error initializing sample data:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // If it's an authentication error, throw it
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Authentication required');
      }
      
      // For other errors, provide more specific messages
      if (error.response?.status >= 400) {
        throw new Error(`Failed to initialize sample data: ${error.response?.data?.error || error.message}`);
      }
      
      throw error;
    }
  }

  // Get database status
  async getDatabaseStatus(): Promise<any> {
    try {
      console.log('🔄 ContentAPI: Checking database status...');
      const response = await axios.get(`${this.baseURL}/content/admin/database-status`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ ContentAPI: Database status retrieved');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting database status:', error);
      
      // If it's an authentication error, throw it
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Authentication required');
      }
      
      throw error;
    }
  }

  // Reinitialize sample data
  async reinitializeSampleData(): Promise<void> {
    try {
      console.log('🔄 ContentAPI: Reinitializing sample data...');
      const response = await axios.post(`${this.baseURL}/content/admin/reinitialize-sample-data`, {}, {
        timeout: 30000, // 30 seconds timeout for reinitialization
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ ContentAPI: Sample data reinitialized successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error reinitializing sample data:', error);
      
      // If it's an authentication error, throw it
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Authentication required');
      }
      
      throw error;
    }
  }

  // Transform fields from backend format to optimized bilingual structure
  private transformFieldsToOptimizedStructure(fields: ContentField[], sectionKey: string): ContentField[] {
    const transformedFields = fields.map(field => {
      // Special handling for old team field in about section - convert to separate English/Arabic fields
      if (sectionKey === 'about' && field.id === 'team' && field.type === 'array') {
        console.log('🔄 Transforming old team field to separate English/Arabic fields:', field.value);
        
        // Check if team members are in old format (Arabic only) or bilingual format
        if (field.value && field.value.length > 0) {
          const firstMember = field.value[0];
          const isAlreadyBilingual = firstMember.name && typeof firstMember.name === 'object' && firstMember.name.en !== undefined;
          
          if (isAlreadyBilingual) {
            // Convert bilingual format to separate fields
            console.log('🔄 Converting bilingual team format to separate fields');
            const englishTeam = field.value.map((member: any) => ({
              name: member.name.en || member.name,
              position: member.position.en || member.position,
              bio: member.bio.en || member.bio
            }));
            
            const arabicTeam = field.value.map((member: any) => ({
              name: member.name.ar || member.name,
              position: member.position.ar || member.position,
              bio: member.bio.ar || member.bio
            }));
            
            // Return both English and Arabic fields
            return [
              {
                id: 'team-members-en',
                label: 'Team Members (English)',
                type: 'array' as const,
                value: englishTeam,
                required: false
              },
              {
                id: 'team-members-ar',
                label: 'Team Members (Arabic)',
                type: 'array' as const,
                value: arabicTeam,
                required: false
              }
            ];
          } else {
            // Convert old Arabic-only format to separate fields
            console.log('🔄 Converting Arabic-only team format to separate fields');
            const englishTeam = field.value.map((member: any) => ({
              name: this.getEnglishEquivalent(member.name) || member.name,
              position: this.getEnglishEquivalent(member.position) || member.position,
              bio: this.getEnglishEquivalent(member.bio) || member.bio
            }));
            
            // Return both English and Arabic fields
            return [
              {
                id: 'team-members-en',
                label: 'Team Members (English)',
                type: 'array' as const,
                value: englishTeam,
                required: false
              },
              {
                id: 'team-members-ar',
                label: 'Team Members (Arabic)',
                type: 'array' as const,
                value: field.value, // Keep original Arabic data
                required: false
              }
            ];
          }
        }
      }
      
      return field;
    });
    
    // Flatten the array in case we returned multiple fields for team
    return transformedFields.flat();
  }

  // Get English equivalent for Arabic text (fallback mapping)
  private getEnglishEquivalent(arabicText: string): string {
    const translations: Record<string, string> = {
      'أحمد محمد': 'Ahmed Mohammed',
      'فاطمة علي': 'Fatima Ali',
      'المدير التنفيذي': 'Chief Executive Officer',
      'مدير التدريب': 'Training Manager',
      'خبرة 15 عام في التدريب': '15 years of experience in training',
      'خبرة 10 أعوام في تطوير المناهج': '10 years of experience in curriculum development'
    };
    
    return translations[arabicText] || arabicText;
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
              { 
                title: { en: 'Advanced Courses', ar: 'دورات متقدمة' }, 
                description: { en: 'Latest technologies and methodologies', ar: 'أحدث التقنيات والمناهج' }
              },
              { 
                title: { en: 'Expert Trainers', ar: 'مدربون خبراء' }, 
                description: { en: 'Extensive experience in the field', ar: 'خبرة واسعة في المجال' }
              },
              { 
                title: { en: 'Continuous Support', ar: 'دعم متواصل' }, 
                description: { en: '24/7 assistance available', ar: 'مساعدة على مدار الساعة' }
              }
            ],
            required: true
          },
          {
            id: 'testimonials',
            label: 'Testimonials',
            type: 'array',
            value: [
              { 
                name: { en: 'Ahmed Ali', ar: 'أحمد علي' }, 
                role: { en: 'Student', ar: 'طالب' }, 
                text: { en: 'Excellent training experience', ar: 'تجربة تدريبية ممتازة' }
              },
              { 
                name: { en: 'Sarah Johnson', ar: 'سارة جونسون' }, 
                role: { en: 'Manager', ar: 'مدير' }, 
                text: { en: 'Professional and effective', ar: 'مهني وفعال' }
              }
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
            id: 'page-title',
            label: 'Page Title',
            type: 'text',
            value: {
              en: 'Our Courses',
              ar: 'دوراتنا'
            },
            required: true,
            placeholder: 'Enter page title'
          },
          {
            id: 'page-description',
            label: 'Page Description',
            type: 'textarea',
            value: {
              en: 'Discover our comprehensive collection of professional development courses',
              ar: 'اكتشف مجموعتنا الشاملة من دورات التطوير المهني'
            },
            required: true,
            placeholder: 'Enter page description'
          },
          {
            id: 'categories',
            label: 'Course Categories',
            type: 'array',
            value: [
              { 
                name: { en: 'Graphic Design', ar: 'التصميم الجرافيكي' }, 
                description: { en: 'Professional design courses', ar: 'دورات تصميم احترافية' }
              },
              { 
                name: { en: 'Web Development', ar: 'تطوير الويب' }, 
                description: { en: 'Modern development skills', ar: 'مهارات تطوير حديثة' }
              },
              { 
                name: { en: 'Digital Marketing', ar: 'التسويق الرقمي' }, 
                description: { en: 'Marketing strategies and tools', ar: 'استراتيجيات وأدوات التسويق' }
              }
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
            id: 'company-name',
            label: 'Company Name',
            type: 'text',
            value: {
              en: 'Ersa Training',
              ar: 'إرساء للتدريب'
            },
            required: true,
            placeholder: 'Enter company name'
          },
          {
            id: 'mission-statement',
            label: 'Mission Statement',
            type: 'textarea',
            value: {
              en: 'Empowering individuals and organizations through world-class training solutions',
              ar: 'تمكين الأفراد والمنظمات من خلال حلول تدريبية عالمية المستوى'
            },
            required: true,
            placeholder: 'Enter company mission'
          },
          {
            id: 'vision-statement',
            label: 'Vision Statement',
            type: 'textarea',
            value: {
              en: 'To be the preferred training partner in the region',
              ar: 'أن نكون الشريك التدريبي المفضل في المنطقة'
            },
            required: true,
            placeholder: 'Enter company vision'
          },
          {
            id: 'team-members-en',
            label: 'Team Members (English)',
            type: 'array',
            value: [
              { 
                name: 'Ahmed Mohammed', 
                position: 'Chief Executive Officer', 
                bio: '15 years of experience in training'
              },
              { 
                name: 'Fatima Ali', 
                position: 'Training Manager', 
                bio: '10 years of experience in curriculum development'
              }
            ],
            required: false
          },
          {
            id: 'team-members-ar',
            label: 'Team Members (Arabic)',
            type: 'array',
            value: [
              { 
                name: 'أحمد محمد', 
                position: 'المدير التنفيذي', 
                bio: 'خبرة 15 عام في التدريب'
              },
              { 
                name: 'فاطمة علي', 
                position: 'مدير التدريب', 
                bio: 'خبرة 10 أعوام في تطوير المناهج'
              }
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
            id: 'services-title',
            label: 'Services Title',
            type: 'text',
            value: {
              en: 'Our Services',
              ar: 'خدماتنا'
            },
            required: true,
            placeholder: 'Enter services title'
          },
          {
            id: 'services-description',
            label: 'Services Description',
            type: 'textarea',
            value: {
              en: 'We offer comprehensive training and consultancy services',
              ar: 'نقدم خدمات تدريبية واستشارية شاملة'
            },
            required: true,
            placeholder: 'Enter services description'
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
            id: 'contact-title',
            label: 'Contact Title',
            type: 'text',
            value: {
              en: 'Get in Touch',
              ar: 'تواصل معنا'
            },
            required: true,
            placeholder: 'Enter contact title'
          },
          {
            id: 'address',
            label: 'Address',
            type: 'text',
            value: {
              en: 'Riyadh, Saudi Arabia',
              ar: 'الرياض، المملكة العربية السعودية'
            },
            required: true,
            placeholder: 'Enter address'
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
            id: 'faq-title',
            label: 'FAQ Title',
            type: 'text',
            value: {
              en: 'Frequently Asked Questions',
              ar: 'الأسئلة الشائعة'
            },
            required: true,
            placeholder: 'Enter FAQ title'
          },
          {
            id: 'faq-items',
            label: 'FAQ Items',
            type: 'array',
            value: [
              { 
                question: { en: 'How do I enroll in a course?', ar: 'كيف يمكنني التسجيل في دورة؟' },
                answer: { en: 'You can enroll through our website or contact us directly.', ar: 'يمكنك التسجيل من خلال موقعنا الإلكتروني أو التواصل معنا مباشرة.' }
              },
              { 
                question: { en: 'What payment methods do you accept?', ar: 'ما هي طرق الدفع المقبولة؟' },
                answer: { en: 'We accept credit cards, bank transfers, and online payments.', ar: 'نقبل بطاقات الائتمان والتحويلات البنكية والمدفوعات الإلكترونية.' }
              },
              { 
                question: { en: 'Do you offer certificates?', ar: 'هل تقدمون شهادات؟' },
                answer: { en: 'Yes, we provide certificates of completion for all our courses.', ar: 'نعم، نقدم شهادات إتمام لجميع دوراتنا.' }
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
            id: 'consultation-title',
            label: 'Consultation Title',
            type: 'text',
            value: {
              en: 'Consultation Services',
              ar: 'خدمات الاستشارة'
            },
            required: true,
            placeholder: 'Enter consultation title'
          },
          {
            id: 'consultation-description',
            label: 'Consultation Description',
            type: 'textarea',
            value: {
              en: 'Professional consultation services tailored to your needs',
              ar: 'خدمات استشارية مهنية مصممة خصيصاً لاحتياجاتك'
            },
            required: true,
            placeholder: 'Enter consultation description'
          }
        ]
      }
    };
  }
}

export const contentApi = new ContentAPI();
export default contentApi;
