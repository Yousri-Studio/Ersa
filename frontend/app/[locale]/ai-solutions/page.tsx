'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';

export default function AISolutionsPage() {
  const locale = useLocale();
  const t = useTranslations();
  const isLoaded = usePageLoad(100);

  const introText = locale === 'ar'
    ? 'في عصر تتحول فيه البيانات إلى قرارات، لم يعد الذكاء الاصطناعي رفاهية، بل أصبح أداة استراتيجية تعيد تشكيل طريقة عمل المؤسسات وتمنحها ميزة تنافسية حقيقية. في إرساء، نمكّنك من توظيف الذكاء الاصطناعي في قلب عملياتك لتحقق كفاءة أعلى، وتفهم أعمق، وأثرًا أكبر في كل خطوة من رحلتك.'
    : 'In an era where data transforms into decisions, artificial intelligence is no longer a luxury, but a strategic tool that reshapes how organizations operate and gives them a real competitive advantage. At Ersa, we enable you to employ artificial intelligence at the heart of your operations to achieve higher efficiency, deeper understanding, and greater impact at every step of your journey.';

  const introSubtitle = locale === 'ar'
    ? 'تشمل حلولنا:'
    : 'Our solutions include:';

  const solutions = locale === 'ar' ? [
    'تحليل البيانات واتخاذ القرار: تحويل البيانات المعقدة إلى رؤى قابلة للتنفيذ تدعم قراراتك الاستراتيجية.',
    'الأتمتة الذكية: تقليل الوقت والتكلفة عبر أتمتة العمليات التشغيلية والإدارية بدقة عالية.',
    'تحليل الاحتياج والتطوير المؤسسي: بناء خطط تطوير وتدريب ذكية تعتمد على بيانات حقيقية، وليس التقدير.'
  ] : [
    'Data Analysis and Decision Making: Transform complex data into actionable insights that support your strategic decisions.',
    'Intelligent Automation: Reduce time and cost through precise automation of operational and administrative processes.',
    'Needs Analysis and Organizational Development: Build smart development and training plans based on real data, not estimates.'
  ];

  const naqadirTitle = locale === 'ar'
    ? 'نقدر AI - ذكاء يحوّل التدريب إلى استثمار'
    : 'Naqader AI - Intelligence that transforms training into investment';

  const naqadirDescription = locale === 'ar'
    ? 'يُعد نظام نقدر AI منصة ذكية لتحليل الاحتياج التدريبي وقياس الأثر، حيث يوفّر:'
    : 'Naqader AI is an intelligent platform for analyzing training needs and measuring impact, providing:';

  const naqadirFeatures = locale === 'ar' ? [
    'أكثر من 1,500 وصف وظيفي مرتبط بالجدارات المطلوبة.',
    'تحليل دقيق لاحتياجات التدريب بناءً على بيانات الأداء والوظائف.',
    'بناء البرامج الأكثر تأثيرًا في تطوير الكفاءات.',
    'تقارير ولوحات تحكم تدعم قرارات الموارد البشرية والاستثمار في رأس المال البشري.'
  ] : [
    'Over 1,500 job descriptions linked to required competencies.',
    'Accurate analysis of training needs based on performance and job data.',
    'Building the most impactful programs for competency development.',
    'Reports and dashboards that support HR decisions and human capital investment.'
  ];

  const closingText = locale === 'ar'
    ? 'ببساطة، نحن لا نقدم "أدوات" ذكاء اصطناعي… بل نصمم حلولًا تغيّر طريقة اتخاذ القرار وتطوير الأداء في مؤسستك.'
    : 'Simply put, we don\'t offer "AI tools"... we design solutions that change the way you make decisions and develop performance in your organization.';

  const ctaText = locale === 'ar'
    ? 'املأ نموذج طلب الاستشارة أدناه، ودعنا نرسم معًا مستقبلًا أذكى وأكثر كفاءة لمنظمتك.'
    : 'Fill out the consultation request form below, and let us draw together a smarter and more efficient future for your organization.';

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen page-enter ${isLoaded ? 'loaded' : ''}`}>
        {/* Hero Section */}
        <div className="relative overflow-hidden" style={{ backgroundColor: '#1A1928', minHeight: '500px' }}>
          <div className="absolute inset-0">
            <img 
              src="/images/Solutions Card BG.png" 
              alt="AI Background"
              className="w-full h-full object-cover opacity-30"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
          
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className={`text-center ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
              <h1 
                className="font-cairo font-bold mb-6"
                style={{ color: '#00AC96', fontSize: 'clamp(32px, 5vw, 48px)' }}
              >
                {locale === 'ar' ? 'حلول الذكاء الاصطناعي' : 'AI Solutions'}
              </h1>
              <p 
                className="text-white font-cairo max-w-3xl mx-auto text-lg md:text-xl leading-relaxed"
              >
                {introText}
              </p>
            </div>
          </div>
        </div>

        {/* Solutions Section */}
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-12 ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
              <p className="text-gray-600 font-cairo text-xl max-w-2xl mx-auto mb-8 font-semibold">
                {introSubtitle}
              </p>
            </div>

            <div className={`max-w-4xl mx-auto mb-12 ${isLoaded ? 'animate-scale-in stagger-2' : 'opacity-0'}`}>
              {solutions.map((solution, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 mb-6"
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: '#00AC96' }}
                  >
                    <Icon 
                      name="check" 
                      className="text-white"
                      style={{ height: '1.0rem', width: '1.0rem' }}
                    />
                  </div>
                  <p className={`text-gray-800 font-cairo text-lg leading-relaxed ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Naqader AI Section */}
        <div className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-12 ${isLoaded ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
              <h2 
                className="font-cairo font-bold mb-6"
                style={{ color: '#292561', fontSize: 'clamp(28px, 4vw, 36px)' }}
              >
                {locale === 'ar' ? 'أبرز حلولنا المبتكرة:' : 'Our Innovative Solutions:'}
              </h2>
              <h3 
                className="font-cairo font-bold mb-4"
                style={{ color: '#00AC96', fontSize: 'clamp(24px, 3vw, 32px)' }}
              >
                {naqadirTitle}
              </h3>
              <p className="text-gray-700 font-cairo text-lg max-w-4xl mx-auto mb-8 leading-relaxed">
                {naqadirDescription}
              </p>
            </div>

            <div className={`max-w-4xl mx-auto mb-12 ${isLoaded ? 'animate-scale-in stagger-4' : 'opacity-0'}`}>
              {naqadirFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 mb-6"
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: '#00AC96' }}
                  >
                    <Icon 
                      name="check" 
                      className="text-white"
                      style={{ height: '1.0rem', width: '1.0rem' }}
                    />
                  </div>
                  <p className={`text-gray-800 font-cairo text-lg leading-relaxed ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            <div className={`text-center mt-12 ${isLoaded ? 'animate-fade-in-up stagger-5' : 'opacity-0'}`}>
              <p className="text-gray-700 font-cairo text-xl leading-relaxed max-w-4xl mx-auto font-semibold">
                {closingText}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div 
          className="py-16"
          style={{ background: 'linear-gradient(135deg, #292561 0%, #1A1445 100%)' }}
        >
          <div className={`mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center ${isLoaded ? 'animate-scale-in stagger-6' : 'opacity-0'}`}>
            <p className="text-gray-300 font-cairo text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
              {ctaText}
            </p>
            <Link
              href={`/${locale}/consultation`}
              className="inline-flex items-center justify-center font-cairo font-semibold text-white transition-all duration-300 hover:shadow-xl"
              style={{
                width: '250px',
                height: '55px',
                borderRadius: '12px',
                backgroundColor: '#00AC96',
                fontSize: '16px'
              }}
            >
              {locale === 'ar' ? 'اطلب استشارة مجانية' : 'Request Free Consultation'}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

