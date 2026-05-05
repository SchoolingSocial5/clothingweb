'use client'
import React from 'react'
import { Order } from './admin/orders/types'
import { useSettingStore } from '@/store/useSettingStore'
import { formatPrice } from '@/utils/format'

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useState } from 'react'

interface PrintSlipProps {
  order: Order
  onClose: () => void
}

const PrintSlip: React.FC<PrintSlipProps> = ({ order, onClose }) => {
  const { settings } = useSettingStore()
  const [sharing, setSharing] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    const element = document.getElementById('printable-slip');
    if (!element) return;

    try {
      setSharing(true);
      
      const canvas = await html2canvas(element, {
        scale: 3, 
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
      if (!blob) throw new Error('Failed to generate image');

      const fileName = `Receipt_${order.receipt_number || order.id}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Share text summary as well
      const shareText = `Receipt from ${settings?.company_name || 'Our Store'} - Order #${order.id}\nTotal: ${formatPrice(order.total_amount)}`;

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Transaction Receipt',
          text: shareText,
        });
      } else {
        // Fallback for desktop: Download image
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('Sharing is not supported on this device. The receipt image has been downloaded instead.');
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleWhatsAppShare = async () => {
    const rawPhone = settings?.phone_number || "";
    const whatsappNumber = rawPhone.replace(/\D/g, "");
    const shareText = `*RECEIPT - ${settings?.company_name?.toUpperCase() || 'STORE'}*\n\nOrder #${order.id}\nReceipt ID: ${order.receipt_number || 'N/A'}\nCustomer: ${order.customer_name}\nTotal: ${formatPrice(order.total_amount)}\n\nThank you for your business!`;
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(shareText)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Optionally also trigger image share if supported
    if (confirm("WhatsApp message opened! Would you also like to share the receipt IMAGE?")) {
      handleShare();
    }
  };

  const handlePrintPDF = async () => {
    const element = document.getElementById('printable-slip');
    if (!element) return;

    try {
      setDownloading(true);
      
      const canvas = await html2canvas(element, {
        scale: 3, 
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dynamic height based on 80mm width ratio
      const pdfWidth = 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Tell the PDF to automatically open the print dialog when generated
      pdf.autoPrint();
      
      // Output as a blob and open in a new tab
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const totalAmount = order.total_amount;
  // Assuming full payment for now if status is paid, or using current order info
  const paidAmount = order.payment_status === 'paid' ? totalAmount : 0;
  const balance = Math.max(0, totalAmount - paidAmount);

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 overflow-auto print:p-0 print:bg-transparent print:static">
        <div className="bg-white text-black p-4 w-full max-w-[380px] shadow-2xl relative rounded-sm print:max-w-none print:w-full print:shadow-none print:p-0 print:m-0">
          <button 
            onClick={onClose}
            className="absolute -top-10 right-0 text-white hover:text-gray-300 flex items-center text-sm font-bold no-print"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            CLOSE
          </button>
          
          {/* Printable Area */}
          <div id="printable-slip" className="receipt-content">
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                @page {
                  margin: 0;
                  size: 80mm auto;
                }
                html, body {
                  height: auto !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  overflow: visible !important;
                }
                body * {
                  visibility: hidden !important;
                }
                #printable-slip, #printable-slip * {
                  visibility: visible !important;
                }
                #printable-slip {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 80mm !important;
                  margin: 0 !important;
                  padding: 10px !important;
                  display: block !important;
                }
                .no-print {
                  display: none !important;
                }
              }
              .receipt-content {
                font-family: 'Courier New', Courier, monospace;
                font-size: 13px;
                line-height: 1.5;
                color: #000;
                background: #fff;
                width: 100%;
              }
              .receipt-header {
                text-align: center;
                margin-bottom: 12px;
              }
              .business-name {
                font-weight: 900;
                font-size: 18px;
                text-transform: uppercase;
                margin-bottom: 2px;
              }
              .dashed-divider {
                border-top: 1px dashed #000;
                margin: 8px 0;
              }
              .receipt-info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 2px;
              }
              .info-label {
                min-width: 80px;
              }
              .info-value {
                text-align: right;
                font-weight: bold;
              }
              .item-row {
                margin-bottom: 8px;
              }
              .item-main {
                font-weight: bold;
              }
              .item-sub-line {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                padding-left: 10px;
              }
              .total-row {
                margin-top: 5px;
                border-top: 2px solid #000;
                padding-top: 8px;
                font-weight: 900;
                font-size: 16px;
                display: flex;
                justify-content: space-between;
              }
              .footer {
                text-align: center;
                margin-top: 15px;
                font-size: 11px;
                padding-bottom: 5px;
              }
            `}} />
            
            {/* Header */}
            <div className="receipt-header">
              <div className="business-name">{settings?.company_name || 'STORE RECEIPT'}</div>
              <div>{settings?.address || 'Nigeria'}</div>
              <div>Tel: {settings?.phone_number || 'Contact Support'}</div>
              <div style={{fontSize: '11px'}}>Email: {settings?.email || ''}</div>
            </div>

            <div className="dashed-divider"></div>

            {/* Info Section */}
            <div className="receipt-info-row">
              <span className="info-label">Invoice #:</span>
              <span className="info-value">{order.receipt_number || order.id}</span>
            </div>
            <div className="receipt-info-row">
              <span className="info-label">Date:</span>
              <span className="info-value">{formatDate(order.created_at)}</span>
            </div>
            <div className="receipt-info-row">
              <span className="info-label">Staff:</span>
              <span className="info-value">{order.approved_by || 'Admin'}</span>
            </div>
            <div className="receipt-info-row">
              <span className="info-label">Customer:</span>
              <span className="info-value">{order.customer_name}</span>
            </div>

            <div className="dashed-divider"></div>

            {/* Iterating Items */}
            <div className="receipt-items">
              {order.items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-main">{item.productName || item.product_name}</div>
                  <div className="item-sub-line">
                    <span>{item.quantity} x {formatPrice(item.price)}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="total-row">
              <span>TOTAL:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>

            <div className="dashed-divider"></div>

            {/* Payment Section */}
            <div className="receipt-info-row">
              <span className="info-label">Payment Type:</span>
              <span className="info-value uppercase">{order.payment_method}</span>
            </div>
            <div className="receipt-info-row">
              <span className="info-label">Amount Paid:</span>
              <span className="info-value">{formatPrice(paidAmount)}</span>
            </div>
            <div className="receipt-info-row">
              <span className="info-label">Balance:</span>
              <span className="info-value">{formatPrice(balance)}</span>
            </div>

            <div className="dashed-divider"></div>

            {/* Footer */}
            <div className="footer">
              <div>Thank you for your business!</div>
              <div>Please come again.</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-2 no-print">
            <button 
              onClick={handlePrint}
              className="w-full bg-[#000] text-white py-3 rounded-xl flex items-center justify-center font-bold text-xs tracking-widest hover:opacity-90 active:scale-[0.98] transition-transform"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2">
                <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
              </svg>
              PRINT DIRECTLY
            </button>
            <button 
              onClick={handlePrintPDF}
              disabled={downloading}
              className="w-full bg-red-600 text-white py-3 rounded-xl flex items-center justify-center font-bold text-xs tracking-widest hover:bg-red-700 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  PREPARING PDF...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                  </svg>
                  PRINT RECEIPT (PDF)
                </>
              )}
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleWhatsAppShare}
                className="bg-[#25D366] text-white py-3 rounded-xl flex items-center justify-center font-bold text-xs tracking-widest hover:bg-[#20BA5A] active:scale-[0.98] transition-transform"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WHATSAPP
              </button>
              <button 
                onClick={handleShare}
                disabled={sharing}
                className="bg-[#f0f0f0] dark:bg-neutral-800 text-black dark:text-white py-3 rounded-xl flex items-center justify-center font-bold text-xs tracking-widest hover:bg-[#e0e0e0] dark:hover:bg-neutral-700 active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {sharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black dark:border-white/30 dark:border-t-white rounded-full animate-spin mr-2" />
                    ...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    IMAGE
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PrintSlip
