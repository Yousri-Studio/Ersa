'use client';

import { useTranslations, useLocale } from 'next-intl';
import { ScrollAnimations } from '@/components/scroll-animations';
import { usePageLoad } from '@/lib/use-animations';

export default function PrivacyPolicyPage() {
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
              {t('footer.privacy-policy')}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">مقدمة</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    نحن في إرسة للتدريب والاستشارات نلتزم بحماية خصوصيتك وضمان أمان معلوماتك الشخصية. 
                    تشرح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك عند استخدام موقعنا الإلكتروني وخدماتنا.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">المعلومات التي نجمعها</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    نجمع أنواع مختلفة من المعلومات لتحسين خدماتنا وتقديم تجربة أفضل لك:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>المعلومات الشخصية (الاسم، البريد الإلكتروني، رقم الهاتف)</li>
                    <li>معلومات الحساب (اسم المستخدم، كلمة المرور)</li>
                    <li>معلومات الدفع (للمعاملات المالية)</li>
                    <li>معلومات الاستخدام (الصفحات التي تزورها، الوقت الذي تقضيه)</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">كيف نستخدم معلوماتك</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    نستخدم معلوماتك للأغراض التالية:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>تقديم وتطوير خدماتنا</li>
                    <li>معالجة طلباتك والمدفوعات</li>
                    <li>إرسال التحديثات والإشعارات المهمة</li>
                    <li>تحسين تجربة المستخدم</li>
                    <li>الامتثال للالتزامات القانونية</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">حماية معلوماتك</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    نستخدم تقنيات أمان متقدمة لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الكشف. 
                    جميع البيانات الحساسة مشفرة ونتبع أفضل الممارسات في أمان المعلومات.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">مشاركة المعلومات</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>بموافقتك الصريحة</li>
                    <li>للموردين الذين يساعدوننا في تقديم الخدمات</li>
                    <li>للامتثال للقوانين واللوائح</li>
                    <li>لحماية حقوقنا ومصالحنا القانونية</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">حقوقك</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    لديك الحقوق التالية فيما يتعلق بمعلوماتك الشخصية:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>الوصول إلى معلوماتك الشخصية</li>
                    <li>تصحيح المعلومات غير الدقيقة</li>
                    <li>حذف معلوماتك الشخصية</li>
                    <li>تقييد معالجة معلوماتك</li>
                    <li>نقل بياناتك</li>
                    <li>الاعتراض على معالجة معلوماتك</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">التحديثات على هذه السياسة</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإشعارك بأي تغييرات مهمة 
                    عبر البريد الإلكتروني أو من خلال إشعار على موقعنا الإلكتروني.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">اتصل بنا</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا:
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 mb-2"><strong>البريد الإلكتروني:</strong> <a href='mailto:info@ersa-training.com:'>info@ersa-training.com</a></p>
                    <p className="text-gray-700 mb-2"><strong>رقم التواصل والواتساب:</strong> +966 55 877 9487</p>
                    <p className="text-gray-700"><strong>العنوان:</strong> المملكة العربية السعودية</p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Introduction</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    At Ersa Training & Consultancy, we are committed to protecting your privacy and ensuring the security of your personal information. 
                    This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Information We Collect</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    We collect different types of information to improve our services and provide you with a better experience:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>Personal information (name, email, phone number)</li>
                    <li>Account information (username, password)</li>
                    <li>Payment information (for financial transactions)</li>
                    <li>Usage information (pages you visit, time spent)</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How We Use Your Information</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    We use your information for the following purposes:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>Providing and developing our services</li>
                    <li>Processing your orders and payments</li>
                    <li>Sending important updates and notifications</li>
                    <li>Improving user experience</li>
                    <li>Complying with legal obligations</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Protecting Your Information</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    We use advanced security technologies to protect your information from unauthorized access, alteration, or disclosure. 
                    All sensitive data is encrypted and we follow best practices in information security.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Information Sharing</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    We do not sell, rent, or share your personal information with third parties except in the following cases:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>With your explicit consent</li>
                    <li>With vendors who help us provide services</li>
                    <li>To comply with laws and regulations</li>
                    <li>To protect our rights and legal interests</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Rights</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    You have the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li>Access to your personal information</li>
                    <li>Correction of inaccurate information</li>
                    <li>Deletion of your personal information</li>
                    <li>Restriction of processing your information</li>
                    <li>Data portability</li>
                    <li>Objection to processing your information</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Updates to This Policy</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any significant changes 
                    via email or through a notice on our website.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    If you have any questions about this Privacy Policy, please contact us:
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 mb-2"><strong>Email:</strong> <a href='mailto:info@ersa-training.com:'>info@ersa-training.com</a></p>
                    <p className="text-gray-700 mb-2"><strong>Phone & Whats APP:</strong> +966 55 877 9487</p>
                    <p className="text-gray-700"><strong>Address:</strong> Saudi Arabia</p>
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
