'use client';

import { useLocale, useTranslations } from 'next-intl';

export function ServicesSection() {
  const locale = useLocale();
  const t = useTranslations('services');

  const services = [
    {
      key: 'quality',
      title: t('cards.quality.title'),
      description: t('cards.quality.description')
    },
    {
      key: 'partnership',
      title: t('cards.partnership.title'),
      description: t('cards.partnership.description')
    },
    {
      key: 'innovation',
      title: t('cards.innovation.title'),
      description: t('cards.innovation.description')
    },
    {
      key: 'sustainability',
      title: t('cards.sustainability.title'),
      description: t('cards.sustainability.description')
    }
  ];

  return (
    <section id="services" className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-teal-600 font-semibold mb-2 font-cairo">
            {t('badge')}
          </p>
          <h2 className="mb-6 text-center font-cairo font-bold" style={{ color: '#292561', fontSize: '32px' }}>
            {t('title')}
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div 
              key={service.key}
              className="bg-white p-6 text-center border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              style={{ borderRadius: '15px' }}
            >
              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <img 
                  src="/images/Trainer Icon.svg" 
                  alt="Service Icon"
                  className="w-12 h-12"
                />
              </div>

              {/* Title */}
              <h3 
                className="font-bold mb-4 font-cairo"
                style={{
                  fontSize: '18px',
                  color: '#292561'
                }}
              >
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 font-cairo text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
