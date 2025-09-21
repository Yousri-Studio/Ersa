'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCountAnimation } from '@/lib/use-count-animation';

export function AchievementsSection() {
  const locale = useLocale();
  const t = useTranslations('achievements');

  const stats = [
    { value: 1500, label: t('stats.trainees'), suffix: '+' },
    { value: 30, label: t('stats.government_courses'), suffix: '+' },
    { value: 30, label: t('stats.clients'), suffix: '+' },
    { value: 95, label: t('stats.satisfaction'), suffix: '%' },
  ];

  // Call hooks at the component level, not inside map
  const animation1 = useCountAnimation({
    targetValue: stats[0].value,
    duration: 2000,
    delay: 0
  });
  
  const animation2 = useCountAnimation({
    targetValue: stats[1].value,
    duration: 2000,
    delay: 200
  });
  
  const animation3 = useCountAnimation({
    targetValue: stats[2].value,
    duration: 2000,
    delay: 400
  });
  
  const animation4 = useCountAnimation({
    targetValue: stats[3].value,
    duration: 2000,
    delay: 600
  });

  const animations = [animation1, animation2, animation3, animation4];

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="mx-auto max-w-7xl p-4 sm:p-8 lg:p-16"
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
          <h2 
            className="mb-6 text-center font-cairo font-bold"
            style={{
              color: '#292561',
              fontSize: '44px'
            }}
          >
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto font-cairo">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '12rem' }}>
          {stats.map((stat, index) => {
            const { count, elementRef } = animations[index];

            return (
              <div key={index} className="text-center flex flex-col items-center">
                {/* Icon */}
                <div className="mb-4">
                  <img 
                    src="/images/Trainer Icon.svg" 
                    alt="Achievement Icon"
                    className="w-12 h-12 mx-auto"
                  />
                </div>
                {/* Stat Value */}
                <div 
                  ref={elementRef}
                  className="font-bold mb-2 font-cairo"
                  style={{
                    fontSize: '32px',
                    color: '#1A1928'
                  }}
                >
                  {count}{stat.suffix}
                </div>
                {/* Stat Label */}
                <div className="text-gray-600 font-cairo" style={{ fontSize: '16px' }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
