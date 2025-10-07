'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function AIConsultationSection() {
  const locale = useLocale();
  const t = useTranslations('ai-consultation');

  return (
    <section id="ai-consultation" className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-teal-600 font-semibold mb-2 font-cairo">
            {t('badge')}
          </p>
          <h2 className="mb-6 text-center font-cairo font-bold" style={{ color: '#292561', fontSize: '32px' }}>
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto font-cairo">
            {t('subtitle')}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Solutions Card */}
          <div 
            className="relative overflow-hidden"
            style={{ 
              backgroundColor: '#1A1928',
              minHeight: '400px',
              borderRadius: '15px'
            }}
          >
            {/* Robot Image - Position changes based on locale */}
            <div className={`absolute top-0 h-full flex items-center ${
              locale === 'en' ? 'right-0 justify-end' : 'left-0 justify-start'
            }`} style={{ width: '90%' }}>
              <img 
                src="/images/Solutions Card BG.png" 
                alt="AI Robot"
                className={`object-contain ${
                  locale === 'en' ? 'scale-x-[-1]' : ''
                }`}
                style={{ 
                  width: '100%',
                  maxWidth: '750px',
                  height: 'auto',
                  maxHeight: '562.5px',
                  flexShrink: 0,
                  aspectRatio: '4/3',
                  mixBlendMode: 'screen'
                }}
              />
            </div>

            {/* Content - Position and alignment changes based on locale */}
            <div className={`relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col justify-center ${
              locale === 'en' ? 'lg:pr-48 text-left' : 'lg:pl-48 text-right'
            }`} style={{ minHeight: '400px' }}>
              <h3 
                className="font-bold mb-4 font-cairo"
                style={{
                  fontSize: '24px',
                  color: '#00AC96'
                }}
              >
                {t('cards.ai-solutions.title')}
              </h3>
              <p className="text-white mb-6 font-cairo text-sm leading-relaxed">
                {t('cards.ai-solutions.description')}
              </p>
              
              {/* CTA Button */}
              <div className={locale === 'en' ? 'text-left' : 'text-right'}>
                <Link
                  href={`/${locale}/ai-solutions`}
                  className="inline-flex items-center justify-center font-cairo font-semibold text-white transition-colors duration-300"
                  style={{
                    width: '150px',
                    height: '45px',
                    borderRadius: '10px',
                    backgroundColor: '#00AC96',
                    fontSize: '14px'
                  }}
                >
                  {t('cards.ai-solutions.cta')}
                </Link>
              </div>
            </div>
          </div>

          {/* Administrative Consultation Card */}
          <div 
            className="relative overflow-hidden"
            style={{ 
              backgroundColor: '#1A1928',
              minHeight: '400px',
              borderRadius: '15px'
            }}
          >
            {/* Robot Image - Position changes based on locale */}
            <div className={`absolute top-0 h-full flex items-center ${
              locale === 'en' ? 'right-0 justify-end' : 'left-0 justify-start'
            }`} style={{ width: '90%' }}>
              <img 
                src="/images/Solutions Card BG.png" 
                alt="Admin Robot"
                className={`object-contain ${
                  locale === 'en' ? 'scale-x-[-1]' : ''
                }`}
                style={{ 
                  width: '100%',
                  maxWidth: '750px',
                  height: 'auto',
                  maxHeight: '562.5px',
                  flexShrink: 0,
                  aspectRatio: '4/3',
                  mixBlendMode: 'screen'
                }}
              />
            </div>

            {/* Content - Position and alignment changes based on locale */}
            <div className={`relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col justify-center ${
              locale === 'en' ? 'lg:pr-48 text-left' : 'lg:pl-48 text-right'
            }`} style={{ minHeight: '400px' }}>
              <h3 
                className="font-bold mb-4 font-cairo"
                style={{
                  fontSize: '24px',
                  color: '#00AC96'
                }}
              >
                {t('cards.admin-consultation.title')}
              </h3>
              <p className="text-white mb-6 font-cairo text-sm leading-relaxed">
                {t('cards.admin-consultation.description')}
              </p>
              
              {/* CTA Button */}
              <div className={locale === 'en' ? 'text-left' : 'text-right'}>
                <Link
                  href={`/${locale}/admin-consulting`}
                  className="inline-flex items-center justify-center font-cairo font-semibold text-white transition-colors duration-300"
                  style={{
                    width: '150px',
                    height: '45px',
                    borderRadius: '10px',
                    backgroundColor: '#00AC96',
                    fontSize: '14px'
                  }}
                >
                  {t('cards.admin-consultation.cta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
