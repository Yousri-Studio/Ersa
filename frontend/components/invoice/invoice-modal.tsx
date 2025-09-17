'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { InvoiceTemplate, InvoiceData } from './invoice-template';
import { downloadInvoicePDF, generateInvoiceFilename, printInvoice } from '@/lib/invoice-utils';
import { Icon } from '@/components/ui/icon';
import toast from 'react-hot-toast';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoiceData,
}) => {
  const locale = useLocale();
  const t = useTranslations('invoice');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const isRTL = locale === 'ar';

  const invoiceId = `invoice-${invoiceData.id}`;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Wait for DOM to be fully rendered and check if element exists
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const element = document.getElementById(invoiceId);
        if (element) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
      }
      
      // Final check
      const element = document.getElementById(invoiceId);
      if (!element) {
        throw new Error(`Invoice element not found after ${maxAttempts} attempts`);
      }
      
      const filename = generateInvoiceFilename(invoiceData);
      await downloadInvoicePDF(invoiceId, filename);
      toast.success(
        locale === 'ar' 
          ? 'تم تحميل الفاتورة بنجاح' 
          : 'Invoice downloaded successfully'
      );
    } catch (error) {
      console.error('Download error:', error);
      toast.error(
        locale === 'ar' 
          ? 'فشل في تحميل الفاتورة. يرجى المحاولة مرة أخرى.' 
          : 'Failed to download invoice. Please try again.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Wait for DOM to be fully rendered and check if element exists
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const element = document.getElementById(invoiceId);
        if (element) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
      }
      
      // Final check
      const element = document.getElementById(invoiceId);
      if (!element) {
        throw new Error(`Invoice element not found after ${maxAttempts} attempts`);
      }
      
      printInvoice(invoiceId);
      toast.success(
        locale === 'ar' 
          ? 'تم فتح نافذة الطباعة' 
          : 'Print dialog opened'
      );
    } catch (error) {
      console.error('Print error:', error);
      toast.error(
        locale === 'ar' 
          ? 'فشل في طباعة الفاتورة. يرجى المحاولة مرة أخرى.' 
          : 'Failed to print invoice. Please try again.'
      );
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-[#292561]">
            {locale === 'ar' ? 'فاتورة' : 'Invoice'} - {invoiceData.orderNumber}
          </h2>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-[#00AC96] text-white rounded-lg hover:bg-[#009688] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Icon name="download" className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isDownloading 
                  ? (locale === 'ar' ? 'جاري التحميل...' : 'Downloading...') 
                  : (locale === 'ar' ? 'تحميل PDF' : 'Download PDF')
                }
              </span>
            </button>
            
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-[#292561] text-white rounded-lg hover:bg-[#1f1d4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrinting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Icon name="printer" className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isPrinting 
                  ? (locale === 'ar' ? 'جاري الطباعة...' : 'Printing...') 
                  : (locale === 'ar' ? 'طباعة' : 'Print')
                }
              </span>
            </button>
            
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Invoice Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-8">
            <InvoiceTemplate 
              invoiceData={invoiceData} 
              className="shadow-lg border border-gray-200 rounded-lg p-8"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {locale === 'ar' 
              ? 'يمكنك تحميل الفاتورة كملف PDF أو طباعتها مباشرة' 
              : 'You can download the invoice as PDF or print it directly'
            }
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {locale === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
