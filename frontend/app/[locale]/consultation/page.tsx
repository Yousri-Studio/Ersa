'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import toast from 'react-hot-toast';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';

interface ConsultationFormData {
  fullName: string;
  userName: string;
  email: string;
  mobileNumber: string;
  country: string;
  message: string;
}

export default function ConsultationPage() {
  const locale = useLocale();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+966');
  const isLoaded = usePageLoad(100);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ConsultationFormData>();

  const onSubmit = async (data: ConsultationFormData) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement API call to submit consultation request
      console.log('Consultation request:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(
        locale === 'ar' 
          ? 'تم إرسال طلب الاستشارة بنجاح! سنتواصل معك قريباً.'
          : 'Consultation request sent successfully! We will contact you soon.'
      );
      
      reset();
    } catch (error) {
      toast.error(
        locale === 'ar'
          ? 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.'
          : 'An error occurred while sending the request. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const countries = [
    'Saudi Arabia', 'United Arab Emirates', 'Kuwait', 'Qatar', 'Bahrain', 'Oman',
    'Egypt', 'Jordan', 'Lebanon', 'Syria', 'Iraq', 'Yemen', 'Palestine',
    'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan', 'Other'
  ];

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
              {locale === 'ar' ? 'طلب استشارة' : 'Request Consultation'}
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
                ? 'يمكنك مراسلتنا حالياً إن كان لديك استفسار أو احتياج لاستشارة بخصوص دورة أو خدمة'
                : 'You can contact us now if you have any inquiry or need consultation regarding a course or service'
              }
            </p>
          </div>

          {/* Consultation Form */}
          <div className={`bg-white rounded-xl shadow-lg overflow-hidden scroll-item ${isLoaded ? 'animate-scale-in stagger-2' : 'opacity-0'}`}>
          <form className="p-6 md:p-12" onSubmit={handleSubmit(onSubmit)}>
            {/* Topic Title - Full Width */}
            <div className="mb-6">
              <label 
                htmlFor="fullName" 
                className="block font-cairo mb-3"
                style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
              >
                {locale === 'ar' ? 'عنوان الموضوع' : 'Subject Title'}
              </label>
              <div className="relative">
                <input
                  {...register('fullName', {
                    required: locale === 'ar' ? 'عنوان الموضوع مطلوب' : 'Subject title is required',
                    minLength: {
                      value: 2,
                      message: locale === 'ar' ? 'العنوان يجب أن يكون حرفين على الأقل' : 'Title must be at least 2 characters',
                    },
                  })}
                  type="text"
                  autoComplete="name"
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo"
                  placeholder={locale === 'ar' ? 'عنوان الرسالة' : 'Message Title'}
                  style={{ fontSize: '14px' }}
                />
                <Icon 
                  name="pen" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  color="#00AC96"
                />
              </div>
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-600 font-cairo">{errors.fullName.message}</p>
              )}
            </div>

            {/* User Name and Email - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* User Name */}
              <div>
                <label 
                  htmlFor="userName" 
                  className="block font-cairo mb-3"
                  style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                >
                  {locale === 'ar' ? 'اسم المستخدم' : 'User Name'}
                </label>
                <div className="relative">
                  <input
                    {...register('userName', {
                      required: locale === 'ar' ? 'اسم المستخدم مطلوب' : 'User name is required',
                      minLength: {
                        value: 2,
                        message: locale === 'ar' ? 'اسم المستخدم يجب أن يكون حرفين على الأقل' : 'User name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo"
                    placeholder={locale === 'ar' ? 'اسم المستخدم' : 'User Name'}
                    style={{ fontSize: '14px' }}
                  />
                                  <Icon 
                  name="pen" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  color="#00AC96"
                />
                </div>
                {errors.userName && (
                  <p className="mt-2 text-sm text-red-600 font-cairo">{errors.userName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
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
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo"
                    placeholder={locale === 'ar' ? 'example@domain.com' : 'example@domain.com'}
                    style={{ fontSize: '14px' }}
                  />
                  <Icon 
                    name="envelope" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                    color="#00AC96"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 font-cairo">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Mobile Number and Country - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Mobile Number */}
              <div>
                <label 
                  htmlFor="mobileNumber" 
                  className="block font-cairo mb-3"
                  style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                >
                  {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <div className="relative">
                  <input
                    {...register('mobileNumber')}
                    type="tel"
                    autoComplete="tel"
                    className="w-full px-4 py-3 pr-10 pl-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo text-right"
                    placeholder={locale === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                    style={{ fontSize: '14px' }}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    <select 
                      className="border-0 bg-transparent focus:outline-none font-cairo text-gray-600"
                      style={{ fontSize: '14px' }}
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                    >
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+965">🇰🇼 +965</option>
                      <option value="+974">🇶🇦 +974</option>
                      <option value="+973">🇧🇭 +973</option>
                      <option value="+968">🇴🇲 +968</option>
                      <option value="+962">🇯🇴 +962</option>
                      <option value="+961">🇱🇧 +961</option>
                      <option value="+20">🇪🇬 +20</option>
                      <option value="+212">🇲🇦 +212</option>
                      <option value="+216">🇹🇳 +216</option>
                      <option value="+213">🇩🇿 +213</option>
                      <option value="+964">🇮🇶 +964</option>
                      <option value="+963">🇸🇾 +963</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                  </div>
                  <Icon 
                    name="phone" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                    color="#00AC96"
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="mt-2 text-sm text-red-600 font-cairo">{errors.mobileNumber.message}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label 
                  htmlFor="country" 
                  className="block font-cairo mb-3"
                  style={{ color: '#292561', fontWeight: 700, fontSize: '12px' }}
                >
                  {locale === 'ar' ? 'الدولة' : 'Country'}
                </label>
                <div className="relative">
                  <select
                    {...register('country', {
                      required: locale === 'ar' ? 'الدولة مطلوبة' : 'Country is required',
                    })}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo appearance-none"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">
                      {locale === 'ar' ? 'اختر الدولة' : 'Select Country'}
                    </option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {locale === 'ar' && country === 'Saudi Arabia' ? 'المملكة العربية السعودية' :
                         locale === 'ar' && country === 'United Arab Emirates' ? 'الإمارات العربية المتحدة' :
                         locale === 'ar' && country === 'Kuwait' ? 'الكويت' :
                         locale === 'ar' && country === 'Qatar' ? 'قطر' :
                         locale === 'ar' && country === 'Bahrain' ? 'البحرين' :
                         locale === 'ar' && country === 'Oman' ? 'عُمان' :
                         locale === 'ar' && country === 'Egypt' ? 'مصر' :
                         locale === 'ar' && country === 'Jordan' ? 'الأردن' :
                         locale === 'ar' && country === 'Lebanon' ? 'لبنان' :
                         locale === 'ar' && country === 'Other' ? 'أخرى' :
                         country}
                      </option>
                    ))}
                  </select>
                  <Icon 
                    name="chevron-down" 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                    color="#9CA3AF"
                  />
                  <Icon 
                    name="globe" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                    color="#00AC96"
                  />
                </div>
                {errors.country && (
                  <p className="mt-2 text-sm text-red-600 font-cairo">{errors.country.message}</p>
                )}
              </div>
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
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-cairo resize-none"
                  placeholder={locale === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  style={{ fontSize: '14px' }}
                />
                <Icon 
                  name="message" 
                  className="absolute right-3 top-4 h-4 w-4"
                  color="#00AC96"
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
                  : (locale === 'ar' ? 'إرسال' : 'Send')
                }
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
    </>
  );
}
