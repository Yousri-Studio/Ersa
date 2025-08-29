import { Course } from './api';
import { CourseCardProps } from '@/components/ui/course-card-new';

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
  // Convert type to mode
  const mode: 'onsite' | 'online' = course.type === 'Live' ? 'onsite' : 'online';
  
  // Convert badge
  const badge = course.badge === 'Bestseller' ? 'bestseller' as const : 
                course.badge === 'New' ? 'new' as const : null;

  // Generate duration label based on course type and sessions
  const getDurationLabel = (): { ar: string; en: string } => {
    if (course.type === 'Live' && course.sessions && course.sessions.length > 0) {
      const sessionCount = course.sessions.length;
      return {
        ar: `المدة: ${sessionCount} ${sessionCount === 1 ? 'جلسة' : 'جلسات'}`,
        en: `Duration: ${sessionCount} ${sessionCount === 1 ? 'session' : 'sessions'}`
      };
    }
    
    // Default duration for PDF courses or courses without sessions
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
    thumbnailUrl: course.thumbnailUrl,
    mode,
    badge,
    durationLabel: getDurationLabel(),
    rating: course.rating,

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
