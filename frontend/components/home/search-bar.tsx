'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';

interface Category {
  id: string;
  name: { ar: string; en: string };
  slug: string;
}

interface SearchBarProps {
  categories?: Category[];
  compact?: boolean;
}

export function SearchBar({ categories = [], compact = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations();

  // Sync with URL parameters
  useEffect(() => {
    const urlQuery = searchParams?.get('query') || '';
    const urlCategory = searchParams?.get('category') || '';
    setQuery(urlQuery);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchParams = new URLSearchParams();
    if (query.trim()) {
      searchParams.set('query', query.trim());
    }
    if (selectedCategory) {
      searchParams.set('category', selectedCategory);
    }

    const searchString = searchParams.toString();
    const url = `/${locale}/courses${searchString ? `?${searchString}` : ''}`;
    router.push(url);
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${!compact ? 'max-w-4xl mx-auto' : ''}`}>
      <div className="flex items-center search-container">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Icon 
            name="search" 
            className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500 ${
              locale === 'ar' ? 'right-4' : 'left-4'
            }`}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              const newValue = e.target.value;
              setQuery(newValue);
              
              // Auto-update URL when input is cleared
              if (newValue.trim() === '') {
                const searchParams = new URLSearchParams();
                if (selectedCategory) {
                  searchParams.set('category', selectedCategory);
                }
                const searchString = searchParams.toString();
                const url = `/${locale}/courses${searchString ? `?${searchString}` : ''}`;
                router.push(url);
              }
            }}
            placeholder={t('home.search.placeholder')}
            className={`w-full py-3 text-gray-700 focus:outline-none focus:ring-0 placeholder-gray-500 font-cairo search-input ${
              locale === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'
            }`}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex-shrink-0 relative">
          <Icon 
            name="chevron-down" 
            className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none ${
              locale === 'ar' ? 'left-4' : 'right-4'
            }`}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-48 py-3 text-gray-700 focus:outline-none focus:ring-0 appearance-none cursor-pointer font-cairo search-select ${
              locale === 'ar' ? 'pl-12 pr-4' : 'pr-12 pl-4'
            }`}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <option value="">{t('home.search.categoryAll')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {locale === 'ar' ? category.name.ar : category.name.en}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="flex-shrink-0 inline-flex items-center justify-center px-8 py-3 text-white font-semibold focus:outline-none transition-colors duration-200 font-cairo search-button"
        >
          {t('home.search.button')}
        </button>
      </div>
    </form>
  );
}
