'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';

export default function HelpPage() {
  const locale = useLocale();
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const isLoaded = usePageLoad(100);

  const helpTopics = [
    {
      icon: 'book-open',
      title: locale === 'ar' ? 'ابدأ التعلم' : 'Getting Started',
      description: locale === 'ar' 
        ? 'تعرف على كيفية التسجيل والبدء في رحلتك التعليمية'
        : 'Learn how to sign up and start your learning journey',
      link: `/${locale}/faq`
    },
    {
      icon: 'credit-card',
      title: locale === 'ar' ? 'الدفع والفواتير' : 'Payment & Billing',
      description: locale === 'ar'
        ? 'معلومات عن طرق الدفع والفواتير والاسترجاع'
        : 'Information about payment methods, invoices, and refunds',
      link: `/${locale}/faq`
    },
    {
      icon: 'academic-cap',
      title: locale === 'ar' ? 'الدورات والشهادات' : 'Courses & Certificates',
      description: locale === 'ar'
        ? 'كل ما تحتاج معرفته عن الدورات والحصول على الشهادات'
        : 'Everything you need to know about courses and getting certificates',
      link: `/${locale}/courses`
    },
    {
      icon: 'user-circle',
      title: locale === 'ar' ? 'حسابي' : 'My Account',
      description: locale === 'ar'
        ? 'إدارة حسابك وإعدادات الملف الشخصي'
        : 'Manage your account and profile settings',
      link: `/${locale}/profile`
    },
    {
      icon: 'question-mark-circle',
      title: locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQs',
      description: locale === 'ar'
        ? 'إجابات للأسئلة المتكررة'
        : 'Answers to frequently asked questions',
      link: `/${locale}/faq`
    },
    {
      icon: 'chat-bubble-left-right',
      title: locale === 'ar' ? 'تواصل معنا' : 'Contact Us',
      description: locale === 'ar'
        ? 'تحتاج مساعدة إضافية؟ راسلنا مباشرة'
        : 'Need more help? Contact us directly',
      link: `/${locale}/contact`
    }
  ];

  const filteredTopics = helpTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen relative page-enter ${isLoaded ? 'loaded' : ''}`}>
        {/* Background that extends to top */}
        <div className="absolute inset-0 hero-background" style={{top: '-100px'}}></div>
        
        {/* Main Content */}
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          {/* Page Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 
              className={`text-center font-cairo font-bold ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}
              style={{
                color: '#292561',
                fontSize: 'clamp(28px, 5vw, 44px)',
                lineHeight: 'normal',
                marginBottom: '0.5rem'
              }}
            >
              {t('footer.help-center')}
            </h1>
            <p 
              className={`font-cairo max-w-3xl mx-auto px-4 ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}
              style={{
                color: '#6B7280',
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                fontWeight: 400,
                lineHeight: '26px'
              }}
            >
              {locale === 'ar' 
                ? 'كيف يمكننا مساعدتك اليوم؟ اختر موضوعاً للبدء'
                : 'How can we help you today? Choose a topic to get started'
              }
            </p>
          </div>

          {/* Search Bar */}
          <div className={`mb-12 ${isLoaded ? 'animate-slide-in-right stagger-2' : 'opacity-0'}`}>
            <form className="w-full max-w-4xl mx-auto">
              <div className="flex items-center search-container rounded-lg p-2 bg-white shadow-sm">
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={locale === 'ar' ? 'ابحث عن موضوع...' : 'Search for a topic...'}
                    className={`w-full py-3 text-gray-700 focus:outline-none focus:ring-0 placeholder-gray-500 font-cairo border-0 bg-transparent ${
                      locale === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'
                    }`}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="flex-shrink-0 inline-flex items-center justify-center px-8 py-3 text-white font-semibold focus:outline-none font-cairo rounded-lg btn-animate"
                  style={{
                    backgroundColor: '#292561'
                  }}
                >
                  {locale === 'ar' ? 'ابحث' : 'Search'}
                </button>
              </div>
            </form>
          </div>

          {/* Help Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredTopics.length === 0 && searchQuery ? (
              <div className="col-span-full text-center py-12">
                <p 
                  className="font-cairo"
                  style={{
                    color: '#6B7280',
                    fontSize: '18px',
                    fontWeight: 500
                  }}
                >
                  {locale === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found'}
                </p>
              </div>
            ) : (
              filteredTopics.map((topic, index) => (
                <Link
                  key={index}
                  href={topic.link}
                  className={`bg-white rounded-xl p-6 hover-lift scroll-item border border-gray-100 transition-all duration-300 hover:shadow-lg group ${
                    isLoaded ? `animate-scale-in stagger-${index + 3}` : 'opacity-0'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: '#E8F8F5' }}
                    >
                      <Icon 
                        name={topic.icon} 
                        className="h-8 w-8 transition-colors duration-300"
                        style={{ color: '#00AC96' }}
                      />
                    </div>
                    <h3 
                      className="font-cairo font-bold mb-2 transition-colors duration-300 group-hover:text-teal-600"
                      style={{
                        color: '#292561',
                        fontSize: '18px'
                      }}
                    >
                      {topic.title}
                    </h3>
                    <p 
                      className="font-cairo"
                      style={{
                        color: '#6B7280',
                        fontSize: '14px',
                        lineHeight: '22px'
                      }}
                    >
                      {topic.description}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Contact Support Section */}
          <div className={`bg-gradient-to-r from-purple-900 to-teal-600 rounded-xl p-8 md:p-12 text-center scroll-item ${
            isLoaded ? 'animate-fade-in-up stagger-9' : 'opacity-0'
          }`}>
            <h2 
              className="font-cairo font-bold text-white mb-4"
              style={{
                fontSize: 'clamp(24px, 4vw, 32px)'
              }}
            >
              {locale === 'ar' ? 'لم تجد ما تبحث عنه؟' : 'Can\'t find what you\'re looking for?'}
            </h2>
            <p 
              className="font-cairo text-white text-opacity-90 mb-6"
              style={{
                fontSize: '16px',
                lineHeight: '26px'
              }}
            >
              {locale === 'ar' 
                ? 'فريق الدعم لدينا جاهز لمساعدتك على مدار الساعة'
                : 'Our support team is ready to help you around the clock'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-purple-900 font-cairo font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300"
              >
                <Icon name="envelope" className="h-5 w-5 mr-2" />
                {locale === 'ar' ? 'راسلنا' : 'Contact Us'}
              </Link>
              <Link
                href={`/${locale}/faq`}
                className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-white border-2 border-white font-cairo font-semibold rounded-lg hover:bg-white hover:text-purple-900 transition-colors duration-300"
              >
                <Icon name="question-mark-circle" className="h-5 w-5 mr-2" />
                {locale === 'ar' ? 'الأسئلة الشائعة' : 'View FAQs'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

