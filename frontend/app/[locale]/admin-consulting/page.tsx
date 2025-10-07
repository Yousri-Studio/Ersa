'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';

export default function AdminConsultingPage() {
  const locale = useLocale();
  const t = useTranslations();
  const isLoaded = usePageLoad(100);

  const introText = locale === 'ar' 
    ? 'في إرساء، نساعدك على اتخاذ القرارات وتحويل عملياتك إلى إنجازات من خلال حلول استشارية مبنية على أحدث المنهجيات العالمية وخبرات عملية تراكمية في قطاعات متعددة.'
    : 'At Ersa, we help you make decisions and transform your operations into achievements through consulting solutions based on the latest global methodologies and cumulative practical experience across multiple sectors.';

  const introSubtitle = locale === 'ar'
    ? 'سواء كنت تسعى إلى:'
    : 'Whether you are seeking to:';

  const services = locale === 'ar' ? [
    'إعادة هيكلة منظمتك وتحسين الكفاءة التشغيلية.',
    'بناء استراتيجية نمو مستدامة تحقق أهدافك المستقبلية.',
    'تطوير رأس المال البشري ورفع مستوى الأداء.',
    'تبني تقنيات الذكاء الاصطناعي والتحول الرقمي في أعمالك.',
    'التميز المؤسسي والحوكمة.'
  ] : [
    'Restructure your organization and improve operational efficiency.',
    'Build a sustainable growth strategy that achieves your future goals.',
    'Develop human capital and raise performance levels.',
    'Adopt artificial intelligence technologies and digital transformation in your business.',
    'Institutional excellence and governance.'
  ];

  const closingText = locale === 'ar'
    ? 'فريقنا من المستشارين المتميزين سيعمل معك على تصميم حلول مخصصة تناسب واقع وتحقق نتائج قابلة للقياس.'
    : 'Our team of distinguished consultants will work with you to design customized solutions that fit your reality and achieve measurable results.';

  const expertise = locale === 'ar' ? [
    {
      title: 'خبرة متخصصة',
      description: 'فريق من الخبراء ذوي الكفاءة العالية في مجال الإدارة والتدريب'
    },
    {
      title: 'حلول مخصصة',
      description: 'استشارات مصممة خصيصاً لتلبية احتياجات مؤسستك الفريدة'
    },
    {
      title: 'منهجية علمية',
      description: 'نهج منظم يعتمد على أفضل الممارسات العالمية'
    },
    {
      title: 'نتائج ملموسة',
      description: 'تركيز على تحقيق أهداف قابلة للقياس والتحسين المستمر'
    }
  ] : [
    {
      title: 'Specialized Expertise',
      description: 'Team of highly qualified experts in management and training'
    },
    {
      title: 'Customized Solutions',
      description: 'Consulting designed specifically to meet your organization\'s unique needs'
    },
    {
      title: 'Scientific Methodology',
      description: 'Systematic approach based on global best practices'
    },
    {
      title: 'Tangible Results',
      description: 'Focus on achieving measurable goals and continuous improvement'
    }
  ];

  const process = locale === 'ar' ? [
    {
      step: '١',
      title: 'التقييم الأولي',
      description: 'نقوم بتحليل شامل لاحتياجاتك وتحدياتك الحالية'
    },
    {
      step: '٢',
      title: 'التخطيط',
      description: 'نضع خطة عمل مفصلة ومخصصة لتحقيق أهدافك'
    },
    {
      step: '٣',
      title: 'التنفيذ',
      description: 'نعمل معك جنباً إلى جنب لتطبيق الحلول'
    },
    {
      step: '٤',
      title: 'المتابعة والتحسين',
      description: 'نضمن استدامة النتائج من خلال المتابعة المستمرة'
    }
  ] : [
    {
      step: '1',
      title: 'Initial Assessment',
      description: 'We conduct a comprehensive analysis of your current needs and challenges'
    },
    {
      step: '2',
      title: 'Planning',
      description: 'We develop a detailed and customized action plan to achieve your goals'
    },
    {
      step: '3',
      title: 'Implementation',
      description: 'We work side by side with you to implement solutions'
    },
    {
      step: '4',
      title: 'Follow-up and Improvement',
      description: 'We ensure sustainability of results through continuous follow-up'
    }
  ];

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen page-enter ${isLoaded ? 'loaded' : ''}`}>
        {/* Hero Section */}
        <div className="relative overflow-hidden" style={{ backgroundColor: '#1A1928', minHeight: '500px' }}>
          <div className="absolute inset-0">
            <img 
              src="/images/Solutions Card BG.png" 
              alt="Admin Consulting Background"
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
                {locale === 'ar' ? 'الخدمات الاستشارية' : 'Consulting Services'}
              </h1>
              <p 
                className="text-white font-cairo max-w-3xl mx-auto text-lg md:text-xl leading-relaxed"
              >
                {introText}
              </p>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-12 ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
              <h2 
                className="font-cairo font-bold mb-6"
                style={{ color: '#292561', fontSize: 'clamp(28px, 4vw, 36px)' }}
              >
                {locale === 'ar' ? 'الخدمات الاستشارية' : 'Consulting Services'}
              </h2>
              <p className="text-gray-700 font-cairo text-lg max-w-4xl mx-auto mb-8 leading-relaxed">
                {introText}
              </p>
              <p className="text-gray-600 font-cairo text-xl max-w-2xl mx-auto mb-8 font-semibold">
                {introSubtitle}
              </p>
            </div>

            <div className={`max-w-4xl mx-auto mb-12 ${isLoaded ? 'animate-scale-in stagger-2' : 'opacity-0'}`}>
              {services.map((service, index) => (
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
                    {service}
                  </p>
                </div>
              ))}
            </div>

            <div className={`text-center mt-12 ${isLoaded ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
              <p className="text-gray-700 font-cairo text-xl leading-relaxed max-w-4xl mx-auto font-semibold">
                {closingText}
              </p>
            </div>
          </div>
        </div>

        {/* Expertise Section */}
        <div className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-12 ${isLoaded ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
              <h2 
                className="font-cairo font-bold mb-4"
                style={{ color: '#292561', fontSize: 'clamp(28px, 4vw, 36px)' }}
              >
                {locale === 'ar' ? 'لماذا نحن؟' : 'Why Us?'}
              </h2>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${isLoaded ? 'animate-slide-in-right stagger-5' : 'opacity-0'}`}>
              {expertise.map((item, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#00AC96' }}
                    >
                      <Icon 
                        name="briefcase" 
                        className="text-white"
                        style={{ height: '1.5rem', width: '1.5rem' }}
                      />
                    </div>
                    <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
                      <h3 
                        className="font-cairo font-bold mb-2"
                        style={{ color: '#292561', fontSize: '20px' }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-gray-600 font-cairo leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-12 ${isLoaded ? 'animate-fade-in-up stagger-6' : 'opacity-0'}`}>
              <h2 
                className="font-cairo font-bold mb-4"
                style={{ color: '#292561', fontSize: 'clamp(28px, 4vw, 36px)' }}
              >
                {locale === 'ar' ? 'كيف نعمل' : 'How We Work'}
              </h2>
              <p className="text-gray-600 font-cairo text-lg max-w-2xl mx-auto">
                {locale === 'ar'
                  ? 'منهجية عمل واضحة ومنظمة لضمان تحقيق أفضل النتائج'
                  : 'Clear and organized work methodology to ensure the best results'
                }
              </p>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isLoaded ? 'animate-scale-in stagger-7' : 'opacity-0'}`}>
              {process.map((step, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 text-center"
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: '#00AC96' }}
                  >
                    <span className="text-white font-cairo font-bold text-2xl">
                      {step.step}
                    </span>
                  </div>
                  <h3 
                    className="font-cairo font-bold mb-3"
                    style={{ color: '#292561', fontSize: '18px' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-gray-600 font-cairo text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div 
          className="py-16"
          style={{ background: 'linear-gradient(135deg, #292561 0%, #1A1445 100%)' }}
        >
          <div className={`mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center ${isLoaded ? 'animate-scale-in stagger-8' : 'opacity-0'}`}>
            <h2 
              className="font-cairo font-bold mb-6 text-white"
              style={{ fontSize: 'clamp(24px, 4vw, 32px)' }}
            >
              {locale === 'ar' ? 'ابدأ رحلة التطوير مع خبرائنا' : 'Start Your Development Journey with Our Experts'}
            </h2>
            <p className="text-gray-300 font-cairo text-lg mb-8 max-w-2xl mx-auto">
              {locale === 'ar'
                ? 'تواصل معنا اليوم واحصل على استشارة مجانية لمناقشة احتياجاتك وأهدافك'
                : 'Contact us today and get a free consultation to discuss your needs and goals'
              }
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
              {locale === 'ar' ? 'اطلب استشارة الآن' : 'Request Consultation Now'}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

