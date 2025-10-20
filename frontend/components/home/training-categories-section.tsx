'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { categoriesApi, CourseCategoryData } from '@/lib/api';

export function TrainingCategoriesSection() {
  const locale = useLocale();
  const t = useTranslations('training-categories');
  const [categories, setCategories] = useState<CourseCategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getCategories(true);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep empty array if error
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className="mx-auto max-w-7xl p-4 sm:p-8 lg:p-16"
          style={{
            display: 'flex',
            width: '100%',
            maxWidth: '1248px',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
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
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="relative bg-white p-8 text-center animate-pulse"
                  style={{ borderRadius: '15px' }}
                >
                  <div className="mb-6 flex justify-center">
                    <div 
                      className="bg-gray-200"
                      style={{
                        width: '200px',
                        height: '75px',
                        borderRadius: '50px'
                      }}
                    />
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-4 mx-auto" style={{ width: '60%' }} />
                  <div className="h-4 bg-gray-200 rounded mb-2 mx-auto" style={{ width: '80%' }} />
                  <div className="h-4 bg-gray-200 rounded mb-8 mx-auto" style={{ width: '70%' }} />
                </div>
              ))
            ) : categories.length > 0 ? (
              categories.map((category) => {
                // Get localized title and subtitle
                const title = locale === 'ar' ? category.titleAr : category.titleEn;
                const subtitle = locale === 'ar' 
                  ? (category.subtitleAr || '') 
                  : (category.subtitleEn || '');
                
                // Create URL-friendly slug from English title for consistency across locales
                const slug = category.titleEn
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^\w\-]+/g, '');
                
                return (
                  <Link
                    key={category.id}
                    href={`/${locale}/courses?category=${encodeURIComponent(slug)}`}
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
                            src="/images/Course Place Holder Small.png"
                            alt={title}
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
                        {title}
                      </h3>

                      {/* Subtitle/Description */}
                      <p className="text-gray-600 group-hover:text-white font-cairo text-sm leading-relaxed mb-8 transition-colors duration-300">
                        {subtitle || (locale === 'ar' 
                          ? 'استكشف دوراتنا في هذه الفئة' 
                          : 'Explore our courses in this category')}
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
                );
              })
            ) : (
              // No categories found
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 font-cairo">
                  {locale === 'ar' 
                    ? 'لا توجد فئات متاحة حالياً' 
                    : 'No categories available at the moment'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}