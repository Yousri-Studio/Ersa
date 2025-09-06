import { Course } from './api';
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
      
      // Convert to base64
      const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
      
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
  // Map course type to badge: 1 = Live (new), 2 = PDF (bestseller)
  if (course.type === 1) return 'new';      // Live courses get 'new' badge
  if (course.type === 2) return 'bestseller'; // PDF courses get 'bestseller' badge
  return null;
};

/**
 * Converts a CourseCategory enum to localized category
 */
const getCourseCategory = (category: any, locale: 'ar' | 'en'): { ar: string; en: string } => {
  // Handle both string and number category values
  if (typeof category === 'string') {
    // If it's already a string, map to localized versions
    switch (category.toLowerCase()) {
      case 'programming':
        return { ar: 'البرمجة', en: 'Programming' };
      case 'business':
        return { ar: 'الأعمال', en: 'Business' };
      case 'design':
        return { ar: 'التصميم', en: 'Design' };
      default:
        return { ar: 'الأعمال', en: 'Business' };
    }
  }
  
  // Handle numeric enum values from API
  switch (category) {
    case 1: return { ar: 'البرمجة', en: 'Programming' };
    case 2: return { ar: 'الأعمال', en: 'Business' }; 
    case 3: return { ar: 'التصميم', en: 'Design' };
    default: return { ar: 'الأعمال', en: 'Business' }; // Default to Business as most courses seem to be business-related
  }
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
  
  // Convert type to mode
  const mode: 'onsite' | 'online' = course.type === 1 ? 'online' : 'onsite';
  
  // Convert badge
  const badge = getCourseBadge(course);
  
  console.log('courseToCardProps - Generated badge:', badge, 'for type:', course.type);

  // Convert photo to thumbnailUrl or use placeholder
  const thumbnailUrl = convertPhotoToDataUrl(course.photo) || "/images/Course Place Holder Small.png";
  
  console.log('courseToCardProps - Generated thumbnailUrl:', thumbnailUrl ? 'Generated from photo' : 'Using placeholder');

  // Get category
  const category = getCourseCategory(course.category, locale);

  // Generate duration label based on course type
  const getDurationLabel = (): { ar: string; en: string } => {
    if (course.type === 1) {
      // Live courses
      return {
        ar: 'المدة: حسب الجدولة',
        en: 'Duration: As scheduled'
      };
    }
    
    // PDF courses (type 2)
    return {
      ar: 'المدة: حسب وتيرتك',
      en: 'Duration: Self-paced'
    };
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
    instructorName: course.instructorName,

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
