import { Course as ApiCourse } from './api';

export interface Course extends ApiCourse {
  curriculum: CurriculumSection[];
  features: string[];
  requirements: string[];
  instructor: {
    name: string;
    title: string;
    avatar: string;
    rating: number;
    studentsCount: number;
    coursesCount: number;
  };
  reviewsCount: number;
  studentsCount: number;
  duration: string;
  level: string;
  language: string;
  originalPrice?: number;
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
