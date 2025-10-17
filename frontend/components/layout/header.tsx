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
    { name: t('navigation.services'), href: isHomePage ? '#ai-consultation' : `/${locale}/#ai-consultation`, sectionId: 'ai-consultation' },
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
          <div className="flex items-center md:gap-16 gap-4">
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

          {/* Right side - Desktop only */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
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
              <Icon 
                name="shopping-cart" 
                className="h-5 w-5" 
                style={{ color: '#3F3D56' }}
              />
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
                      href={`/${locale}/profile/orders`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Icon name="receipt" className="h-4 w-4 mr-3 rtl:mr-0 rtl:ml-3" />
                      {t('navigation.my-orders')}
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
          </div>

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

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu panel */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-lg max-h-screen overflow-y-auto">
              {/* Menu header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Link
                  href={`/${locale}`}
                  className="flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <img 
                    src="/Header Logo.svg" 
                    alt={t('hero.company')}
                    className="h-8 w-auto"
                  />
                </Link>
                <button
                  type="button"
                  className="p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name="xmark" className="h-6 w-6" />
                </button>
              </div>

              {/* Menu content */}
              <div className="p-4 space-y-4">
                {/* Navigation links */}
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-3 py-3 nav-link rounded-md transition-colors duration-200 text-base ${
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
                </div>

                {/* Language Switcher - Mobile only */}
                <div className="flex justify-center py-2 border-t border-gray-200">
                  <LanguageSwitcher />
                </div>

                {/* Action buttons row */}
                <div className="flex items-center justify-center py-4 border-t border-gray-200 gap-5">
                  {/* Wishlist */}
                  <Link
                    href={`/${locale}/wishlist`}
                    className="relative flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full hover:bg-gray-100 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
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
                    className="relative flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full hover:bg-gray-100 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon 
                      name="shopping-cart" 
                      className="h-5 w-5" 
                      style={{ color: '#3F3D56' }}
                    />
                    {itemCount() > 0 && (
                      <span className="absolute -top-1 -right-1 rtl:right-auto rtl:left-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {itemCount()}
                      </span>
                    )}
                  </Link>
                </div>

                {/* User section */}
                {isAuthenticated ? (
                  <>
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex items-center px-3 py-2">
                        <Icon name="user" className="h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3 text-gray-500" />
                        <span className="text-base font-medium text-gray-700">
                          {user?.fullName}
                        </span>
                      </div>
                      
                      <Link
                        href={`/${locale}/profile/enrollments`}
                        className="flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="graduation-cap" className="h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3" />
                        {t('navigation.my-learning')}
                      </Link>
                      
                      <Link
                        href={`/${locale}/profile/orders`}
                        className="flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="receipt" className="h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3" />
                        {t('navigation.my-orders')}
                      </Link>
                      
                      <Link
                        href={`/${locale}/profile/wishlist`}
                        className="flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon icon={['fas', 'heart']} className="h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3" style={{ color: '#00AC96' }} />
                        {t('navigation.wishlist')}
                      </Link>
                      
                      <Link
                        href={`/${locale}/profile`}
                        className="flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
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
                        className="w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                      >
                        {t('common.logout')}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <Link
                      href={`/${locale}/auth/login`}
                      className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('common.login')}
                    </Link>
                    <Link
                      href={`/${locale}/auth/register`}
                      className="block w-full text-center px-4 py-3 text-base font-medium text-primary-600 border border-primary-600 hover:bg-primary-50 rounded-md transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('common.register')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop for desktop user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent md:hidden"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
  );
}