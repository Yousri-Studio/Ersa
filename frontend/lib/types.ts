import { Course as ApiCourse } from './api';

export interface Course extends Omit<ApiCourse, 'description' | 'duration'> {
  curriculum: CurriculumSection[];
  features: string[];
  requirements: string[];
  topics: string[];
  description?: {
    ar: string;
    en: string;
  };
  lessons: number;
  instructor?: {
    name: string;
    title: string;
    avatar: string;
    rating: number;
    studentsCount: number;
    coursesCount: number;
  };
  reviewsCount: number;
  studentsCount: number;
  duration: string; // This is already localized by transformApiCourse
  level: number;
  language: string;
  originalPrice: number;
  lastUpdated: string;
  videoPreviewUrl?: string;
  subtitle?: string;
}

export interface CurriculumSection {
  id: number | string;
  title: string;
  lessons: number;
  duration: string;
  isPreview?: boolean;
}
