'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';

export function JoinUsSection() {
  const locale = useLocale();
  const t = useTranslations('join-us');

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className="hero-background grid grid-cols-1 lg:grid-cols-2 items-center"
          style={{
            display: 'inline-flex',
            padding: '30px 80px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '50px',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px'
          }}
        >
          {/* Content Side */}
          <div className="order-2 lg:order-1">
            {/* Main Title */}
            <h2 
              className={`mb-6 font-cairo font-bold ${
                locale === 'ar' ? 'text-right' : 'text-left'
              }`}
              style={{
                color: '#00AC96',
                fontSize: '32px'
              }}
            >
              {t('title')}
            </h2>

            {/* Subtitle */}
            <p className={`text-gray-600 mb-8 font-cairo text-lg leading-relaxed ${
              locale === 'ar' ? 'text-right' : 'text-left'
            }`}>
              {t('subtitle')}
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              {t.raw('benefits').map((benefit: string, index: number) => (
                <div key={index} className={`flex items-center gap-4 ${
                  locale === 'en' ? 'flex-row' : 'flex-row-reverse'
                }`}>
                  {/* Check Icon - positioned on the right for Arabic */}
                  <div 
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      locale === 'ar' ? 'order-2' : 'order-1'
                    }`}
                    style={{ backgroundColor: '#27D88E' }}
                  >
                    <Icon 
                      name="check" 
                      className="w-4 h-4" 
                      style={{ color: '#FFFFFF' }}
                    />
                  </div>
                  {/* Benefit Text - positioned on the left for Arabic */}
                  <p 
                    className={`text-gray-700 font-cairo leading-relaxed flex-1 ${
                      locale === 'ar' ? 'text-right order-1' : 'text-left order-2'
                    }`}
                    style={{ 
                      fontSize: '18px',
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
                className="inline-flex items-center justify-center bg-gray-800 text-white font-cairo font-semibold hover:bg-gray-700 transition-colors duration-300"
                style={{
                  width: '200px',
                  height: '65px',
                  borderRadius: '10px'
                }}
              >
                {t('cta')}
              </Link>
            </div>
          </div>

          {/* Image Side */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <img
                src="/images/Join us Image.png"
                alt={t('title')}
                className="w-full h-auto max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
