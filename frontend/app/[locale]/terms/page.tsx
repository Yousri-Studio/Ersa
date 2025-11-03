'use client';

import { useTranslations, useLocale } from 'next-intl';
import { ScrollAnimations } from '@/components/scroll-animations';
import { usePageLoad } from '@/lib/use-animations';

export default function TermsOfServicePage() {
  const t = useTranslations();
  const locale = useLocale();
  const isLoaded = usePageLoad(100);

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen bg-gray-50 py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold text-gray-900 font-cairo ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
              {t('footer.terms-of-service')}
            </h1>
            <p className={`mt-2 text-gray-600 font-cairo ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
              {locale === 'ar' 
                ? 'آخر تحديث: يناير 2025'
                : 'Last updated: January 2025'
              }
            </p>
          </div>

          {/* Content */}
          <div className={`bg-white rounded-lg shadow-sm p-8 scroll-item ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            <div className="prose prose-lg max-w-none font-cairo" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              {locale === 'ar' ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">قبول الشروط</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    بوصولك واستخدامك لموقع إرسة للتدريب والاستشارات، فإنك توافق على الالتزام بشروط الخدمة هذه. 
                    إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام موقعنا الإلكتروني أو خدماتنا.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">وصف الخدمة</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    إرسة للتدريب والاستشارات تقدم خدمات تدريبية واستشارية عبر الإنترنت. تشمل خدماتنا:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>دورات تدريبية متخصصة</li>
                    <li>استشارات إدارية</li>
                    <li>حلول الذكاء الاصطناعي</li>
                    <li>شهادات معتمدة</li>
                    <li>دعم فني وتقني</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">إنشاء الحساب</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    لاستخدام خدماتنا، يجب عليك إنشاء حساب. عند إنشاء الحساب، توافق على:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>تقديم معلومات دقيقة وحديثة</li>
                    <li>الحفاظ على سرية كلمة المرور</li>
                    <li>تحمل المسؤولية عن جميع الأنشطة في حسابك</li>
                    <li>إشعارنا فوراً بأي استخدام غير مصرح به</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">الدفع والاسترداد</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    جميع المدفوعات مستحقة مقدماً. سياسة الاسترداد لدينا:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>يمكن طلب الاسترداد خلال 7 أيام من تاريخ الشراء</li>
                    <li>يتم استرداد المبلغ خلال 5-10 أيام عمل</li>
                    <li>لا يمكن استرداد المبالغ بعد بدء الدورة التدريبية</li>
                    <li>رسوم المعالجة غير قابلة للاسترداد</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">الاستخدام المقبول</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    عند استخدام خدماتنا، توافق على عدم:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>انتهاك أي قوانين أو لوائح محلية أو دولية</li>
                    <li>نشر محتوى مسيء أو غير قانوني</li>
                    <li>محاولة الوصول غير المصرح به لأنظمتنا</li>
                    <li>استخدام خدماتنا لأغراض تجارية غير مصرح بها</li>
                    <li>انتهاك حقوق الملكية الفكرية</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">الملكية الفكرية</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    جميع المحتويات والمواد التدريبية محمية بحقوق الطبع والنشر. لا يجوز لك نسخ أو توزيع أو تعديل 
                    أي محتوى دون إذن كتابي منا. الشهادات الممنوحة صالحة فقط للاستخدام الشخصي.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">إيقاف الحساب</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    نحتفظ بالحق في إيقاف أو إنهاء حسابك في أي وقت إذا انتهكت شروط الخدمة هذه. 
                    في حالة الإيقاف، لن تكون مؤهلاً للحصول على استرداد.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">إخلاء المسؤولية</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    خدماتنا مقدمة "كما هي" دون ضمانات من أي نوع. لا نضمن أن خدماتنا ستكون متاحة بشكل مستمر 
                    أو خالية من الأخطاء. لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">تعديل الشروط</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    نحتفظ بالحق في تعديل شروط الخدمة هذه في أي وقت. سيتم إشعارك بأي تغييرات مهمة 
                    عبر البريد الإلكتروني أو من خلال إشعار على موقعنا الإلكتروني.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">القانون المطبق</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    تحكم شروط الخدمة هذه وتفسر وفقاً لقوانين المملكة العربية السعودية. 
                    أي نزاعات تخضع للاختصاص الحصري للمحاكم السعودية.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">اتصل بنا</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    إذا كان لديك أي أسئلة حول شروط الخدمة هذه، يرجى الاتصال بنا:
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 mb-2"><strong>البريد الإلكتروني:</strong> <a href='mailto:info@ersa-training.com:'>info@ersa-training.com</a></p>
                    <p className="text-gray-700 mb-2"><strong>الهاتف:</strong> +966 557 7878 49</p>
                    <p className="text-gray-700"><strong>العنوان:</strong> المملكة العربية السعودية، الرياض،العليا، طريق مكة المكرمة</p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Acceptance of Terms</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    By accessing and using Ersa Training & Consultancy's website, you agree to be bound by these Terms of Service. 
                    If you do not agree to any of these terms, please do not use our website or services.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Description</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Ersa Training & Consultancy provides online training and consulting services. Our services include:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>Specialized training courses</li>
                    <li>Management consulting</li>
                    <li>AI solutions</li>
                    <li>Certified certificates</li>
                    <li>Technical support</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Creation</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    To use our services, you must create an account. When creating an account, you agree to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>Provide accurate and current information</li>
                    <li>Maintain password confidentiality</li>
                    <li>Be responsible for all activities in your account</li>
                    <li>Notify us immediately of any unauthorized use</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment and Refunds</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    All payments are due in advance. Our refund policy:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>Refunds can be requested within 7 days of purchase</li>
                    <li>Refunds are processed within 5-10 business days</li>
                    <li>No refunds after course commencement</li>
                    <li>Processing fees are non-refundable</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Acceptable Use</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    When using our services, you agree not to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>Violate any local or international laws or regulations</li>
                    <li>Post offensive or illegal content</li>
                    <li>Attempt unauthorized access to our systems</li>
                    <li>Use our services for unauthorized commercial purposes</li>
                    <li>Infringe on intellectual property rights</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Intellectual Property</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    All content and training materials are protected by copyright. You may not copy, distribute, or modify 
                    any content without our written permission. Certificates granted are valid for personal use only.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Termination</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    We reserve the right to suspend or terminate your account at any time if you violate these Terms of Service. 
                    In case of termination, you will not be eligible for a refund.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Disclaimer</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Our services are provided "as is" without warranties of any kind. We do not guarantee that our services 
                    will be continuously available or error-free. We will not be liable for any direct or indirect damages.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Modification of Terms</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    We reserve the right to modify these Terms of Service at any time. You will be notified of any significant changes 
                    via email or through a notice on our website.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    These Terms of Service are governed by and construed in accordance with the laws of Saudi Arabia. 
                    Any disputes are subject to the exclusive jurisdiction of Saudi courts.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 mb-2"><strong>Email:</strong> <a href='mailto:info@ersa-training.com:'>info@ersa-training.com</a></p>
                    <p className="text-gray-700 mb-2"><strong>Phone:</strong> +966 557 7878 49</p>
                    <p className="text-gray-700"><strong>Address:</strong> Saudi Arabia, Riyadh, Olaya District, Makkah Al-Mukarramah Road</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
