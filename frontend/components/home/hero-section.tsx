'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SearchBar } from './search-bar';
import { FeaturedCoursesSlider } from './featured-courses-slider';
import { usePageLoad } from '@/lib/use-animations';

export function HeroSection() {
  const locale = useLocale();
  const t = useTranslations();
  const isLoaded = usePageLoad(100);

  // Define localized course categories matching backend enum
  const categories = [
    {
      id: 'Programming',
      name: { ar: 'البرمجة', en: 'Programming' },
      slug: 'Programming'
    },
    {
      id: 'Business',
      name: { ar: 'الأعمال', en: 'Business' },
      slug: 'Business'
    },
    {
      id: 'Design',
      name: { ar: 'التصميم', en: 'Design' },
      slug: 'Design'
    }
  ];

  return (
    <section className="relative pt-20 pb-20">
      {/* Background that extends to top */}
      <div className="absolute inset-0 hero-background" style={{top: '-100px'}}></div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Hero Copy + Actions */}
        <div className={`text-center mb-12 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Tagline */}
          <p className="mb-6 hero-tagline">
            {t('consultation.badge')}
          </p>

          {/* Main Headline */}
          <h1 className="mx-auto max-w-4xl mb-6 font-cairo hero-heading">
            {t('consultation.title')}
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl mb-8 hero-description">
            {t('home.hero.subtitle')}
          </p>


        </div>

        {/* Search Bar */}
        <div className={`mb-16 ${isLoaded ? 'animate-slide-in-right stagger-2' : 'opacity-0'}`}>
          <SearchBar categories={categories} />
        </div>

        {/* Featured Courses Slider */}
        <div className={`mb-8 ${isLoaded ? 'animate-scale-in stagger-3' : 'opacity-0'}`}>
          <FeaturedCoursesSlider />
        </div>

      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
          <div className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#00AC96] to-[#693EB0] opacity-10 hero-clip-path" />
        </div>
      </div>
    </section>
  );
}