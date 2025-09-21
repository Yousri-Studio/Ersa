'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

export function HtmlAttributes() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  useEffect(() => {
    // Update HTML attributes based on locale
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [locale, isRTL]);

  return null; // This component doesn't render anything
}
