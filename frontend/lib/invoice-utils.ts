import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { InvoiceData } from '@/components/invoice/invoice-template';
import { AdminOrderDetail } from './admin-api';

export interface InvoiceGenerationOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
}

/**
 * Convert AdminOrderDetail to InvoiceData format
 */
export function convertOrderToInvoiceData(order: AdminOrderDetail): InvoiceData {
  // Safely handle the order ID conversion
  const orderId = order.id?.toString() || '';
  const orderNumber = orderId ? `INV-${orderId.substring(0, 8).toUpperCase()}` : 'INV-UNKNOWN';
  
  return {
    id: orderId,
    orderNumber: orderNumber,
    createdAt: order.createdAt,
    status: order.status.toString(),
    amount: order.amount,
    currency: order.currency,
    customer: {
      id: order.customer.id,
      fullName: order.customer.fullName,
      email: order.customer.email,
      phone: order.customer.phone,
      country: order.customer.country,
    },
    items: order.items.map((item: any) => ({
      id: item.id,
      courseId: item.courseId,
      courseTitleEn: item.courseTitleEn,
      courseTitleAr: item.courseTitleAr,
      price: item.price,
      currency: item.currency,
      qty: item.qty,
    })),
    payments: order.payments.map((payment: any) => ({
      id: payment.id,
      provider: payment.provider,
      providerRef: payment.providerRef,
      status: payment.status.toString(),
      capturedAt: payment.capturedAt,
      createdAt: payment.createdAt,
    })),
  };
}

/**
 * Generate PDF from HTML element
 */
export async function generateInvoicePDF(
  elementId: string,
  options: InvoiceGenerationOptions = {}
): Promise<Blob> {
  const {
    format = 'a4',
    orientation = 'portrait',
    quality = 1.0,
  } = options;

  console.log('Looking for element with ID:', elementId);
  const element = document.getElementById(elementId);
  
  if (!element) {
    // Debug: List all elements with invoice- prefix
    const allInvoiceElements = document.querySelectorAll('[id^="invoice-"]');
    console.log('Available invoice elements:', Array.from(allInvoiceElements).map(el => el.id));
    throw new Error(`Element with id "${elementId}" not found`);
  }
  
  console.log('Found element:', element);
  console.log('Element dimensions:', {
    width: element.offsetWidth,
    height: element.offsetHeight,
    visible: element.offsetParent !== null
  });

  // Ensure element is visible
  if (element.offsetParent === null) {
    throw new Error(`Element with id "${elementId}" is not visible`);
  }

  // Create canvas from HTML element
  const canvas = await html2canvas(element, {
    scale: 2, // Higher scale for better quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  // Calculate PDF dimensions
  const imgWidth = format === 'a4' ? 210 : 216; // mm
  const pageHeight = format === 'a4' ? 297 : 279; // mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;

  // Create PDF
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });

  let position = 0;

  // Add first page
  pdf.addImage(
    canvas.toDataURL('image/png', quality),
    'PNG',
    0,
    position,
    imgWidth,
    imgHeight
  );
  heightLeft -= pageHeight;

  // Add additional pages if content is longer than one page
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(
      canvas.toDataURL('image/png', quality),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pageHeight;
  }

  return pdf.output('blob');
}

/**
 * Download invoice as PDF
 */
export async function downloadInvoicePDF(
  elementId: string,
  filename: string,
  options: InvoiceGenerationOptions = {}
): Promise<void> {
  try {
    const pdfBlob = await generateInvoicePDF(elementId, options);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Generate invoice filename based on order data
 */
export function generateInvoiceFilename(invoiceData: InvoiceData): string {
  const date = new Date(invoiceData.createdAt);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const orderNumber = invoiceData.orderNumber;
  const customerName = invoiceData.customer.fullName
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 20);
  
  return `Invoice_${orderNumber}_${customerName}_${dateStr}`;
}

/**
 * Print invoice
 */
export function printInvoice(elementId: string): void {
  // Debug: Log all elements with invoice-related IDs
  const allElements = document.querySelectorAll('[id*="invoice"]');
  console.log('All invoice elements found for print:', Array.from(allElements).map(el => ({ id: el.id, tagName: el.tagName })));
  
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for printing. Available elements:`, 
      Array.from(document.querySelectorAll('[id]')).map(el => el.id).filter(id => id.includes('invoice')));
    throw new Error(`Element with id "${elementId}" not found`);
  }
  
  console.log('Found invoice element for print:', { id: element.id, tagName: element.tagName, clientHeight: element.clientHeight, clientWidth: element.clientWidth });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Unable to open print window');
  }

  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice</title>
        <style>
          ${styles}
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}
