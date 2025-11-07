'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@/components/ui/icon';
import toast from 'react-hot-toast';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';
import Link from 'next/link';
import { contactApi } from '@/lib/api';

interface SupportFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export default function SupportPage() {
  const locale = useLocale();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const isLoaded = usePageLoad(100);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SupportFormData>({
    defaultValues: {
      priority: 'medium'
    }
  });

  const onSubmit = async (data: SupportFormData) => {
    setIsLoading(true);
    
    try {
      const response = await contactApi.submitContactForm({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        subject: `[${data.priority.toUpperCase()}] ${data.subject}`,
        message: data.message,
        locale: locale
      });
      
      if (response.data.success) {
        toast.success(
          locale === 'ar' 
            ? 'تم إرسال طلب الدعم بنجاح! سنتواصل معك قريباً.'
            : 'Your support request has been sent successfully! We will contact you soon.'
        );
        
        reset();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Support form error:', error);
      toast.error(
        locale === 'ar'
          ? 'حدث خطأ أثناء إرسال طلب الدعم. يرجى المحاولة مرة أخرى.'
          : 'An error occurred while sending the support request. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const supportFeatures = [
    {
      icon: 'clock',
      title: locale === 'ar' ? 'دعم على مدار الساعة' : '24/7 Support',
      description: locale === 'ar' 
        ? 'نحن هنا لمساعدتك في أي وقت'
        : 'We are here to help you anytime'
    },
    {
      icon: 'chat-bubble-left-right',
      title: locale === 'ar' ? 'استجابة سريعة' : 'Quick Response',
      description: locale === 'ar'
        ? 'نرد على استفساراتك خلال 24 ساعة'
        : 'We respond to your inquiries within 24 hours'
    },
    {
      icon: 'user-group',
      title: locale === 'ar' ? 'فريق محترف' : 'Professional Team',
      description: locale === 'ar'
        ? 'فريق دعم متخصص وذو خبرة'
        : 'Specialized and experienced support team'
    }
  ];

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
              {t('footer.technical-support')}
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
                ? 'نحن هنا لمساعدتك في حل أي مشكلة تقنية أو استفسار'
                : 'We are here to help you solve any technical issue or inquiry'
              }
            </p>
          </div>

          {/* Support Features */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            {supportFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center hover-lift scroll-item border border-gray-100"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
                  style={{ backgroundColor: '#E8F8F5' }}
                >
                  <Icon 
                    name={feature.icon} 
                    className="h-8 w-8"
                    style={{ color: '#00AC96' }}
                  />
                </div>
                <h3 
                  className="font-cairo font-bold mb-2"
                  style={{
                    color: '#292561',
                    fontSize: '18px'
                  }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="font-cairo"
                  style={{
                    color: '#6B7280',
                    fontSize: '14px',
                    lineHeight: '22px'
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Support Form */}
            <div className="lg:col-span-2">
              <div className={`bg-white rounded-xl shadow-lg overflow-hidden scroll-item ${isLoaded ? 'animate-scale-in stagger-3' : 'opacity-0'}`}>
                <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
                  <h2 
                    className="font-cairo font-bold mb-6"
                    style={{
                      color: '#292561',
                      fontSize: '24px'
                    }}
                  >
                    {locale === 'ar' ? 'أرسل طلب دعم' : 'Submit Support Request'}
                  </h2>

                  {/* Priority */}
                  <div className="mb-6">
                    <label 
                      htmlFor="priority" 
                      className="block font-cairo mb-3"
                      style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                    >
                      {locale === 'ar' ? 'الأولوية' : 'Priority'}
                    </label>
                    <select
                      {...register('priority')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo"
                      style={{ fontSize: '14px' }}
                    >
                      <option value="low">{locale === 'ar' ? 'منخفضة' : 'Low'}</option>
                      <option value="medium">{locale === 'ar' ? 'متوسطة' : 'Medium'}</option>
                      <option value="high">{locale === 'ar' ? 'عالية' : 'High'}</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div className="mb-6">
                    <label 
                      htmlFor="subject" 
                      className="block font-cairo mb-3"
                      style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                    >
                      {locale === 'ar' ? 'عنوان المشكلة' : 'Issue Subject'}
                    </label>
                    <input
                      {...register('subject', {
                        required: locale === 'ar' ? 'عنوان المشكلة مطلوب' : 'Subject is required',
                      })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo"
                      placeholder={locale === 'ar' ? 'مثال: مشكلة في تسجيل الدخول' : 'Example: Login issue'}
                      style={{ fontSize: '14px' }}
                    />
                    {errors.subject && (
                      <p className="mt-2 text-sm text-red-600 font-cairo">{errors.subject.message}</p>
                    )}
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label 
                        htmlFor="firstName" 
                        className="block font-cairo mb-3"
                        style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                      >
                        {locale === 'ar' ? 'الاسم الأول' : 'First Name'}
                      </label>
                      <input
                        {...register('firstName', {
                          required: locale === 'ar' ? 'الاسم الأول مطلوب' : 'First name is required',
                        })}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo"
                        style={{ fontSize: '14px' }}
                      />
                      {errors.firstName && (
                        <p className="mt-2 text-sm text-red-600 font-cairo">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label 
                        htmlFor="lastName" 
                        className="block font-cairo mb-3"
                        style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                      >
                        {locale === 'ar' ? 'الاسم الأخير' : 'Last Name'}
                      </label>
                      <input
                        {...register('lastName', {
                          required: locale === 'ar' ? 'الاسم الأخير مطلوب' : 'Last name is required',
                        })}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo"
                        style={{ fontSize: '14px' }}
                      />
                      {errors.lastName && (
                        <p className="mt-2 text-sm text-red-600 font-cairo">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <label 
                      htmlFor="email" 
                      className="block font-cairo mb-3"
                      style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                    >
                      {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      {...register('email', {
                        required: locale === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: locale === 'ar' ? 'عنوان بريد إلكتروني غير صحيح' : 'Invalid email address',
                        },
                      })}
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo"
                      style={{ fontSize: '14px' }}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 font-cairo">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label 
                      htmlFor="message" 
                      className="block font-cairo mb-3"
                      style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                    >
                      {locale === 'ar' ? 'وصف المشكلة' : 'Issue Description'}
                    </label>
                    <textarea
                      {...register('message', {
                        required: locale === 'ar' ? 'وصف المشكلة مطلوب' : 'Description is required',
                      })}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo resize-none"
                      placeholder={locale === 'ar' ? 'يرجى وصف المشكلة بالتفصيل...' : 'Please describe the issue in detail...'}
                      style={{ fontSize: '14px' }}
                    />
                    {errors.message && (
                      <p className="mt-2 text-sm text-red-600 font-cairo">{errors.message.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 font-cairo font-bold text-white rounded-xl btn-animate hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#292561',
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                  >
                    {isLoading 
                      ? (locale === 'ar' ? 'جارٍ الإرسال...' : 'Sending...')
                      : (locale === 'ar' ? 'إرسال طلب الدعم' : 'Send Support Request')
                    }
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Links */}
              <div className={`bg-white rounded-xl shadow-lg p-6 mb-6 scroll-item ${isLoaded ? 'animate-scale-in stagger-4' : 'opacity-0'}`}>
                <h3 
                  className="font-cairo font-bold mb-4"
                  style={{
                    color: '#292561',
                    fontSize: '18px'
                  }}
                >
                  {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
                </h3>
                <div className="space-y-3">
                  <Link
                    href={`/${locale}/help`}
                    className="flex items-center text-gray-700 hover:text-teal-600 transition-colors duration-300 font-cairo"
                  >
                    <Icon name="question-mark-circle" className="h-5 w-5 mr-2" />
                    {locale === 'ar' ? 'مركز المساعدة' : 'Help Center'}
                  </Link>
                  <Link
                    href={`/${locale}/faq`}
                    className="flex items-center text-gray-700 hover:text-teal-600 transition-colors duration-300 font-cairo"
                  >
                    <Icon name="book-open" className="h-5 w-5 mr-2" />
                    {locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQs'}
                  </Link>
                  <Link
                    href={`/${locale}/contact`}
                    className="flex items-center text-gray-700 hover:text-teal-600 transition-colors duration-300 font-cairo"
                  >
                    <Icon name="envelope" className="h-5 w-5 mr-2" />
                    {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                  </Link>
                </div>
              </div>

              {/* Contact Info */}
              <div className={`bg-gradient-to-br from-purple-900 to-teal-600 rounded-xl p-6 text-white scroll-item ${isLoaded ? 'animate-scale-in stagger-5' : 'opacity-0'}`}>
                <h3 className="font-cairo font-bold mb-4" style={{ fontSize: '18px' }}>
                  {locale === 'ar' ? 'تحتاج مساعدة فورية؟' : 'Need Immediate Help?'}
                </h3>
                <p className="font-cairo mb-4" style={{ fontSize: '14px' }}>
                  {locale === 'ar' 
                    ? 'يمكنك التواصل معنا مباشرة'
                    : 'You can contact us directly'
                  }
                </p>
                <div className="space-y-3">
                  <div className="flex items-center font-cairo">
                    <Icon name="envelope" className="h-5 w-5 mr-2" />
                    <span style={{ fontSize: '14px' }}><a href='mailto:info@ersa-training.com:'>info@ersa-training.com</a></span>
                  </div>
                  <div className="flex items-center font-cairo">
                    <Icon name="phone" className="h-5 w-5 mr-2" />
                    <span dir="ltr" style={{ fontSize: '14px', display: 'inline-block' }}>+966 557 7878 49</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

