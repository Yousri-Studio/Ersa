'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const t = useTranslations('faq');
  const locale = useLocale();
  const [openItems, setOpenItems] = useState<number[]>([0]); // First item open by default

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData: FAQItem[] = [
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
    }
  ];

  return (
    <section className="py-16 bg-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#292561] mb-6 font-cairo">
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-cairo">
            {t('subtitle')}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = openItems.includes(index);
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className={`w-full px-6 py-5 relative flex items-center transition-all duration-200 ${
                    isOpen ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                >
                  {locale === 'ar' ? (
                    <>
                      <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                        <Icon 
                          name={isOpen ? 'minus' : 'plus'} 
                          className={`h-5 w-5 text-gray-600`}
                        />
                      </div>
                      <span className={`font-medium text-lg transition-colors w-full text-right pr-12 ${
                        isOpen ? 'text-[#00AC96]' : 'text-gray-700'
                      }`}>
                        {item.question}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={`font-medium text-lg transition-colors flex-1 text-left pl-4 ${
                        isOpen ? 'text-[#00AC96]' : 'text-gray-700'
                      }`}>
                        {item.question}
                      </span>
                      <div className="flex-shrink-0">
                        <Icon 
                          name={isOpen ? 'minus' : 'plus'} 
                          className={`h-5 w-5 text-gray-600`}
                        />
                      </div>
                    </>
                  )}
                </button>
                
                {/* Animated content */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                >
                  <div className="px-6 pb-5">
                    <div className="border-t border-gray-100 pt-4">
                      <p className={`text-gray-600 leading-relaxed text-base font-cairo ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-10">
          <Link
            href={`/${locale}/faq`}
            className="inline-flex items-center px-8 py-3 border-2 border-[#00AC96] text-[#00AC96] font-semibold rounded-lg hover:bg-[#00AC96] hover:text-white transition-colors shadow-md"
          >
            {t('view-all')}
          </Link>
        </div>
      </div>
    </section>
  );
}
