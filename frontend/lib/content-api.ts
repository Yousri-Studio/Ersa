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
    // On server-side, use absolute backend URL; on client, use proxy if configured
    if (typeof window === 'undefined') {
      // Server-side: use direct backend URL
      let serverBaseURL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
      // Ensure it ends with /api if it's a direct backend URL (not a proxy)
      if (serverBaseURL.startsWith('http') && !serverBaseURL.includes('/api/proxy')) {
        if (!serverBaseURL.endsWith('/api') && !serverBaseURL.endsWith('/api/')) {
          serverBaseURL = serverBaseURL.endsWith('/') ? `${serverBaseURL}api` : `${serverBaseURL}/api`;
        }
      }
      this.baseURL = serverBaseURL;
      console.log(`🔧 ContentAPI constructor (server): baseURL=${this.baseURL}`);
    } else {
      // Client-side: use proxy URL if configured, otherwise direct backend URL
      const clientBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
      // If it's a relative URL (proxy), we'll handle it in the get method
      this.baseURL = clientBaseURL;
      console.log(`🔧 ContentAPI constructor (client): baseURL=${this.baseURL}`);
    }
    
    // Only set up interceptors on client-side (browser)
    if (typeof window !== 'undefined') {
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
  }
  // Get About page content from database
  async getAboutContent(locale: string = 'en') {
    try {
      // Fetch data from the correct API endpoint
      console.log('🔄 Fetching about content from API...');
      const response = await this.get<any>(`/content/templates`);
      
      console.log('📦 API Response:', response);
      
      // The response is an object with section keys, not an array
      const sectionsData = response.data;
      console.log('📋 Available sections:', Object.keys(sectionsData));
      
      // Get the about section directly from the object
      const aboutSection = sectionsData.about;
      
      if (!aboutSection) {
        console.warn('❌ About section not found in templates, using default content');
        console.log('Available section keys:', Object.keys(sectionsData));
        return this.getDefaultAboutContent(locale);
      }
      
      console.log('✅ Found about section:', aboutSection);
      console.log('📝 Available fields:', aboutSection.fields?.map((f: any) => f.id || f.key));

      // Helper function to get bilingual field value
      // Note: Fields are transformed to separate -en/-ar fields by transformFieldsToOptimizedStructure
      const getBilingualField = (baseKey: string, defaultValue: string = ''): string => {
        // First check for separate en/ar fields (after transformation)
        const enField = aboutSection.fields.find((f: any) => f.id === `${baseKey}-en`);
        const arField = aboutSection.fields.find((f: any) => f.id === `${baseKey}-ar`);
        
        if (locale === 'ar' && arField) {
          return arField.value || defaultValue;
        }
        if (enField) {
          return enField.value || defaultValue;
        }
        
        // Fallback: check for original bilingual object field (before transformation)
        const field = aboutSection.fields.find((f: any) => f.id === baseKey);
        if (field) {
          // Handle bilingual object structure {en: "...", ar: "..."}
          if (field.value && typeof field.value === 'object' && (field.value.en !== undefined || field.value.ar !== undefined)) {
            return field.value[locale] || field.value.en || field.value.ar || defaultValue;
          }
          // Handle regular string value
          return field.value || defaultValue;
        }
        
        return defaultValue;
      };

      // Helper function to get field value (for backward compatibility)
      const getFieldValue = (key: string, defaultValue: string = ''): string => {
        return getBilingualField(key, defaultValue);
      };

      // Return the transformed data structure
      return {
        title: getBilingualField('company-name', 
          locale === 'ar' ? 'من نحن' : 'About Us'),
        
        subtitle: getBilingualField('content', 
          locale === 'ar' 
            ? 'شركة محلية وخبرات عالمية تعمل على تقديم حلول تدريبية متخصصة وخدمات استشارية إدارية مبتكرة، وبأعلى معايير الجودة، وأفضل الممارسات؛ لتعزيز كفاءة المنظمات، وتحقيق أهدافها الاستراتيجية بفاعلية.'
            : 'A local company with global expertise that provides specialized training solutions and innovative management consulting services, with the highest quality standards and best practices, to enhance the efficiency of organizations and effectively achieve their strategic goals.'
        ),

        vision: {
          title: locale === 'ar' ? 'رؤيتنا' : 'Our Vision',
          description: getFieldValue('vision-statement',
            locale === 'ar' 
              ? 'أن نصبـح الشريـك الأول للمنظمـــــات فــي تحقيــق التميـــز المستـــدام.'
              : 'To become the first partner of organizations in achieving sustainable excellence.')
        },
        
        mission: {
          title: locale === 'ar' ? 'مهمتنا' : 'Our Mission',
          description: getFieldValue('mission-statement',
            locale === 'ar'
              ? 'تمكيـــن المنظمــــات وتطويــــر الكفــــاءات لتحقيـــق أقصى إمكاناتهـــا والوصــــول إلــى الأهـداف الاستراتيجيــة بفعاليـة وكفــاءة.'
              : 'Empowering organizations and developing competencies to achieve their maximum potential and reach strategic goals effectively and efficiently.')
        },
        
        values: [
          {
            title: locale === 'ar' ? 'التميز' : 'Excellence',
            description: locale === 'ar'
              ? 'نسعى للتميز في كل ما نقوم به'
              : 'We strive for excellence in everything we do'
          },
          {
            title: locale === 'ar' ? 'الابتكار' : 'Innovation',
            description: locale === 'ar'
              ? 'نعتمد الابتكار في مناهجنا التعليمية'
              : 'We embrace innovation in our teaching methodologies'
          },
          {
            title: locale === 'ar' ? 'النزاهة' : 'Integrity',
            description: locale === 'ar'
              ? 'نتميز بأعلى معايير النزاهة والاحترافية'
              : 'We maintain the highest standards of integrity and professionalism'
          }
        ],
        
        team: {
          title: locale === 'ar' ? 'فريقنا' : 'Our Team',
          members: (() => {
            const teamField = aboutSection.fields.find((f: any) => (f.id === 'team' || f.key === 'team'));
            if (teamField && teamField.value && Array.isArray(teamField.value)) {
              return teamField.value.map((member: any, index: number) => ({
                name: locale === 'ar' ? (member.nameAr || member.name) : (member.name || member.nameEn),
                position: locale === 'ar' ? (member.positionAr || member.position) : (member.position || member.positionEn),
                bio: locale === 'ar' ? (member.bioAr || member.bio) : (member.bio || member.bioEn),
                image: member.image || `/images/team/team-${index + 1}.png`
              }));
            }
            // Fallback to default team members
            return [
              {
                name: locale === 'ar' ? 'أحمد محمد' : 'John Doe',
                position: locale === 'ar' ? 'المدير التنفيذي' : 'CEO',
                bio: locale === 'ar'
                  ? 'أكثر من 15 عامًا من الخبرة في مجال التدريب'
                  : 'Over 15 years of experience in training',
                image: '/images/team/team-1.png'
              },
              {
                name: locale === 'ar' ? 'سارة أحمد' : 'Jane Smith',
                position: locale === 'ar' ? 'مدربة رئيسية' : 'Lead Trainer',
                bio: locale === 'ar'
                  ? 'متخصصة في التطوير المهني والقيادة'
                  : 'Specialized in professional development and leadership',
                image: '/images/team/team-2.png'
              },
              {
                name: locale === 'ar' ? 'علي خالد' : 'Ahmed Ali',
                position: locale === 'ar' ? 'مدرب تقني' : 'Technical Instructor',
                bio: locale === 'ar'
                  ? 'خبير في التدريب التقني والتكنولوجيا الحديثة'
                  : 'Expert in technical training and modern technologies',
                image: '/images/team/team-3.png'
              }
            ];
          })()
        }
      };

    } catch (error) {
      console.error('❌ Error fetching about content:', error);
      console.error('🔄 Falling back to default content');
      // Return default content in case of error
      return this.getDefaultAboutContent(locale);
    }
  }

  // Add the getDefaultAboutContent method
  private getDefaultAboutContent(locale: string) {
    return {
      title: locale === 'ar' ? 'من نحن' : 'About Us',
      subtitle: locale === 'ar' ? 'تعرف على مهمتنا وقيمنا' : 'Learn more about our mission and values',
      vision: {
        title: locale === 'ar' ? 'رؤيتنا' : 'Our Vision',
        description: locale === 'ar' 
          ? 'أن نكون مزود التدريب الرائد في المنطقة'
          : 'To be the leading training provider in the region'
      },
      mission: {
        title: locale === 'ar' ? 'مهمتنا' : 'Our Mission',
        description: locale === 'ar' 
          ? 'تمكين الأفراد والمنظمات من خلال برامج التدريب والتطوير عالية الجودة'
          : 'To empower individuals and organizations through high-quality training and development programs'
      },
      values: [
        {
          title: locale === 'ar' ? 'التميز' : 'Excellence',
          description: locale === 'ar' 
            ? 'نسعى للتميز في كل ما نقوم به'
            : 'We strive for excellence in everything we do'
        },
        {
          title: locale === 'ar' ? 'الابتكار' : 'Innovation',
          description: locale === 'ar' 
            ? 'نعتمد الابتكار في مناهجنا التعليمية'
            : 'We embrace innovation in our teaching methodologies'
        },
        {
          title: locale === 'ar' ? 'النزاهة' : 'Integrity',
          description: locale === 'ar' 
            ? 'نتميز بأعلى معايير النزاهة والاحترافية'
            : 'We maintain the highest standards of integrity and professionalism'
        }
      ],
      team: {
        title: locale === 'ar' ? 'فريقنا' : 'Our Team',
        members: [
          {
            name: locale === 'ar' ? 'أحمد محمد' : 'John Doe',
            position: locale === 'ar' ? 'المدير التنفيذي' : 'CEO',
            bio: locale === 'ar' 
              ? 'أكثر من 15 عامًا من الخبرة في مجال التدريب'
              : 'Over 15 years of experience in training',
            image: '/images/team/team-1.png'
          },
          {
            name: locale === 'ar' ? 'سارة أحمد' : 'Jane Smith',
            position: locale === 'ar' ? 'مدربة رئيسية' : 'Lead Trainer',
            bio: locale === 'ar' 
              ? 'متخصصة في التطوير المهني والقيادة'
              : 'Specialized in professional development and leadership',
            image: '/images/team/team-2.png'
          },
          {
            name: locale === 'ar' ? 'علي خالد' : 'Ahmed Ali',
            position: locale === 'ar' ? 'مدرب تقني' : 'Technical Instructor',
            bio: locale === 'ar' 
              ? 'خبير في التدريب التقني والتكنولوجيا الحديثة'
              : 'Expert in technical training and modern technologies',
            image: '/images/team/team-3.png'
          }
        ]
      }
    };
  }

  // Get Privacy page content from database
  async getPrivacyContent(locale: string = 'en') {
    try {
      console.log('🔄 Fetching privacy content from API...');
      const templates = await this.getContentTemplates();
      
      const privacySection = templates.privacy;
      
      if (!privacySection) {
        console.warn('❌ Privacy section not found in templates, using default content');
        return this.getDefaultPrivacyContent(locale);
      }

      // Helper function to get field value
      const getFieldValue = (key: string, defaultValue: string = ''): string => {
        const field = privacySection.fields.find((f: any) => f.id === key || f.key === key);
        if (!field) {
          return defaultValue;
        }
        
        // Handle bilingual content - check if value is an object with en/ar properties
        if (field.value && typeof field.value === 'object' && (field.value.en !== undefined || field.value.ar !== undefined)) {
          return field.value[locale] || field.value.en || field.value.ar || defaultValue;
        }
        
        // Handle separate English/Arabic fields (e.g., page-title-en, page-title-ar)
        if (field.id.endsWith('-en') || field.id.endsWith('-ar')) {
          return field.value || defaultValue;
        }
        
        // Handle regular content
        return field.value || defaultValue;
      };

      // Get bilingual field value
      // Note: Fields are transformed to separate -en/-ar fields by transformFieldsToOptimizedStructure
      const getBilingualField = (baseKey: string, defaultValue: string = ''): string => {
        console.log(`🔍 Looking for field: ${baseKey} in privacy section`);
        console.log(`📋 Available fields:`, privacySection.fields.map((f: any) => f.id));
        
        // First check for separate en/ar fields (after transformation)
        const enField = privacySection.fields.find((f: any) => f.id === `${baseKey}-en`);
        const arField = privacySection.fields.find((f: any) => f.id === `${baseKey}-ar`);
        
        if (locale === 'ar' && arField) {
          console.log(`✅ Found ${baseKey}-ar field:`, arField.value);
          return arField.value || defaultValue;
        }
        if (enField) {
          console.log(`✅ Found ${baseKey}-en field:`, enField.value);
          return enField.value || defaultValue;
        }
        
        // Fallback: check for original bilingual object field (before transformation)
        const field = privacySection.fields.find((f: any) => f.id === baseKey);
        if (field) {
          console.log(`✅ Found original field ${baseKey}:`, field);
          // Handle bilingual object structure {en: "...", ar: "..."}
          if (field.value && typeof field.value === 'object' && (field.value.en !== undefined || field.value.ar !== undefined)) {
            const result = field.value[locale] || field.value.en || field.value.ar || defaultValue;
            console.log(`🌐 Extracted ${locale} value from object:`, result);
            return result;
          }
          // Handle regular string value
          const result = field.value || defaultValue;
          console.log(`📝 Using string value:`, result);
          return result;
        }
        
        console.log(`❌ Field ${baseKey} not found`);
        return defaultValue;
      };

      // Format last modified date
      const formatLastUpdated = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (locale === 'ar') {
          return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
        }
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
      };

      return {
        title: getBilingualField('privacy-title', locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'),
        lastUpdated: formatLastUpdated(privacySection.lastModified),
        content: getBilingualField('privacy-content', ''),
        contact: getBilingualField('privacy-contact-info', '')
      };

    } catch (error) {
      console.error('❌ Error fetching privacy content:', error);
      console.error('🔄 Falling back to default content');
      return this.getDefaultPrivacyContent(locale);
    }
  }

  // Get Terms page content from database
  async getTermsContent(locale: string = 'en') {
    try {
      console.log('🔄 Fetching terms content from API...');
      const templates = await this.getContentTemplates();
      
      const termsSection = templates.terms;
      
      if (!termsSection) {
        console.warn('❌ Terms section not found in templates, using default content');
        return this.getDefaultTermsContent(locale);
      }

      // Helper function to get field value
      const getFieldValue = (key: string, defaultValue: string = ''): string => {
        const field = termsSection.fields.find((f: any) => f.id === key || f.key === key);
        if (!field) {
          return defaultValue;
        }
        
        // Handle bilingual content - check if value is an object with en/ar properties
        if (field.value && typeof field.value === 'object' && (field.value.en !== undefined || field.value.ar !== undefined)) {
          return field.value[locale] || field.value.en || field.value.ar || defaultValue;
        }
        
        // Handle separate English/Arabic fields (e.g., page-title-en, page-title-ar)
        if (field.id.endsWith('-en') || field.id.endsWith('-ar')) {
          return field.value || defaultValue;
        }
        
        // Handle regular content
        return field.value || defaultValue;
      };

      // Get bilingual field value
      // Note: Fields are transformed to separate -en/-ar fields by transformFieldsToOptimizedStructure
      const getBilingualField = (baseKey: string, defaultValue: string = ''): string => {
        console.log(`🔍 Looking for field: ${baseKey} in terms section`);
        console.log(`📋 Available fields:`, termsSection.fields.map((f: any) => f.id));
        
        // First check for separate en/ar fields (after transformation)
        const enField = termsSection.fields.find((f: any) => f.id === `${baseKey}-en`);
        const arField = termsSection.fields.find((f: any) => f.id === `${baseKey}-ar`);
        
        if (locale === 'ar' && arField) {
          console.log(`✅ Found ${baseKey}-ar field:`, arField.value);
          return arField.value || defaultValue;
        }
        if (enField) {
          console.log(`✅ Found ${baseKey}-en field:`, enField.value);
          return enField.value || defaultValue;
        }
        
        // Fallback: check for original bilingual object field (before transformation)
        const field = termsSection.fields.find((f: any) => f.id === baseKey);
        if (field) {
          console.log(`✅ Found original field ${baseKey}:`, field);
          // Handle bilingual object structure {en: "...", ar: "..."}
          if (field.value && typeof field.value === 'object' && (field.value.en !== undefined || field.value.ar !== undefined)) {
            const result = field.value[locale] || field.value.en || field.value.ar || defaultValue;
            console.log(`🌐 Extracted ${locale} value from object:`, result);
            return result;
          }
          // Handle regular string value
          const result = field.value || defaultValue;
          console.log(`📝 Using string value:`, result);
          return result;
        }
        
        console.log(`❌ Field ${baseKey} not found`);
        return defaultValue;
      };

      // Format last modified date
      const formatLastUpdated = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (locale === 'ar') {
          return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
        }
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
      };

      return {
        title: getBilingualField('terms-title', locale === 'ar' ? 'شروط الخدمة' : 'Terms of Service'),
        lastUpdated: formatLastUpdated(termsSection.lastModified),
        content: getBilingualField('terms-content', ''),
        contact: getBilingualField('terms-contact-info', '')
      };

    } catch (error) {
      console.error('❌ Error fetching terms content:', error);
      console.error('🔄 Falling back to default content');
      return this.getDefaultTermsContent(locale);
    }
  }

  // Default privacy content fallback
  private getDefaultPrivacyContent(locale: string) {
    return {
      title: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
      lastUpdated: locale === 'ar' ? 'ديسمبر 2025' : 'December 2025',
      content: '',
      contact: ''
    };
  }

  // Default terms content fallback
  private getDefaultTermsContent(locale: string) {
    return {
      title: locale === 'ar' ? 'شروط الخدمة' : 'Terms of Service',
      lastUpdated: locale === 'ar' ? 'يناير 2025' : 'January 2025',
      content: '',
      contact: ''
    };
  }

 // Add the get method if it doesn't exist
  async get<T>(url: string): Promise<{ data: T }> {
    // Ensure baseURL is set
    if (!this.baseURL) {
      if (typeof window === 'undefined') {
        // Server-side
        let serverBaseURL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
        // Ensure it ends with /api if it's a direct backend URL (not a proxy)
        if (serverBaseURL.startsWith('http') && !serverBaseURL.includes('/api/proxy')) {
          if (!serverBaseURL.endsWith('/api') && !serverBaseURL.endsWith('/api/')) {
            serverBaseURL = serverBaseURL.endsWith('/') ? `${serverBaseURL}api` : `${serverBaseURL}/api`;
          }
        }
        this.baseURL = serverBaseURL;
      } else {
        // Client-side
        this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
      }
    }
    
    // Handle proxy URL format for client-side
    let fullUrl: string;
    if (url.startsWith('http')) {
      fullUrl = url;
    } else if (this.baseURL.includes('/api/proxy?endpoint=')) {
      // Client-side proxy format
      const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
      fullUrl = `${this.baseURL}${cleanUrl}`;
    } else {
      // Direct backend URL - ensure proper path construction
      const cleanUrl = url.startsWith('/') ? url : '/' + url;
      fullUrl = `${this.baseURL}${cleanUrl}`;
    }
    
    // Log for debugging
    console.log(`🔗 ContentAPI.get: baseURL=${this.baseURL}, url=${url}, fullUrl=${fullUrl}`);
    
    // Validate URL - only if it's an absolute URL
    if (fullUrl.startsWith('http')) {
      try {
        new URL(fullUrl);
      } catch (error) {
        throw new Error(`Invalid URL: ${fullUrl}. baseURL: ${this.baseURL}, url: ${url}`);
      }
    }
    
    const response = await axios.get<T>(fullUrl);
    return { data: response.data };
  }

  // Get page content by page key
  async getPageContentByKey(pageKey: string, locale: string = 'en') {
    try {
      const response = await this.get<any>(`/api/Content/pages/${pageKey}`);
      
      // Transform the API response to match our component's expected structure
      const transformField = (key: string, defaultValue: string = '') => {
        const field = response.data.sections
          .flatMap((s: any) => s.blocks)
          .find((b: any) => b.blockKey === key);
        
        if (!field) return defaultValue;
        return locale === 'ar' ? field.contentAr || field.contentEn || defaultValue : field.contentEn || defaultValue;
      };

      if (pageKey === 'about') {
        return {
          title: transformField('about-title', locale === 'ar' ? 'من نحن' : 'About Us'),
          subtitle: transformField('about-subtitle', locale === 'ar' ? 'تعرف على مهمتنا وقيمنا' : 'Learn more about our mission and values'),
          vision: {
            title: transformField('about-vision-title', locale === 'ar' ? 'رؤيتنا' : 'Our Vision'),
            description: transformField('about-vision-desc', 
              locale === 'ar' 
                ? 'أن نكون مزود التدريب الرائد في المنطقة' 
                : 'To be the leading training provider in the region'
            )
          },
          mission: {
            title: transformField('about-mission-title', locale === 'ar' ? 'مهمتنا' : 'Our Mission'),
            description: transformField('about-mission-desc',
              locale === 'ar'
                ? 'تمكين الأفراد والمنظمات من خلال برامج التدريب والتطوير عالية الجودة'
                : 'To empower individuals and organizations through high-quality training and development programs'
            )
          },
          values: [
            {
              title: transformField('about-value1-title', locale === 'ar' ? 'التميز' : 'Excellence'),
              description: transformField('about-value1-desc',
                locale === 'ar'
                  ? 'نسعى للتميز في كل ما نقوم به'
                  : 'We strive for excellence in everything we do'
              )
            },
            {
              title: transformField('about-value2-title', locale === 'ar' ? 'الابتكار' : 'Innovation'),
              description: transformField('about-value2-desc',
                locale === 'ar'
                  ? 'نعتمد الابتكار في مناهجنا التعليمية'
                  : 'We embrace innovation in our teaching methodologies'
              )
            },
            {
              title: transformField('about-value3-title', locale === 'ar' ? 'النزاهة' : 'Integrity'),
              description: transformField('about-value3-desc',
                locale === 'ar'
                  ? 'نتميز بأعلى معايير النزاهة والاحترافية'
                  : 'We maintain the highest standards of integrity and professionalism'
              )
            }
          ],
          team: {
            title: transformField('about-team-title', locale === 'ar' ? 'فريقنا' : 'Our Team'),
            members: [
              {
                name: transformField('about-team1-name', locale === 'ar' ? 'أحمد محمد' : 'John Doe'),
                position: transformField('about-team1-pos', locale === 'ar' ? 'المدير التنفيذي' : 'CEO'),
                bio: transformField('about-team1-bio',
                  locale === 'ar'
                    ? 'أكثر من 15 عامًا من الخبرة في مجال التدريب'
                    : 'Over 15 years of experience in training'
                ),
                image: transformField('about-team1-img', '/images/team/team-1.png')
              },
              {
                name: transformField('about-team2-name', locale === 'ar' ? 'سارة أحمد' : 'Jane Smith'),
                position: transformField('about-team2-pos', locale === 'ar' ? 'مدربة رئيسية' : 'Lead Trainer'),
                bio: transformField('about-team2-bio',
                  locale === 'ar'
                    ? 'متخصصة في التطوير المهني والقيادة'
                    : 'Specialized in professional development and leadership'
                ),
                image: transformField('about-team2-img', '/images/team/team-2.png')
              },
              {
                name: transformField('about-team3-name', locale === 'ar' ? 'علي خالد' : 'Ahmed Ali'),
                position: transformField('about-team3-pos', locale === 'ar' ? 'مدرب تقني' : 'Technical Instructor'),
                bio: transformField('about-team3-bio',
                  locale === 'ar'
                    ? 'خبير في التدريب التقني والتكنولوجيا الحديثة'
                    : 'Expert in technical training and modern technologies'
                ),
                image: transformField('about-team3-img', '/images/team/team-3.png')
              }
            ]
          }
        };
      }

      // Return a default structure if page key doesn't match
      return {
        title: '',
        subtitle: '',
        vision: { title: '', description: '' },
        mission: { title: '', description: '' },
        values: [],
        team: { title: '', members: [] }
      };
    } catch (error) {
      console.error('Error fetching page content:', error);
      // Return default content in case of error
      return this.getDefaultAboutContent(locale);
    }
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
            // Special handling for FAQ items: split bilingual array back into separate en/ar arrays
            if (field.id === 'faq-items' && Array.isArray(field.value)) {
              console.log('🔄 Splitting faq-items back into faq-items-en and faq-items-ar');
              const bilingualItems = field.value as any[];
              
              const englishItems = bilingualItems.map((item: any) => ({
                question: item.questionEn || '',
                answer: item.answerEn || ''
              }));
              
              const arabicItems = bilingualItems.map((item: any) => ({
                question: item.questionAr || '',
                answer: item.answerAr || ''
              }));
              
              transformedContent['faq-items-en'] = englishItems;
              transformedContent['faq-items-ar'] = arabicItems;
              console.log('✅ Split FAQ items:', { englishItems, arabicItems });
            }
            // Handle separate English/Arabic fields by combining them into bilingual objects
            else if (field.id.endsWith('-en')) {
              const baseId = field.id.replace('-en', '');
              const arField = content.fields.find((f: any) => f.id === `${baseId}-ar`);
              
              if (arField) {
                // Create bilingual object for backend
                transformedContent[baseId] = {
                  en: field.value,
                  ar: arField.value
                };
              } else {
                // If no Arabic counterpart, store as English only
                transformedContent[field.id] = field.value;
              }
            } else if (field.id.endsWith('-ar')) {
              // Skip Arabic fields as they're handled with their English counterparts
              const baseId = field.id.replace('-ar', '');
              const enField = content.fields.find((f: any) => f.id === `${baseId}-en`);
              
              if (!enField) {
                // If no English counterpart, store as Arabic only
                transformedContent[field.id] = field.value;
              }
            } else if (field.id !== 'faq-items') {
              // For regular fields (non-bilingual and not faq-items), store as-is
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
      
      // Transform the response to match the frontend format (merge faq-items if needed)
      return this.transformResponseFields(response.data);
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

  // Helper function to transform response fields
  private transformResponseFields(responseData: any): any {
    if (responseData.fields && Array.isArray(responseData.fields)) {
      // Use sectionKey from response, or fallback to inferring from pageKey/title
      let sectionKeyFromResponse = responseData.sectionKey || '';
      
      if (!sectionKeyFromResponse && responseData.pageKey) {
        // Try to match pageKey to section keys we know
        const pageKeyMap: Record<string, string> = {
          'home': 'hero',
          'about': 'about',
          'faq': 'faq',
          'contact': 'contact',
          'courses': 'courses'
        };
        sectionKeyFromResponse = pageKeyMap[responseData.pageKey] || '';
      }
      
      // If we still can't determine, try to infer from title
      if (!sectionKeyFromResponse && responseData.title) {
        const titleLower = responseData.title.toLowerCase();
        if (titleLower.includes('faq') || titleLower.includes('question')) {
          sectionKeyFromResponse = 'faq';
        } else if (titleLower.includes('about')) {
          sectionKeyFromResponse = 'about';
        } else if (titleLower.includes('hero') || titleLower.includes('home')) {
          sectionKeyFromResponse = 'hero';
        } else if (titleLower.includes('contact')) {
          sectionKeyFromResponse = 'contact';
        } else if (titleLower.includes('course')) {
          sectionKeyFromResponse = 'courses';
        }
      }
      
      if (sectionKeyFromResponse) {
        console.log('🔄 Transforming response fields for section:', sectionKeyFromResponse);
        // Transform the fields
        const transformedFields = this.transformFieldsToOptimizedStructure(
          responseData.fields,
          sectionKeyFromResponse
        );
        
        return {
          ...responseData,
          fields: transformedFields
        };
      }
    }
    
    return responseData;
  }

  // Publish content section
  async publishSection(sectionId: string): Promise<ContentSection> {
    try {
      const response = await axios.post(`${this.baseURL}/content/sections/${sectionId}/publish`);
      return this.transformResponseFields(response.data);
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
    // First, handle FAQ section: merge faq-items-en and faq-items-ar into single bilingual array
    if (sectionKey === 'faq') {
      const faqItemsEnField = fields.find(f => f.id === 'faq-items-en');
      const faqItemsArField = fields.find(f => f.id === 'faq-items-ar');
      
      if (faqItemsEnField && faqItemsArField && faqItemsEnField.type === 'array' && faqItemsArField.type === 'array') {
        console.log('🔄 Merging faq-items-en and faq-items-ar into single bilingual array');
        
        const englishItems = (faqItemsEnField.value as any[]) || [];
        const arabicItems = (faqItemsArField.value as any[]) || [];
        const maxLength = Math.max(englishItems.length, arabicItems.length);
        
        // Merge into bilingual structure
        const bilingualItems = Array.from({ length: maxLength }, (_, index) => ({
          questionEn: englishItems[index]?.question || '',
          questionAr: arabicItems[index]?.question || '',
          answerEn: englishItems[index]?.answer || '',
          answerAr: arabicItems[index]?.answer || ''
        }));
        
        console.log('✅ Merged FAQ items:', bilingualItems);
        
        // Remove the separate en/ar fields and add merged field
        const otherFields = fields.filter(f => f.id !== 'faq-items-en' && f.id !== 'faq-items-ar');
        
        return [
          ...otherFields,
          {
            id: 'faq-items',
            label: 'FAQ Items',
            type: 'array' as const,
            value: bilingualItems,
            required: faqItemsEnField.required || faqItemsArField.required
          }
        ];
      }
    }
    
    const transformedFields = fields.map(field => {
      // Transform any bilingual object fields to separate English/Arabic fields
      if (field.value && typeof field.value === 'object' && field.value.en !== undefined && field.value.ar !== undefined) {
        console.log(`🔄 Transforming bilingual field ${field.id} to separate fields`);
        return [
          {
            id: `${field.id}-en`,
            label: `${field.label} (English)`,
            type: field.type,
            value: field.value.en,
            required: field.required,
            placeholder: `${field.placeholder || 'Enter ' + field.label.toLowerCase()} in English`
          },
          {
            id: `${field.id}-ar`,
            label: `${field.label} (Arabic)`,
            type: field.type,
            value: field.value.ar,
            required: field.required,
            placeholder: `${field.placeholder || 'Enter ' + field.label.toLowerCase()} in Arabic`
          }
        ];
      }
      
      // Special handling for consultation section - ensure it has proper structure
      if (sectionKey === 'consultation' && field.value && typeof field.value === 'string') {
        console.log(`🔄 Ensuring consultation field ${field.id} has proper structure`);
        // If it's a simple string field, keep it as is
        return field;
      }
      
      // Special handling for arrays that should be grouped by item type (Hero section and Courses section)
      if ((sectionKey === 'hero' && (field.id === 'features' || field.id === 'testimonials')) || 
          (sectionKey === 'courses' && field.id === 'categories') && field.type === 'array') {
        console.log(`🔄 FORCING transformation of Hero ${field.id} to bilingual items:`, field.value);
        
        if (field.id === 'features') {
          const bilingualFeatures = [
            { 
              titleEn: 'Advanced Courses',
              titleAr: 'دورات متقدمة',
              descriptionEn: 'Latest technologies and methodologies',
              descriptionAr: 'أحدث التقنيات والمناهج'
            },
            { 
              titleEn: 'Expert Trainers',
              titleAr: 'مدربون خبراء', 
              descriptionEn: 'Extensive experience in the field',
              descriptionAr: 'خبرة واسعة في المجال'
            },
            { 
              titleEn: 'Continuous Support',
              titleAr: 'دعم متواصل',
              descriptionEn: '24/7 assistance available',
              descriptionAr: 'مساعدة على مدار الساعة'
            }
          ];
          
          return {
            id: 'features',
            label: 'Features',
            type: 'array' as const,
            value: bilingualFeatures,
            required: field.required || false
          };
        }
        
        if (field.id === 'testimonials') {
          const bilingualTestimonials = [
            { 
              nameEn: 'Ahmed Ali',
              nameAr: 'أحمد علي',
              roleEn: 'Student',
              roleAr: 'طالب',
              textEn: 'Excellent training experience',
              textAr: 'تجربة تدريبية ممتازة'
            },
            { 
              nameEn: 'Sarah Johnson',
              nameAr: 'سارة جونسون',
              roleEn: 'Manager', 
              roleAr: 'مدير',
              textEn: 'Professional and effective',
              textAr: 'مهني وفعال'
            }
          ];
          
          return {
            id: 'testimonials',
            label: 'Testimonials',
            type: 'array' as const,
            value: bilingualTestimonials,
            required: field.required || false
          };
        }
        
        if (field.id === 'categories') {
          const bilingualCategories = [
            { 
              nameEn: 'Graphic Design',
              nameAr: 'التصميم الجرافيكي',
              descriptionEn: 'Professional design courses',
              descriptionAr: 'دورات تصميم احترافية'
            },
            { 
              nameEn: 'Web Development',
              nameAr: 'تطوير الويب',
              descriptionEn: 'Modern development skills',
              descriptionAr: 'مهارات تطوير حديثة'
            },
            { 
              nameEn: 'Digital Marketing',
              nameAr: 'التسويق الرقمي',
              descriptionEn: 'Marketing strategies and tools',
              descriptionAr: 'استراتيجيات وأدوات التسويق'
            }
          ];
          
          return {
            id: 'categories',
            label: 'Course Categories',
            type: 'array' as const,
            value: bilingualCategories,
            required: field.required || false
          };
        }
      }
      
      // Special handling for old FAQ items - ALWAYS transform to separate fields
      if (sectionKey === 'faq' && (field.id === 'faq-items' || field.id === 'faqs') && field.type === 'array') {
        console.log('🔄 FORCING transformation of FAQ items to separate English/Arabic fields:', field.value);
        
        if (field.value && field.value.length > 0) {
          const firstItem = field.value[0];
          // Check if FAQ items have bilingual structure (question/answer with en/ar objects)
          const hasBilingualQuestions = firstItem.question && typeof firstItem.question === 'object' && firstItem.question.en !== undefined;
          
          if (hasBilingualQuestions) {
            console.log('🔄 Converting bilingual FAQ items to separate fields');
            const englishFAQs = field.value.map((item: any) => ({
              question: item.question.en || item.question,
              answer: item.answer.en || item.answer
            }));
            
            const arabicFAQs = field.value.map((item: any) => ({
              question: item.question.ar || item.question,
              answer: item.answer.ar || item.answer
            }));
            
            return [
              {
                id: 'faq-items-en',
                label: 'FAQ Items (English)',
                type: 'array' as const,
                value: englishFAQs,
                required: field.required
              },
              {
                id: 'faq-items-ar',
                label: 'FAQ Items (Arabic)',
                type: 'array' as const,
                value: arabicFAQs,
                required: field.required
              }
            ];
          } else {
            // Handle old Arabic-only FAQ format OR mixed format - ALWAYS create separate English/Arabic fields
            console.log('🔄 Converting FAQ items to separate fields - FORCED');
            
            // Create bilingual FAQ items grouped by item type
            const bilingualFAQs = [
              { 
                questionEn: 'How do I enroll in a course?',
                questionAr: 'كيف يمكنني التسجيل في دورة؟',
                answerEn: 'You can enroll through our website or contact us directly.',
                answerAr: 'يمكنك التسجيل من خلال موقعنا الإلكتروني أو التواصل معنا مباشرة.'
              },
              { 
                questionEn: 'What payment methods do you accept?',
                questionAr: 'ما هي طرق الدفع المقبولة؟',
                answerEn: 'We accept credit cards, bank transfers, and online payments.',
                answerAr: 'نقبل بطاقات الائتمان والتحويلات البنكية والمدفوعات الإلكترونية.'
              },
              { 
                questionEn: 'Do you offer certificates?',
                questionAr: 'هل تقدمون شهادات؟',
                answerEn: 'Yes, we provide certificates of completion for all our courses.',
                answerAr: 'نعم، نقدم شهادات إتمام لجميع دوراتنا.'
              }
            ];
            
            console.log('✅ Created bilingual FAQs:', bilingualFAQs);
            
            return {
              id: 'faq-items',
              label: 'FAQ Items',
              type: 'array' as const,
              value: bilingualFAQs,
              required: field.required || false
            };
          }
        }
      }
      
      // Special handling for team field in about section - keep as single array with bilingual fields per member
      if (sectionKey === 'about' && field.id === 'team' && field.type === 'array') {
        console.log('🔄 Processing team field with bilingual structure per member:', field.value);
        
        // Check if team members already have the correct bilingual structure (nameEn, nameAr, etc.)
        if (field.value && field.value.length > 0) {
          const firstMember = field.value[0];
          const hasCorrectStructure = firstMember.nameEn !== undefined && firstMember.nameAr !== undefined;
          
          if (hasCorrectStructure) {
            // Team members already have the correct structure, return as-is
            console.log('✅ Team members already have correct bilingual structure');
            return field;
          } else {
            // Convert old format to new bilingual structure per member
            console.log('🔄 Converting team members to bilingual structure per member');
            const bilingualTeam = field.value.map((member: any) => {
              // Handle different possible formats
              if (member.name && typeof member.name === 'object' && member.name.en !== undefined) {
                // Old bilingual object format: { name: { en: "...", ar: "..." } }
                return {
                  nameEn: member.name.en || '',
                  nameAr: member.name.ar || '',
                  positionEn: member.position?.en || '',
                  positionAr: member.position?.ar || '',
                  bioEn: member.bio?.en || '',
                  bioAr: member.bio?.ar || ''
                };
              } else {
                // Old Arabic-only format or mixed format
                return {
                  nameEn: this.getEnglishEquivalent(member.name) || member.name || '',
                  nameAr: member.name || '',
                  positionEn: this.getEnglishEquivalent(member.position) || member.position || '',
                  positionAr: member.position || '',
                  bioEn: this.getEnglishEquivalent(member.bio) || member.bio || '',
                  bioAr: member.bio || ''
                };
              }
            });
            
            return {
              ...field,
              value: bilingualTeam
            };
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

  // Get English equivalent for FAQ text (fallback mapping)
  private getEnglishEquivalentFAQ(arabicText: string): string {
    const faqTranslations: Record<string, string> = {
      'كيف يمكنني التسجيل في دورة؟': 'How do I enroll in a course?',
      'يمكنك التسجيل من خلال موقعنا الإلكتروني أو التواصل معنا مباشرة.': 'You can enroll through our website or contact us directly.',
      'ما هي طرق الدفع المقبولة؟': 'What payment methods do you accept?',
      'نقبل بطاقات الائتمان والتحويلات البنكية والمدفوعات الإلكترونية.': 'We accept credit cards, bank transfers, and online payments.',
      'هل تقدمون شهادات؟': 'Do you offer certificates?',
      'نعم، نقدم شهادات إتمام لجميع دوراتنا.': 'Yes, we provide certificates of completion for all our courses.'
    };
    
    return faqTranslations[arabicText] || arabicText;
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
            id: 'hero-badge-en',
            label: 'Hero Badge (English)',
            type: 'text',
            value: 'Ersa with you for skill development',
            required: true,
            placeholder: 'Enter hero badge text in English'
          },
          {
            id: 'hero-badge-ar',
            label: 'Hero Badge (Arabic)',
            type: 'text',
            value: 'إرساء معك لتطوير المهارات',
            required: true,
            placeholder: 'Enter hero badge text in Arabic'
          },
          {
            id: 'hero-title-en',
            label: 'Hero Title (English)',
            type: 'text',
            value: 'Explore our training platform and elevate your abilities to achieve your maximum potential',
            required: true,
            placeholder: 'Enter main hero title in English'
          },
          {
            id: 'hero-title-ar',
            label: 'Hero Title (Arabic)',
            type: 'text',
            value: 'استكشف منصتنا التدريبية وارتقي بقدراتك لتحقيق أقصى إمكاناتك',
            required: true,
            placeholder: 'Enter main hero title in Arabic'
          },
          {
            id: 'hero-description-en',
            label: 'Hero Description (English)',
            type: 'textarea',
            value: 'Build a promising future and lead your life with our interactive and comprehensive programs',
            required: true,
            placeholder: 'Enter hero description in English'
          },
          {
            id: 'hero-description-ar',
            label: 'Hero Description (Arabic)',
            type: 'textarea',
            value: 'ابن مستقبلاً واعداً وقود حياتك مع برامجنا التفاعلية والمفهمة',
            required: true,
            placeholder: 'Enter hero description in Arabic'
          },
          {
            id: 'hero-cta-primary-en',
            label: 'Primary CTA Text (English)',
            type: 'text',
            value: 'Explore Courses',
            required: true,
            placeholder: 'Enter primary button text in English'
          },
          {
            id: 'hero-cta-primary-ar',
            label: 'Primary CTA Text (Arabic)',
            type: 'text',
            value: 'استكشف الدورات',
            required: true,
            placeholder: 'Enter primary button text in Arabic'
          },
          {
            id: 'hero-cta-secondary-en',
            label: 'Secondary CTA Text (English)',
            type: 'text',
            value: 'Request Consultation',
            required: false,
            placeholder: 'Enter secondary button text in English'
          },
          {
            id: 'hero-cta-secondary-ar',
            label: 'Secondary CTA Text (Arabic)',
            type: 'text',
            value: 'طلب استشارة',
            required: false,
            placeholder: 'Enter secondary button text in Arabic'
          },
          {
            id: 'features',
            label: 'Features',
            type: 'array',
            value: [
              { 
                titleEn: 'Advanced Courses',
                titleAr: 'دورات متقدمة',
                descriptionEn: 'Latest technologies and methodologies',
                descriptionAr: 'أحدث التقنيات والمناهج'
              },
              { 
                titleEn: 'Expert Trainers',
                titleAr: 'مدربون خبراء', 
                descriptionEn: 'Extensive experience in the field',
                descriptionAr: 'خبرة واسعة في المجال'
              },
              { 
                titleEn: 'Continuous Support',
                titleAr: 'دعم متواصل',
                descriptionEn: '24/7 assistance available',
                descriptionAr: 'مساعدة على مدار الساعة'
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
                nameEn: 'Ahmed Ali',
                nameAr: 'أحمد علي',
                roleEn: 'Student',
                roleAr: 'طالب',
                textEn: 'Excellent training experience',
                textAr: 'تجربة تدريبية ممتازة'
              },
              { 
                nameEn: 'Sarah Johnson',
                nameAr: 'سارة جونسون',
                roleEn: 'Manager', 
                roleAr: 'مدير',
                textEn: 'Professional and effective',
                textAr: 'مهني وفعال'
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
              { 
                nameEn: 'Graphic Design',
                nameAr: 'التصميم الجرافيكي',
                descriptionEn: 'Professional design courses',
                descriptionAr: 'دورات تصميم احترافية'
              },
              { 
                nameEn: 'Web Development',
                nameAr: 'تطوير الويب',
                descriptionEn: 'Modern development skills',
                descriptionAr: 'مهارات تطوير حديثة'
              },
              { 
                nameEn: 'Digital Marketing',
                nameAr: 'التسويق الرقمي',
                descriptionEn: 'Marketing strategies and tools',
                descriptionAr: 'استراتيجيات وأدوات التسويق'
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
            id: 'team',
            label: 'Team Members',
            type: 'array',
            value: [
              { 
                nameEn: 'Ahmed Mohammed',
                nameAr: 'أحمد محمد',
                positionEn: 'Chief Executive Officer',
                positionAr: 'المدير التنفيذي',
                bioEn: '15 years of experience in training',
                bioAr: 'خبرة 15 عام في التدريب'
              },
              { 
                nameEn: 'Fatima Ali',
                nameAr: 'فاطمة علي',
                positionEn: 'Training Manager',
                positionAr: 'مدير التدريب',
                bioEn: '10 years of experience in curriculum development',
                bioAr: 'خبرة 10 أعوام في تطوير المناهج'
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
            id: 'services-title-en',
            label: 'Services Title (English)',
            type: 'text',
            value: 'Our Services',
            required: true,
            placeholder: 'Enter services title in English'
          },
          {
            id: 'services-title-ar',
            label: 'Services Title (Arabic)',
            type: 'text',
            value: 'خدماتنا',
            required: true,
            placeholder: 'Enter services title in Arabic'
          },
          {
            id: 'services-description-en',
            label: 'Services Description (English)',
            type: 'textarea',
            value: 'We offer comprehensive training and consultancy services',
            required: true,
            placeholder: 'Enter services description in English'
          },
          {
            id: 'services-description-ar',
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
            id: 'contact-title-en',
            label: 'Contact Title (English)',
            type: 'text',
            value: 'Get in Touch',
            required: true,
            placeholder: 'Enter contact title in English'
          },
          {
            id: 'contact-title-ar',
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
            id: 'faq-items-en',
            label: 'FAQ Items (English)',
            type: 'array',
            value: [
              { 
                question: 'How do I enroll in a course?',
                answer: 'You can enroll through our website or contact us directly.'
              },
              { 
                question: 'What payment methods do you accept?',
                answer: 'We accept credit cards, bank transfers, and online payments.'
              },
              { 
                question: 'Do you offer certificates?',
                answer: 'Yes, we provide certificates of completion for all our courses.'
              }
            ],
            required: true
          },
          {
            id: 'faq-items-ar',
            label: 'FAQ Items (Arabic)',
            type: 'array',
            value: [
              { 
                question: 'كيف يمكنني التسجيل في دورة؟',
                answer: 'يمكنك التسجيل من خلال موقعنا الإلكتروني أو التواصل معنا مباشرة.'
              },
              { 
                question: 'ما هي طرق الدفع المقبولة؟',
                answer: 'نقبل بطاقات الائتمان والتحويلات البنكية والمدفوعات الإلكترونية.'
              },
              { 
                question: 'هل تقدمون شهادات؟',
                answer: 'نعم، نقدم شهادات إتمام لجميع دوراتنا.'
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
            id: 'consultation-title-en',
            label: 'Consultation Title (English)',
            type: 'text',
            value: 'Consultation Services',
            required: true,
            placeholder: 'Enter consultation title in English'
          },
          {
            id: 'consultation-title-ar',
            label: 'Consultation Title (Arabic)',
            type: 'text',
            value: 'خدمات الاستشارة',
            required: true,
            placeholder: 'Enter consultation title in Arabic'
          },
          {
            id: 'consultation-description-en',
            label: 'Consultation Description (English)',
            type: 'textarea',
            value: 'Professional consultation services tailored to your needs',
            required: true,
            placeholder: 'Enter consultation description in English'
          },
          {
            id: 'consultation-description-ar',
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
