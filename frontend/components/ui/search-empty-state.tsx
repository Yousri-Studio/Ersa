'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

interface SearchEmptyStateProps {
  query?: string;
  className?: string;
}

export function SearchEmptyState({ query, className = '' }: SearchEmptyStateProps) {
  const locale = useLocale();
  const t = useTranslations();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div className={`p-12 text-center ${className}`}>
      {/* Illustration */}
      <div className="mb-8">
        <Image
          src="/images/search empty state.svg"
          alt={isHydrated ? t('courses.search.no-results.title') : 'Search Empty State'}
          width={160}
          height={165}
          className="mx-auto"
          priority
        />
      </div>

      {/* Title */}
      <h2 
        className="mb-4 font-cairo"
        style={{
          color: 'var(--Primary, #292561)',
          textAlign: 'center',
          fontFamily: 'Cairo',
          fontSize: '36px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '61px'
        }}
      >
        {isHydrated ? t('courses.search.no-results.title') : 'لا توجد نتائج للبحث'}
      </h2>

      {/* Description */}
      <p className="text-gray-600 mb-8 max-w-md mx-auto font-cairo leading-relaxed">
        {isHydrated ? t('courses.search.no-results.description') : 'جرّب تعديل كلمات البحث أو استخدام عبارات أبسط للوصول لما تريده.'}
      </p>



      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200 font-cairo"
          style={{ backgroundColor: '#292561' }}
        >
          <span>{isHydrated ? t('courses.search.no-results.try-again') : 'جرب البحث مرة أخرى'}</span>
        </button>
        <Link
          href={`/${locale}/courses`}
          className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200 font-cairo"
          style={{ backgroundColor: '#00AC96' }}
        >
          <span>{isHydrated ? t('courses.search.no-results.browse-all') : 'استكشف الدورات'}</span>
        </Link>
      </div>
    </div>
  );
}
