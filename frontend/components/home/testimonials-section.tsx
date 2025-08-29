'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';

const testimonialsData = [
  {
    id: 1,
    name: { ar: 'اسم العميل', en: 'Client Name' },
    content: { 
      ar: 'وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط',
      en: 'Simple description simple description simple description simple description simple description simple description'
    },
    rating: 4,
    avatar: '/images/Avatar.svg'
  },
  {
    id: 2,
    name: { ar: 'اسم العميل', en: 'Client Name' },
    content: {
      ar: 'وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط',
      en: 'Simple description simple description simple description simple description simple description simple description'
    },
    rating: 4,
    avatar: '/images/Avatar.svg'
  },
  {
    id: 3,
    name: { ar: 'اسم العميل', en: 'Client Name' },
    content: {
      ar: 'وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط وصف بسيط',
      en: 'Simple description simple description simple description simple description simple description simple description'
    },
    rating: 4,
    avatar: '/images/Avatar.svg'
  },
];

export function TestimonialsSection() {
  const locale = useLocale();
  const t = useTranslations();

  const testimonials = testimonialsData.map(testimonial => ({
    ...testimonial,
    name: testimonial.name[locale as 'ar' | 'en'],
    content: testimonial.content[locale as 'ar' | 'en'],
  }));

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-teal-600 font-semibold mb-2 font-cairo">
            {t('testimonials.subtitle')}
          </p>
          <h2 className="gradient-text text-4xl font-bold font-cairo">
            {t('testimonials.title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto font-cairo">
            {t('testimonials.description')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white border border-gray-100 p-8 transition-all duration-300" style={{borderRadius: '20px'}}>
              {/* Profile Section */}
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-4 rtl:ml-0 rtl:mr-4 flex-1">
                  <div className="font-bold text-gray-900 text-lg font-cairo">
                    {testimonial.name}
                  </div>
                  {/* Rating Stars */}
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Icon 
                        key={i} 
                                        name="star"
                className={`h-4 w-4 ${i < testimonial.rating ? '' : 'text-gray-300'}`}
                style={{ color: i < testimonial.rating ? '#FB831D' : undefined }} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-600 leading-relaxed font-cairo text-base line-clamp-3">
                {testimonial.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}