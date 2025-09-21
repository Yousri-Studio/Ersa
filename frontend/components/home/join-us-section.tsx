'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';

export function JoinUsSection() {
  const locale = useLocale();
  const t = useTranslations('join-us');

  return (
    <section className="py-8 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className="hero-background flex flex-col lg:grid lg:grid-cols-2 items-center gap-8 lg:gap-12 p-5 lg:p-20"
          style={{
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px'
          }}
        >
          {/* Content Side */}
          <div className="order-2 lg:order-1">
            {/* Main Title */}
            <h2 
              className={`mb-4 md:mb-6 font-cairo font-bold ${
                locale === 'ar' ? 'text-right' : 'text-left'
              }`}
              style={{
                color: '#00AC96',
                fontSize: 'clamp(24px, 5vw, 32px)'
              }}
            >
              {t('title')}
            </h2>

            {/* Subtitle */}
            <p className={`text-gray-600 mb-6 md:mb-8 font-cairo text-base md:text-lg leading-relaxed ${
              locale === 'ar' ? 'text-right' : 'text-left'
            }`}>
              {t('subtitle')}
            </p>

            {/* Benefits List */}
            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              {t.raw('benefits').map((benefit: string, index: number) => (
                <div key={index} className={`flex items-center gap-3 md:gap-4 ${
                  locale === 'en' ? 'flex-row' : 'flex-row-reverse'
                }`}>
                  {/* Check Icon - positioned on the right for Arabic */}
                  <div 
                    className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                      locale === 'ar' ? 'order-2' : 'order-1'
                    }`}
                    style={{ backgroundColor: '#27D88E' }}
                  >
                    <Icon 
                      name="check" 
                      className="w-3 h-3 md:w-4 md:h-4" 
                      style={{ color: '#FFFFFF' }}
                    />
                  </div>
                  {/* Benefit Text - positioned on the left for Arabic */}
                  <p 
                    className={`text-gray-700 font-cairo leading-relaxed flex-1 ${
                      locale === 'ar' ? 'text-right order-1' : 'text-left order-2'
                    }`}
                    style={{ 
                      fontSize: 'clamp(14px, 3vw, 18px)',
                      fontWeight: 700
                    }}
                  >
                    {benefit}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
              <Link
                href={`/${locale}/auth/register`}
                className="inline-flex items-center justify-center bg-gray-800 text-white font-cairo font-semibold hover:bg-gray-700 transition-colors duration-300 w-full md:w-auto"
                style={{
                  width: '100%',
                  maxWidth: '200px',
                  height: '50px',
                  borderRadius: '10px'
                }}
              >
                {t('cta')}
              </Link>
            </div>
          </div>

          {/* Image Side */}
          <div className="order-1 lg:order-2">
            <div className="relative flex justify-center">
              <img
                src="/images/Join us Image.png"
                alt={t('title')}
                className="w-full h-auto max-w-sm lg:max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
