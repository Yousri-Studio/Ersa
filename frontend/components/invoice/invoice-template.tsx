'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';

export interface InvoiceData {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  amount: number;
  currency: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    country?: string;
  };
  items: Array<{
    id: string;
    courseId: string;
    courseTitleEn: string;
    courseTitleAr: string;
    price: number;
    currency: string;
    qty: number;
  }>;
  payments: Array<{
    id: string;
    provider: string;
    providerRef?: string;
    status: string;
    capturedAt?: string;
    createdAt: string;
  }>;
}

interface InvoiceTemplateProps {
  invoiceData: InvoiceData;
  className?: string;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  invoiceData,
  className = ''
}) => {
  const locale = useLocale();
  const t = useTranslations('invoice');
  const isRTL = locale === 'ar';

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { ar: string; en: string }> = {
      'Paid': { ar: 'مدفوع', en: 'Paid' },
      'Pending': { ar: 'قيد الانتظار', en: 'Pending' },
      'Failed': { ar: 'فشل', en: 'Failed' },
      'Refunded': { ar: 'مسترد', en: 'Refunded' },
      'Processed': { ar: 'معالج', en: 'Processed' },
      'UnderProcess': { ar: 'قيد المعالجة', en: 'Under Process' },
    };
    return statusMap[status]?.[locale as 'ar' | 'en'] || status;
  };

  const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const vatRate = 0.15; // 15% VAT
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  return (
    <div 
      id={`invoice-${invoiceData.id}`}
      className={`bg-white ${className}`} 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Invoice Header */}
      <div className="border-b-2 border-gray-200 pb-8 mb-8">
        <div className="flex justify-between items-start">
          {/* Company Logo and Info */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-32 h-12 relative">
              <Image
                src="/Header Logo.svg"
                alt="Ersa Training & Consultancy"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#292561]">
                {locale === 'ar' ? 'إرسا للتدريب والاستشارات' : 'Ersa Training & Consultancy'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {locale === 'ar' ? 'تطوير المهارات وبناء القدرات' : 'Skills Development & Capacity Building'}
              </p>
            </div>
          </div>

          {/* Invoice Title */}
          <div className="text-right rtl:text-left">
            <h2 className="text-3xl font-bold text-[#292561] mb-2">
              {locale === 'ar' ? 'فاتورة' : 'INVOICE'}
            </h2>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-semibold">
                  {locale === 'ar' ? 'رقم الفاتورة:' : 'Invoice #:'}
                </span>{' '}
                {invoiceData.orderNumber}
              </p>
              <p className="mt-1">
                <span className="font-semibold">
                  {locale === 'ar' ? 'تاريخ الإصدار:' : 'Date:'}
                </span>{' '}
                {formatDate(invoiceData.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer and Order Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Bill To */}
        <div>
          <h3 className="text-lg font-bold text-[#292561] mb-4 border-b border-[#00AC96] pb-2">
            {locale === 'ar' ? 'إرسال الفاتورة إلى:' : 'Bill To:'}
          </h3>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-gray-900">{invoiceData.customer.fullName}</p>
            <p className="text-gray-600">{invoiceData.customer.email}</p>
            {invoiceData.customer.phone && (
              <p className="text-gray-600">{invoiceData.customer.phone}</p>
            )}
            {invoiceData.customer.country && (
              <p className="text-gray-600">{invoiceData.customer.country}</p>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div>
          <h3 className="text-lg font-bold text-[#292561] mb-4 border-b border-[#00AC96] pb-2">
            {locale === 'ar' ? 'تفاصيل الطلب:' : 'Order Details:'}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">
                {locale === 'ar' ? 'رقم الطلب:' : 'Order ID:'}
              </span>
              <span className="text-gray-600">{invoiceData.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">
                {locale === 'ar' ? 'الحالة:' : 'Status:'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                invoiceData.status === 'Paid' || invoiceData.status === 'Processed'
                  ? 'bg-green-100 text-green-800'
                  : invoiceData.status === 'Pending' || invoiceData.status === 'UnderProcess'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {getStatusLabel(invoiceData.status)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">
                {locale === 'ar' ? 'تاريخ الطلب:' : 'Order Date:'}
              </span>
              <span className="text-gray-600">{formatDateTime(invoiceData.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#292561] mb-4 border-b border-[#00AC96] pb-2">
          {locale === 'ar' ? 'عناصر الطلب:' : 'Order Items:'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left rtl:text-right text-sm font-semibold text-gray-700 border-b">
                  {locale === 'ar' ? 'اسم الدورة' : 'Course Name'}
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">
                  {locale === 'ar' ? 'الكمية' : 'Qty'}
                </th>
                <th className="px-4 py-3 text-right rtl:text-left text-sm font-semibold text-gray-700 border-b">
                  {locale === 'ar' ? 'السعر' : 'Price'}
                </th>
                <th className="px-4 py-3 text-right rtl:text-left text-sm font-semibold text-gray-700 border-b">
                  {locale === 'ar' ? 'المجموع' : 'Total'}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm text-gray-900 border-b">
                    {locale === 'ar' ? item.courseTitleAr : item.courseTitleEn}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center border-b">
                    {item.qty}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right rtl:text-left border-b">
                    {formatCurrency(item.price, item.currency)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right rtl:text-left border-b">
                    {formatCurrency(item.price * item.qty, item.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-full max-w-sm">
          <div className="bg-gray-50 rounded-lg p-6 border">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {locale === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(subtotal, invoiceData.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {locale === 'ar' ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(vatAmount, invoiceData.currency)}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-[#292561]">
                    {locale === 'ar' ? 'المجموع الإجمالي:' : 'Total Amount:'}
                  </span>
                  <span className="text-lg font-bold text-[#292561]">
                    {formatCurrency(total, invoiceData.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {invoiceData.payments.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#292561] mb-4 border-b border-[#00AC96] pb-2">
            {locale === 'ar' ? 'معلومات الدفع:' : 'Payment Information:'}
          </h3>
          <div className="space-y-3">
            {invoiceData.payments.map((payment) => (
              <div key={payment.id} className="bg-gray-50 rounded-lg p-4 border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">
                      {locale === 'ar' ? 'مقدم الخدمة:' : 'Provider:'}
                    </span>
                    <p className="text-gray-600">{payment.provider}</p>
                  </div>
                  {payment.providerRef && (
                    <div>
                      <span className="font-semibold text-gray-700">
                        {locale === 'ar' ? 'مرجع الدفع:' : 'Payment Reference:'}
                      </span>
                      <p className="text-gray-600 font-mono">{payment.providerRef}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-gray-700">
                      {locale === 'ar' ? 'تاريخ الدفع:' : 'Payment Date:'}
                    </span>
                    <p className="text-gray-600">
                      {formatDateTime(payment.capturedAt || payment.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold text-[#292561] mb-2">
              {locale === 'ar' ? 'معلومات الاتصال:' : 'Contact Information:'}
            </h4>
            <div className="space-y-1">
              <p>{locale === 'ar' ? 'الموقع الإلكتروني:' : 'Website:'} www.ersa-consultancy.com</p>
              <p>{locale === 'ar' ? 'البريد الإلكتروني:' : 'Email:'} info@ersa-consultancy.com</p>
              <p>{locale === 'ar' ? 'الهاتف:' : 'Phone:'} +966 XX XXX XXXX</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#292561] mb-2">
              {locale === 'ar' ? 'شكراً لاختيارك إرسا' : 'Thank you for choosing Ersa'}
            </h4>
            <p className="text-xs leading-relaxed">
              {locale === 'ar' 
                ? 'هذه فاتورة إلكترونية صادرة من إرسا للتدريب والاستشارات. للاستفسارات، يرجى التواصل معنا عبر البريد الإلكتروني أو الهاتف.'
                : 'This is an electronic invoice issued by Ersa Training & Consultancy. For inquiries, please contact us via email or phone.'
              }
            </p>
          </div>
        </div>
        
        {/* Invoice Footer Note */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            {locale === 'ar' 
              ? `تم إنشاء هذه الفاتورة إلكترونياً في ${formatDateTime(new Date().toISOString())}`
              : `This invoice was generated electronically on ${formatDateTime(new Date().toISOString())}`
            }
          </p>
        </div>
      </div>
    </div>
  );
};
