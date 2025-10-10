import { Course as ApiCourse } from './api';
import { Course } from './types';
import { CourseCardProps } from '@/components/ui/course-card-new';

/**
 * Converts photo data to a data URL
 */
const convertPhotoToDataUrl = (photo?: string | number[]): string | undefined => {
  console.log('convertPhotoToDataUrl called with:', typeof photo, photo ? 'has data' : 'no data');
  
  if (!photo) {
    console.log('convertPhotoToDataUrl: No photo data available');
    return undefined;
  }
  
  try {
    // Handle base64 string data from backend (current format)
    if (typeof photo === 'string' && photo.length > 0) {
      console.log('convertPhotoToDataUrl: Converting base64 string, length:', photo.length);
      // Backend already returns base64 string, just add the data URL prefix
      const dataUrl = `data:image/png;base64,${photo}`;
      console.log('convertPhotoToDataUrl: Generated data URL from base64 string');
      return dataUrl;
    }
    
    // Handle binary array data (legacy format - keeping for compatibility)
    if (Array.isArray(photo) && photo.length > 0) {
      console.log('convertPhotoToDataUrl: Converting binary array, length:', photo.length);
      
      // Convert number array to Uint8Array
      const uint8Array = new Uint8Array(photo);
      
      // Convert to base64 using spread operator for TypeScript compatibility
      const base64 = btoa(String.fromCharCode(...Array.from(uint8Array)));
      
      // Return as data URL
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      console.log('convertPhotoToDataUrl: Generated data URL from binary array');
      return dataUrl;
    }
    
    console.log('convertPhotoToDataUrl: Unsupported photo format');
    return undefined;
  } catch (error) {
    console.error('Error converting photo to data URL:', error);
    return undefined;
  }
};

/**
 * Converts a CourseType enum to badge
 */
const getCourseBadge = (course: Course): 'bestseller' | 'new' | null => {
  // Handle both string and numeric course types
  const courseType = typeof course.type === 'string' ? 
    (course.type === 'Live' ? 1 : 0) : 
    course.type;
  
  // Map course type to badge: 1 = Live (new), 0 = PDF (bestseller)
  if (courseType === 1) return 'new';      // Live courses get 'new' badge
  if (courseType === 0) return 'bestseller'; // PDF courses get 'bestseller' badge
  return null;
};

/**
 * Converts a CourseCategory to localized category
 * Handles both old enum format and new database category object
 */
const getCourseCategory = (course: Course, locale: 'ar' | 'en'): { ar: string; en: string } => {
  // Handle new category object structure from database
  if (course.category && typeof course.category === 'object' && 'titleAr' in course.category) {
    return {
      ar: course.category.titleAr,
      en: course.category.titleEn
    };
  }
  
  // Fallback for legacy data or missing category
  // Check if category field exists as enum (old format)
  const categoryValue = (course as any).category;
  
  if (typeof categoryValue === 'string') {
    // If it's already a string, map to localized versions
    switch (categoryValue.toLowerCase()) {
      case 'programming':
        return { ar: 'البرمجة', en: 'Programming' };
      case 'business':
        return { ar: 'الأعمال', en: 'Business' };
      case 'design':
        return { ar: 'التصميم', en: 'Design' };
      default:
        return { ar: 'عام', en: 'General' };
    }
  }
  
  // Handle numeric enum values from old API format
  if (typeof categoryValue === 'number') {
    switch (categoryValue) {
      case 1: return { ar: 'البرمجة', en: 'Programming' };
      case 2: return { ar: 'الأعمال', en: 'Business' }; 
      case 3: return { ar: 'التصميم', en: 'Design' };
      default: return { ar: 'عام', en: 'General' };
    }
  }
  
  // Default fallback
  return { ar: 'عام', en: 'General' };
};

/**
 * Converts a Course from the API to CourseCardProps for the new card component
 */
