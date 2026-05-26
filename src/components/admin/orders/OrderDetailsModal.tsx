"use client";
import React, { useState } from 'react';
import { getImageUrl } from '@/utils/image';
import { Order } from './types';
import ItemImage from './ItemImage';
import ReceiptModal from './ReceiptModal';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const [isReceiptZoomed, setIsReceiptZoomed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 px-[10px] md:px-8 py-6 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">{order.customer_name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{order.customer_email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-[10px] md:px-8 py-6 space-y-8">
          {/* Cart Items */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              Order Items
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[10px] font-black">{order.items.length}</span>
            </h4>
            <div className="bg-black text-white rounded-3xl p-4 md:p-6">
              <div className="divide-y divide-white/10">
                {order.items.map((item, idx) => (
                  <div key={item.id || item._id || idx} className="flex items-center gap-4 py-4 px-2">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 flex-shrink-0 border border-white/10">
                      <ItemImage item={item} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm leading-tight truncate">{item.productName}</p>
                      <p className="text-[11px] text-white/50 font-semibold mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-black text-white text-sm flex-shrink-0">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fulfillment */}
          {(order.customer_phone || order.delivery_address) && (
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Delivery Info</h4>
              <div className="bg-black text-white rounded-2xl p-4 md:p-6 space-y-5">
                  {order.customer_phone && (
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-50 block mb-1">Phone</label>
                      <p className="text-sm font-bold">{order.customer_phone}</p>
                    </div>
                  )}
                  {order.delivery_address && (
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-50 block mb-1">Address</label>
                      <p className="text-sm font-bold leading-relaxed">{order.delivery_address}</p>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Payment Receipt Preview */}
          {order.receipt_path && (
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Payment Receipt</h4>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-3xl border border-gray-100 dark:border-neutral-800/60">
                <button
                  onClick={() => setIsReceiptZoomed(true)}
                  className="w-28 h-28 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-sm relative group hover:scale-[1.02] active:scale-95 transition-all cursor-pointer bg-gray-100 dark:bg-neutral-800 flex-shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(order.receipt_path) || undefined}
                    alt="Receipt Thumbnail"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="scale-90 group-hover:scale-100 transition-transform">
                      <circle cx="11" cy="11" r="8" stroke="white" fill="none"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="white"/>
                      <line x1="11" y1="8" x2="11" y2="14" stroke="white"/>
                      <line x1="8" y1="11" x2="14" y2="11" stroke="white"/>
                    </svg>
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Proof of Payment Uploaded</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Click the thumbnail image on the left to open a high-resolution preview of the receipt.
                  </p>
                  <button
                    onClick={() => setIsReceiptZoomed(true)}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                    Zoom Receipt
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-black text-white rounded-2xl px-[10px] md:px-6 py-5">
              <span className="text-[10px] font-black uppercase tracking-widest">Total Payment</span>
              <span className="text-xl font-black">₦{order.total_amount.toLocaleString()}</span>
            </div>
            {order.approved_by && (
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-2xl px-6 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Processed By</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{order.approved_by}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-neutral-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Method</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 capitalize">
                    {order.payment_method === 'transfer' ? 'Transfer' : (order.payment_method === 'pos' ? 'POS' : order.payment_method)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isReceiptZoomed && <ReceiptModal order={order} onClose={() => setIsReceiptZoomed(false)} />}
    </div>
  );
}
