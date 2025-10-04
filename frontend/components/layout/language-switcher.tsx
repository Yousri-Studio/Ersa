'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (newLocale: string) => {
    if (!pathname) return;
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <div className="language-switcher">
      <button
        onClick={() => switchLanguage('ar')}
        className={`language-option ${locale === 'ar' ? 'language-option-active' : 'language-option-inactive'}`}
      >
        AR
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={`language-option ${locale === 'en' ? 'language-option-active' : 'language-option-inactive'}`}
      >
        Eng
      </button>
    </div>
  );
}