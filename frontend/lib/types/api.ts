import { LocaleString } from '../common-types';

// Course-related types matching backend DTOs
export type CourseCategory = 'Programming' | 'Business' | 'Design';
export type CourseType = 'Live' | 'PDF';
export type CourseLevel = 'Biginner' | 'Intermediate' | 'Advanced';

export interface Course {
  id: string;
  slug: string;
  title: LocaleString;
  summary: LocaleString;
  price: number;
  currency: string;
  type: CourseType;
  level: CourseLevel;
  category: CourseCategory;
  imageUrl?: string;
  instructorName: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  badge?: 'Bestseller' | 'New' | null;
  instructor?: {
    name: string;
    title?: string;
    avatar?: string;
  };
  sessions?: Session[];
  attachments?: Attachment[];
}

export interface Session {
  id: string;
  startAt: string;
  endAt: string;
  capacity?: number;
  availableSpots?: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  type: string;
}

// Content-related types
export interface PageContent {
  key: string;
  content: Record<string, any>;
  locale: string;
  lastModified: string;
}

export interface ContentSection {
  id: string;
  name: string;
  type: string;
  content: Record<string, any>;
  isActive: boolean;
  lastModified: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  coursesCount: number;
}

export interface HomeContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
  };
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    company: string;
    text: string;
    avatar?: string;
  }>;
  stats: Array<{
    label: string;
    value: string;
    description?: string;
  }>;
}

export interface AboutContent {
  hero: {
    title: string;
    description: string;
    imageUrl: string;
  };
  mission: {
    title: string;
    description: string;
    points: string[];
  };
  team: Array<{
    name: string;
    role: string;
    bio: string;
    avatar: string;
  }>;
}

export interface FaqContent {
  title: string;
  description: string;
  categories: Array<{
    title: string;
    questions: Array<{
      question: string;
      answer: string;
    }>;
  }>;
}

export interface SiteStats {
  totalStudents: number;
  totalCourses: number;
  totalInstructors: number;
  totalReviews: number;
  averageRating: number;
  completionRate: number;
}
