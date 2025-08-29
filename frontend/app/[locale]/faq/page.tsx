'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePageLoad, useStaggeredAnimation } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';
import { Icon } from '@/components/ui/icon';

export default function FAQPage() {
  const locale = useLocale();
  const t = useTranslations();
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isLoaded = usePageLoad(100);

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  // Random FAQ items for demonstration
  const faqItems = [
    {
      question: locale === 'ar' ? 'ما هي أفضل طريقة لتعلم البرمجة؟' : 'What is the best way to learn programming?',
      answer: locale === 'ar' ? 'أفضل طريقة لتعلم البرمجة هي الممارسة المستمرة والعمل على مشاريع حقيقية. ابدأ بلغة برمجة واحدة وتعلمها جيداً قبل الانتقال إلى لغات أخرى.' : 'The best way to learn programming is through consistent practice and working on real projects. Start with one programming language and master it well before moving to others.'
    },
    {
      question: locale === 'ar' ? 'كم من الوقت يحتاج المبتدئ لتعلم التطوير؟' : 'How long does it take for a beginner to learn development?',
      answer: locale === 'ar' ? 'يختلف الوقت حسب الشخص والمجهود المبذول، لكن عادة يحتاج المبتدئ من 6 إلى 12 شهر للحصول على أساس قوي في البرمجة مع الممارسة اليومية.' : 'The time varies depending on the person and effort invested, but typically a beginner needs 6 to 12 months to build a strong foundation in programming with daily practice.'
    },
    {
      question: locale === 'ar' ? 'هل يمكنني تعلم البرمجة بدون خلفية تقنية؟' : 'Can I learn programming without a technical background?',
      answer: locale === 'ar' ? 'نعم، بالطبع! البرمجة مهارة يمكن لأي شخص تعلمها بغض النظر عن خلفيته. المهم هو الصبر والمثابرة والممارسة المستمرة.' : 'Yes, absolutely! Programming is a skill that anyone can learn regardless of their background. What matters is patience, persistence, and continuous practice.'
    },
    {
      question: locale === 'ar' ? 'ما هي أهم النصائح للمطورين الجدد؟' : 'What are the most important tips for new developers?',
      answer: locale === 'ar' ? 'اقرأ الكود بكثرة، اكتب الكود يومياً، لا تخف من الأخطاء، اطلب المساعدة عند الحاجة، وابق مطلعاً على التقنيات الجديدة.' : 'Read code frequently, write code daily, don\'t be afraid of making mistakes, ask for help when needed, and stay updated with new technologies.'
    },
    {
      question: locale === 'ar' ? 'كيف أختار لغة البرمجة المناسبة لي؟' : 'How do I choose the right programming language for me?',
      answer: locale === 'ar' ? 'اختر لغة البرمجة بناءً على أهدافك: تطوير المواقع (JavaScript)، تطوير التطبيقات (Swift/Kotlin)، الذكاء الاصطناعي (Python)، أو التطوير العام (Java/C#).' : 'Choose a programming language based on your goals: web development (JavaScript), mobile apps (Swift/Kotlin), AI (Python), or general development (Java/C#).'
    },
    {
      question: locale === 'ar' ? 'هل البرمجة مهنة مربحة؟' : 'Is programming a profitable career?',
      answer: locale === 'ar' ? 'نعم، البرمجة من أكثر المهن طلباً ومن أعلاها أجراً في العالم. مع التطور التكنولوجي المستمر، الطلب على المطورين في ازدياد مستمر.' : 'Yes, programming is one of the most in-demand and highest-paying careers in the world. With continuous technological advancement, the demand for developers keeps growing.'
    },
    {
      question: locale === 'ar' ? 'ما هي أفضل الموارد لتعلم البرمجة مجاناً؟' : 'What are the best free resources for learning programming?',
      answer: locale === 'ar' ? 'هناك العديد من المصادر المجانية مثل: فري كود كامب، كورسيرا، يوتيوب، جيت هاب، وستاك أوفرفلو. المهم هو اختيار مصدر والالتزام به.' : 'There are many free resources like: FreeCodeCamp, Coursera, YouTube, GitHub, and Stack Overflow. The key is to choose one source and stick with it.'
    },
    {
      question: locale === 'ar' ? 'كيف أبني مشروع برمجي ناجح؟' : 'How do I build a successful programming project?',
      answer: locale === 'ar' ? 'ابدأ بفكرة بسيطة، خطط جيداً، اكتب كود نظيف، اختبر مشروعك باستمرار، واطلب آراء المستخدمين. لا تحاول بناء شيء معقد من البداية.' : 'Start with a simple idea, plan well, write clean code, test your project continuously, and seek user feedback. Don\'t try to build something complex from the beginning.'
    },
    {
      question: locale === 'ar' ? 'ما الفرق بين تطوير الواجهات الأمامية والخلفية؟' : 'What is the difference between frontend and backend development?',
      answer: locale === 'ar' ? 'تطوير الواجهات الأمامية يركز على ما يراه المستخدم (التصميم والتفاعل)، بينما تطوير الواجهات الخلفية يركز على الخوادم وقواعد البيانات والمنطق.' : 'Frontend development focuses on what users see (design and interaction), while backend development focuses on servers, databases, and business logic.'
    }
  ];

  // Filter FAQ items based on search query
  const filteredFaqItems = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add staggered animation for FAQ items
  const { visibleItems: faqVisible, setRef: setFaqRef } = useStaggeredAnimation(filteredFaqItems, 100);

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen relative page-enter ${isLoaded ? 'loaded' : ''}`}>
        {/* Background that extends to top */}
        <div className="absolute inset-0 hero-background" style={{top: '-100px'}}></div>
        
        {/* Main Content */}
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-16">
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
              {t('faq.title')}
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
                ? 'اكتشف إجابات شاملة لجميع استفساراتك التعليمية والتقنية.'
                : 'Discover comprehensive answers to all your educational and technical inquiries.'
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
                  placeholder={locale === 'ar' ? 'ابحث في الأسئلة...' : 'Search in questions...'}
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

        {/* FAQ Items */}
        <div className="space-y-4 mb-16">
          {filteredFaqItems.length === 0 && searchQuery ? (
            <div className={`text-center py-12 scroll-item ${isLoaded ? 'animate-scale-in stagger-3' : 'opacity-0'}`}>
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
              <p 
                className="font-cairo mt-2"
                style={{
                  color: '#9CA3AF',
                  fontSize: '14px',
                  fontWeight: 400
                }}
              >
                {locale === 'ar' ? 'جرب البحث بكلمات مختلفة' : 'Try searching with different keywords'}
              </p>
            </div>
          ) : (
            filteredFaqItems.map((item, index) => (
              <div
                key={index}
                ref={setFaqRef(index)}
                className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover-lift scroll-item ${
                  faqVisible.has(index) ? 'visible' : ''
                }`}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleItem(index)}
                  className={`w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-all duration-300 ${
                    locale === 'ar' ? 'text-right' : 'text-left'
                  }`}
                >
                  {/* Question Mark Icon - Left Side */}
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ 
                      backgroundColor: openItem === index ? '#00AC96' : '#E8F8F5', 
                      transform: locale === 'ar' ? 'scaleX(-1)' : 'scaleX(1)'
                    }}
                  >
                    <span 
                      className="font-cairo font-bold transition-colors duration-300"
                      style={{ 
                        color: openItem === index ? '#FFFFFF' : '#292561',
                        fontSize: '18px'
                      }}
                    >
                      {locale === 'ar' ? '؟' : '?'}
                    </span>
                  </div>
                  
                  {/* Question Text - Center */}
                  <div className="flex-1 mx-4">
                    <h3 
                      className={`font-semibold font-cairo transition-all duration-300 ${
                        locale === 'ar' ? 'text-right' : 'text-left'
                      }`}
                      style={{
                        color: openItem === index ? '#00AC96' : '#292561',
                        fontSize: '18px'
                      }}
                    >
                      {item.question}
                    </h3>
                  </div>
                  
                  {/* Plus/Minus Icon - Right Side */}
                  <div className="flex items-center">
                    <Icon
                      name={openItem === index ? 'minus' : 'plus'}
                      className="h-5 w-5 text-teal-600 transition-transform duration-300"
                    />
                  </div>
                </button>

                {/* Answer Content */}
                {openItem === index && (
                  <div className="px-6 pb-4 pt-2 border-t border-gray-100 animate-fade-in-up">
                    <p className={`text-gray-600 font-cairo leading-relaxed ${
                      locale === 'ar' ? 'text-right' : 'text-left'
                    }`}>
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Section */}
        <div className="flex justify-center scroll-item">
          {/* Card Container */}
          <div 
            className="p-12 text-center flex-shrink-0 contact-card hover-lift"
            style={{
              borderRadius: '10px',
              border: '1px solid #F6F6FA',
              background: '#FFF',
              width: '973px',
              height: '429px'
            }}
          >
            {/* Title */}
            <h2 
              className="font-cairo font-bold"
              style={{
                color: '#00AC96',
                fontSize: 'clamp(24px, 4vw, 32px)',
                lineHeight: 'normal',
                marginBottom: '0.5rem'
              }}
            >
              {locale === 'ar' ? 'اترك سؤالك' : 'Leave Your Question'}
            </h2>
            
            {/* Description */}
            <p 
              className="font-cairo mb-8 max-w-2xl mx-auto"
              style={{
                color: 'rgb(26, 25, 40)',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '26px',
                textAlign: 'center',
                fontFamily: 'Cairo',
                fontStyle: 'normal'
              }}
            >
              {locale === 'ar' 
                ? 'شاركنا استفساراتك وسنقوم بالرد عليك في أقرب وقت ممكن.'
                : 'Share your inquiries with us and we will respond to you as soon as possible.'
              }
            </p>

            {/* Input Field */}
            <div className="mb-8 mx-auto max-w-2xl">
              <div 
                className="flex items-center justify-between transition-all duration-300 hover:shadow-md"
                style={{
                  display: 'flex',
                  padding: '20px 24px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '6px',
                  border: '1px solid #EBEBF0',
                  background: '#FFF'
                }}
              >
                <span 
                  className="mr-4 transition-all duration-300"
                  style={{ 
                    color: '#00AC96', 
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}
                >
                  ؟
                </span>
                <input
                  type="text"
                  placeholder={locale === 'ar' ? 'محتوى السؤال أو الاستفسار' : 'Question or inquiry content'}
                  className={`flex-1 border-0 focus:ring-0 focus:outline-none font-cairo transition-all duration-300 ${
                    locale === 'ar' ? 'text-right' : 'text-left'
                  }`}
                  style={{
                    backgroundColor: 'transparent',
                    fontSize: '16px',
                    color: '#9CA3AF',
                    fontWeight: 400
                  }}
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
            </div>

            {/* Send Button */}
            <div className="flex justify-center">
              <button
                onClick={() => window.location.href = `/${locale}/contact`}
                className="font-cairo font-bold text-white btn-animate"
                style={{
                  display: 'flex',
                  width: '398px',
                  padding: '14px 30px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  borderRadius: '10px',
                  background: '#292561',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                {locale === 'ar' ? 'إرسال' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}