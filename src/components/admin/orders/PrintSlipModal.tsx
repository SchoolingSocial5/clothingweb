"use client";
import React from 'react';
import { Order } from './types';

interface PrintSlipModalProps {
  order: Order;
  settings: any;
  onClose: () => void;
}

export default function PrintSlipModal({ order, settings, onClose }: PrintSlipModalProps) {
  const handlePrint = () => {
    const items = order.items.map(item =>
      `<div class="row"><span>${item.productName} &times;${item.quantity}</span><span>&#8358;${(parseFloat(item.price as any) * item.quantity).toLocaleString()}</span></div>`
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
    <h2>${settings?.companyName || 'Receipt'}</h2>
    ${settings?.address ? `<p>${settings.address}</p>` : ''}
    ${settings?.phone ? `<p>Tel: ${settings.phone}</p>` : ''}
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
    const text = `Order #${order.id}\nReceipt ID: ${order.receipt_number || 'N/A'}\nTotal: ₦${parseFloat(order.total_amount as any).toLocaleString()}\n\nThank you for shopping with ${settings?.companyName || 'us'}!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt - Order #${order.id}`,
          text: text,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert('Receipt details copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
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
        <div className="px-6 py-5 font-mono text-xs space-y-1 border-b border-dashed border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/50">
          <div className="text-center mb-3">
            <p className="font-black text-sm uppercase tracking-wider">{settings?.companyName || 'Store Receipt'}</p>
            {settings?.address && <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{settings.address}</p>}
            {settings?.phone && <p className="text-[9px] text-gray-500 mt-0.5">Tel: {settings.phone}</p>}
          </div>

          <div className="border-t border-dashed border-gray-300 dark:border-neutral-600 my-2" />
          
          <p className="text-center font-black text-[10px] tracking-widest uppercase mb-1">Receipt Summary</p>
          <p className="text-center text-gray-900 dark:text-gray-100 text-[10px] font-black">Order #{order.id}</p>
          {order.receipt_number && (
            <p className="text-center text-[10px] font-black text-gray-500">Receipt ID: <span className="text-black dark:text-white">{order.receipt_number}</span></p>
          )}
          <div className="border-t border-dashed border-gray-300 dark:border-neutral-600 my-2" />
          <div><span className="text-gray-400 uppercase text-[9px] tracking-widest">Customer</span><p className="font-bold dark:text-gray-200">{order.customer_name}</p></div>
          {order.customer_phone && <div><span className="text-gray-400 uppercase text-[9px] tracking-widest">Phone</span><p className="font-bold dark:text-gray-200">{order.customer_phone}</p></div>}
          {order.delivery_address && <div><span className="text-gray-400 uppercase text-[9px] tracking-widest">Address</span><p className="font-bold leading-tight dark:text-gray-200">{order.delivery_address}</p></div>}
          <div className="border-t border-dashed border-gray-300 dark:border-neutral-600 my-2" />
          {order.items.map((item, idx) => (
            <div key={item.id || item._id || idx} className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300 truncate max-w-[60%]">{item.productName} &times;{item.quantity}</span>
              <span className="font-bold dark:text-white">&#8358;{(parseFloat(item.price as any) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-dashed border-gray-300 dark:border-neutral-600 my-2" />
          <div className="flex justify-between font-black text-sm dark:text-white">
            <span>TOTAL</span>
            <span>&#8358;{parseFloat(order.total_amount as any).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3">
          <button
            onClick={handleShare}
            className="p-2.5 border border-gray-200 dark:border-neutral-800 rounded-xl text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            title="Share Receipt"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Slip
          </button>
        </div>
      </div>
    </div>
  );
}
