'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';

export function TrainingCategoriesSection() {
  const locale = useLocale();
  const t = useTranslations('training-categories');

  const categories = [
    {
      key: 'general',
      title: t('categories.general.title'),
      description: t('categories.general.description'),
      image: '/images/Course Place Holder Small.png'
    },
    {
      key: 'specialized',
      title: t('categories.specialized.title'),
      description: t('categories.specialized.description'),
      image: '/images/Course Place Holder Small.png'
    },
    {
      key: 'professional',
      title: t('categories.professional.title'),
      description: t('categories.professional.description'),
      image: '/images/Course Place Holder Small.png'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-16"
          style={{
            display: 'flex',
            width: '100%',
            maxWidth: '1248px',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '30px',
            borderRadius: '20px',
            background: '#FAFAFC'
          }}
        >
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

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.key}
                href={`/${locale}/courses?category=${category.key}`}
                className="relative bg-white hover:shadow-lg transition-all duration-300 p-8 text-center group cursor-pointer overflow-hidden block"
                style={{ borderRadius: '15px' }}
              >
                {/* Hover Background Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ 
                    background: '#00AC96',
                    borderRadius: '15px'
                  }}
                ></div>
                
                {/* Content Container */}
                <div className="relative z-10">
                  {/* Oval Category Image */}
                  <div className="mb-6 flex justify-center">
                    <div 
                      className="overflow-hidden"
                      style={{
                        width: '200px',
                        height: '75px',
                        borderRadius: '50px'
                      }}
                    >
                      <img 
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 
                    className="font-bold mb-4 font-cairo group-hover:text-white transition-colors duration-300"
                    style={{
                      fontSize: '20px',
                      color: '#292561'
                    }}
                  >
                    {category.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 group-hover:text-white font-cairo text-sm leading-relaxed mb-8 transition-colors duration-300">
                    {category.description}
                  </p>

                  {/* Arrow Icon - Bottom Center */}
                  <div className="flex justify-center">
                    <Icon 
                      name={locale === 'ar' ? 'arrow-left' : 'arrow-right'}
                      className="text-gray-600 group-hover:text-white transition-colors duration-300"
                      style={{ width: '.95rem' }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}