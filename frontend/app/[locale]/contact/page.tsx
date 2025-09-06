'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@/components/ui/icon';
import toast from 'react-hot-toast';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';
import ErrorBoundary from '@/components/ErrorBoundary';
import { contactApi } from '@/lib/api';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

export default function ContactPage() {
  const locale = useLocale();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const isLoaded = usePageLoad(100);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    
    try {
      const response = await contactApi.submitContactForm({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        subject: data.subject,
        message: data.message,
        phone: data.phone,
        locale: locale
      });
      
      if (response.data.success) {
        toast.success(
          locale === 'ar' 
            ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'
            : 'Your message has been sent successfully! We will contact you soon.'
        );
        
        reset();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast.error(
        locale === 'ar'
          ? 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.'
          : 'An error occurred while sending the message. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
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
              {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
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
                ? 'تواصل مع فريقنا. نحن هنا لمساعدتك في تحقيق أهدافك التعليمية'
                : 'Get in touch with our team. We\'re here to help you achieve your learning goals.'
              }
            </p>
          </div>

          {/* Contact Form */}
          <div className={`bg-white rounded-xl shadow-lg overflow-hidden scroll-item ${isLoaded ? 'animate-scale-in stagger-2' : 'opacity-0'}`}>
          <form className="p-6 md:p-12" onSubmit={handleSubmit(onSubmit)}>
            {/* Subject - Full Width */}
            <div className="mb-6">
              <label 
                htmlFor="subject" 
                className="block font-cairo mb-3"
                style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
              >
                {locale === 'ar' ? 'عنوان الموضوع' : 'Subject'}
              </label>
              <div className="relative">
                <input
                  {...register('subject', {
                    required: locale === 'ar' ? 'عنوان الموضوع مطلوب' : 'Subject is required',
                    minLength: {
                      value: 2,
                      message: locale === 'ar' ? 'العنوان يجب أن يكون حرفين على الأقل' : 'Subject must be at least 2 characters',
                    },
                  })}
                  type="text"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo ${
                    locale === 'ar' ? 'pr-10' : 'pl-10'
                  }`}
                  placeholder={locale === 'ar' ? 'عنوان الرسالة' : 'Message Subject'}
                  style={{ fontSize: '14px' }}
                />
                <Icon 
                  name="pen" 
                  className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                    locale === 'ar' ? 'right-3' : 'left-3'
                  }`}
                  style={{ color: '#00AC96' }}
                />
              </div>
              {errors.subject && (
                <p className="mt-2 text-sm text-red-600 font-cairo">{errors.subject.message}</p>
              )}
            </div>

            {/* First Name and Last Name - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* First Name */}
              <div>
                <label 
                  htmlFor="firstName" 
                  className="block font-cairo mb-3"
                  style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                >
                  {locale === 'ar' ? 'الاسم الأول' : 'First Name'}
                </label>
                <div className="relative">
                  <input
                    {...register('firstName', {
                      required: locale === 'ar' ? 'الاسم الأول مطلوب' : 'First name is required',
                      minLength: {
                        value: 2,
                        message: locale === 'ar' ? 'الاسم يجب أن يكون حرفين على الأقل' : 'Name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo ${
                      locale === 'ar' ? 'pr-10' : 'pl-10'
                    }`}
                    placeholder={locale === 'ar' ? 'الاسم الأول' : 'First Name'}
                    style={{ fontSize: '14px' }}
                  />
                  <Icon 
                    name="user" 
                    className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                      locale === 'ar' ? 'right-3' : 'left-3'
                    }`}
                    color="#00AC96"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-2 text-sm text-red-600 font-cairo">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label 
                  htmlFor="lastName" 
                  className="block font-cairo mb-3"
                  style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                >
                  {locale === 'ar' ? 'الاسم الأخير' : 'Last Name'}
                </label>
                <div className="relative">
                  <input
                    {...register('lastName', {
                      required: locale === 'ar' ? 'الاسم الأخير مطلوب' : 'Last name is required',
                      minLength: {
                        value: 2,
                        message: locale === 'ar' ? 'الاسم يجب أن يكون حرفين على الأقل' : 'Name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo ${
                      locale === 'ar' ? 'pr-10' : 'pl-10'
                    }`}
                    placeholder={locale === 'ar' ? 'الاسم الأخير' : 'Last Name'}
                    style={{ fontSize: '14px' }}
                  />
                  <Icon 
                    name="user" 
                    className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                      locale === 'ar' ? 'right-3' : 'left-3'
                    }`}
                    color="#00AC96"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-2 text-sm text-red-600 font-cairo">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email - Full Width */}
            <div className="mb-6">
              <label 
                htmlFor="email" 
                className="block font-cairo mb-3"
                style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
              >
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  {...register('email', {
                    required: locale === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: locale === 'ar' ? 'عنوان بريد إلكتروني غير صحيح' : 'Invalid email address',
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo ${
                    locale === 'ar' ? 'pr-10' : 'pl-10'
                  }`}
                  placeholder={locale === 'ar' ? 'example@domain.com' : 'example@domain.com'}
                  style={{ fontSize: '14px' }}
                />
                <Icon 
                  name="envelope" 
                  className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                    locale === 'ar' ? 'right-3' : 'left-3'
                  }`}
                  color="#00AC96"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 font-cairo">{errors.email.message}</p>
              )}
            </div>

            {/* Message - Full Width */}
            <div>
              <label 
                htmlFor="message" 
                className="block font-cairo mb-3"
                style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
              >
                {locale === 'ar' ? 'الرسالة' : 'Message'}
              </label>
              <div className="relative">
                <textarea
                  {...register('message', {
                    required: locale === 'ar' ? 'الرسالة مطلوبة' : 'Message is required',
                    minLength: {
                      value: 10,
                      message: locale === 'ar' ? 'الرسالة يجب أن تكون 10 أحرف على الأقل' : 'Message must be at least 10 characters',
                    },
                  })}
                  rows={6}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo resize-none ${
                    locale === 'ar' ? 'pr-10' : 'pl-10'
                  }`}
                  placeholder={locale === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  style={{ fontSize: '14px' }}
                />
                <Icon 
                  name="message" 
                  className={`absolute top-4 h-4 w-4 ${
                    locale === 'ar' ? 'right-3' : 'left-3'
                  }`}
                  style={{ color: '#00AC96' }}
                />
              </div>
              {errors.message && (
                <p className="mt-2 text-sm text-red-600 font-cairo">{errors.message.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="px-16 py-4 font-cairo font-bold text-white rounded-xl btn-animate hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#292561',
                  fontSize: '16px',
                  fontWeight: 600,
                  width: '410px'
                }}
              >
                {isLoading 
                  ? (locale === 'ar' ? 'جارٍ الإرسال...' : 'Sending...')
                  : (locale === 'ar' ? 'إرسال الرسالة' : 'Send Message')
                }
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
    </>
    </ErrorBoundary>
  );
}
