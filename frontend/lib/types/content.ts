export interface PageContent {
  key: string;
  title: LocaleString;
  sections: ContentSection[];
  lastModified: string;
}

export interface ContentSection {
  id: string;
  name: string;
  type: ContentSectionType;
  content: any;
  isActive: boolean;
  lastModified: string;
}

export type ContentSectionType = 'hero' | 'consultation' | 'training' | 'services' | 'ai' | 'testimonials' | 'join' | 'achievements' | 'faq';
