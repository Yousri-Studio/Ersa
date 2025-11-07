'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ScrollAnimations } from '@/components/scroll-animations';
import { usePageLoad } from '@/lib/use-animations';
import { contentApi } from '@/lib/content-api';

interface PrivacyContent {
  title: string;
  lastUpdated: string;
  content: string;
  contact: string;
}

export default function PrivacyPolicyPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isLoaded = usePageLoad(100);
  const [content, setContent] = useState<PrivacyContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const privacyContent = await contentApi.getPrivacyContent(locale);
        setContent(privacyContent);
      } catch (err) {
        console.error('Error fetching privacy content:', err);
        setError('Failed to load content');
        // Fallback to default content structure
        setContent({
          title: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
          lastUpdated: locale === 'ar' ? 'ديسمبر 2025' : 'December 2025',
          content: '',
          contact: ''
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [locale]);

  if (isLoading) {
    return (
      <>
        <ScrollAnimations />
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (!content) {
    return (
      <>
        <ScrollAnimations />
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">{error || (locale === 'ar' ? 'فشل في تحميل المحتوى' : 'Failed to load content')}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen bg-gray-50 py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold text-gray-900 font-cairo ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
              {content.title || t('footer.privacy-policy-title')}
            </h1>
            <p className={`mt-2 text-gray-600 font-cairo ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
              {locale === 'ar' 
                ? `آخر تحديث: ${content.lastUpdated}`
                : `Last updated: ${content.lastUpdated}`
              }
            </p>
          </div>

          {/* Content */}
          <div className={`bg-white rounded-lg shadow-sm p-8 scroll-item ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            <div className="prose prose-lg max-w-none font-cairo" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              {content.content ? (
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              ) : (
                // Fallback content if database content is empty
                locale === 'ar' ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">مقدمة</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      حرصًا من معهد إرساء للتدريب والاستشارات على توفير تجربة تعليمية احترافية، وضمان الشفافية الكاملة في التعامل مع
                      جميع المتدربين، فقد وُضعت هذه السياسات لتكون مرجعًا رسميًا ينظّم إجراءات التسجيل، الدفع، الإلغاء، والاسترجاع. إن
                      الهدف منها هو تحقيق التوازن بين حقوق المتدرب وحقوق المعهد، بما ينسجم مع أفضل الممارسات المعتمدة لدى الجهات
                      التدريبية الرائدة في المملكة العربية السعودية.
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">أولًا: آلية التسجيل</h2>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      يمكن للمتدربين التسجيل عبر:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>الموقع الإلكتروني الرسمي للمعهد.</li>
                      <li>قنوات التواصل المعتمدة (الهاتف، الواتساب، البريد الإلكتروني).</li>
                      <li>زيارات مباشرة لمقر المعهد عند الحاجة.</li>
                      <li>بعد إتمام التسجيل، يتلقى المتدرب رسالة تأكيد مبدئية تحتوي على تفاصيل الدورة، متبوعة بتعليمات.</li>
                      <li>لا يُعتبر التسجيل نهائيًا إلا بعد إتمام عملية الدفع وتأكيده من قسم المالية.</li>
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">ثانيًا: آلية الدفع</h2>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      يقبل المعهد وسائل الدفع التالية:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>بطاقات الدفع البنكية (مدى/فيزا/ماستر).</li>
                      <li>التحويل البنكي المباشر.</li>
                      <li>بوابات الدفع الإلكتروني المعتمدة.</li>
                      <li>في حالة التحويل البنكي، يجب إرسال صورة من إيصال التحويل إلى قسم التسجيل لتأكيد الحجز.</li>
                      <li>يُشترط سداد كامل الرسوم قبل موعد إغلاق التسجيل، وأي تأخير في السداد قد يؤدي إلى إلغاء الحجز تلقائيًا.</li>
                      <li>جميع الرسوم تشمل تكلفة التدريب والمواد الأساسية، ولا تشمل – ما لم يُذكر صراحة – أي اختبارات دولية أو رسوم شهادات خارجية.</li>
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">ثالثًا: سياسة الإلغاء والاسترجاع (من قبل المتدرب)</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      يُسمح للمتدرب – بدلًا من الإلغاء – بطلب تحويل تسجيله إلى موعد لاحق أو إلى دورة بديلة، بناءً على توفر المقاعد وموافقة الإدارة.
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>إلغاء قبل 7 أيام أو أكثر من بداية الدورة: يحق للمتدرب استرداد 100% من الرسوم المدفوعة.</li>
                      <li>إلغاء بين 6 و3 أيام من بداية الدورة: يحق استرداد 50% من الرسوم.</li>
                      <li>إلغاء قبل أقل من 3 أيام أو بعد بدء الدورة: لا يحق استرداد أي رسوم.</li>
                      <li>تتم عملية الاسترجاع خلال مدة أقصاها 7 أيام عمل عبر وسيلة الدفع الأصلية متى ما أمكن.</li>
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">رابعًا: سياسة الإلغاء أو التأجيل (من قبل المعهد)</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      يحتفظ معهد إرساء بالحق في إلغاء أو تأجيل أي دورة في الحالات التالية:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>عدم اكتمال الحد الأدنى من عدد المسجلين (5 مشاركين).</li>
                      <li>ظروف طارئة أو قوة قاهرة تمنع انعقاد الدورة.</li>
                      <li>في حال الإلغاء أو التأجيل، يخيَّر المتدرب بين:</li>
                      <li>استرداد 100% من الرسوم المدفوعة.</li>
                      <li>أو تحويل التسجيل إلى موعد لاحق أو دورة أخرى دون أي رسوم إضافية.</li>
                      <li>يلتزم المعهد بإبلاغ جميع المسجلين بقرار الإلغاء أو التأجيل قبل الموعد المحدد للدورة بوقت مناسب (لا يقل عن 48 ساعة).</li>
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">خامسًا: تحويل التسجيل</h2>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      يحق للمتدرب تحويل تسجيله إلى شخص آخر بشرط:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>تقديم إخطار خطي رسمي للمعهد قبل 3 أيام على الأقل من تاريخ بدء الدورة.</li>
                      <li>التزام المتدرب الجديد بكافة الشروط والسياسات ذاتها.</li>
                      <li>لا يُسمح بتحويل التسجيل بعد بدء الدورة.</li>
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">سادسًا: الأحكام العامة</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      يرجى الإشارة إلى أن هذه السياسات ملزمة ويجب الالتزام بها عند تسجيل الدورة. لا يُسمح بإلغاء التسجيل أو الاسترجاع بعد بدء الدورة.
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>التسجيل في أي دورة يعني إقرار المتدرب بقراءة هذه السياسات والموافقة عليها.</li>
                      <li>لمعهد إرساء الحق في تحديث هذه السياسات بما يتماشى مع الأنظمة المحلية والممارسات التدريبية الحديثة، وتعتبر النسخة المنشورة عبر القنوات الرسمية هي المرجع المعتمد.</li>
                      <li>في حال وجود أي نزاع، يتم اللجوء إلى الأنظمة والقوانين السارية في المملكة العربية السعودية.</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Introduction</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      In line with Ersa Institute for Training and Consulting's commitment to providing
                      professional learning experience and ensuring full transparency in dealings with all
                      trainees, these policies have been established as an official reference governing
                      registration, payment, cancellation, and refund procedures. The purpose of these
                      policies is to maintain a fair balance between the rights of trainees and the Institute's
                      rights, in accordance with best practices adopted by leading training providers in the
                      Kingdom of Saudi Arabia.
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Registration Process</h2>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      Trainees may register through any of the following channels:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>The Institute's official website.</li>
                      <li>Authorized communication channels (phone, WhatsApp, or email).</li>
                      <li>Direct visits to the Institute's premises when necessary.</li>
                      <li>Upon completing the registration, the trainee receives a preliminary confirmation message containing course details, followed by payment instructions.</li>
                      <li>Registration is not considered final until full payment has been received and verified by the Finance Department.</li>
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Payment Process</h2>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      The Institute accepts the following payment methods:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Debit and credit cards (Mada / Visa / MasterCard).</li>
                      <li>Direct bank transfer.</li>
                      <li>Approved electronic payment gateways.</li>
                      <li>For bank transfers, a copy of the transfer receipt must be sent to the Registration Department to confirm the booking.</li>
                      <li>Full payment must be made before the registration closing date. Any delay in payment may result in automatic cancellation of the booking.</li>
                      <li>All fees include training costs and basic materials unless otherwise stated. They do not include international exam fees or external certification costs unless explicitly mentioned.</li>
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Cancellation and Refund Policy (by the Trainee)</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Instead of cancellation, trainees may request to transfer their registration to a later session or an alternative course, subject to seat availability and management approval.
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Cancellation 7 days or more before the course start date: 100% refund of paid fees.</li>
                      <li>Cancellation between 6 and 3 days before the start date: 50% refund of paid fees.</li>
                      <li>Cancellation less than 3 days before or after the course starts: No refund will be issued.</li>
                      <li>Refunds will be processed within a maximum of 7 working days using the original payment method whenever possible.</li>
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Cancellation or Postponement Policy (by the Institute)</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Ersa Institute reserves the right to cancel or postpone any course under the following circumstances:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>The minimum number of participants required (5) has not been met.</li>
                      <li>Unforeseen circumstances or force majeure prevent the course from being conducted.</li>
                      <li>In case of cancellation or postponement, the trainee will be offered the choice between:</li>
                      <li>100% refund of paid fees.</li>
                      <li>Or transferring the registration to a later date or another course at no additional cost.</li>
                      <li>The Institute is committed to notifying all registered trainees of any cancellation or postponement at least 48 hours prior to the scheduled start date.</li>
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Registration Transfer</h2>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      Trainees may transfer their registration to another individual provided that:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>A formal written notice is submitted to the Institute at least 3 days before the course start date.</li>
                      <li>The new trainee agrees to all applicable terms and policies.</li>
                      <li>No transfer is permitted after the course has started.</li>
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">6. General Provisions</h2>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      By registering for any course, the trainee acknowledges having read, understood, and agreed to these policies.
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Ersa Institute reserves the right to update these policies in line with local regulations and current training best practices. The version published through the Institute's official channels shall be deemed the authoritative reference.</li>
                      <li>In the event of any dispute, applicable laws and regulations of the Kingdom of Saudi Arabia shall prevail.</li>
                    </ul>
                  </>
                )
              )}

              {/* Contact Us Section */}
              {content.contact && (
                <div className="mt-8">
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: content.contact }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
