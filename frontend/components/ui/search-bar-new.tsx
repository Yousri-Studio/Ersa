'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import type { CourseCategoryData } from '@/lib/api';
import styles from './search-bar-new.module.css';

interface SearchBarProps {
  onSearch?: (query: string, category?: CourseCategoryData) => void;
  className?: string;
}

export function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategoryData | ''>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations();

  // Sync with URL parameters
  useEffect(() => {
    const urlQuery = searchParams?.get('query') || '';
    const urlCategory = (searchParams?.get('category') as unknown) as CourseCategoryData || '';
    setQuery(urlQuery);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch(query, selectedCategory || undefined);
      return;
    }

    const searchParams = new URLSearchParams();
    if (query.trim()) {
      searchParams.set('query', query.trim());
    }
    if (selectedCategory) {
      searchParams.set('category', selectedCategory as unknown as string);
    }

    const searchString = searchParams.toString();
    const url = `/${locale}/courses${searchString ? `?${searchString}` : ''}`;
    router.push(url);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={styles.searchContainer}>
        {/* Search Input */}
        <div className="relative flex-1">
          <Icon 
            name="search" 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('home.search.placeholder')}
            className={styles.searchInput}
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory as string}
          onChange={(e) => setSelectedCategory(e.target.value as unknown as CourseCategoryData)}
          className={styles.categorySelect}
        >
          <option value="">{t('Choose Category')}</option>
          <option value="Programming">Programming</option>
          <option value="Business">Business</option>
          <option value="Design">Design</option>
        </select>

        {/* Search Button */}
        <button
          type="submit"
          className={styles.searchButton}
        >
          Search
        </button>
      </div>
    </form>
  );
}