export const courseToCardProps = (
  course: Course, 
  locale: 'ar' | 'en',
  options: {
    inWishlist?: boolean;
    inCart?: boolean;
    onToggleWishlist?: (courseId: string) => void;
    onAddToCart?: (courseId: string) => void;
    onClick?: (slug: string) => void;
  } = {}
): CourseCardProps => {
  // Debug logging
  console.log('courseToCardProps - Processing course:', {
    id: course.id,
    title: course.title.en,
    type: course.type,
    photo: course.photo ? 'Has photo data' : 'No photo'
  });
  
  // Handle both string and numeric course types
  const courseType = typeof course.type === 'string' ? 
    (course.type === 'Live' ? 1 : 0) : 
    course.type;
  
  // Convert type to mode: 1 = Live (online), 0 = PDF (displayed as "PDF")
  const mode: 'onsite' | 'online' = courseType === 1 ? 'online' : 'onsite';
  
  // Convert badge
  const badge = getCourseBadge(course);
  
  console.log('courseToCardProps - Generated badge:', badge, 'for type:', course.type, '(converted to:', courseType, ')');

  // Convert photo to thumbnailUrl or use placeholder
  const thumbnailUrl = convertPhotoToDataUrl(course.photo) || "/images/Course Place Holder Small.png";
  
  console.log('courseToCardProps - Generated thumbnailUrl:', thumbnailUrl ? 'Generated from photo' : 'Using placeholder');

  // Get category - now handles new database structure
  const category = getCourseCategory(course, locale);

  // Get duration label - the transformed Course already has duration as a localized string
  const getDurationLabel = (): { ar: string; en: string } => {
    // Use the actual duration from the course if available
    if (course.duration) {
      return {
        ar: course.duration,
        en: course.duration
      };
    }
    
    // Fallback to course type-based labels if no duration data
    const courseType = typeof course.type === 'string' ? 
      (course.type === 'Live' ? 1 : 0) : 
      course.type;
      
    if (courseType === 1) {
      // Live courses (online)
      return {
        ar: 'المدة: حسب الجدولة',
        en: 'Duration: As scheduled'
      };
    }
    
    // PDF courses (onsite/self-paced) - type 0
    return {
      ar: 'المدة: حسب وتيرتك',
      en: 'Duration: Self-paced'
    };
  };

  // Extract instructor name based on locale
  const getInstructorName = (): string | undefined => {
  // First check if there's a transformed instructor object
  if (course.instructor?.name) {
    return course.instructor.name;
  }
  
  // Check instructors relationship
  if (course.instructors && course.instructors.length > 0) {
    const instructor = course.instructors[0];
    if (locale === 'ar') {
      return instructor.instructorName.ar;
    } else {
      return instructor.instructorName.en;
    }
  }
  
  return undefined;
  };

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    thumbnailUrl,
    mode,
    badge,
    category,
    durationLabel: getDurationLabel(),
    rating: course.rating,
    instructorName: getInstructorName(),

    price: course.price,
    currency: course.currency === 'SAR' ? 'SAR' : 'USD',
    locale,
    inWishlist: options.inWishlist || false,
    inCart: options.inCart || false,
    onToggleWishlist: options.onToggleWishlist,
    onAddToCart: options.onAddToCart,
    onClick: options.onClick
  };
};

/**
 * Converts multiple courses to card props
 */
export const coursesToCardProps = (
  courses: Course[],
  locale: 'ar' | 'en',
  options: {
    wishlistIds?: string[];
    cartIds?: string[];
    onToggleWishlist?: (courseId: string) => void;
    onAddToCart?: (courseId: string) => void;
    onClick?: (slug: string) => void;
  } = {}
): CourseCardProps[] => {
  return courses.map(course => courseToCardProps(
    course,
    locale,
    {
      inWishlist: options.wishlistIds?.includes(course.id) || false,
      inCart: options.cartIds?.includes(course.id) || false,
      onToggleWishlist: options.onToggleWishlist,
      onAddToCart: options.onAddToCart,
      onClick: options.onClick
    }
  ));
};
