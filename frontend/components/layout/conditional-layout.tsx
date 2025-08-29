'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current page is an auth page or admin page
  const isAuthPage = pathname.includes('/auth/login') || pathname.includes('/auth/register') || pathname.includes('/admin-login');
  const isAdminPage = pathname.includes('/admin');

  if (isAuthPage || isAdminPage) {
    // Auth pages and admin pages without header and footer
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  // Regular pages with header and footer
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[100px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
