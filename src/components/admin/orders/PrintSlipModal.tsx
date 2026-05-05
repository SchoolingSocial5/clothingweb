"use client";
import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Order } from './types';

interface PrintSlipModalProps {
  order: Order;
  settings: any;
  onClose: () => void;
}

export default function PrintSlipModal({ order, settings, onClose }: PrintSlipModalProps) {
  const receiptRef = React.useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  // Fix field names from settings
  const companyName = settings?.company_name || settings?.companyName || 'Store Receipt';
  const companyPhone = settings?.phone_number || settings?.phone || '';
  const companyAddress = settings?.address || '';

  const handlePrint = () => {
    const items = order.items.map(item =>
      `<div class="row"><span>${item.productName || item.product_name} &times;${item.quantity}</span><span>&#8358;${(parseFloat(item.price as any) * item.quantity).toLocaleString()}</span></div>`
    ).join('');

    const w = window.open('', '_blank', 'width=380,height=680,scrollbars=yes');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt #${order.id}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Courier New',monospace;font-size:12px;padding:20px;color:#111;background:#fff;width:100%;max-width:340px;margin:0 auto}
  .header{text-align:center;margin-bottom:15px}
  .header h2{font-size:16px;font-weight:900;letter-spacing:1px;margin-bottom:2px;text-transform:uppercase}
  .header p{font-size:10px;color:#444;margin-bottom:1px}
  .receipt-title{text-align:center;font-size:14px;font-weight:900;margin:10px 0;border-top:1px dashed #000;border-bottom:1px dashed #000;padding:5px 0}
  .center{text-align:center;color:#555;font-size:10px;margin-bottom:2px}
  .divider{border:none;border-top:1px dashed #aaa;margin:10px 0}
  .section-label{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}
  .section-value{font-weight:700;margin-bottom:6px}
  .row{display:flex;justify-content:space-between;margin:4px 0;font-size:11px}
  .total-row{display:flex;justify-content:space-between;font-weight:900;font-size:14px;margin-top:4px;border-top:1px solid #000;padding-top:4px}
  .footer{text-align:center;margin-top:20px;font-size:10px;color:#666;font-style:italic}
  .btn-print{display:block;margin:20px auto 0;padding:10px 24px;background:#000;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer}
  @media print{.btn-print{display:none}}
</style></head><body>
  <div class="header">
    <h2>${companyName}</h2>
    ${companyAddress ? `<p>${companyAddress}</p>` : ''}
    ${companyPhone ? `<p>Tel: ${companyPhone}</p>` : ''}
  </div>
  <div class="receipt-title">ORDER RECEIPT</div>
  <p class="center">Order #${order.id}</p>
  ${order.receipt_number ? `<p class="center">Receipt ID: <strong>${order.receipt_number}</strong></p>` : ''}
  <p class="center">${new Date().toLocaleString()}</p>
  <div class="divider"></div>
  <div class="section-label">Customer</div><div class="section-value">${order.customer_name}</div>
  ${order.customer_phone ? `<div class="section-label">Phone</div><div class="section-value">${order.customer_phone}</div>` : ''}
  ${order.delivery_address ? `<div class="section-label">Address</div><div class="section-value">${order.delivery_address}</div>` : ''}
  <div class="divider"></div>
  <div class="section-label">Items</div>
  ${items}
  <div class="total-row"><span>TOTAL</span><span>&#8358;${parseFloat(order.total_amount as any).toLocaleString()}</span></div>
  <div class="footer">~ Thank you for your business! ~</div>
  <button class="btn-print" onclick="window.print()">Print Receipt</button>
</body></html>`);
    w.document.close();
  };

  const handleShare = async () => {
    const text = `*RECEIPT - ${companyName.toUpperCase()}*\n\nOrder #${order.id}\nReceipt ID: ${order.receipt_number || 'N/A'}\nTotal: ₦${parseFloat(order.total_amount as any).toLocaleString()}\n\nThank you for shopping with us!`;
    
    setSharing(true);
    try {
      let file: File | null = null;
      let fallbackDataUrl: string | null = null;
      
      if (receiptRef.current) {
        const canvas = await html2canvas(receiptRef.current, { scale: 3, backgroundColor: '#ffffff' });
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
        if (blob) {
          file = new File([blob], `receipt-${order.id}.png`, { type: 'image/png' });
          fallbackDataUrl = canvas.toDataURL('image/png');
        }
      }

      const canShareFiles = file && navigator.canShare && navigator.canShare({ files: [file] });

      if (navigator.share) {
        const shareData: any = { title: `Receipt - Order #${order.id}` };
        if (canShareFiles) {
          shareData.files = [file];
          shareData.text = text;
        } else {
          shareData.text = text;
        }
        await navigator.share(shareData);
      } else if (fallbackDataUrl) {
        triggerDownload(fallbackDataUrl, `receipt-${order.id}.png`);
      } else {
        fallbackClipboard(text);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error('Error sharing:', err);
    } finally {
      setSharing(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `*RECEIPT - ${companyName.toUpperCase()}*\n\nOrder #${order.id}\nReceipt ID: ${order.receipt_number || 'N/A'}\nTotal: ₦${parseFloat(order.total_amount as any).toLocaleString()}\n\nThank you for shopping with us!`;
    const whatsappUrl = `https://wa.me/${companyPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const triggerDownload = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    alert('Receipt image downloaded! You can now share it manually.');
  };

  const fallbackClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Receipt details copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="font-black text-gray-900 dark:text-gray-100">Order Receipt</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Order #{order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Slip Preview */}
        <div ref={receiptRef} style={{ backgroundColor: '#ffffff', color: '#000000', padding: '20px', fontFamily: 'monospace', fontSize: '12px', borderBottom: '1px dashed #e5e7eb' }}>
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px 0', color: '#000000' }}>{companyName}</p>
            {companyAddress && <p style={{ fontSize: '9px', lineHeight: '1.2', marginTop: '2px', color: '#6b7280', margin: '0' }}>{companyAddress}</p>}
            {companyPhone && <p style={{ fontSize: '9px', marginTop: '2px', color: '#6b7280', margin: '0' }}>Tel: {companyPhone}</p>}
          </div>

          <div style={{ borderTop: '1px dashed #d1d5db', margin: '8px 0' }} />
          
          <p style={{ textAlign: 'center', fontWeight: '900', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px 0', color: '#000000' }}>Receipt Summary</p>
          <p style={{ textAlign: 'center', fontSize: '10px', fontWeight: '900', margin: '0', color: '#000000' }}>Order #{order.id}</p>
          {order.receipt_number && (
            <p style={{ textAlign: 'center', fontSize: '10px', fontWeight: '900', margin: '0', color: '#6b7280' }}>Receipt ID: <span style={{ color: '#000000' }}>{order.receipt_number}</span></p>
          )}
          <div style={{ borderTop: '1px dashed #d1d5db', margin: '8px 0' }} />
          <div style={{ marginBottom: '4px' }}><span style={{ textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.1em', color: '#9ca3af' }}>Customer</span><p style={{ fontWeight: '700', margin: '0', color: '#000000' }}>{order.customer_name}</p></div>
          {order.customer_phone && <div style={{ marginBottom: '4px' }}><span style={{ textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.1em', color: '#9ca3af' }}>Phone</span><p style={{ fontWeight: '700', margin: '0', color: '#000000' }}>{order.customer_phone}</p></div>}
          {order.delivery_address && <div style={{ marginBottom: '4px' }}><span style={{ textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.1em', color: '#9ca3af' }}>Address</span><p style={{ fontWeight: '700', lineHeight: '1.2', margin: '0', color: '#000000' }}>{order.delivery_address}</p></div>}
          <div style={{ borderTop: '1px dashed #d1d5db', margin: '8px 0' }} />
          {order.items.map((item, idx) => (
            <div key={item.id || item._id || idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%', color: '#374151' }}>{item.productName || item.product_name} &times;{item.quantity}</span>
              <span style={{ fontWeight: '700', color: '#000000' }}>&#8358;{(parseFloat(item.price as any) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px dashed #d1d5db', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '14px', color: '#000000' }}>
            <span>TOTAL</span>
            <span>&#8358;{parseFloat(order.total_amount as any).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 py-3 bg-[#25D366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#20BA5A] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              title="Share on WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="p-3 border border-gray-200 dark:border-neutral-800 rounded-xl text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              title="Share Receipt Image"
            >
              {sharing ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              )}
            </button>
          </div>
          <button
            onClick={handlePrint}
            className="w-full py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Receipt Slip
          </button>
        </div>
      </div>
    </div>
  );
}
