'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { debounce } from '@/lib/utils';

interface Category {
  id: string;
  name: { ar: string; en: string };
  slug: string;
}

interface SearchBarProps {
  categories?: Category[];
  compact?: boolean;
  enableLiveSearch?: boolean; // Enable live search as you type
}

export function SearchBar({ categories = [], compact = false, enableLiveSearch = false }: SearchBarProps) {
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

  // Debounced search function for live search
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, category: string) => {
      if (!enableLiveSearch) return;
      
      console.log('Live search triggered:', { query: searchQuery, category });
      
      const searchParams = new URLSearchParams();
      if (searchQuery.trim()) {
        searchParams.set('query', searchQuery.trim());
      }
      if (category) {
        searchParams.set('category', category);
      }

      const searchString = searchParams.toString();
      const url = `/${locale}/courses${searchString ? `?${searchString}` : ''}`;
      
      // Only navigate if we're not already on the courses page or if parameters changed
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const newSearch = searchString ? `?${searchString}` : '';
      
      if (currentPath !== `/${locale}/courses` || currentSearch !== newSearch) {
        router.push(url);
      }
    }, 5000),
    [enableLiveSearch, locale, router]
  );

  // Handle live search when query or category changes
  useEffect(() => {
    if (enableLiveSearch) {
      debouncedSearch(query, selectedCategory);
    }
  }, [query, selectedCategory, debouncedSearch, enableLiveSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Search submitted:', { query: query.trim(), category: selectedCategory });
    
    const searchParams = new URLSearchParams();
    if (query.trim()) {
      searchParams.set('query', query.trim());
    }
    if (selectedCategory) {
      searchParams.set('category', selectedCategory);
    }

    const searchString = searchParams.toString();
    const url = `/${locale}/courses${searchString ? `?${searchString}` : ''}`;
    
    console.log('Navigating to:', url);
    router.push(url);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    // Auto-clear search when input is completely empty (for non-live search)
    if (!enableLiveSearch && newValue.trim() === '') {
      const searchParams = new URLSearchParams();
      if (selectedCategory) {
        searchParams.set('category', selectedCategory);
      }
      const searchString = searchParams.toString();
      const url = `/${locale}/courses${searchString ? `?${searchString}` : ''}`;
      router.push(url);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    
    // For non-live search, immediately navigate when category changes
    if (!enableLiveSearch) {
      const searchParams = new URLSearchParams();
      if (query.trim()) {
        searchParams.set('query', query.trim());
      }
      if (newCategory) {
        searchParams.set('category', newCategory);
      }
      const searchString = searchParams.toString();
      const url = `/${locale}/courses${searchString ? `?${searchString}` : ''}`;
      router.push(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${!compact ? 'max-w-4xl mx-auto' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center search-container gap-3">
        {/* Search Input */}
        <div className="flex-1 relative mb-3 md:mb-0">
          <Icon 
            name="search" 
            className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500 ${
              locale === 'ar' ? 'right-4' : 'left-4'
            }`}
          />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder={t('home.search.placeholder')}
            className={`w-full py-3 text-gray-700 focus:outline-none focus:ring-0 placeholder-gray-500 font-cairo search-input ${
              locale === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'
            }`}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          />
          {/* Search indicator for live search */}
          {enableLiveSearch && (query.trim() || selectedCategory) && (
            <div className={`absolute top-1/2 transform -translate-y-1/2 ${
              locale === 'ar' ? 'left-4' : 'right-4'
            }`}>
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="flex-shrink-0 relative mb-3 md:mb-0">
          <Icon 
            name="chevron-down" 
            className={`absolute top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none ${
              locale === 'ar' ? 'left-4' : 'right-4'
            }`}
            style={{ height: '1.0rem', width: '1.0rem' }}
          />
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className={`w-full md:w-48 py-3 text-gray-700 focus:outline-none focus:ring-0 appearance-none cursor-pointer font-cairo search-select ${
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
          className="w-full md:w-auto flex-shrink-0 inline-flex items-center justify-center px-8 py-3 text-white font-semibold focus:outline-none transition-colors duration-200 font-cairo search-button"
        >
          {t('home.search.button')}
        </button>
      </div>
    </form>
  );
}
