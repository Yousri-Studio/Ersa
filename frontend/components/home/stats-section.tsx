'use client';

import { useTranslations } from 'next-intl';

export function StatsSection() {
  const t = useTranslations();

  const stats = [
    { value: '5,000+', label: t('hero.stats.students') },
    { value: '50+', label: t('hero.stats.courses') },
    { value: '98%', label: t('hero.stats.satisfaction') },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}