'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';

export function ConsultationSection() {
  const locale = useLocale();
  const t = useTranslations();

  const traineeAvatars = [
    '/api/placeholder/32/32?text=1',
    '/api/placeholder/32/32?text=2', 
    '/api/placeholder/32/32?text=3',
    '/api/placeholder/32/32?text=4',
    '/api/placeholder/32/32?text=5'
  ];

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Layout changes based on locale */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
          locale === 'en' ? 'lg:grid-flow-col-dense' : ''
        }`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          
          {/* Image side - position changes based on locale */}
          <div className={`relative ${locale === 'en' ? 'lg:col-start-2' : ''}`}>
            {/* Main consultation image */}
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="/images/Hero Image.png"
                alt={t('consultation.image-alt')}
                className="w-full h-96 object-cover"
              />
            </div>
          </div>
          
          {/* Content side - position changes based on locale */}
          <div className={`space-y-6 ${locale === 'ar' ? 'rtl' : 'ltr'} ${
            locale === 'en' ? 'lg:col-start-1' : ''
          }`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {/* Badge */}
            <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
              <div className="inline-flex items-center text-brand text-sm font-semibold font-cairo">
                {t('consultation.badge')}
              </div>
            </div>
            
            {/* Main headline */}
            <h2 className={`font-cairo font-bold leading-tight ${
              locale === 'ar' ? 'text-right' : 'text-left'
            }`} style={{
              color: 'var(--Primary, #292561)',
              textAlign: locale === 'ar' ? 'right' : 'left',
              fontFamily: 'Cairo',
              fontSize: '36px',
              fontStyle: 'normal',
              fontWeight: '700'
            }}>
              {t('consultation.title')}
            </h2>
            
            {/* Description */}
            <p className={`text-lg text-gray-600 leading-relaxed font-cairo ${
              locale === 'ar' ? 'text-right' : 'text-left'
            }`}>
              {t('consultation.description')}
            </p>
            
            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 ${
              locale === 'ar' ? 'sm:flex-row-reverse sm:justify-end' : 'sm:justify-start'
            }`}>
              <Link
                href={`/${locale}/consultation`}
                className="border-2 text-brand px-8 py-3 rounded-lg font-semibold transition-all duration-200 text-center font-cairo hover:bg-brand hover:text-white"
                style={{
                  borderColor: 'var(--Secondary, #00AC96)',
                  color: 'var(--Secondary, #00AC96)'
                }}
              >
                {t('consultation.request-consultation')}
              </Link>
              <Link
                href={`/${locale}/courses`}
                className="px-8 py-3 rounded-lg font-semibold transition-all duration-200 text-center font-cairo text-white hover:opacity-90"
                style={{
                  backgroundColor: '#292561'
                }}
              >
                {t('consultation.explore-courses')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
