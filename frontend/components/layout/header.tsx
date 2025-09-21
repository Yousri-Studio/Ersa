'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { useAuthStore } from '@/lib/auth-store';
import { useCartStore } from '@/lib/cart-store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { itemCount: wishlistCount } = useWishlistStore();

  // Check if we're on the home page
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle navigation to sections from anchor links
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && isHomePage) {
      const elementId = hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, [isHomePage]);
  
  // Navigation handler for scroll-to-section functionality
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    if (isHomePage) {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  const navigation: Array<{ name: string; href: string; sectionId?: string }> = [
    { name: t('navigation.home'), href: `/${locale}` },
    { name: t('navigation.courses'), href: `/${locale}/courses` },
    { name: t('navigation.services'), href: isHomePage ? '#services' : `/${locale}/#services`, sectionId: 'services' },
    { name: t('navigation.faq'), href: `/${locale}/faq` },
    { name: t('navigation.contact'), href: `/${locale}/contact` },
  ];



  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 pt-4 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-sm border-b border-gray-200' 
        : 'bg-transparent'
    }`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center" style={{gap: '65px'}}>
            <Link
              href={`/${locale}`}
              className="flex items-center"
            >
              <img 
                src="/Header Logo.svg" 
                alt={t('hero.company')}
                className="h-12 w-auto"
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8 rtl:space-x-reverse">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => item.sectionId ? handleNavClick(e, item.sectionId) : undefined}
                  className={`nav-link transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Wishlist */}
            <Link
              href={`/${locale}/wishlist`}
              className="relative flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Icon 
                icon={['fas', 'heart']} 
                className="h-5 w-5" 
                style={{ color: '#00AC96' }}
              />
              {wishlistCount() > 0 && (
                <span className="absolute -top-1 -right-1 rtl:right-auto rtl:left-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {wishlistCount()}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href={`/${locale}/cart`}
              className="relative flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="relative">
                <Icon 
                  name="shopping-cart" 
                  className="h-5 w-5" 
                  style={{ color: '#3F3D56' }}
                />
                <Icon 
                  name="plus" 
                  className="h-3 w-3 absolute -bottom-1 -right-1" 
                  style={{ color: '#3F3D56' }}
                />
              </div>
              {itemCount() > 0 && (
                <span className="absolute -top-1 -right-1 rtl:right-auto rtl:left-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {itemCount()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 rtl:space-x-reverse p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  <Icon name="user" className="h-6 w-6" />
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.fullName.split(' ')[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      href={`/${locale}/profile/enrollments`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Icon name="graduation-cap" className="h-4 w-4 mr-3 rtl:mr-0 rtl:ml-3" />
                      {t('navigation.my-learning')}
                    </Link>
                    <Link
                      href={`/${locale}/profile/wishlist`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="relative mr-3 rtl:mr-0 rtl:ml-3">
                        <Icon icon={['fas', 'heart']} className="h-4 w-4" style={{ color: '#00AC96' }} />
                        {wishlistCount() > 0 && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                            {wishlistCount()}
                          </span>
                        )}
                      </div>
                      {t('navigation.wishlist')}
                    </Link>
                    <Link
                      href={`/${locale}/profile`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Icon name="user" className="h-4 w-4 mr-3 rtl:mr-0 rtl:ml-3" />
                      {t('common.profile')}
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className="btn-primary inline-flex items-center justify-center border border-transparent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 header-login-btn"
              >
                {t('common.login')}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <Icon name="xmark" className="h-6 w-6" />
              ) : (
                <Icon name="bars" className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 nav-link rounded-md transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                  onClick={(e) => {
                    if (item.sectionId) {
                      handleNavClick(e, item.sectionId);
                    }
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.name}
                </Link>
              ))}
              
              {isAuthenticated && (
                <>
                  <hr className="my-2" />
                  <Link
                    href={`/${locale}/profile/enrollments`}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="graduation-cap" className="h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3" />
                    {t('navigation.my-learning')}
                  </Link>
                  <Link
                    href={`/${locale}/profile/wishlist`}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="relative mr-3 rtl:mr-0 rtl:ml-3">
                      <Icon icon={['fas', 'heart']} className="h-5 w-5" style={{ color: '#00AC96' }} />
                      {wishlistCount() > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                          {wishlistCount()}
                        </span>
                      )}
                    </div>
                    {t('navigation.wishlist')}
                  </Link>
                  <Link
                    href={`/${locale}/profile`}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="user" className="h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3" />
                    {t('common.profile')}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    {t('common.logout')}
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <hr className="my-2" />
                  <Link
                    href={`/${locale}/auth/login`}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('common.login')}
                  </Link>
                  <Link
                    href={`/${locale}/auth/register`}
                    className="block px-3 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 rounded-md transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('common.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop for mobile menu */}
      {(mobileMenuOpen || userMenuOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden"
          onClick={() => {
            setMobileMenuOpen(false);
            setUserMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}