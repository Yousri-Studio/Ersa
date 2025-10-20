'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { ordersApi, type Order } from '@/lib/api';
import { adminApi, type OrderEnrollmentDto, type InvoiceDto } from '@/lib/admin-api';
import { usePageLoad } from '@/lib/use-animations';
import { ScrollAnimations } from '@/components/scroll-animations';
import { InvoiceModal } from '@/components/invoice/invoice-modal';
import { InvoiceData } from '@/components/invoice/invoice-template';
import toast from 'react-hot-toast';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [order, setOrder] = useState<Order | null>(null);
  const [enrollments, setEnrollments] = useState<OrderEnrollmentDto[]>([]);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [error, setError] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const isLoaded = usePageLoad(100);
  const orderId = params?.orderId as string;

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getOrder(orderId);
      setOrder(response.data);
      
      // Fetch enrollments if order is paid or processed
      const status = response.data.status.toLowerCase();
      if (status === 'paid' || status === 'processed' || status === 'completed') {
        fetchEnrollments();
      }
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      if (err.response?.status === 401) {
        setError(t('orders.unauthorized'));
      } else if (err.response?.status === 404) {
        setError(t('orders.not-found'));
      } else {
        setError(t('orders.fetch-error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoadingEnrollments(true);
      const response = await ordersApi.getOrderEnrollments(orderId);
      setEnrollments(response.data);
    } catch (err: any) {
      console.error('Error fetching enrollments:', err);
      // Don't show error toast for enrollments, just log it
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const fetchInvoiceData = async () => {
    try {
      setLoadingInvoice(true);
      const response = await adminApi.getOrderInvoice(orderId);
      const invoiceDto = response.data;
      
      // Convert InvoiceDto to InvoiceData format
      const converted: InvoiceData = {
        id: invoiceDto.id,
        orderNumber: invoiceDto.invoiceNumber,
        createdAt: invoiceDto.createdAt,
        status: invoiceDto.status,
        amount: invoiceDto.amount,
        currency: invoiceDto.currency,
        customer: {
          id: invoiceDto.customer.id,
          fullName: invoiceDto.customer.fullName,
          email: invoiceDto.customer.email,
          phone: invoiceDto.customer.phone,
          country: invoiceDto.customer.country,
        },
        items: invoiceDto.items.map(item => ({
          id: item.id,
          courseId: item.courseId,
          courseTitleEn: item.courseTitleEn,
          courseTitleAr: item.courseTitleAr,
          price: item.price,
          currency: item.currency,
          qty: item.qty,
        })),
        payments: invoiceDto.payments.map(payment => ({
          id: payment.id,
          provider: payment.provider,
          providerRef: payment.providerRef,
          status: payment.status,
          capturedAt: payment.capturedAt,
          createdAt: payment.createdAt,
        })),
      };
      
      setInvoiceData(converted);
      setShowInvoiceModal(true);
    } catch (err: any) {
      console.error('Error fetching invoice:', err);
      toast.error(t('orders.invoice-error'));
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleViewInvoice = () => {
    if (invoiceData) {
      setShowInvoiceModal(true);
    } else {
      fetchInvoiceData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pendingpayment':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return t('orders.status.paid');
      case 'completed':
        return t('orders.status.completed');
      case 'pending':
      case 'pendingpayment':
        return t('orders.status.pending');
      case 'cancelled':
      case 'canceled':
        return t('orders.status.cancelled');
      case 'failed':
        return t('orders.status.failed');
      default:
        return status;
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (!confirm(t('orders.confirm-cancel'))) {
      return;
    }

    try {
      // TODO: Implement cancel order API call
      toast.success(t('orders.order-cancelled'));
      fetchOrderDetails();
    } catch (error) {
      toast.error(t('orders.cancel-error'));
    }
  };

  const handleContinuePayment = () => {
    if (!order) return;
    // Redirect to checkout with order ID
    router.push(`/${locale}/checkout?orderId=${order.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <>
        <ScrollAnimations />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
              {error || t('orders.not-found')}
            </div>
            <Link
              href={`/${locale}/profile/orders`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-cairo"
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {t('orders.back-to-orders')}
            </Link>
          </div>
        </div>
      </>
    );
  }

  const isPending = order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'pendingpayment';
  const canCancel = isPending;
  const canContinuePayment = isPending;
  const isPaidOrProcessed = order.status.toLowerCase() === 'paid' || order.status.toLowerCase() === 'processed' || order.status.toLowerCase() === 'completed';

  return (
    <>
      <ScrollAnimations />
      <div className={`min-h-screen bg-gray-50 py-8 page-enter ${isLoaded ? 'loaded' : ''}`}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className={`mb-8 ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <div className="flex items-center mb-4">
              <Link
                href={`/${locale}/profile/orders`}
                className="text-primary-600 hover:text-primary-700 mr-2 rtl:mr-0 rtl:ml-2"
              >
                <Icon name="arrow-left" className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 font-cairo">
                {t('orders.order-details')}
              </h1>
            </div>
          </div>

          {/* Order Details Card */}
          <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${isLoaded ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            {/* Order Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-cairo">
                    {t('orders.order-number')}
                  </p>
                  <p className="text-lg font-bold text-gray-900 font-cairo">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold font-cairo ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>

            {/* Order Information */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 font-cairo mb-1">
                    {t('orders.order-date')}
                  </p>
                  <p className="text-base font-semibold text-gray-900 font-cairo">
                    {new Date(order.createdAt).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-cairo mb-1">
                    {t('orders.total-amount')}
                  </p>
                  <p className="text-xl font-bold text-primary-600 font-cairo">
                    {order.amount} {order.currency}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-bold text-gray-900 font-cairo mb-4">
                  {t('orders.items')} ({order.items?.length || 0})
                </h2>
                <div className="space-y-4">
                  {order.items && order.items.map((item, index) => {
                    const courseTitle = locale === 'ar' 
                      ? (item.courseTitleAr || item.courseTitleEn || 'Course') 
                      : (item.courseTitleEn || item.courseTitleAr || 'Course');
                    
                    return (
                      <div key={index} className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <Link
                            href={`/${locale}/courses/${item.courseSlug || item.courseId}`}
                            className="font-semibold text-primary-600 hover:text-primary-700 font-cairo mb-1 inline-block transition-colors"
                          >
                            {courseTitle}
                          </Link>
                          {item.session && (
                            <p className="text-sm text-gray-600 font-cairo">
                              {t('orders.session')}: {new Date(item.session.startAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                          {item.qty > 1 && (
                            <p className="text-sm text-gray-600 font-cairo">
                              {t('orders.quantity')}: x{item.qty}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-6 rtl:ml-0 rtl:mr-6">
                          <p className="font-bold text-gray-900 font-cairo">
                            {item.price} {item.currency}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-4 mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900 font-cairo">
                    {t('orders.total')}
                  </p>
                  <p className="text-2xl font-bold text-primary-600 font-cairo">
                    {order.amount} {order.currency}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                {/* Invoice Button - show for paid/processed orders */}
                {isPaidOrProcessed && (
                  <button
                    onClick={handleViewInvoice}
                    disabled={loadingInvoice}
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 font-cairo disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingInvoice ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 rtl:mr-0 rtl:ml-2"></div>
                        {t('common.loading')}
                      </>
                    ) : (
                      <>
                        <Icon name="file" className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
                        {t('orders.view-invoice')}
                      </>
                    )}
                  </button>
                )}
                
                {canCancel && (
                  <button
                    onClick={handleCancelOrder}
                    className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 font-cairo"
                  >
                    <Icon name="times-circle" className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
                    {t('orders.cancel-order')}
                  </button>
                )}
                {canContinuePayment && (
                  <button
                    onClick={handleContinuePayment}
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 font-cairo"
                  >
                    <Icon name="credit-card" className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
                    {t('orders.continue-payment')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Enrollments Section - Show for paid/processed orders */}
          {isPaidOrProcessed && (
            <div className={`bg-white rounded-lg shadow-sm overflow-hidden mt-6 ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900 font-cairo">
                  {t('orders.enrollments')}
                </h2>
              </div>
              <div className="px-6 py-6">
                {loadingEnrollments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : enrollments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 font-cairo">
                    {t('orders.no-enrollments')}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => {
                      const courseTitle = locale === 'ar' 
                        ? enrollment.courseTitle.ar 
                        : enrollment.courseTitle.en;
                      const isLiveCourse = enrollment.courseType === 1;
                      const isPdfCourse = enrollment.courseType === 2;
                      
                      return (
                        <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 font-cairo">
                                  {courseTitle}
                                </h3>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  isLiveCourse ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {isLiveCourse ? (locale === 'ar' ? 'مباشر' : 'Live') : 'PDF'}
                                </span>
                              </div>
                              
                              {/* Session Information for Live Courses */}
                              {enrollment.session && isLiveCourse && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                  <div className="flex items-center mb-2">
                                    <Icon name="calendar" className="h-4 w-4 text-blue-600 mr-2 rtl:mr-0 rtl:ml-2" />
                                    <p className="text-sm font-semibold text-gray-900 font-cairo">
                                      {locale === 'ar' ? enrollment.session.titleAr : enrollment.session.titleEn}
                                    </p>
                                  </div>
                                  
                                  {enrollment.session.descriptionEn && (
                                    <p className="text-sm text-gray-600 font-cairo mb-2">
                                      {locale === 'ar' ? enrollment.session.descriptionAr : enrollment.session.descriptionEn}
                                    </p>
                                  )}
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center text-gray-700">
                                      <Icon name="clock" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 text-blue-600" />
                                      <span className="font-cairo">
                                        {new Date(enrollment.session.startAt).toLocaleDateString(locale, { 
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    
                                    {/* Only show Join Session link if session has not ended */}
                                    {enrollment.session.teamsLink && new Date() <= new Date(enrollment.session.endAt) ? (
                                      <a
                                        href={enrollment.session.teamsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-blue-600 hover:text-blue-700 font-cairo"
                                      >
                                        <Icon name="video" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                                        {locale === 'ar' ? 'رابط الجلسة' : 'Join Session'}
                                      </a>
                                    ) : enrollment.session.teamsLink && new Date() > new Date(enrollment.session.endAt) ? (
                                      <div className="flex items-center text-gray-400 font-cairo">
                                        <Icon name="video" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                                        {locale === 'ar' ? 'انتهت الجلسة' : 'Session Ended'}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              )}
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 font-cairo">
                              {t('orders.enrolled')}
                            </span>
                          </div>
                          
                          {/* Course Attachments */}
                          {enrollment.courseAttachments && enrollment.courseAttachments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm font-semibold text-gray-700 font-cairo mb-2 flex items-center">
                                <Icon name="paperclip" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                                {t('orders.course-materials')} ({enrollment.courseAttachments.length})
                              </p>
                              
                              {/* Show secure download links if available */}
                              {enrollment.secureLinks && enrollment.secureLinks.length > 0 ? (
                                <div className="space-y-2">
                                  {enrollment.secureLinks.map((link) => (
                                    link.isRevoked ? (
                                      <div
                                        key={link.id}
                                        className="flex items-center justify-between p-2 bg-gray-100 rounded cursor-not-allowed opacity-60"
                                      >
                                        <div className="flex items-center flex-1 min-w-0">
                                          <Icon name="ban" className="h-4 w-4 text-red-600 mr-2 rtl:mr-0 rtl:ml-2 flex-shrink-0" />
                                          <span className="text-sm text-gray-500 font-cairo truncate">
                                            {link.attachmentFileName}
                                          </span>
                                        </div>
                                        <span className="text-xs text-red-600 font-cairo ml-2 rtl:ml-0 rtl:mr-2 flex-shrink-0">
                                          {locale === 'ar' ? 'تم الإلغاء' : 'Revoked'}
                                        </span>
                                      </div>
                                    ) : (
                                      <a
                                        key={link.id}
                                        href={`${typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL?.includes('proxy') 
                                          ? (process.env.NEXT_PUBLIC_DIRECT_API_URL || 'http://localhost:5002/api') 
                                          : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api')}/secure-download/${link.token}`}
                                        download
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                      >
                                        <div className="flex items-center flex-1 min-w-0">
                                          <Icon name="download" className="h-4 w-4 text-primary-600 mr-2 rtl:mr-0 rtl:ml-2 flex-shrink-0" />
                                          <span className="text-sm text-primary-600 hover:text-primary-700 font-cairo truncate">
                                            {link.attachmentFileName}
                                          </span>
                                        </div>
                                        <Icon name="external-link" className="h-3 w-3 text-gray-400 ml-2 rtl:ml-0 rtl:mr-2 flex-shrink-0" />
                                      </a>
                                    )
                                  ))}
                                </div>
                              ) : (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                  <p className="text-sm text-yellow-800 font-cairo flex items-center">
                                    <Icon name="info-circle" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                                    {locale === 'ar' 
                                      ? 'سيتم إرسال روابط التحميل قريباً' 
                                      : 'Download links will be sent soon'}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    {enrollment.courseAttachments.map((attachment) => (
                                      <div key={attachment.id} className="flex items-center text-sm text-gray-600">
                                        <Icon name="file" className="h-3 w-3 mr-2 rtl:mr-0 rtl:ml-2" />
                                        <span className="font-cairo">{attachment.fileName}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Back to Orders */}
          <div className={`mt-8 text-center ${isLoaded ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            <Link
              href={`/${locale}/profile/orders`}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200 font-cairo"
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {t('orders.back-to-orders')}
            </Link>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceData && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          invoiceData={invoiceData}
        />
      )}
    </>
  );
}

