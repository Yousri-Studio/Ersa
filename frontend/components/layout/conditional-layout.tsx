'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Header } from './header';
import { Footer } from './footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  // Check if current page is an auth page or admin page
  const isAuthPage = pathname?.includes('/auth/login') || pathname?.includes('/auth/register') || pathname?.includes('/admin-login') || false;
  // Admin dashboard pages (but not admin-consulting or admin-login which are public pages)
  const isAdminPage = (pathname?.startsWith(`/${locale}/admin/`) || pathname === `/${locale}/admin`) || false;

  if (isAuthPage || isAdminPage) {
    // Auth pages and admin pages without header and footer
    return (
      <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    );
  }

  // Regular pages with header and footer
  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      <main className="flex-1 pt-[100px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
