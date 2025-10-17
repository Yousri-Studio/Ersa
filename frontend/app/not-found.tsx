'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';

// Translations
const translations = {
  ar: {
    title: 'الصفحة المطلوبة غير موجودة',
    description: 'عذراً، الصفحة التي تبحث عنها غير موجودة. يرجى التحقق من الرابط أو العودة إلى الصفحة الرئيسية.',
    goHome: 'العودة للرئيسية',
    browseCourses: 'تصفح الدورات'
  },
  en: {
    title: 'Page Not Found',
    description: "Sorry, the page you're looking for doesn't exist. Please verify the link or return to the homepage.",
    goHome: 'Go to Homepage',
    browseCourses: 'Browse Courses'
  }
};

// Root-level 404 page - detects locale from URL
export default function NotFound() {
  const pathname = usePathname();
  const isLoaded = usePageLoad(100);
  
  // Detect locale from pathname
  const locale = (pathname?.includes('/ar/') || pathname?.startsWith('/ar')) ? 'ar' : 'en';
  const t = translations[locale];
  
  // Debug log
  console.log('🚨 Root 404 Page - pathname:', pathname, 'detected locale:', locale);

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen relative page-enter ${isLoaded ? 'loaded' : ''}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {/* Background that extends to top */}
        <div className="absolute inset-0 hero-background" style={{top: '-5rem'}}></div>
        
        {/* Main Content */}
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            {/* 404 Error Illustration */}
            <div className={`mx-auto mb-8 w-80 h-60 flex items-center justify-center ${isLoaded ? 'animate-bounce-in' : 'opacity-0'}`}>
              <img 
                src="/images/search empty state.svg" 
                alt="404 Error"
                className="w-full h-full"
              />
            </div>
            
            {/* Error Title */}
            <h1 
              className={`text-center font-cairo font-bold mb-6 ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}
              style={{
                color: '#292561',
                fontSize: 'clamp(28px, 5vw, 44px)',
                lineHeight: 'normal'
              }}
            >
              {t.title}
            </h1>
            
            {/* Error Description */}
            <p 
              className={`font-cairo max-w-2xl mx-auto px-4 mb-8 ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}
              style={{
                color: '#6B7280',
                fontSize: 'clamp(16px, 2.5vw, 18px)',
                fontWeight: 400,
                lineHeight: '28px',
                textAlign: 'center'
              }}
            >
              {t.description}
            </p>

            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${isLoaded ? 'animate-scale-in stagger-3' : 'opacity-0'}`}>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center justify-center px-8 py-3 text-white font-semibold rounded-lg btn-animate font-cairo"
                style={{
                  backgroundColor: '#292561',
                  fontSize: '16px',
                  fontWeight: 600,
                  minWidth: '200px'
                }}
              >
                {t.goHome}
              </Link>
              
              <Link
                href={`/${locale}/courses`}
                className="inline-flex items-center justify-center px-8 py-3 text-white font-semibold rounded-lg btn-animate font-cairo"
                style={{
                  backgroundColor: '#00AC96',
                  fontSize: '16px',
                  fontWeight: 600,
                  minWidth: '200px'
                }}
              >
                {t.browseCourses}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
