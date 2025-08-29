'use client';

import { useLocale, useTranslations } from 'next-intl';

export function NoSearchResults() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Illustration */}
      <div className="mb-8">
        <div className="w-48 h-48 mx-auto flex items-center justify-center">
          <img 
            src="/images/search empty state.svg" 
            alt="لا توجد نتائج للبحث"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Main message */}
      <h3 
        className="font-cairo font-bold text-center mb-4"
        style={{
          color: '#292561',
          fontSize: '24px',
          fontWeight: 700
        }}
      >
        لا توجد نتائج للبحث
      </h3>

      {/* Subtitle */}
      <p 
        className="font-cairo text-center max-w-md"
        style={{
          color: '#6B7280',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '1.6'
        }}
      >
        جرب تعديل كلمات البحث أو استخدام عبارات أبسط للوصول لما تريده.
      </p>
    </div>
  );
}
